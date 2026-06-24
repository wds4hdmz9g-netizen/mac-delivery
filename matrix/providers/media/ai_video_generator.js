/**
 * AI视频生成模块 v1.0
 * 调用多模态Skill（buddy-cloud.py）生成精准匹配文案的视频片段
 * 
 * 使用方式：
 *   1. 调用方先通过 connect_cloud_service 获取 token
 *   2. 将 token 传入本模块的各个函数
 *   3. 支持分段生成 + 拼接
 */
const path = require('path');
const fs = require('fs');
// child_process 通过 require('child_process').exec 内联使用

const SKILL_DIR = 'D:\\workbuddy\\resources\\app.asar.unpacked\\resources\\builtin-skills\\buddy-multimodal-generation';
const PYTHON = 'C:\\Users\\dell\\.workbuddy\\binaries\\python\\versions\\3.13.12\\python.exe';

/**
 * 用 AI 把中文文案拆成视频片段 prompts
 * @param {string} text - 中文文案
 * @param {number} duration - 目标视频总时长（秒）
 * @returns {Array<{prompt:string, text:string, start:number, end:number}>}
 */
function buildVideoPrompts(text, duration = 30) {
  const sentences = text
    .split(/[。！？\n\r]+/)
    .map(s => s.trim())
    .filter(s => s.length > 5);

  if (sentences.length === 0) {
    return [{ prompt: 'vertical video, 9:16 portrait, Modern Chinese factory workshop, workers operating machines, industrial environment, documentary style', text: text.slice(0, 50), start: 0, end: duration }];
  }

  // 控制分段数：最多6段，每段至少6秒（40秒视频至少6-7段，画面更多样）
  const MAX_SEGMENTS = 6;
  const MIN_DURATION = 6;

  let segments;
  if (sentences.length <= MAX_SEGMENTS) {
    // 句子少 → 每句一段，index 传入句子序号确保角度轮换
    const perSeg = Math.max(MIN_DURATION, duration / sentences.length);
    let t = 0;
    segments = sentences.map((s, i) => {
      const seg = { prompt: _chineseToVideoPrompt(s, i), text: s, start: t, end: t + perSeg };
      t += perSeg;
      return seg;
    });
  } else {
    // 句子多 → 合并为 MAX_SEGMENTS 段
    const chunkSize = Math.ceil(sentences.length / MAX_SEGMENTS);
    const perSeg = duration / MAX_SEGMENTS;
    const chunks = [];
    for (let i = 0; i < sentences.length; i += chunkSize) {
      chunks.push(sentences.slice(i, i + chunkSize).join('，'));
    }
    // 限制实际段数，index 传入 chunks 序号确保角度轮换
    const finalChunks = chunks.slice(0, MAX_SEGMENTS);
    let t = 0;
    segments = finalChunks.map((chunk, i) => {
      const seg = { prompt: _chineseToVideoPrompt(chunk, i), text: chunk, start: t, end: t + perSeg };
      t += perSeg;
      return seg;
    });
  }

  console.log(`[AIVideo] 文案分段: ${segments.length}段 (原文${sentences.length}句, 总时长${duration}s)`);
  return segments;
}

/**
 * 中文句子 → 英文视频生成 prompt（关键词映射）
 */
function _chineseToVideoPrompt(sentence, index) {
  // 镜头角度后缀：根据段序号轮换，确保同一话题多段时画面不重复
  const angleSuffixes = [
    ', vertical video, 9:16 portrait, wide establishing shot, showing full workshop layout',
    ', vertical video, 9:16 portrait, medium shot, focus on workers hands operating equipment',
    ', vertical video, 9:16 portrait, close-up shot, detailed view of machinery in motion',
    ', vertical video, 9:16 portrait, low angle shot, dramatic perspective of factory floor',
    ', vertical video, 9:16 portrait, tracking shot, following products on conveyor belt',
    ', vertical video, 9:16 portrait, overhead shot, bird eye view of assembly line',
    ', vertical video, 9:16 portrait, side angle, workers in blue uniforms working at stations',
    ', vertical video, 9:16 portrait, slow pan left to right, revealing entire production hall',
    ', vertical video, 9:16 portrait, tilt up from machine level to ceiling, showing factory scale',
    ', vertical video, 9:16 portrait, dutch angle, dynamic industrial atmosphere with motion blur',
  ];

  const keywordMap = [
    { cn: ['电子厂','电子','手机','电器','电路板','PCB'], en: 'vertical video, portrait 9:16, Electronics factory assembly line, workers soldering circuit boards, clean room environment, bright fluorescent lights, documentary style' },
    { cn: ['冲压','冲压岗','冲床','压机'], en: 'vertical video, portrait 9:16, Metal stamping press machine in operation, industrial factory workshop, sparks and metal sheets, workers in safety gear' },
    { cn: ['注塑','注塑机','塑料'], en: 'vertical video, portrait 9:16, Injection molding machine producing plastic parts, modern factory, automated manufacturing, close-up of molten plastic' },
    { cn: ['CNC','数控','加工中心'], en: 'vertical video, portrait 9:16, CNC machining center in operation, precision manufacturing, metal cutting, industrial workshop, sparks from cutting tool' },
    { cn: ['打磨','抛光'], en: 'vertical video, portrait 9:16, Worker polishing metal parts in factory, grinding wheel sparks, industrial workshop environment' },
    { cn: ['组装','装配','流水线','工位','操作台'], en: 'vertical video, portrait 9:16, Assembly line workers putting together electronic products, conveyor belt moving, modern factory workstation' },
    { cn: ['仓库','物流'], en: 'vertical video, portrait 9:16, Factory warehouse storage, shelves with cardboard boxes, forklift moving goods, logistics center wide shot' },
    { cn: ['宿舍','住宿','空调','wifi'], en: 'vertical video, portrait 9:16, Modern factory dormitory room, bunk beds, air conditioning unit, clean living conditions, Chinese workers resting' },
    { cn: ['食堂','包吃','餐厅'], en: 'vertical video, portrait 9:16, Factory canteen, workers eating meals together, clean dining hall, food service line, Chinese factory cafeteria' },
    { cn: ['招工','招聘','报名'], en: 'vertical video, portrait 9:16, Job recruitment scene at Chinese factory gate, people lining up for job application, HR desk with application forms' },
    { cn: ['工资','月薪','时薪','高薪','薪资'], en: 'vertical video, portrait 9:16, Factory worker receiving salary payment, cash envelope with Chinese yuan, happy worker smiling, payroll scene' },
    { cn: ['小时工','临时工','日结'], en: 'vertical video, portrait 9:16, Temporary factory worker clocking in at time card machine, flexible manufacturing job, part-time worker entering factory' },
    { cn: ['长白班','白班'], en: 'vertical video, portrait 9:16, Day shift in Chinese factory, bright workshop with sunlight through windows, daytime work, clear view of production line' },
    { cn: ['夜班','加班'], en: 'vertical video, portrait 9:16, Night shift factory workers under bright artificial lights, overtime work, evening manufacturing, workers in blue uniforms' },
    { cn: ['广州','黄埔','广东','东莞','深圳'], en: 'vertical video, portrait 9:16, Modern Chinese industrial factory in Guangdong province, urban manufacturing facility, exterior wide shot' },
    { cn: ['简介','企业','公司'], en: 'vertical video, portrait 9:16, Modern Chinese manufacturing company building exterior, corporate headquarters, factory entrance with company sign, professional shot' },
  ];

  const lower = sentence.toLowerCase();
  for (const kw of keywordMap) {
    if (kw.cn.some(c => lower.includes(c))) {
      const angle = angleSuffixes[index % angleSuffixes.length];
      const hasShotType = /(wide|close.up|medium|tracking|overhead|pan|tilt|dutch|angle|shot)/i.test(kw.en);
      // v4.0.9: 强制加角度 + 序号，确保不同片段prompt完全不同
      const uniqueTag = `(scene ${index+1})`;
      return (hasShotType ? kw.en : kw.en + angle) + ' ' + uniqueTag;
    }
  }

  const genericPrompts = [
    'vertical video, portrait 9:16, Modern Chinese factory interior, workers in blue uniforms operating machinery, industrial automation production line',
    'vertical video, portrait 9:16, Factory workshop wide view, production line in full operation, bright fluorescent lights, industrial environment',
    'vertical video, portrait 9:16, Chinese manufacturing facility interior, workers assembling electronic products, clean factory floor, documentary style',
    'vertical video, portrait 9:16, Industrial factory exterior view, Chinese manufacturing plant, modern production facility building',
    'vertical video, portrait 9:16, Factory workers at individual workstations, focused on precision tasks, blue collar manufacturing jobs',
    'vertical video, portrait 9:16, Row of factory machines in operation, mechanical movement, industrial production rhythm',
    'vertical video, portrait 9:16, Factory quality control station, worker inspecting products, professional manufacturing environment',
    'vertical video, portrait 9:16, Chinese factory break area, workers resting and chatting, good working atmosphere',
    'vertical video, portrait 9:16, Manufacturing workshop tools and equipment, organized workspace, industrial efficiency',
    'vertical video, portrait 9:16, Factory entrance with workers arriving for shift change, morning light, industrial district',
    'vertical video, portrait 9:16, Drone aerial view of entire factory complex, industrial park, parking lot with cars',
    'vertical video, portrait 9:16, Warehouse storage area, shelves with boxes, forklift moving, logistics center interior',
  ];
  // v4.0.9: 每个片段强制不同视角 + 序号
  const prompt = genericPrompts[index % genericPrompts.length];
  const angle = angleSuffixes[index % angleSuffixes.length];
  return prompt + angle + ` (segment ${index+1})`;
}

/**
 * 调用 buddy-cloud.py（通过 spawn + stdin 传 token）
 * @param {string} token - 认证 token（tempToken）
 * @param {Array<string>} args - buddy-cloud.py 的参数（不含 token 相关）
 * @returns {Promise<object>} 解析后的 JSON 输出
 */
function _callBuddyCloud(token, args) {
  return new Promise((resolve, reject) => {
    const { exec } = require('child_process');
    const os = require('os');

    // 将 token 写入临时文件（避免 echo 管道中的特殊字符问题）
    const tokenFile = path.join(os.tmpdir(), `buddy_cloud_token_${Date.now()}.txt`);
    fs.writeFileSync(tokenFile, token, 'utf-8');

    const scriptPath = `"${SKILL_DIR}\\scripts\\buddy-cloud.py"`;
    const quotedArgs = args.map(a => {
      if (a.startsWith('"') && a.endsWith('"')) return a;
      if (a.startsWith('--')) return a;
      return `"${a.replace(/"/g, '\\"')}"`;
    }).join(' ');
    const cmd = `"${PYTHON}" -u ${scriptPath} ${quotedArgs} --token-stdin`;

    // 用 type 从文件读取 token 传入 stdin，避免 echo 的 ! 等特殊字符被 cmd 扩展
    const fullCmd = `type "${tokenFile}" | ${cmd}`;

    exec(fullCmd, { timeout: 120000, maxBuffer: 1024 * 1024 }, (error, stdout, stderr) => {
      // 清理临时文件
      try { fs.unlinkSync(tokenFile); } catch {}

      if (error) {
        const msg = stderr ? stderr.slice(-400) : error.message;
        console.error(`[AIVideo] buddy-cloud.py 失败:`, msg);
        reject(new Error(`buddy-cloud.py 失败: ${msg}`));
        return;
      }
      try {
        const jsonMatch = stdout.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          console.error('[AIVideo] stdout 无JSON:', stdout.slice(-300));
          reject(new Error(`无JSON输出: ${stdout.slice(-200)}`));
          return;
        }
        const result = JSON.parse(jsonMatch[0]);
        if (result.error) {
          reject(new Error(result.message || result.error));
          return;
        }
        resolve(result);
      } catch (e) {
        console.error('[AIVideo] 解析失败:', stdout.slice(-200));
        reject(new Error(`解析失败: ${stdout.slice(-200)}`));
      }
    });
  });
}

/**
 * 提交 AI 视频生成任务（不等待）
 * @param {string} prompt - 英文视频描述
 * @param {string} token - 认证 token
 * @returns {Promise<{jobId:string}>}
 */
async function submitVideoJob(prompt, token) {
  // prompt 必须加引号，否则 exec 按空格拆散
  const safePrompt = `"${prompt.replace(/"/g, '\\"')}"`;
  const result = await _callBuddyCloud(token, [
    'video',
    safePrompt,
    '--no-poll'
  ]);
  if (!result.job_id) {
    throw new Error(`提交失败: ${JSON.stringify(result)}`);
  }
  return { jobId: result.job_id };
}

/**
 * 查询 AI 视频生成任务状态
 * @param {string} jobId
 * @param {string} token
 * @returns {Promise<{status:string, resultUrl:string|null}>}
 */
async function checkVideoJob(jobId, token) {
  const result = await _callBuddyCloud(token, [
    'status',
    jobId,
    '--type', 'video'
  ]);
  return {
    status: result.status || 'RUN',
    resultUrl: result.result_url || null,
    jobId: result.job_id || jobId
  };
}

/**
 * 等待视频生成任务完成（带轮询）
 * @param {string} jobId
 * @param {string} token
 * @param {function} onProgress - 进度回调
 * @param {number} maxWait - 最大等待秒数
 * @returns {Promise<{jobId, resultUrl}>}
 */
async function waitForVideoJob(jobId, token, onProgress = () => {}, maxWait = 300) {
  const start = Date.now();
  const interval = 8000;

  while (true) {
    const elapsed = (Date.now() - start) / 1000;
    if (elapsed > maxWait) {
      throw new Error(`视频生成超时(${maxWait}s): ${jobId}`);
    }

    const result = await checkVideoJob(jobId, token);
    onProgress({ jobId, status: result.status, elapsed: Math.round(elapsed) });

    if (result.status === 'DONE') {
      return { jobId, resultUrl: result.resultUrl };
    }
    if (result.status === 'FAIL') {
      throw new Error(`视频生成失败: ${jobId}`);
    }

    await new Promise(r => setTimeout(r, interval));
  }
}

/**
 * 下载文件到本地
 * @param {string} url
 * @param {string} outputPath
 */
function downloadFile(url, outputPath) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? require('https') : require('http');
    const file = fs.createWriteStream(outputPath);

    const req = proto.get(url, { timeout: 60000 }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        resolve(downloadFile(res.headers.location, outputPath));
        return;
      }
      if (res.statusCode !== 200) {
        reject(new Error(`下载失败 HTTP ${res.statusCode}`));
        return;
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(outputPath); });
      file.on('error', (e) => { try { fs.unlinkSync(outputPath); } catch {} reject(e); });
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('下载超时')); });
  });
}

/**
 * 完整流程：生成精准匹配文案的 AI 视频
 * @param {string} text - 中文文案
 * @param {number} duration - 视频时长（秒）
 * @param {string} outputDir - 输出目录
 * @param {string} token - 认证 token（由调用方通过 connect_cloud_service 获取）
 * @param {function} onProgress - 进度回调
 * @returns {Promise<{videoPaths:string[], segments:Array}>}
 */
async function generateAIVideo(text, duration, outputDir, token, onProgress = () => {}) {
  if (!token) {
    throw new Error('缺少 token（AI视频生成需要先调用 connect_cloud_service 获取）');
  }

  // Step1: 拆分段落 + 生成 prompts
  onProgress({ step: 'prompt', message: '分析文案，生成视频提示词...' });
  const segments = buildVideoPrompts(text, duration);

  // Step2: 批量提交所有视频生成任务（并行，不等结果）
  onProgress({ step: 'submit', message: `提交 ${segments.length} 个AI视频生成任务...` });
  const submitResults = await Promise.allSettled(
    segments.map((seg, i) =>
      submitVideoJob(seg.prompt, token).then(job => {
        console.log(`[AIVideo] 段落${i+1}/${segments.length} 提交成功: ${job.jobId}`);
        return { ...seg, jobId: job.jobId, index: i };
      }).catch(e => {
        console.warn(`[AIVideo] 段落${i+1} 提交失败:`, e.message);
        return null;
      })
    )
  );

  const jobs = submitResults
    .map(r => r.status === 'fulfilled' ? r.value : null)
    .filter(Boolean);

  if (jobs.length === 0) {
    throw new Error('所有AI视频生成任务提交失败');
  }
  console.log(`[AIVideo] 成功提交 ${jobs.length}/${segments.length} 个任务`);

  // Step3: 并行轮询等待所有任务完成（最多3个并发）
  onProgress({ step: 'poll', message: `AI正在生成 ${jobs.length} 段视频，预计1-3分钟...` });
  const CONCURRENCY = 3;
  const results = [];
  
  for (let i = 0; i < jobs.length; i += CONCURRENCY) {
    const batch = jobs.slice(i, i + CONCURRENCY);
    const batchResults = await Promise.allSettled(
      batch.map((job, bi) =>
        waitForVideoJob(job.jobId, token, (info) => {
          const globalIdx = i + bi + 1;
          onProgress({ step: 'poll', message: `AI生成视频 ${globalIdx}/${jobs.length} (${info.elapsed}s)...` });
        }).then(done => {
          console.log(`[AIVideo] 段落${job.index+1} 生成完成`);
          return { ...job, resultUrl: done.resultUrl };
        }).catch(e => {
          console.warn(`[AIVideo] 段落${job.index+1} 失败:`, e.message);
          return null;
        })
      )
    );
    batchResults.forEach(r => {
      if (r.status === 'fulfilled' && r.value) results.push(r.value);
    });
  }

  // Step4: 下载所有视频到本地
  onProgress({ step: 'download', message: '下载生成的视频...' });
  const videoPaths = [];
  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    if (!r.resultUrl) continue;
    const localPath = path.join(outputDir, `ai_video_${Date.now()}_${i}.mp4`);
    try {
      await downloadFile(r.resultUrl, localPath);
      if (fs.existsSync(localPath) && fs.statSync(localPath).size > 10000) {
        videoPaths.push(localPath);
        console.log(`[AIVideo] 下载成功: ${path.basename(localPath)} (${fs.statSync(localPath).size} bytes)`);
      }
    } catch (e) {
      console.warn(`[AIVideo] 下载失败:`, e.message);
    }
  }

  if (videoPaths.length === 0) {
    throw new Error('所有AI视频片段下载失败');
  }

  onProgress({ step: 'done', message: `AI视频生成完成！${videoPaths.length}个片段` });
  return { videoPaths, segments: results };
}

module.exports = {
  buildVideoPrompts,
  submitVideoJob,
  checkVideoJob,
  waitForVideoJob,
  downloadFile,
  generateAIVideo,
  _chineseToVideoPrompt,
};
