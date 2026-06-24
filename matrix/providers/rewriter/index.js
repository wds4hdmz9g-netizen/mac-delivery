/**
 * Rewriter Provider 工厂
 * 根据配置自动创建对应的改写器实例
 * 
 * 切换方法：改 config/providers.js 里的 rewriter.active
 */

const DeepSeekRewriter = require('./deepseek');
const OpenAIRewriter = require('./openai');
const MockRewriter = require('./mock');

/**
 * 创建改写器实例
 * @param {object} config - providers.js 中的 rewriter 配置
 * @returns {BaseRewriter}
 */
function createRewriter(config) {
  const activeName = config.active;
  const providerConfig = config.providers[activeName];

  if (!providerConfig) {
    throw new Error(`未知的改写器: "${activeName}"，可选: ${Object.keys(config.providers).join(', ')}`);
  }

  // 如果active是mock，或者当前provider有mock.enabled
  if (activeName === 'mock') {
    console.log('[Rewriter] 使用 Mock 模式（不调用API）');
    return new MockRewriter(providerConfig);
  }

  console.log(`[Rewriter] 激活: ${activeName} / ${providerConfig.model}`);
  
  switch (activeName) {
    case 'deepseek':
      return new DeepSeekRewriter(providerConfig);
    case 'openai':
      return new OpenAIRewriter(providerConfig);
    case 'claude':
      // Claude 用 OpenAI 兼容格式（通过中转）
      console.log('[Rewriter] Claude 使用 OpenAI 兼容模式');
      return new OpenAIRewriter(providerConfig);
    case 'qwen':
      // 通义千问也用 OpenAI 兼容 API
      console.log('[Rewriter] 通义千问使用 OpenAI 兼容模式');
      return new OpenAIRewriter(providerConfig);
    default:
      throw new Error(`改写器 "${activeName}" 尚未实现`);
  }
}

module.exports = { createRewriter };
