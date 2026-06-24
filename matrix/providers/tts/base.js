/**
 * TTS Provider 基类
 * 所有语音合成服务都继承这个
 */
class BaseTTS {
  constructor(config) {
    this.config = config;
    this.name = 'base';
  }

  /**
   * 文字转语音
   * @param {string} text - 要合成的文本
   * @param {object} options - { voice, rate, pitch }
   * @returns {Promise<{audioPath: string, duration: number, format: string}>}
   */
  async synthesize(text, options = {}) {
    throw new Error('子类必须实现 synthesize()');
  }

  async healthCheck() {
    throw new Error('子类必须实现 healthCheck()');
  }
}

module.exports = BaseTTS;
