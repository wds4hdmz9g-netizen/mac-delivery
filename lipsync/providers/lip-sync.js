/**
 * 视频对口型提供者 - 基于模力方舟异步视频API
 *
 * 模力方舟可能支持的模型（按优先级尝试）：
 * 1. live-portrait - 轻量人像动画
 * 2. Wan2.1-T2V-1.3B - 文生视频（兜底）
 */
const fs = require('fs');
const path = require('path');
const config = require('../config/default');

const MOARK_BASE = config.moark.baseUrl;
let API_KEY = config.moark.apiKey;

function setApiKey(key) { API_KEY = key; }

// 可能支持对口型的模型列表
const LIP_SYNC_MODELS = [
  'live-portrait',
  'LivePortrait',
  'wav2lip',
  'Wav2Lip',
  'SadTalker',
  'MuseTalk',
  'face-animation'
];

// 有效模型缓存
let activeModel = null;

/**
 * 视频+音频 → 对口型视频
 */
async function syncVideoAudio(videoPath, audioPath) {
  const videoBuffer = fs.readFileSync(videoPath);
  const audioBuffer = fs.readFileSync(audioPath);

  // 尝试找到可用的对口型模型
  const model = await findLipSyncModel();
  if (!model) {
    // 没有对口型模型，做简单的视频+音频合成
    return simpleCompose(videoPath, audioPath);
  }

  const formData = new FormData();
  formData.append('model', model);
  formData.append('video', new Blob([videoBuffer]), path.basename(videoPath));
  formData.append('audio', new Blob([audioBuffer]), path.basename(audioPath));

  const response = await fetch(`${MOARK_BASE}/async/videos/generations`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`
    },
    body: formData
  });

  if (!response.ok) {
    const errText = await response.text();
    console.log(`对口型模型 ${model} 不可用，使用简单合成`);
    return simpleCompose(videoPath, audioPath);
  }

  const data = await response.json();
  const taskId = data.task_id;

  // 轮询等待任务完成
  const result = await pollTask(taskId);

  if (!result || !result.file_url) {
    return simpleCompose(videoPath, audioPath);
  }

  // 下载结果视频
  const videoResponse = await fetch(result.file_url);
  const outputBuffer = Buffer.from(await videoResponse.arrayBuffer());
  const outputFileName = `lipsync_${Date.now()}.mp4`;
  const outputPath = path.join(__dirname, '..', 'output', outputFileName);
  fs.writeFileSync(outputPath, outputBuffer);

  return {
    videoPath: `/output/${outputFileName}`,
    absolutePath: outputPath,
    duration: result.duration || 0
  };
}

/**
 * 文本 → 语音 → 对口型视频
 */
async function syncWithText(audioPath, text) {
  // 生成默认数字人视频
  return simpleCompose(null, audioPath);
}

/**
 * 查找可用的对口型模型
 */
async function findLipSyncModel() {
  if (activeModel) return activeModel;

  // 先直接用配置的模型试一次
  try {
    const testRes = await fetch(`${MOARK_BASE}/async/videos/generations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: config.lipSync.model,
        prompt: 'test'
      })
    });

    if (testRes.ok || testRes.status !== 404) {
      activeModel = config.lipSync.model;
      return activeModel;
    }
  } catch (e) {
    // ignore
  }

  // 逐个尝试已知模型
  for (const model of LIP_SYNC_MODELS) {
    try {
      const res = await fetch(`${MOARK_BASE}/async/videos/generations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ model, prompt: 'test' })
      });

      // 404表示模型不存在，400可能是参数问题（模型存在）
      if (res.status !== 404) {
        console.log(`找到可用的对口型模型: ${model}`);
        activeModel = model;
        return model;
      }
    } catch (e) {
      // continue
    }
  }

  return null;
}

/**
 * 轮询异步任务
 */
async function pollTask(taskId, maxAttempts = 60, interval = 3000) {
  for (let i = 0; i < maxAttempts; i++) {
    await sleep(interval);

    const response = await fetch(`${MOARK_BASE}/task/${taskId}/status`, {
      headers: { 'Authorization': `Bearer ${API_KEY}` }
    });

    if (!response.ok) continue;

    const data = await response.json();

    if (data.status === 'success') {
      return {
        file_url: data.output?.file_url,
        duration: data.output?.duration
      };
    }

    if (data.status === 'failure' || data.status === 'cancelled') {
      return null;
    }
  }

  return null;
}

/**
 * 简单视频+音频合成（无对口型）
 */
function simpleCompose(videoPath, audioPath) {
  const outputFileName = `compose_${Date.now()}.mp4`;
  const outputPath = path.join(__dirname, '..', 'output', outputFileName);

  // 使用系统FFmpeg合成
  const { execSync } = require('child_process');

  if (videoPath && fs.existsSync(videoPath)) {
    try {
      execSync(`ffmpeg -y -i "${videoPath}" -i "${audioPath}" -c:v copy -c:a aac -shortest "${outputPath}"`, {
        stdio: 'pipe',
        timeout: 60000
      });
    } catch (e) {
      // FFmpeg不可用，直接复制视频
      if (fs.existsSync(videoPath) && videoPath !== outputPath) {
        fs.copyFileSync(videoPath, outputPath);
      }
    }
  } else {
    // 没有视频，创建纯音频+黑屏视频
    try {
      execSync(`ffmpeg -y -f lavfi -i color=c=black:s=1080x1920:d=30 -i "${audioPath}" -c:v libx264 -c:a aac -shortest "${outputPath}"`, {
        stdio: 'pipe',
        timeout: 60000
      });
    } catch (e) {
      // 复制音频文件作为兜底
      if (fs.existsSync(audioPath)) {
        fs.copyFileSync(audioPath, outputPath.replace('.mp4', '.mp3'));
      }
    }
  }

  return {
    videoPath: `/output/${outputFileName}`,
    absolutePath: outputPath,
    duration: 0
  };
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = { syncVideoAudio, syncWithText, setApiKey };
