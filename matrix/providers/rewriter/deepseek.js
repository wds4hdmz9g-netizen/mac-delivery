/**
 * DeepSeek 改写器
 * 首推：便宜好用，中文理解强，¥5/月
 */
const BaseRewriter = require('./base');

const SYSTEM_PROMPT = `你是一个工厂招工类短视频文案写手，专门为抖音/快手平台创作口播文案。

你的写作风格：
1. 开头必须有吸引人的钩子（比如"今天跟大家说个实在的"、"很多人不知道"、"避坑提醒"）
2. 语言口语化，像朋友聊天，不要书面语
3. 多用短句，每句不超过20字
4. 包含具体的数字、地点、薪资数据，增加可信度
5. 结尾要有行动号召（"想找靠谱工作的可以找我"、"评论区扣1"）

输出格式要求：
- 生成 {versionCount} 个不同的改写版本
- 每个版本 {minLength}-{maxLength} 字
- 每个版本用不同的切入角度
- 保持原意但换说法，不能照抄原文
- 用 JSON 格式输出：{"versions": ["版本1", "版本2", ...]}`;

class DeepSeekRewriter extends BaseRewriter {
  constructor(config) {
    super(config);
    this.name = 'deepseek';
    this.baseURL = config.baseURL;
    this.apiKey = config.apiKey;
    this.model = config.model;
    this.temperature = config.temperature || 0.8;
    this.maxTokens = config.maxTokens || 2000;
  }

  async rewrite(originalText, options = {}) {
    const { versionCount = 3, minLength = 100, maxLength = 300 } = options;
    
    const prompt = SYSTEM_PROMPT
      .replace('{versionCount}', versionCount)
      .replace('{minLength}', minLength)
      .replace('{maxLength}', maxLength);

    const axios = require('axios');
    
    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: this.model,
          messages: [
            { role: 'system', content: prompt },
            { role: 'user', content: `请改写以下文案：\n\n${originalText}` }
          ],
          temperature: this.temperature,
          max_tokens: this.maxTokens,
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      const content = response.data.choices[0].message.content;
      // 尝试解析JSON，失败则按行拆分
      let parsed;
      try {
        parsed = JSON.parse(content);
      } catch(e) {
        // 不是JSON，按换行或编号拆分版本
        const lines = content.split('\n').filter(l => l.trim()).slice(0, versionCount);
        parsed = { versions: lines.length > 1 ? lines : [content] };
      }
      
      return {
        versions: parsed.versions || parsed || [content],
        model: this.model,
        usage: response.data.usage || {}
      };
    } catch (err) {
      if (err.response) {
        const status = err.response.status;
        // 429 限流 → 自动等2秒重试一次
        if (status === 429) {
          console.log('[DeepSeek] 429限流，等待2秒后重试...');
          await new Promise(r => setTimeout(r, 2000));
          try {
            const retryResponse = await axios.post(
              `${this.baseURL}/chat/completions`,
              {
                model: this.model,
                messages: [
                  { role: 'system', content: prompt },
                  { role: 'user', content: `请改写以下文案：\n\n${originalText}` }
                ],
                temperature: this.temperature,
                max_tokens: this.maxTokens,
              },
              {
                headers: {
                  'Authorization': `Bearer ${this.apiKey}`,
                  'Content-Type': 'application/json'
                },
                timeout: 30000
              }
            );
            const content = retryResponse.data.choices[0].message.content;
            let parsed;
            try { parsed = JSON.parse(content); } catch(e) {
              const lines = content.split('\n').filter(l => l.trim()).slice(0, versionCount);
              parsed = { versions: lines.length > 1 ? lines : [content] };
            }
            return {
              versions: parsed.versions || parsed || [content],
              model: this.model,
              usage: retryResponse.data.usage || {}
            };
          } catch (retryErr) {
            throw new Error(`DeepSeek API错误 [429重试失败]: 请稍后再试`);
          }
        }
        throw new Error(`DeepSeek API错误 [${status}]: ${JSON.stringify(err.response.data)}`);
      }
      throw new Error(`DeepSeek调用失败: ${err.message}`);
    }
  }

  async healthCheck() {
    const axios = require('axios');
    try {
      await axios.get(`${this.baseURL}/models`, {
        headers: { 'Authorization': `Bearer ${this.apiKey}` },
        timeout: 5000
      });
      return { ok: true, provider: 'deepseek', model: this.model };
    } catch (err) {
      return { ok: false, provider: 'deepseek', error: err.message };
    }
  }
}

module.exports = DeepSeekRewriter;
