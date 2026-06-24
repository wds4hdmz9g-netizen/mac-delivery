/**
 * 素材匹配 Provider 基类
 */
class BaseMediaProvider {
  constructor(config) {
    this.config = config;
    this.name = 'base';
  }

  /**
   * 根据关键词搜索素材
   * @param {string[]} keywords - 关键词列表
   * @param {number} count - 需要多少个素材
   * @returns {Promise<Array<{url: string, type: 'image'|'video', duration: number, source: string}>>}
   */
  async search(keywords, count = 5) {
    throw new Error('子类必须实现 search()');
  }

  async healthCheck() {
    throw new Error('子类必须实现 healthCheck()');
  }
}

module.exports = BaseMediaProvider;
