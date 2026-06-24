/**
 * 矩阵内容工厂 - 视频渲染引擎 v3.4
 * 支持多比例、字幕烧录、BGM混音
 * 图片轮播：逐段渲染 + concat demuxer（避开filter_complex兼容问题）
 */
const path = require('path');
const fs = require('fs');

/**
 * 执行 FFmpeg（v4.0.7: 改用 exec 方式，与 PowerShell 行为一致）
 */
function runFFmpeg(ffmpegExe, args, { timeout = 300000, logPrefix = '' } = {}) {
  const { exec } = require('child_process');
  return new Promise((resolve, reject) => {
    // 拼接命令：对含特殊字符的参数加双引号
    const cmdArgs = args.map(a => {
      const s = String(a);
      // 如果包含空格或特殊字符，用双引号包裹
      if (/[\s,;()|&<>]/.test(s) && !s.startsWith('"')) {
        return `"${s.replace(/"/g, '\\"')}"`;
      }
      return s;
    }).join(' ');
    const cmd = `"${ffmpegExe}" ${cmdArgs}`;
    
    const shortCmd = cmd.length > 300 ? cmd.substring(0, 280) + '...' : cmd;
    console.log(`[FFmpeg ${logPrefix}] ${shortCmd}`);

    const startTime = Date.now();
    exec(cmd, { timeout, maxBuffer: 20 * 1024 * 1024, windowsHide: true }, (error, stdout, stderr) => {
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
      
      if (error) {
        if (error.killed) {
          console.error(`[FFmpeg ${logPrefix}] 超时 (${elapsed}s)`);
          reject(new Error(`FFmpeg timeout after ${timeout}ms`));
          return;
        }
        // FFmpeg 常用 stderr 输出，code非零才是真失败
        const errLines = (stderr || '').split('\n').filter(l => l.trim()).slice(-5);
        console.error(`[FFmpeg ${logPrefix}] 失败(code=${error.code}, ${elapsed}s):`, errLines.slice(-2).join(' | ').substring(0, 300));
        reject(new Error(`FFmpeg exit ${error.code}: ${errLines[errLines.length-1] || 'unknown'}`));
        return;
      }
      
      console.log(`[FFmpeg ${logPrefix}] 完成 (${elapsed}s)`);
      resolve({ code: 0, stdout, stderr: stderr || '' });
    });
  });
}

/**
 * 合成基础视频：素材 + 配音 → MP4
 */
async function synthesizeBaseVideo(ffmpegPath, outputFile, ttsResult, mediaPlan, outDir, resolution = { width: 720, height: 1280 }) {
  const { width, height } = resolution;
  const validMedia = mediaPlan.filter(m => m.url && fs.existsSync(m.url));
  const ttsDuration = ttsResult.duration || 30;

  const videoExts = ['.mp4', '.mov', '.avi', '.webm'];
  const validVideos = validMedia.filter(m => {
    const ext = path.extname(m.url || '').toLowerCase();
    return videoExts.includes(ext) || m.type === 'video';
  });
  const validImages = validMedia.filter(m => {
    const ext = path.extname(m.url || '').toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext) || m.type === 'image';
  });

  console.log(`[FFmpeg] 素材统计: mediaPlan=${mediaPlan.length}, valid=${validMedia.length}, videos=${validVideos.length}, images=${validImages.length}`);

  // 素材优先级（v4.0.9）：
  // 1. 在线视频素材（Pexels/Bing视频）
  // 2. 本地匹配视频（真人真场景）
  // 3. 在线图片轮播（Pexels/Unsplash/Bing/Ken Burns）
  // 4. 本地图片轮播（Ken Burns）
  // 5. 黑屏兜底
  const webVideos = validVideos.filter(m => m.source === 'web');
  const localVideos = validVideos.filter(m => m.source === 'local');
  const webImages  = validImages.filter(m => m.source === 'web');
  const pexelsImages = webImages.filter(m => m.source === 'pexels' || m.relevance >= 7);
  const localImages = validImages.filter(m => m.source === 'local');

  console.log(`[FFmpeg] 分支判断: webVideos=${webVideos.length}, localVideos=${localVideos.length}, pexelsImages=${pexelsImages.length}, webImages=${webImages.length}, localImages=${localImages.length}`);

  // v4.0.7 debug
  const debugLog = path.join(outDir, '_synthesize_debug.log');
  fs.appendFileSync(debugLog, `\n=== synthesizeBaseVideo ${new Date().toISOString()} ===\n`);
  fs.appendFileSync(debugLog, `mediaPlan=${mediaPlan.length} valid=${validMedia.length} videos=${validVideos.length} images=${validImages.length}\n`);
  fs.appendFileSync(debugLog, `webVideos=${webVideos.length} pexelsImages=${pexelsImages.length} webImages=${webImages.length}\n`);
  if (validMedia.length > 0) {
    validMedia.slice(0, 5).forEach((m, i) => {
      fs.appendFileSync(debugLog, `  [${i}] ${path.basename(m.url)} src=${m.source} type=${m.type} exists=${fs.existsSync(m.url)}\n`);
    });
  } else {
    fs.appendFileSync(debugLog, '  ⚠️ validMedia为空!\n');
  }

  // v4.0.9 FINAL: 只用视频，不走任何图片动效/轮播路径
  if (webVideos.length > 0) {
    console.log(`[FFmpeg] 航拍视频拼接 (${webVideos.length}个)`);
    await _renderVideoSequence(ffmpegPath, outputFile, ttsResult, webVideos, ttsDuration, width, height, outDir);
    return;
  }
  if (localVideos.length > 0) {
    console.log(`[FFmpeg] 本地视频拼接 (${localVideos.length}个)`);
    await _renderVideoSequence(ffmpegPath, outputFile, ttsResult, localVideos, ttsDuration, width, height, outDir);
    return;
  }

  // 不应出现：航拍保证有视频，走到这里说明异常
  console.log('[FFmpeg] ⚠️ 无视频可用（异常）→ 黑屏兜底');
  const blackArgs = [
    '-f', 'lavfi', '-i', `color=c=black:s=${width}x${height}:d=${ttsDuration}:r=30`,
    '-i', ttsResult.audioPath.replace(/\\/g, '/'),
    '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '30',
    '-c:a', 'aac', '-b:a', '96k',
    '-shortest', '-y',
    outputFile.replace(/\\/g, '/')
  ];
  await runFFmpeg(ffmpegPath, blackArgs, { timeout: 60000, logPrefix: 'base' });
}

/**
 * 图片轮播渲染：逐张生成片段 → concat demuxer 拼接 → 混入音频
 * 这个方案完全避开 filter_complex，在 Windows FFmpeg 上最稳定
 */
async function _renderSlideshow(ffmpegPath, outputFile, ttsResult, images, totalDuration, width, height, outDir) {
  const count = images.length;
  const perImage = totalDuration / count;
  const segFiles = [];
  const concatList = [];

  // v4.0.7 debug: 写日志到文件
  const debugLog = path.join(outDir, '_slideshow_debug.log');
  fs.appendFileSync(debugLog, `\n=== _renderSlideshow ${new Date().toISOString()} ===\n`);
  fs.appendFileSync(debugLog, `images=${count} totalDuration=${totalDuration} perImage=${perImage.toFixed(2)}s\n`);
  fs.appendFileSync(debugLog, `outputFile=${outputFile}\n`);
  images.forEach((img, i) => {
    const exists = fs.existsSync(img.url);
    fs.appendFileSync(debugLog, `  [${i}] ${path.basename(img.url)} source=${img.source} exists=${exists}\n`);
  });

  // 逐张图渲染为临时视频片段
  for (let i = 0; i < count; i++) {
    const segFile = path.join(outDir, `_seg_${Date.now()}_${i}.mp4`);
    const imgPath = images[i].url.replace(/\\/g, '/');

    // v4.0.8: Ken Burns 动效 — 缓慢缩放+平移，让图片"呼吸"
    // 交替使用不同方向：zoom-in / pan-left / pan-right / pan-down
    const panModes = [
      `zoompan=z='min(1+0.0004*on,1.08)':d=1:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=${width}x${height}:fps=30`,  // 居中放大
      `zoompan=z='min(1+0.0004*on,1.08)':d=1:x='iw/2-(iw/zoom/2)+10*on':y='ih/2-(ih/zoom/2)':s=${width}x${height}:fps=30`,  // 向右平移
      `zoompan=z='min(1+0.0004*on,1.08)':d=1:x='iw/2-(iw/zoom/2)-10*on':y='ih/2-(ih/zoom/2)':s=${width}x${height}:fps=30`,  // 向左平移
      `zoompan=z='min(1+0.0004*on,1.08)':d=1:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)+8*on':s=${width}x${height}:fps=30`,   // 向下平移
    ];
    const vf = panModes[i % panModes.length];

    console.log(`[FFmpeg slideshow] 渲染片段 ${i+1}/${count}: ${path.basename(images[i].url)}`);

    await runFFmpeg(ffmpegPath, [
      '-loop', '1',
      '-i', imgPath,
      '-t', perImage.toFixed(2),
      '-vf', vf,
      '-c:v', 'libx264',
      '-preset', 'ultrafast',
      '-crf', '30',
      '-pix_fmt', 'yuv420p',
      '-y',
      segFile
    ], { timeout: 120000, logPrefix: `seg${i}` });

    segFiles.push(segFile);
    concatList.push(`file '${segFile.replace(/\\/g, '/')}'`);
  }

  // 创建 concat 配置文件
  const concatFile = path.join(outDir, `_concat_${Date.now()}.txt`);
  fs.writeFileSync(concatFile, concatList.join('\n'), 'utf-8');

  console.log(`[FFmpeg slideshow] 拼接${count}个片段 + 音频...`);

  // 用 concat demuxer 拼接所有片段 + 混入音频
  await runFFmpeg(ffmpegPath, [
    '-f', 'concat',
    '-safe', '0',
    '-i', concatFile.replace(/\\/g, '/'),
    '-i', ttsResult.audioPath.replace(/\\/g, '/'),
    '-c:v', 'copy',
    '-c:a', 'aac',
    '-b:a', '96k',
    '-shortest',
    '-y',
    outputFile.replace(/\\/g, '/')
  ], { timeout: 300000, logPrefix: 'concat' });

  // 清理临时文件
  segFiles.forEach(f => { try { fs.unlinkSync(f); } catch {} });
  try { fs.unlinkSync(concatFile); } catch {}
  console.log(`[FFmpeg slideshow] 轮播完成 → ${path.basename(outputFile)}`);
  
  // debug: 记录最终文件大小
  const finalSize = fs.existsSync(outputFile) ? fs.statSync(outputFile).size : 0;
  fs.appendFileSync(debugLog, `\n完成: segCount=${segFiles.length} outputSize=${finalSize}bytes\n`);
}

/**
 * 视频序列渲染：拼接多个视频片段 + 配音
 * 比图片轮播更动态，班长要的就是这个
 */
async function _renderVideoSequence(ffmpegPath, outputFile, ttsResult, videos, totalDuration, width, height, outDir) {
  const count = videos.length;
  const segFiles = [];
  const concatList = [];

  // 逐个视频缩放为统一尺寸
  for (let i = 0; i < count; i++) {
    const segFile = path.join(outDir, `_vseg_${Date.now()}_${i}.mp4`);
    const vidPath = videos[i].url.replace(/\\/g, '/');

    const vf = [
      `scale=${width}:${height}:force_original_aspect_ratio=decrease`,
      `pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:black`,
      'setsar=1',
      'fps=30',
      'format=yuv420p'
    ].join(',');

    console.log(`[FFmpeg vseq] 缩放视频片段 ${i+1}/${count}: ${path.basename(videos[i].url)}`);

    await runFFmpeg(ffmpegPath, [
      '-i', vidPath,
      '-vf', vf,
      '-c:v', 'libx264',
      '-preset', 'ultrafast',
      '-crf', '28',
      '-pix_fmt', 'yuv420p',
      '-an',
      '-y',
      segFile
    ], { timeout: 120000, logPrefix: `vseg${i}` });

    segFiles.push(segFile);
    concatList.push(`file '${segFile.replace(/\\/g, '/')}'`);
  }

  // v4.0.9: 视频不够时长 → 循环复用填满配音
  // 估算总视频时长（每个视频约5秒，精确值不重要，多循环几次）
  const estVideoDur = count * 5; // 每个视频约5秒
  if (estVideoDur < totalDuration) {
    const loops = Math.ceil(totalDuration / estVideoDur);
    console.log(`[FFmpeg vseq] 视频仅${estVideoDur}s，配音${totalDuration}s → 循环${loops}次`);
    const originalList = [...concatList];
    for (let l = 1; l < loops; l++) {
      concatList.push(...originalList);
    }
  }

  // concat 拼接 + 混入配音
  const concatFile = path.join(outDir, `_vconcat_${Date.now()}.txt`);
  fs.writeFileSync(concatFile, concatList.join('\n'), 'utf-8');

  console.log(`[FFmpeg vseq] 拼接${count}个视频片段 + 配音...`);

  await runFFmpeg(ffmpegPath, [
    '-f', 'concat',
    '-safe', '0',
    '-i', concatFile.replace(/\\/g, '/'),
    '-i', ttsResult.audioPath.replace(/\\/g, '/'),
    '-c:v', 'copy',
    '-c:a', 'aac',
    '-b:a', '96k',
    '-shortest',
    '-y',
    outputFile.replace(/\\/g, '/')
  ], { timeout: 300000, logPrefix: `vconcat` });

  // 清理临时文件
  segFiles.forEach(f => { try { fs.unlinkSync(f); } catch {} });
  try { fs.unlinkSync(concatFile); } catch {}
  console.log(`[FFmpeg vseq] 视频序列完成 → ${path.basename(outputFile)}`);
}

/**
 * 两路音频混音（视频的TTS音频 + BGM背景音乐）
 */
async function mixAudio(ffmpegPath, baseVideo, bgmAudio, outputFile) {
  const args = [
    '-i', baseVideo.replace(/\\/g, '/'),
    '-i', bgmAudio.replace(/\\/g, '/'),
    '-map', '0:v', '-map', '1:a',
    '-c:v', 'copy', '-c:a', 'aac', '-b:a', '96k',
    '-shortest', '-y',
    outputFile.replace(/\\/g, '/')
  ];
  await runFFmpeg(ffmpegPath, args, { timeout: 120000, logPrefix: 'mix' });
}

/**
 * 字幕烧录（ASS文件）
 */
async function burnSubtitles(ffmpegPath, videoPath, assPath, outputFile) {
  const args = [
    '-i', videoPath.replace(/\\/g, '/'),
    '-vf', `ass=${assPath.replace(/\\/g, '/')}`,
    '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '30',
    '-c:a', 'copy', '-y',
    outputFile.replace(/\\/g, '/')
  ];
  await runFFmpeg(ffmpegPath, args, { timeout: 120000, logPrefix: 'sub' });
}

/**
 * 烧录字幕（使用 SRT + 样式）
 */
async function burnSubtitlesSRT(ffmpegPath, videoPath, srtPath, outputFile, styleConfig = {}) {
  const {
    fontName = 'Microsoft YaHei',
    fontSize = 36,
    fontColor = 'white',
    borderColor = 'black',
    borderW = 2,
    marginV = 60,
  } = styleConfig;

  // FFmpeg 颜色格式: &HBBGGRR (BGR 倒序)
  const toBGR = (c) => {
    const map = { white: 'FFFFFF', black: '000000', yellow: '00FFFF', red: '0000FF', green: '00FF00', blue: 'FF0000' };
    if (map[c]) return map[c];
    const hex = c.replace('#', '');
    if (hex.length === 6) return hex[4] + hex[5] + hex[2] + hex[3] + hex[0] + hex[1];
    return 'FFFFFF';
  };

  // FFmpeg force_style 格式：逗号必须用 \, 转义
  const forceStyle = [
    `FontName=${fontName}`,
    `FontSize=${fontSize}`,
    `PrimaryColour=&H${toBGR(fontColor)}`,
    `OutlineColour=&H${toBGR(borderColor)}`,
    `Outline=${borderW}`,
    `MarginV=${marginV}`
  ].join('\\,');

  // Windows 路径：反斜杠→正斜杠，盘符冒号转义
  const srtEscaped = srtPath.replace(/\\/g, '/').replace(/:/g, '\\:');

  // spawn 模式下不加单引号，用 \, 转义逗号即可
  const vfStr = `subtitles=${srtEscaped}:force_style=${forceStyle}`;

  const args = [
    '-i', videoPath.replace(/\\/g, '/'),
    '-vf', vfStr,
    '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '30',
    '-c:a', 'copy', '-y',
    outputFile.replace(/\\/g, '/')
  ];

  await runFFmpeg(ffmpegPath, args, { timeout: 120000, logPrefix: 'sub' });
}

/**
 * 烧录 ASS 字幕（用 subtitles 滤镜，支持 ASS 格式自动检测）
 * ass 滤镜在 Windows 上解析 \: 路径崩溃，改用 subtitles 滤镜
 */
async function burnSubtitlesASS(ffmpegPath, videoPath, assPath, outputFile) {
  // v4.0.7: 把 ass 复制到视频同目录的简单文件名，避免路径转义问题
  const simpleAssPath = path.join(path.dirname(outputFile), `_subtitle_${Date.now()}.ass`).replace(/\\/g, '/');
  fs.copyFileSync(assPath, simpleAssPath);
  
  const videoEscaped = videoPath.replace(/\\/g, '/');
  const outputEscaped = outputFile.replace(/\\/g, '/');

  // 用 subtitles 滤镜，路径用单引号包裹（Windows FFmpeg 兼容）
  // 冒号用 \: 转义，但路径本身不包含特殊字符
  const subtitleFilter = `subtitles='${simpleAssPath.replace(/:/g, '\\:')}'`;

  console.log(`[FFmpeg sub:ass] 烧录ASS字幕 → ${path.basename(outputFile)}`);

  const args = [
    '-i', videoEscaped,
    '-vf', subtitleFilter,
    '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '30',
    '-c:a', 'copy', '-y',
    outputEscaped
  ];

  await runFFmpeg(ffmpegPath, args, { timeout: 120000, logPrefix: 'sub:ass' });
  
  // 清理临时 ass
  try { fs.unlinkSync(simpleAssPath); } catch {}
}

/**
 * 拼接多个视频片段 + 配音 → 完整视频
 * 用于 AI 生成的视频片段拼合
 */
async function concatVideoSegments(ffmpegPath, outputFile, videoFiles, audioPath, outDir, resolution = { width: 720, height: 1280 }) {
  const { width, height } = resolution;
  const validVideos = videoFiles.filter(f => fs.existsSync(f));
  if (validVideos.length === 0) throw new Error('没有可用的视频片段');

  console.log(`[FFmpeg concat] 拼接 ${validVideos.length} 个AI视频片段 + 配音`);

  if (validVideos.length === 1) {
    const videoDuration = await _getVideoDuration(ffmpegPath, validVideos[0]);
    const audioDuration = (await _getAudioDuration(ffmpegPath, audioPath)) || 30;
    const loopCount = Math.ceil(audioDuration / Math.max(videoDuration, 1));
    console.log(`[FFmpeg concat] 单片段 ${videoDuration.toFixed(1)}s，配音${audioDuration.toFixed(0)}s → 循环${loopCount}次`);

    const args = [
      '-stream_loop', String(loopCount),
      '-i', validVideos[0].replace(/\\/g, '/'),
      '-i', audioPath.replace(/\\/g, '/'),
      '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '28',
      '-vf', `scale=${width}:${height}:force_original_aspect_ratio=decrease,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:black,setsar=1,fps=30,format=yuv420p`,
      '-c:a', 'aac', '-b:a', '96k',
      '-shortest', '-y',
      outputFile.replace(/\\/g, '/')
    ];
    await runFFmpeg(ffmpegPath, args, { timeout: 300000, logPrefix: 'concat:single' });
    return;
  }

  // 多片段：先逐个缩放+配音 → 再 concat
  const segFiles = [];
  const concatLines = [];
  const audioDuration = (await _getAudioDuration(ffmpegPath, audioPath));
  const perVideo = audioDuration / validVideos.length;

  for (let i = 0; i < validVideos.length; i++) {
    const segFile = path.join(outDir, `_aiseg_${Date.now()}_${i}.mp4`);
    const vf = [
      `scale=${width}:${height}:force_original_aspect_ratio=decrease`,
      `pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:black`,
      'setsar=1', 'fps=30', 'format=yuv420p'
    ].join(',');

    console.log(`[FFmpeg concat] 缩放片段 ${i+1}/${validVideos.length}`);

    await runFFmpeg(ffmpegPath, [
      '-i', validVideos[i].replace(/\\/g, '/'),
      '-vf', vf,
      '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '28',
      '-pix_fmt', 'yuv420p',
      '-an', '-y',
      segFile
    ], { timeout: 120000, logPrefix: `aiseg${i}` });

    segFiles.push(segFile);
    concatLines.push(`file '${segFile.replace(/\\/g, '/')}'`);
  }

  // 创建 concat 文件
  const concatFile = path.join(outDir, `_concat_ai_${Date.now()}.txt`);
  
  // v4.0.9: AI视频不够长 → 循环填充到配音时长
  const estVideoDur = validVideos.length * 5;
  if (estVideoDur < audioDuration) {
    const loops = Math.ceil(audioDuration / estVideoDur);
    console.log(`[FFmpeg concat] AI视频仅${estVideoDur}s，配音${audioDuration.toFixed(0)}s → 循环${loops}次`);
    const origLines = [...concatLines];
    for (let l = 1; l < loops; l++) { concatLines.push(...origLines); }
  }
  
  fs.writeFileSync(concatFile, concatLines.join('\n'), 'utf-8');

  // 拼接所有视频片段 + 混入配音
  console.log('[FFmpeg concat] 拼接所有AI片段 + 配音...');
  await runFFmpeg(ffmpegPath, [
    '-f', 'concat', '-safe', '0',
    '-i', concatFile.replace(/\\/g, '/'),
    '-i', audioPath.replace(/\\/g, '/'),
    '-c:v', 'copy',
    '-c:a', 'aac', '-b:a', '96k',
    '-shortest', '-y',
    outputFile.replace(/\\/g, '/')
  ], { timeout: 300000, logPrefix: 'concat:ai' });

  // 清理
  segFiles.forEach(f => { try { fs.unlinkSync(f); } catch {} });
  try { fs.unlinkSync(concatFile); } catch {}
  console.log(`[FFmpeg concat] AI视频拼合完成 → ${path.basename(outputFile)}`);
}

/**
 * 获取视频文件时长
 */
async function _getVideoDuration(ffmpegPath, videoPath) {
  try {
    const result = await runFFmpeg(ffmpegPath, [
      '-i', videoPath.replace(/\\/g, '/'),
      '-f', 'null', '-'
    ], { timeout: 10000, logPrefix: 'vdur' });
    const durMatch = result.stderr.match(/Duration: (\d+):(\d+):(\d+)\.(\d+)/);
    if (durMatch) {
      const [, h, m, s, ms] = durMatch;
      return parseInt(h) * 3600 + parseInt(m) * 60 + parseInt(s) + parseInt(ms) / 100;
    }
  } catch (e) {
    if (e.message) {
      const durMatch = e.message.match(/Duration: (\d+):(\d+):(\d+)\.(\d+)/);
      if (durMatch) {
        const [, h, m, s, ms] = durMatch;
        return parseInt(h) * 3600 + parseInt(m) * 60 + parseInt(s) + parseInt(ms) / 100;
      }
    }
  }
  return 5; // 默认5秒
}

/**
 * 获取音频文件时长
 */
async function _getAudioDuration(ffmpegPath, audioPath) {
  try {
    const result = await runFFmpeg(ffmpegPath, [
      '-i', audioPath.replace(/\\/g, '/'),
      '-f', 'null', '-'
    ], { timeout: 10000, logPrefix: 'dur' });
    // 从 stderr 提取 duration
    const durMatch = result.stderr.match(/Duration: (\d+):(\d+):(\d+)\.(\d+)/);
    if (durMatch) {
      const [, h, m, s, ms] = durMatch;
      return parseInt(h) * 3600 + parseInt(m) * 60 + parseInt(s) + parseInt(ms) / 100;
    }
  } catch (e) {
    // ffmpeg 输出 duration 到 stderr 并返回非零码，stderr 里有信息
    if (e.message) {
      const durMatch = e.message.match(/Duration: (\d+):(\d+):(\d+)\.(\d+)/);
      if (durMatch) {
        const [, h, m, s, ms] = durMatch;
        return parseInt(h) * 3600 + parseInt(m) * 60 + parseInt(s) + parseInt(ms) / 100;
      }
    }
  }
  return 30; // 兜底
}

module.exports = { runFFmpeg, synthesizeBaseVideo, mixAudio, burnSubtitles, burnSubtitlesSRT, burnSubtitlesASS, concatVideoSegments };
