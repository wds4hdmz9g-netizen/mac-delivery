/**
 * AI改写 Provider 基类
 * 所有改写大模型都继承这个，保证接口一致，能随时切换
 */
class BaseRewriter {
  constructor(config) {
    this.config = config;
    this.name = 'base';
  }

  /**
   * 改写文案
   * @param {string} originalText - 原始文案
   * @param {object} options - { versionCount, minLength, maxLength }
   * @returns {Promise<{versions: string[], model: string, usage: object}>}
   */
  async rewrite(originalText, options = {}) {
    throw new Error('子类必须实现 rewrite()');
  }

  /** 健康检查 */
  async healthCheck() {
    throw new Error('子类必须实现 healthCheck()');
  }

  /** 获取当前模型名 */
  getModelName() {
    return this.config.model || 'unknown';
  }
}

module.exports = BaseRewriter;
