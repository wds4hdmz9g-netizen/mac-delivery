/**
 * Mock TTS - 测试用
 * 生成静音MP3替代真实语音，方便快速测试流程
 */
const BaseTTS = require('./base');
const path = require('path');
const fs = require('fs');

class MockTTS extends BaseTTS {
  constructor(config) {
    super(config);
    this.name = 'mock';
  }

  async synthesize(text, options = {}) {
    const outputDir = path.join(process.cwd(), 'output', 'audio');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const timestamp = Date.now();
    const outputFile = path.join(outputDir, `tts_mock_${timestamp}.mp3`);

    // 生成1秒静音（最小MP3文件）
    // 用 Node.js 写一个最小的合法 MP3
    const silenceMP3 = Buffer.from([
      0xFF, 0xFB, 0x90, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
    ]);
    fs.writeFileSync(outputFile, silenceMP3);

    return {
      audioPath: outputFile,
      duration: this._estimateDuration(text),
      format: 'mp3',
      size: silenceMP3.length,
      _mock: true
    };
  }

  async healthCheck() {
    return { ok: true, provider: 'mock' };
  }

  _estimateDuration(text) {
    const charCount = text.replace(/\s/g, '').length;
    return Math.ceil(charCount / 3);
  }
}

module.exports = MockTTS;
