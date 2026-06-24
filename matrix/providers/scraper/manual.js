/**
 * 手动粘贴模式 - 最稳，不受任何平台API限制
 * 班长直接粘贴对标视频的文案
 */
const BaseScraper = require('./base');

class ManualScraper extends BaseScraper {
  constructor(config) {
    super(config);
    this.name = 'manual';
  }

  /**
   * manual模式特殊：url参数传的是文本内容，不是链接
   */
  async extract(input) {
    // 判断是链接还是纯文本
    const isURL = input.startsWith('http://') || input.startsWith('https://');
    
    if (isURL) {
      return {
        title: '手动输入',
        text: `[链接: ${input}]\n\n请手动粘贴视频文案内容到输入框。\n\n提示：在抖音APP中长按视频 → 复制链接后，可以先手动记下文案再粘贴。`,
        author: '手动输入',
        platform: 'manual',
        _needsManualText: true
      };
    }

    // 纯文本，直接使用
    return {
      title: '手动输入文案',
      text: input.trim(),
      author: '手动输入',
      platform: 'manual'
    };
  }

  async healthCheck() {
    return { ok: true, provider: 'manual' };
  }
}

module.exports = ManualScraper;
