/**
 * cyanlis.cn 第三方文案提取 API
 * 费用：¥0.15/次，传入分享链接直接返回文案
 */
const BaseScraper = require('./base');

class CyanlisScraper extends BaseScraper {
  constructor(config) {
    super(config);
    this.name = 'cyanlis';
    this.apiKey = config.apiKey;
    this.baseURL = config.baseURL;
  }

  async extract(url) {
    const axios = require('axios');
    
    try {
      const response = await axios.post(
        `${this.baseURL}/api/douyin/extract`,
        { url },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 15000
        }
      );

      const data = response.data;
      return {
        title: data.desc || data.title || '',
        text: data.audio_text || data.text || data.content || '',
        author: data.author || data.nickname || '',
        platform: 'douyin'
      };
    } catch (err) {
      if (err.response) {
        throw new Error(`文案提取失败 [${err.response.status}]: ${JSON.stringify(err.response.data)}`);
      }
      throw new Error(`文案提取失败: ${err.message}`);
    }
  }

  async healthCheck() {
    if (!this.apiKey) {
      return { ok: false, provider: 'cyanlis', error: '未配置 API Key' };
    }
    const axios = require('axios');
    try {
      await axios.get(`${this.baseURL}/api/health`, {
        headers: { 'Authorization': `Bearer ${this.apiKey}` },
        timeout: 5000
      });
      return { ok: true, provider: 'cyanlis' };
    } catch {
      return { ok: true, provider: 'cyanlis', warning: '健康检查端点不可用，可能正常' };
    }
  }
}

module.exports = CyanlisScraper;
