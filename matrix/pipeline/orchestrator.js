/**
 * 视频生产流水线 v4.0
 * 支持两种模式：
 *   - 普通模式：扒文案 → AI改写 → TTS配音 → 搜索素材 → BGM → 字幕 → 成品
 *   - AI视频模式：扒文案 → AI改写 → TTS配音 → AI生成视频 → BGM → 字幕 → 成品
 */
const path = require('path');
const fs = require('fs');
const { synthesizeBaseVideo, mixAudio, burnSubtitles, burnSubtitlesASS, concatVideoSegments } = require('./ffmpeg_helper');

class VideoPipeline {
  constructor(providers, config) {
    this.rewriter = providers.rewriter;
    this.tts = providers.tts;
    this.scraper = providers.scraper;
    this.media = providers.media;
    this.bgm = providers.bgm;
    this.subtitle = providers.subtitle;
    this.webSearcher = providers.webSearcher;
    this.aiVideoGen = providers.aiVideoGen || null; // v4.0: AI 视频生成模块
    this.aiImageGen = providers.aiImageGen || null; // v4.0.8: AI 图片生成兜底
    this.localVideoMatcher = providers.localVideoMatcher || null; // v4.0.9: 本地工厂视频匹配
    this.config = config;

    // 给 WebMediaSearcher 注入 AI 查询生成能力
    if (this.webSearcher && this.rewriter) {
      this.webSearcher.aiQueryGen = async (text) => {
        return await this._generateSearchQueries(text);
      };
    }

    const outputDir = config.general?.output?.outputDir || './output';
    ['audio','video','bgm','web_media','ai_video'].forEach(sub => {
      const dir = path.join(outputDir, sub);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    });
  }

  /**
   * 运行完整流水线
   * @param {string} input - 输入文案/链接
   * @param {object} options - {
   *   editedText, ttsVoice, bgmId, subtitleStyle,
   *   aspectRatio, enableSubtitles, selectedVersionIndex,
   *   useWebMedia, bgmVolume,
   *   useAiVideo: boolean,      // v4.0: 启用AI视频生成模式
   *   cloudToken: string,        // v4.0: 多模态生成token
   * }
   * @param {function} onProgress
   */
  async run(input, options = {}, onProgress = () => {}) {
    const startTime = Date.now();
    const taskId = `task_${startTime}`;
    const stepTotal = options.useAiVideo ? 8 : 7;

    // 解析分辨率
    const aspectRatioKey = options.aspectRatio || this.config.defaultAspectRatio || '9:16';
    const ratios = this.config.aspectRatios || {
      '9:16': { width: 720, height: 1280 },
      '16:9': { width: 1280, height: 720 },
      '4:3': { width: 960, height: 720 },
      '3:4': { width: 720, height: 960 },
      '1:1': { width: 1080, height: 1080 },
    };
    const resolution = ratios[aspectRatioKey] || ratios['9:16'];

    try {
      // ============== Step1: 扒文案（直接粘贴文案模式跳过提取） ==============
      let originalText;
      if (options.editedText && options.skipRewrite) {
        // 直接粘贴文案模式：跳过URL提取，直接用传入的文案
        originalText = options.editedText.trim();
        console.log('[Pipeline] 直接粘贴文案模式，跳过URL提取');
        onProgress({ step: 1, total: stepTotal, status: 'completed', message: `使用粘贴文案（${originalText.length}字）` });
      } else {
        onProgress({ step: 1, total: stepTotal, status: 'running', message: '正在提取文案...' });
        const extracted = await this.scraper.extract(input);
        originalText = options.editedText || extracted.text;
        onProgress({ step: 1, total: stepTotal, status: 'completed', message: `提取完成（${originalText.length}字）` });
      }
      if (!originalText || originalText.trim().length < 10) {
        throw new Error('文案内容太短，至少10个字');
      }

      // ============== Step2: AI改写（v4.0.9: 支持 skipRewrite） ==============
      let rewriteResult;
      if (options.skipRewrite) {
        console.log('[Pipeline] 跳过AI改写，直接使用原文');
        rewriteResult = { versions: [originalText] };
      } else {
        onProgress({ step: 2, total: stepTotal, status: 'running', message: 'AI改写文案...' });
        const rewriteOptions = this.config.general?.rewrite || { versionCount: 3 };
        rewriteResult = await this.rewriter.rewrite(originalText, rewriteOptions);
        onProgress({ step: 2, total: stepTotal, status: 'completed', message: `改写完成（${rewriteResult.versions.length}版）` });
      }

      // 确定要生成的版本
      const selIdx = options.selectedVersionIndex !== undefined ? options.selectedVersionIndex : 0;
      const selectedText = rewriteResult.versions[selIdx] || rewriteResult.versions[0];

      // ============== Step3: TTS 配音 ==============
      onProgress({ step: 3, total: stepTotal, status: 'running', message: '合成语音...' });
      const ttsVoice = options.ttsVoice || null;
      const ttsResult = await this.tts.synthesize(selectedText, { voice: ttsVoice });
      onProgress({ step: 3, total: stepTotal, status: 'completed', message: '语音合成完成' });

      // ============== Step4: 素材获取（AI模式 vs 搜索模式） ==============
      let aiVideoPaths = [];
      let webMedia = [];
      let allMedia = [];

      if (options.useAiVideo && this.aiVideoGen && options.cloudToken) {
        // ====== AI 视频生成模式 ======
        onProgress({ step: 4, total: stepTotal, status: 'running', message: 'AI生成匹配视频...' });
        try {
          const aiResult = await this.aiVideoGen.generateAIVideo(
            selectedText,
            ttsResult.duration,
            path.join(this.config.general?.output?.outputDir || './output', 'ai_video'),
            options.cloudToken,
            (p) => {
              onProgress({ step: 4, total: stepTotal, status: 'running', message: p.message });
            }
          );
          aiVideoPaths = aiResult.videoPaths;
          console.log(`[Pipeline] AI视频生成完成: ${aiVideoPaths.length}个片段`);
        } catch (e) {
          console.warn('[Pipeline] AI视频生成失败，回退到普通模式:', e.message);
          // 回退到搜索模式
          aiVideoPaths = [];
        }
        onProgress({ step: 4, total: stepTotal, status: 'completed', message: aiVideoPaths.length > 0 ? `AI视频: ${aiVideoPaths.length}段` : 'AI视频生成失败，使用备选素材' });
      }

      // v4.0.9: AI视频不够 → 混入Pexels中国工厂视频补充多样性
      if (aiVideoPaths.length > 0 && aiVideoPaths.length < 5 && options.cloudToken) {
        console.log(`[Pipeline] AI视频仅${aiVideoPaths.length}段，补充Pexels视频...`);
        try {
          webMedia = await this.webSearcher.searchAndDownload(originalText, 8);
          console.log(`[Pipeline] 补充Pexels: ${webMedia.length}条`);
        } catch (e) { console.warn('[Pipeline] Pexels补充失败:', e.message); }
      }

      if (aiVideoPaths.length === 0) {
        // ====== 传统搜索模式 ======
        if (options.useWebMedia !== false) {
          onProgress({ step: 4, total: stepTotal, status: 'running', message: '自动搜索匹配素材...' });
          try {
            webMedia = await this.webSearcher.searchAndDownload(originalText, 8);
            console.log(`[Pipeline] 在线素材: ${webMedia.length}条`);
          } catch (e) { console.warn('[Pipeline] 网络搜索失败:', e.message); }
          onProgress({ step: 4, total: stepTotal, status: 'completed', message: `在线素材: ${webMedia.length}条` });
        }

        // v4.0.9 FINAL: 不启用本地单视频回退（会导致循环播放同一画面）
        // 航拍搜索保证永远有8个不同视频
        if (webMedia.length === 0) {
          console.log('[Pipeline] ⚠️ 航拍搜索也无结果（极罕见），重试一次...');
          try {
            const retryMedia = await this.webSearcher.searchAndDownload(originalText, 8);
            webMedia = retryMedia.length > 0 ? retryMedia : webMedia;
          } catch (e) { console.warn('[Pipeline] 重试失败:', e.message); }
        }

        // v4.0.8: 在线搜索+本地视频都无 → AI文生图兜底
        if (webMedia.length === 0 && options.cloudToken && this.aiImageGen) {
          onProgress({ step: 4.1, total: stepTotal, status: 'running', message: '在线搜索无结果，AI生成匹配图片...' });
          try {
            const aiImages = await this.aiImageGen.generateImages(
              originalText, 4,
              path.join(this.config.general?.output?.outputDir || './output', 'ai_img'),
              options.cloudToken
            );
            if (aiImages.length > 0) {
              webMedia = aiImages;
              console.log(`[Pipeline] AI生图: ${aiImages.length}张`);
            }
          } catch (e) { console.warn('[Pipeline] AI生图失败:', e.message); }
          onProgress({ step: 4.1, total: stepTotal, status: 'completed', message: webMedia.length > 0 ? `AI生图: ${webMedia.length}张` : 'AI生图也失败了' });
        }

        // ===== v4.0.9 FINAL: 100%航拍视频，强制 type:'video' =====
        allMedia = webMedia
          .filter(m => m.type === 'video')
          .map(m => ({
            url: m.path,
            type: 'video',
            source: 'web',
            relevance: 7
          }));
        console.log(`[Pipeline] allMedia: ${allMedia.length}个视频 (全航拍)`);

        // v4.0.6: 素材不够 → 自动触发 AI 视频生成（视频<2个 或 总素材<3个）
        const onlineVideos = allMedia.filter(m => m.type === 'video' && m.source === 'web');
        const qualityImages = allMedia.filter(m => m.type === 'image' && m.relevance >= 6);
        const needAiFallback = onlineVideos.length < 2 || (onlineVideos.length === 0 && qualityImages.length < 3);
        
        if (needAiFallback && options.cloudToken && this.aiVideoGen) {
          console.log(`[Pipeline] 素材不足(视频${onlineVideos.length}个,相关图${qualityImages.length}张)，自动切换AI视频生成...`);
          onProgress({ step: 4.5, total: stepTotal, status: 'running', message: '素材不足，启用AI视频生成...' });
          try {
            const aiResult = await this.aiVideoGen.generateAIVideo(
              selectedText,
              ttsResult.duration,
              path.join(this.config.general?.output?.outputDir || './output', 'ai_video'),
              options.cloudToken,
              (p) => {
                onProgress({ step: 4.5, total: stepTotal, status: 'running', message: p.message });
              }
            );
            aiVideoPaths = aiResult.videoPaths;
            console.log(`[Pipeline] AI视频自动生成: ${aiVideoPaths.length}个片段`);
          } catch (e) {
            console.warn('[Pipeline] AI视频自动生成失败:', e.message);
          }
          onProgress({ step: 4.5, total: stepTotal, status: 'completed', message: aiVideoPaths.length > 0 ? `AI视频: ${aiVideoPaths.length}段` : `素材共${allMedia.length}个` });
        } else {
          onProgress({ step: 4.5, total: stepTotal, status: 'completed', message: `素材共${allMedia.length}个（不含本地视频）` });
        }
      }

      // ============== Step5: 准备BGM ==============
      let bgmInfo = { bgmPath: '', duration: 0, bgmId: 'none' };
      const bgmEnabled = options.bgmId !== 'none' && options.bgmId !== false;
      if (bgmEnabled) {
        onProgress({ step: 5, total: stepTotal, status: 'running', message: '准备背景音乐...' });
        try {
          bgmInfo = await this.bgm.prepareBGM(options.bgmId || 'auto', ttsResult.duration, originalText);
        } catch (e) { console.warn('[Pipeline] BGM准备失败:', e.message); }
        onProgress({ step: 5, total: stepTotal, status: 'completed', message: bgmInfo.bgmPath ? 'BGM就绪' : '无BGM' });
      }

      // ============== Step6: 渲染视频 ==============
      onProgress({ step: 6, total: stepTotal, status: 'running', message: '渲染视频...' });
      
      // v4.0.9: AI视频不够时混入Pexels视频
      if (aiVideoPaths.length > 0 && aiVideoPaths.length < 5 && webMedia.length > 0) {
        const pexelsVids = webMedia.filter(m => m.type === 'video').map(m => m.path);
        if (pexelsVids.length > 0) {
          const aiCount = aiVideoPaths.length;
          const needMore = Math.min(pexelsVids.length, 5 - aiCount);
          aiVideoPaths = [...aiVideoPaths, ...pexelsVids.slice(0, needMore)];
          console.log(`[Pipeline] AI+混搭: ${aiCount}段AI + ${needMore}段Pexels`);
        }
      }
      
      const videoResult = aiVideoPaths.length > 0
        ? await this._renderWithAIVideo(taskId, ttsResult, aiVideoPaths, selectedText, {
            ...options, resolution, bgmInfo,
            enableSubtitles: options.enableSubtitles !== false,
            subtitleStyle: options.subtitleStyle || 'white',
            bgmVolume: options.bgmVolume || 0.15,
          })
        : await this._renderFinal(taskId, ttsResult, allMedia, selectedText, {
            ...options, resolution, bgmInfo,
            enableSubtitles: options.enableSubtitles !== false,
            subtitleStyle: options.subtitleStyle || 'white',
            bgmVolume: options.bgmVolume || 0.15,
          });

      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      onProgress({ step: stepTotal, total: stepTotal, status: 'completed', message: `完成！${elapsed}秒` });

      return {
        taskId,
        status: 'completed',
        versions: [{
          versionIndex: selIdx,
          text: selectedText,
          videoPath: videoResult.videoPath,
          duration: videoResult.duration,
          audioPath: videoResult.audioPath,
          info: videoResult.info,
        }],
        allVersions: rewriteResult.versions,
        selectedIndex: selIdx,
        stats: {
          totalTime: elapsed,
          rewriteModel: rewriteResult.model,
          mediaCount: allMedia.length,
          aiVideoCount: aiVideoPaths.length,
          bgm: bgmInfo.bgmId || 'none',
          resolution: `${resolution.width}x${resolution.height}`,
          subtitles: options.enableSubtitles !== false,
          mode: aiVideoPaths.length > 0 ? 'ai_video' : 'search',
        },
        input: originalText,
      };
      // v4.0.9: 自动清理所有临时文件
      try {
        const baseDir = path.resolve(this.config.general?.output?.outputDir || './output');
        // 输出视频：保留最新5个
        const vd = path.join(baseDir, 'video');
        if (fs.existsSync(vd)) {
          const vids = fs.readdirSync(vd).filter(f => f.startsWith('base_task_') || f.startsWith('sub_task_')).map(f => ({
            name: f, time: fs.statSync(path.join(vd, f)).mtimeMs
          })).sort((a, b) => b.time - a.time);
          vids.slice(5).forEach(f => fs.unlinkSync(path.join(vd, f.name)));
        }
        // TTS音频：保留最新10个
        const ad = path.join(baseDir, 'audio');
        if (fs.existsSync(ad)) {
          const auds = fs.readdirSync(ad).filter(f => f.startsWith('tts_')).map(f => ({
            name: f, time: fs.statSync(path.join(ad, f)).mtimeMs
          })).sort((a, b) => b.time - a.time);
          auds.slice(10).forEach(f => fs.unlinkSync(path.join(ad, f.name)));
        }
        // 🔑 航拍源素材：每次生成完全部清空（只用一次，下次重新下载新的）
        const wm = path.join(baseDir, 'web_media');
        if (fs.existsSync(wm)) {
          const mediaFiles = fs.readdirSync(wm).filter(f => f.startsWith('web_'));
          mediaFiles.forEach(f => fs.unlinkSync(path.join(wm, f)));
          if (mediaFiles.length > 0) console.log(`[AutoClean] 清空 ${mediaFiles.length} 个航拍源文件`);
        }
        // AI视频片段：保留最新5个
        const aiv = path.join(baseDir, 'ai_video');
        if (fs.existsSync(aiv)) {
          const aivs = fs.readdirSync(aiv).filter(f => f.startsWith('ai_video_')).map(f => ({
            name: f, time: fs.statSync(path.join(aiv, f)).mtimeMs
          })).sort((a, b) => b.time - a.time);
          aivs.slice(5).forEach(f => fs.unlinkSync(path.join(aiv, f.name)));
        }
      } catch(e) {}
    } catch (err) {
      onProgress({ step: 0, total: stepTotal, status: 'error', message: err.message });
      return { taskId, status: 'error', error: err.message };
    }
  }

  /** AI视频模式渲染：拼接AI生成的视频片段 + 配音 + 字幕 */
  async _renderWithAIVideo(taskId, ttsResult, aiVideoPaths, text, options) {
    const ffmpeg = this._getFFmpegPath();
    const outDir = path.resolve(this.config.general?.output?.outputDir || './output', 'video');
    const baseFile = path.join(outDir, `base_${taskId}.mp4`);

    // 拼接AI视频片段 + 配音
    await concatVideoSegments(ffmpeg, baseFile, aiVideoPaths, ttsResult.audioPath, outDir, options.resolution);

    if (!fs.existsSync(baseFile)) {
      throw new Error('AI视频拼接失败');
    }

    let videoWithAudio = baseFile;

    // BGM 混音
    if (options.bgmInfo?.bgmPath && fs.existsSync(options.bgmInfo.bgmPath)) {
      const mixedFile = path.join(outDir, `mixed_${taskId}.mp4`);
      try {
        const mixedAudioFile = path.join(outDir, '..', 'audio', `merged_${taskId}.mp3`);
        await this._mixAudioWithBGM(ffmpeg, ttsResult.audioPath, options.bgmInfo.bgmPath, mixedAudioFile, options.bgmVolume || 0.15);
        if (fs.existsSync(mixedAudioFile)) {
          await mixAudio(ffmpeg, baseFile, mixedAudioFile, mixedFile);
          if (fs.existsSync(mixedFile)) {
            videoWithAudio = mixedFile;
          }
        }
      } catch (e) { console.warn('[Pipeline] BGM混音失败:', e.message); }
    }

    // 字幕烧录
    let outputFile = videoWithAudio;
    if (options.enableSubtitles !== false) {
      console.log(`[Pipeline] 生成ASS字幕 (文案${text.length}字, 时长${ttsResult.duration}s)...`);
      const { ass, segments } = this.subtitle.generateASS(text, ttsResult.duration, options.subtitleStyle || 'white', options.resolution);
      console.log(`[Pipeline] ASS字幕: ${segments.length}段${ass ? ', ass长度=' + ass.length : ', ass为空'}`);
      
      if (ass && segments.length > 0) {
        const assPath = videoWithAudio.replace(/\.mp4$/, '.ass');
        fs.writeFileSync(assPath, ass, 'utf-8');
        console.log(`[Pipeline] ASS文件写入: ${assPath}`);
        
        const subtitledFile = path.join(outDir, `sub_${taskId}.mp4`);
        try {
          await burnSubtitlesASS(ffmpeg, videoWithAudio, assPath, subtitledFile);
          if (fs.existsSync(subtitledFile) && fs.statSync(subtitledFile).size > 1000) {
            outputFile = subtitledFile;
            console.log(`[Pipeline] 字幕烧录成功: ${path.basename(subtitledFile)}`);
          } else {
            console.warn('[Pipeline] 字幕烧录后文件异常，保留无字幕版本');
          }
        } catch (e) {
          console.warn('[Pipeline] 字幕烧录失败:', e.message);
        }
        try { fs.unlinkSync(assPath); } catch {}
      } else {
        console.warn(`[Pipeline] 跳过字幕: ass=${!!ass}, segments=${segments.length}`);
      }
    }

    const stats = fs.statSync(outputFile);
    return {
      videoPath: outputFile,
      duration: ttsResult.duration,
      audioPath: ttsResult.audioPath,
      size: stats.size,
      info: {
        ttsVoice: options.ttsVoice,
        bgmId: options.bgmInfo?.bgmId || 'none',
        subtitleStyle: options.subtitleStyle,
        subtitles: options.enableSubtitles !== false,
        aiVideoGenerated: true,
      }
    };
  }

  /** 最终渲染（普通搜索模式） */
  async _renderFinal(taskId, ttsResult, mediaPlan, text, options) {
    const ffmpeg = this._getFFmpegPath();
    const outDir = path.resolve(this.config.general?.output?.outputDir || './output', 'video');
    const baseFile = path.join(outDir, `base_${taskId}.mp4`);

    await synthesizeBaseVideo(ffmpeg, baseFile, ttsResult, mediaPlan, outDir, options.resolution);
    if (!fs.existsSync(baseFile)) throw new Error('基础视频合成失败');

    let videoWithAudio = baseFile;

    if (options.bgmInfo?.bgmPath && fs.existsSync(options.bgmInfo.bgmPath)) {
      const mixedFile = path.join(outDir, `mixed_${taskId}.mp4`);
      try {
        const mixedAudioFile = path.join(outDir, '..', 'audio', `merged_${taskId}.mp3`);
        await this._mixAudioWithBGM(ffmpeg, ttsResult.audioPath, options.bgmInfo.bgmPath, mixedAudioFile, options.bgmVolume || 0.15);
        if (fs.existsSync(mixedAudioFile)) {
          await mixAudio(ffmpeg, baseFile, mixedAudioFile, mixedFile);
          if (fs.existsSync(mixedFile)) videoWithAudio = mixedFile;
        }
      } catch (e) { console.warn('[Pipeline] BGM混音失败:', e.message); }
    }

    let outputFile = videoWithAudio;
    if (options.enableSubtitles !== false) {
      console.log(`[Pipeline] 生成ASS字幕 (普通模式, 文案${text.length}字)...`);
      const { ass, segments } = this.subtitle.generateASS(text, ttsResult.duration, options.subtitleStyle || 'white', options.resolution);
      console.log(`[Pipeline] ASS字幕: ${segments.length}段`);
      
      if (ass && segments.length > 0) {
        const assPath = videoWithAudio.replace(/\.mp4$/, '.ass');
        fs.writeFileSync(assPath, ass, 'utf-8');
        const subtitledFile = path.join(outDir, `sub_${taskId}.mp4`);
        try {
          await burnSubtitlesASS(ffmpeg, videoWithAudio, assPath, subtitledFile);
          if (fs.existsSync(subtitledFile) && fs.statSync(subtitledFile).size > 1000) {
            outputFile = subtitledFile;
            console.log(`[Pipeline] 字幕烧录成功`);
          } else {
            console.warn('[Pipeline] 字幕烧录后文件异常');
          }
        } catch (e) { console.warn('[Pipeline] 字幕烧录失败:', e.message); }
        try { fs.unlinkSync(assPath); } catch {}
      } else {
        console.warn(`[Pipeline] 跳过字幕: segments=${segments.length}`);
      }
    }

    const stats = fs.statSync(outputFile);
    return {
      videoPath: outputFile, duration: ttsResult.duration,
      audioPath: ttsResult.audioPath, size: stats.size,
      info: {
        ttsVoice: options.ttsVoice, bgmId: options.bgmInfo?.bgmId || 'none',
        subtitleStyle: options.subtitleStyle, subtitles: options.enableSubtitles !== false,
      }
    };
  }

  async _mixAudioWithBGM(ffmpegPath, voiceAudio, bgmAudio, outputFile, bgmVolume) {
    const args = [
      '-i', voiceAudio.replace(/\\/g, '/'),
      '-i', bgmAudio.replace(/\\/g, '/'),
      '-filter_complex', `[1:a]volume=${bgmVolume}[bgm];[0:a][bgm]amix=inputs=2:duration=first:dropout_transition=2`,
      '-c:a', 'aac', '-b:a', '128k', '-y',
      outputFile.replace(/\\/g, '/')
    ];
    await require('./ffmpeg_helper').runFFmpeg(ffmpegPath, args, { timeout: 30000, logPrefix: 'bgm_mix' });
  }

  async _generateSearchQueries(text) {
    try {
      const prompt = `你是一个视频素材搜索专家。根据下面的中文文案，生成5个英文搜索关键词用于在素材库中搜索匹配场景。
文案：${text.slice(0, 500)}
要求：准确对应场景（如"冲压车间"→"metal stamping factory"），每个1-5个单词，优先描述工作环境。
直接返回JSON数组格式：["query1", "query2", "query3", "query4", "query5"]`;
      const result = await this.rewriter.rewrite(prompt, { versionCount: 1 });
      if (result && result.versions && result.versions[0]) {
        const cleaned = result.versions[0].trim();
        const match = cleaned.match(/\[([^\]]*)\]/);
        if (match) {
          return JSON.parse(`[${match[1]}]`).filter(q => typeof q === 'string' && q.length > 0);
        }
      }
    } catch (e) {
      console.warn('[Pipeline] AI搜索词生成失败:', e.message);
    }
    return [];
  }

  _getFFmpegPath() {
    if (process.env.FFMPEG_PATH && fs.existsSync(process.env.FFMPEG_PATH)) return process.env.FFMPEG_PATH;
    // Windows paths
    const dPath = 'D:\\ffmpeg\\ffmpeg-8.1.1-essentials_build\\bin\\ffmpeg.exe';
    if (fs.existsSync(dPath)) return dPath;
    const localExe = path.join(__dirname, '..', 'ffmpeg.exe');
    if (fs.existsSync(localExe)) return localExe;
    // Cached .ffmpeg/ffmpeg.exe (dev & Electron extraResources)
    const cachedExe = path.join(__dirname, '..', '.ffmpeg', 'ffmpeg.exe');
    if (fs.existsSync(cachedExe)) return cachedExe;
    // Electron packaged: resources/.ffmpeg/
    if (process.resourcesPath) {
      const resExe = path.join(process.resourcesPath, '.ffmpeg', 'ffmpeg.exe');
      if (fs.existsSync(resExe)) return resExe;
      const resExe2 = path.join(process.resourcesPath, 'ffmpeg.exe');
      if (fs.existsSync(resExe2)) return resExe2;
    }
    // Mac / Linux paths
    if (process.platform !== 'win32') {
      const localFF = path.join(__dirname, '..', '.ffmpeg', 'ffmpeg');
      if (fs.existsSync(localFF)) return localFF;
      if (process.resourcesPath) {
        const resFF = path.join(process.resourcesPath, '.ffmpeg', 'ffmpeg');
        if (fs.existsSync(resFF)) return resFF;
      }
      const macPaths = ['/opt/homebrew/bin/ffmpeg', '/usr/local/bin/ffmpeg', '/usr/bin/ffmpeg'];
      for (const mp of macPaths) { if (fs.existsSync(mp)) return mp; }
    }
    return 'ffmpeg';
  }

  _extractKeywords(text) {
    const map = {
      '电子厂':['电子厂','工厂','车间','流水线'], '冲压':['冲压','冲压岗','机器'],
      'CNC':['CNC','数控'], '打磨':['打磨','抛光'], '小时工':['小时工','临时工'],
      '正式工':['正式工'], '宿舍':['宿舍','住宿','空调'], '食堂':['食堂','包吃'],
      '工资':['工资','月薪','时薪'], '黄埔':['黄埔','广州'], '长白班':['长白班','白班'],
      '夜班':['夜班','通宵']
    };
    const found = new Set();
    const lt = text.toLowerCase();
    for (const [k, kw] of Object.entries(map)) {
      if (kw.some(w => lt.includes(w.toLowerCase()))) found.add(k);
    }
    return found.size > 0 ? [...found] : ['工厂','招工'];
  }
}

module.exports = VideoPipeline;
