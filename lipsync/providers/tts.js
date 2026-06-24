/**
 * TTS/语音合成提供者 - 基于模力方舟 ChatTTS API
 */
const fs = require('fs');
const path = require('path');
const config = require('../config/default');

const MOARK_BASE = config.moark.baseUrl;
let API_KEY = config.moark.apiKey;

function setApiKey(key) { API_KEY = key; }

// 存储克隆的声纹信息
const voiceProfiles = new Map();

// 加载已有的克隆音色
function loadExistingVoices() {
  const voicesDir = path.join(__dirname, '..', 'resources', 'voices');
  if (!fs.existsSync(voicesDir)) return;

  const files = fs.readdirSync(voicesDir);
  for (const file of files) {
    if (file.endsWith('.json')) {
      try {
        const profile = JSON.parse(fs.readFileSync(path.join(voicesDir, file), 'utf-8'));
        voiceProfiles.set(profile.id, profile);
      } catch (e) {
        // skip invalid files
      }
    }
  }
}

// 初始化
loadExistingVoices();

/**
 * 从音频文件提取声纹（语音克隆）
 */
async function cloneVoice(audioPath, promptText, voiceName) {
  const audioBuffer = fs.readFileSync(audioPath);
  const audioBase64 = audioBuffer.toString('base64');

  const formData = new FormData();
  formData.append('model', 'CosyVoice-300M');
  formData.append('file', new Blob([audioBuffer], { type: 'audio/mp3' }), path.basename(audioPath));
  formData.append('prompt_text', promptText || '');

  const response = await fetch(`${MOARK_BASE}/audio/voice-feature-extraction`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`
    },
    body: formData
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`声纹提取失败 (${response.status}): ${errText}`);
  }

  // 保存声纹文件
  const voiceId = `voice_${Date.now()}`;
  const ptPath = path.join(__dirname, '..', 'resources', 'voices', `${voiceId}.pt`);
  const ptBuffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(ptPath, ptBuffer);

  // 保存声纹配置
  const profile = {
    id: voiceId,
    name: voiceName,
    ptPath: ptPath,
    promptText: promptText,
    createdAt: new Date().toISOString()
  };
  fs.writeFileSync(
    path.join(__dirname, '..', 'resources', 'voices', `${voiceId}.json`),
    JSON.stringify(profile, null, 2)
  );
  voiceProfiles.set(voiceId, profile);

  return {
    voiceId,
    voiceName,
    ptPath
  };
}

/**
 * 文字转语音
 */
async function synthesize(text, voiceId) {
  const body = {
    model: config.tts.model,
    input: text,
    voice: 'alloy'
  };

  // 如果指定了克隆音色，添加声纹参数
  if (voiceId && voiceProfiles.has(voiceId)) {
    const profile = voiceProfiles.get(voiceId);
    body.extra_body = {
      prompt_audio_url: profile.promptAudioUrl || '',
      prompt_text: profile.promptText || ''
    };
  }

  const response = await fetch(`${MOARK_BASE}/audio/speech`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`语音合成失败 (${response.status}): ${errText}`);
  }

  // 保存音频文件
  const audioFileName = `tts_${Date.now()}.mp3`;
  const audioPath = path.join(__dirname, '..', 'output', audioFileName);

  const audioBuffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(audioPath, audioBuffer);

  // 计算时长（粗略估算）
  const bytesPerSecond = 16000; // MP3 approx
  const duration = audioBuffer.length / bytesPerSecond;

  return {
    audioPath: `/output/${audioFileName}`,
    absolutePath: audioPath,
    duration: Math.round(duration),
    format: 'mp3'
  };
}

/**
 * 获取可用音色列表
 */
function getVoices() {
  const voices = [...config.tts.voices];

  // 添加已克隆的声纹
  for (const [id, profile] of voiceProfiles) {
    voices.push({
      id: id,
      name: profile.name,
      description: '自定义克隆音色'
    });
  }

  return voices;
}

module.exports = { cloneVoice, synthesize, getVoices, setApiKey };
