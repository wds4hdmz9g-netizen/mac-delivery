/**
 * 文案扒取 Provider 基类
 */
class BaseScraper {
  constructor(config) {
    this.config = config;
    this.name = 'base';
  }

  /**
   * 从URL扒取文案
   * @param {string} url - 视频链接
   * @returns {Promise<{title: string, text: string, author: string, platform: string}>}
   */
  async extract(url) {
    throw new Error('子类必须实现 extract()');
  }

  async healthCheck() {
    throw new Error('子类必须实现 healthCheck()');
  }
}

module.exports = BaseScraper;
