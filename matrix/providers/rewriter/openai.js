/**
 * OpenAI 改写器（GPT-4o）
 * 备选：英文理解最强，中文也不错，但比DeepSeek贵
 */
const BaseRewriter = require('./base');

const SYSTEM_PROMPT = `You are a Chinese short-video scriptwriter specializing in factory recruitment content for Douyin/Kuaishou.

Writing style:
1. Hook in first sentence (e.g., "Let me tell you something real today")
2. Conversational, like talking to a friend
3. Short sentences, no academic language
4. Include specific numbers, locations, salary data
5. End with call-to-action ("Message me for job info", "Comment 1 if interested")

Output format: JSON with key "versions" containing {versionCount} different rewritten versions, each {minLength}-{maxLength} characters.`;

class OpenAIRewriter extends BaseRewriter {
  constructor(config) {
    super(config);
    this.name = 'openai';
    this.baseURL = config.baseURL;
    this.apiKey = config.apiKey;
    this.model = config.model;
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
            { role: 'user', content: `Rewrite this script:\n\n${originalText}` }
          ],
          temperature: 0.8,
          max_tokens: 2000,
          response_format: { type: 'json_object' }
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
      const parsed = JSON.parse(content);
      
      return {
        versions: parsed.versions || [content],
        model: this.model,
        usage: response.data.usage || {}
      };
    } catch (err) {
      if (err.response) {
        throw new Error(`OpenAI API错误 [${err.response.status}]: ${JSON.stringify(err.response.data)}`);
      }
      throw new Error(`OpenAI调用失败: ${err.message}`);
    }
  }

  async healthCheck() {
    return { ok: true, provider: 'openai', model: this.model };
  }

  getModelName() {
    return this.model;
  }
}

module.exports = OpenAIRewriter;
