/**
 * TTS Provider 工厂
 * 
 * 切换方法：改 config/providers.js 里的 tts.active
 */

const EdgeTTS = require('./edgetts');
const MockTTS = require('./mock');

function createTTS(config) {
  const activeName = config.active;
  const providerConfig = config.providers[activeName];

  if (!providerConfig) {
    throw new Error(`未知的TTS: "${activeName}"，可选: ${Object.keys(config.providers).join(', ')}`);
  }

  if (activeName === 'mock') {
    console.log('[TTS] 使用 Mock 模式（静音）');
    return new MockTTS(providerConfig);
  }

  console.log(`[TTS] 激活: ${activeName}`);

  switch (activeName) {
    case 'edgetts':
      return new EdgeTTS(providerConfig);
    case 'volcengine':
      console.log('[TTS] 火山引擎待实现，已降级为 Mock');
      return new MockTTS({ enabled: true });
    case 'openai':
      console.log('[TTS] OpenAI TTS 待实现，已降级为 Mock');
      return new MockTTS({ enabled: true });
    default:
      throw new Error(`TTS "${activeName}" 尚未实现`);
  }
}

module.exports = { createTTS };
