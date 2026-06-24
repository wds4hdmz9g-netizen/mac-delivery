/**
 * ASR/语音识别提供者 - 基于模力方舟 Whisper
 */
const fs = require('fs');
const path = require('path');
const config = require('../config/default');

const MOARK_BASE = config.moark.baseUrl;
let API_KEY = config.moark.apiKey;

function setApiKey(key) { API_KEY = key; }

/**
 * 语音转文字
 * @param {string} audioPath - 音频文件路径
 * @param {string} language - 语言（默认zh）
 */
async function transcribe(audioPath, language = 'zh') {
  const formData = new FormData();
  const audioBuffer = fs.readFileSync(audioPath);
  formData.append('file', new Blob([audioBuffer], { type: 'audio/mp3' }), path.basename(audioPath));
  formData.append('model', 'whisper-large');
  formData.append('language', language);

  const response = await fetch(`${MOARK_BASE}/audio/transcriptions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`
    },
    body: formData
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`语音识别失败 (${response.status}): ${errText}`);
  }

  const data = await response.json();

  return {
    text: data.text || '',
    segments: data.segments || [],
    language: data.language || language
  };
}

module.exports = { transcribe, setApiKey };
