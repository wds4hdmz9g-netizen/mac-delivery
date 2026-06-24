/**
 * Mock 改写器 - 测试用，不花钱
 * 返回模拟改写结果，方便开发调试
 */
const BaseRewriter = require('./base');

class MockRewriter extends BaseRewriter {
  constructor(config) {
    super(config);
    this.name = 'mock';
  }

  async rewrite(originalText, options = {}) {
    const { versionCount = 3 } = options;
    
    const mockVersions = [];
    const prefixes = ['【避坑提醒】', '【干货分享】', '【最新岗位】'];
    
    for (let i = 0; i < versionCount; i++) {
      mockVersions.push(
        `${prefixes[i % prefixes.length]}\n\n大家好我是杨班长，今天在广州黄埔这边，${originalText.slice(0, 50)}...` +
        `\n\n想在广州找靠谱工作的朋友，可以关注我，每天更新真实岗位信息。`
      );
    }

    return {
      versions: mockVersions,
      model: 'mock',
      usage: { prompt_tokens: 100, completion_tokens: 200, total_tokens: 300 }
    };
  }

  async healthCheck() {
    return { ok: true, provider: 'mock' };
  }
}

module.exports = MockRewriter;
