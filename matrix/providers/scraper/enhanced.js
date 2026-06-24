/**
 * 增强版文案扒取器
 * 支持粘贴链接自动提取文案、手动编辑改写
 */
const BaseScraper = require('./base');

class EnhancedScraper extends BaseScraper {
  constructor(config) {
    super(config);
    this.name = 'enhanced';
  }

  /**
   * 智能提取（自动判链接还是纯文本）
   * @param {string} input - 链接或纯文本
   */
  async extract(input) {
    // 判断是否是链接
    const urlPattern = /https?:\/\/[^\s]+/;
    const match = input.match(urlPattern);

    if (match) {
      return this._extractFromURL(match[0]);
    }

    // 纯文本直接返回
    return {
      success: true,
      text: input,
      source: 'text',
      method: 'direct'
    };
  }

  /** 从链接提取文案 v4.0.9 */
  async _extractFromURL(url) {
    try {
      // 抖音/小红书等SPA页面大概率抓不到正文，直接用链接提示用户手动粘贴
      const knownSPA = /douyin\.com|tiktok\.com|xiaohongshu\.com|kuaishou\.com|bilibili\.com|weibo\.com/.test(url);
      
      try {
        const res = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml'
          },
          redirect: 'follow',
          signal: AbortSignal.timeout(10000),
        });

        const html = await res.text();
        let text = '';

        // 1. 元标签
        const ogMatch = html.match(/<meta[^>]+property="og:description"[^>]+content="([^"]+)"/i);
        const descMatch = html.match(/<meta[^>]+name="description"[^>]+content="([^"]+)"/i);
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        if (ogMatch) text = ogMatch[1];
        else if (descMatch) text = descMatch[1];

        // 2. 正文提取
        if (!text || text.length < 20) {
          const cleaned = html
            .replace(/<script[\s\S]*?<\/script>/gi, '')
            .replace(/<style[\s\S]*?<\/style>/gi, '')
            .replace(/<nav[\s\S]*?<\/nav>/gi, '')
            .replace(/<header[\s\S]*?<\/header>/gi, '')
            .replace(/<footer[\s\S]*?<\/footer>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/\s+/g, ' ')
            .trim();

          if (cleaned.length > text.length) text = cleaned;
        }

        // 3. 加上页面标题
        if (titleMatch && titleMatch[1] && titleMatch[1].length > 5) {
          const title = titleMatch[1].replace(/\s+/g, ' ').trim();
          if (!text.includes(title)) text = title + '。' + text;
        }

        if (text && text.length >= 10) {
          return { success: true, text: text.slice(0, 1500), source: url, method: 'web_scrape' };
        }
      } catch (fetchErr) {
        console.warn('[Scraper] fetch失败:', fetchErr.message);
      }

      // 抓取失败/SPA页面 → 引导手动粘贴
      const hint = knownSPA
        ? '抖音/小红书等平台无法自动提取文案，请手动复制文案粘贴到输入框'
        : '未能从链接自动提取文案，请手动粘贴文案内容';
      return {
        success: false, text: '', source: url, method: 'web_scrape',
        error: hint + `\n\n（链接: ${url}）`
      };

    } catch (err) {
      return {
        success: false, text: '', source: url, method: 'web_scrape',
        error: `链接抓取失败，请手动粘贴文案\n（${err.message}）`
      };
    }
  }

  async healthCheck() {
    return { ok: true, provider: 'enhanced_scraper' };
  }
}

module.exports = EnhancedScraper;
