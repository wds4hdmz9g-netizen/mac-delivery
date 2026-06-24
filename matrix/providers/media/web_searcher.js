/**
 * 网络素材搜索下载器 v4.0.6
 * 多源智能搜索：Pexels(视频/图片) → Bing(视频/图片) → Unsplash(图片兜底)
 * ⚠️ 已移除 LoremFlickr 和 Picsum（返回随机不相关图片）
 */
const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');

// ========== 高质量图片源 ==========
const FREE_SOURCES = {
  unsplash: {
    name: 'Unsplash',
    baseURL: 'https://source.unsplash.com',
    needsKey: false,
    type: 'image'
  }
};

class WebMediaSearcher {
  constructor(config = {}) {
    this.pexelsKey = config.pexelsKey || '';
    this.pixabayKey = config.pixabayKey || '';
    this.outputDir = config.outputDir || path.join(process.cwd(), 'output', 'web_media');
    this.maxDownload = config.maxDownload || 5;
    this.timeout = config.timeout || 15000;
    this.aiQueryGen = config.aiQueryGen || null;
    // v4.0.9: 去重记录 — 已下载的视频URL永不再用
    this._historyFile = path.join(this.outputDir, '_download_history.json');
    this._downloadedUrls = new Set();
    this._loadHistory();
  }

  _loadHistory() {
    try {
      if (fs.existsSync(this._historyFile)) {
        const data = JSON.parse(fs.readFileSync(this._historyFile, 'utf-8'));
        if (Array.isArray(data)) { data.forEach(u => this._downloadedUrls.add(u)); }
        console.log(`[WebMedia] 去重记录: ${this._downloadedUrls.size}条`);
      }
    } catch (e) { /* 忽略 */ }
  }

  _saveHistory() {
    try {
      fs.writeFileSync(this._historyFile, JSON.stringify([...this._downloadedUrls]), 'utf-8');
    } catch (e) { /* 忽略 */ }
  }

  /**
   * 用 AI 根据文案语义生成精准英文搜索词
   * @param {string} text - 中文文案
   * @returns {Promise<string[]>}
   */
  async generateAIQueries(text) {
    if (!this.aiQueryGen) {
      // 无AI时回退关键词映射
      const { queries } = this.extractKeywords(text);
      return queries;
    }
    try {
      const aiQueries = await this.aiQueryGen(text);
      if (aiQueries && aiQueries.length > 0) {
        console.log(`[WebMedia] AI生成搜索词:`, aiQueries.slice(0, 5));
        return aiQueries;
      }
    } catch (e) {
      console.warn('[WebMedia] AI查询生成失败:', e.message);
    }
    const { queries } = this.extractKeywords(text);
    return queries;
  }

  /**
   * 从文案提取搜索关键词（中→英映射）
   */
  extractKeywords(text) {
    const lt = text.toLowerCase();
    const keywordMap = [
      { cn: ['电子厂','电子','电器','手机厂'], en: ['electronics','factory','manufacturing'] },
      { cn: ['冲压','冲压岗','冲床'], en: ['metal','stamping','factory machine'] },
      { cn: ['注塑','注塑机','塑料'], en: ['plastic','injection','factory'] },
      { cn: ['CNC','数控','加工中心'], en: ['cnc','machine','workshop'] },
      { cn: ['打磨','抛光'], en: ['polishing','grinding','workshop'] },
      { cn: ['组装','装配','流水线','工位','操作台'], en: ['assembly','line','production','workstation','factory'] },
      { cn: ['仓库','物流','仓储'], en: ['warehouse','storage','logistics'] },
      { cn: ['宿舍','住宿','公寓'], en: ['dormitory','accommodation','room'] },
      { cn: ['食堂','餐厅','包吃'], en: ['canteen','food','dining'] },
      { cn: ['包吃包住'], en: ['dormitory','accommodation','canteen'] },
      { cn: ['长白班','白班'], en: ['factory','day','shift','worker'] },
      { cn: ['夜班','加班','通宵'], en: ['night','shift','factory','overtime'] },
      { cn: ['小时工','临时工','日结'], en: ['temporary','worker','job'] },
      { cn: ['正式工','普工'], en: ['factory','worker','staff'] },
      { cn: ['招工','招聘','招人'], en: ['recruitment','hiring','job fair'] },
      { cn: ['广州','黄埔','广东'], en: ['guangzhou','china','factory','industry'] },
      { cn: ['工厂','车间','厂房'], en: ['factory','workshop','industrial'] },
      { cn: ['打工','上班','工作'], en: ['worker','job','employment'] },
      { cn: ['工资','月薪','时薪','高薪'], en: ['money','salary','payment'] },
      { cn: ['空调','热水','wifi','环境好'], en: ['modern','facility','clean','room'] },
    ];

    const found = new Set();
    for (const m of keywordMap) {
      if (m.cn.some(kw => lt.includes(kw))) {
        m.en.forEach(e => found.add(e));
      }
    }

    if (found.size === 0) {
      // 兜底：通用工厂关键词
      ['factory','worker','manufacturing','workshop','industrial'].forEach(k => found.add(k));
    }

    // 生成多个搜索查询（组合短语比单词更精准）
    const words = [...found];
    const queries = [];

    // v4.0.9: 强制添加 chinese/asian 限定词，搜中国工厂视频
    const phraseTemplates = [
      (w) => `chinese ${w[0] || 'factory'} ${w[1] || 'worker'} factory workers`,
      (w) => `asian workers ${w[0] || 'factory'} ${w[2] || w[1] || 'manufacturing'}`,
      (w) => `china ${w[0] || 'manufacturing'} ${w[1] || 'factory'} workshop interior`,
      (w) => `chinese factory ${w[0] || 'production'} ${w[1] || 'assembly'} line`,
    ];

    for (let i = 0; i < Math.min(4, words.length); i++) {
      const combo = [words[i % words.length], words[(i + 2) % words.length]];
      queries.push(phraseTemplates[i % phraseTemplates.length](combo));
    }

    if (queries.length < 3) {
      queries.push(`chinese factory workshop manufacturing workers`);
      queries.push(`asian factory assembly line workers`);
    }

    return { keywords: words, queries: [...new Set(queries)] };
  }

  /**
   * 搜索并下载素材（多源策略 + AI查询 + 相关度评分）
   * @param {string} text - 文案
   * @param {number} count - 需要多少素材
   * @param {object} options - { aiQueries?: string[], minRelevance?: number }
   * @returns {Promise<Array<{path:string, type:string, source:string, relevance:number}>>}
   */
  async searchAndDownload(text, count = 5, options = {}) {
    // v4.0.9: 保存原始文本副本（text可能在异步流程中被污染）
    const originalText = String(text);
    const aiQueries = options.aiQueries || await this.generateAIQueries(text);
    const queries = aiQueries.length > 0 ? aiQueries : this.extractKeywords(text).queries;
    const minRelevance = options.minRelevance || 0;
    const results = [];

    // 确保输出目录
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    // ===== v5.0: 精简航拍策略 — 只下载需要的数量，不浪费磁盘 =====
    if (this.pexelsKey) {
      console.log(`[WebMedia] 🥇 航拍模式（只下载${count}个）...`);
      // 清掉去重，每次全新搜索
      this._downloadedUrls.clear();
      try { fs.unlinkSync(this._historyFile); } catch {}
      
      try {
        // 策略：3个查询，每个只下载 ceil(count/3) 个，总共刚好 count 个
        const broadQueries = [
          'drone aerial factory industrial',
          'aerial view manufacturing plant drone',
          'industrial factory aerial drone overview',
        ];
        const perBatch = Math.ceil(count / broadQueries.length); // 每批下载3-4个
        
        for (const q of broadQueries) {
          if (results.length >= count) break;
          const need = Math.min(perBatch, count - results.length);
          const r = await this._searchPexels([q], need, true);
          results.push(...r);
        }
        console.log(`[WebMedia] 航拍完成: 下载${results.length}个（目标${count}个）`);
      } catch (e) { console.warn('[WebMedia] 航拍失败:', e.message); }
    }
    
    // ===== v4.0.9 FINAL: 只做航拍，不搜Bing/本地/图片 =====
    // 航拍本来就有8万+库存，永不枯竭
    if (results.length < 3) {
      console.log(`[WebMedia] ⚠️ 航拍仅${results.length}个（正常不会出现）`);
    }

    // 计算相关度：用文案关键词检查文件名/路径，给一个粗略分数
    const scoredResults = results.map(r => ({
      ...r,
      relevance: this._scoreRelevance(text, r)
    }));

    // 过滤低相关度（但至少保留一些兜底）
    let filtered = scoredResults.filter(r => r.relevance >= minRelevance);
    if (filtered.length < 3) {
      // 太低就留最高分的几个
      filtered = scoredResults.sort((a, b) => b.relevance - a.relevance).slice(0, count);
    }

    console.log(`[WebMedia] 相关度过滤: ${scoredResults.length}→${filtered.length} (min=${minRelevance})`);

    return filtered.slice(0, count);
  }

  /**
   * 简单相关度评分（基于中文关键词命中）
   */
  _scoreRelevance(text, result) {
    const keywords = this.extractKeywords(text).keywords;
    if (keywords.length === 0) return 3;
    
    // Unsplash/Bing 来源天然比纯随机好
    let baseScore = 5;
    if (result.source === 'pexels') baseScore = 7;
    if (result.source === 'bing') baseScore = 8; // Bing搜索结果天然精准
    if (result.source === 'unsplash') baseScore = 6;
    
    return baseScore;
  }

  // ========== Pexels API 搜索 ==========
  async _searchPexels(queries, count, videoOnly = false) {
    const results = [];
    const perQuery = Math.ceil(count / Math.min(queries.length, 3));

    for (const query of queries.slice(0, 3)) {
      if (results.length >= count) break;
      try {
        // videoOnly=true → 只搜视频；videoOnly=false → 只搜图片
        const searchType = videoOnly ? 'videos' : '';
        const endpoint = searchType === 'videos'
          ? `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=${perQuery}`
          : `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${perQuery}`;

        const data = await this._fetchJSON(endpoint, {
          'Authorization': this.pexelsKey
        });

        if (searchType === 'videos' && data.videos) {
          for (const v of data.videos) {
            if (results.length >= count) break;
            // v4.0.9: Pexels API quality字段已变空，改用分辨率优先选取
            const files = v.video_files || [];
            // 优先1280x720，其次960x540，最后640x360
            const ordered = [...files].sort((a, b) => (b.width || 0) - (a.width || 0));
            const file = ordered.find(f => (f.width || 0) <= 1280) || ordered[0];
            if (file && file.link) {
              // v4.0.9: 去重，跳过已下载的视频
              if (this._downloadedUrls.has(file.link)) {
                continue;
              }
              console.log(`[WebMedia] Pexels视频: ${(file.width||0)}x${(file.height||0)} ${v.duration}s`);
              const localPath = await this._downloadFile(file.link, 'video');
              if (localPath) {
                this._downloadedUrls.add(file.link);
                results.push({ path: localPath, type: 'video', source: 'pexels' });
              }
            }
          }
        } else if (data.photos && !videoOnly) {
          for (const p of data.photos) {
            if (results.length >= count) break;
            const url = p.src?.large || p.src?.medium;
            if (url) {
              if (this._downloadedUrls.has(url)) continue;
              const localPath = await this._downloadFile(url, 'image');
              if (localPath) results.push({ path: localPath, type: 'image', source: 'pexels' });
            }
          }
        }
      } catch (e) {
        // 单个查询失败继续下一个
      }
    }
    return results;
  }

  // ========== Pexels API 搜索（视频/图片）==========
  async _searchPexels(queries, count, videoOnly = false) {
    const results = [];
    const perQuery = Math.ceil(count / Math.min(queries.length, 3));

    for (const query of queries.slice(0, 3)) {
      if (results.length >= count) break;
      try {
        // v4.0.9 FINAL: 随机页码确保永不重复
        const randomPage = Math.floor(Math.random() * 20) + 1;
        const searchType = videoOnly ? 'videos' : '';
        const endpoint = searchType === 'videos'
          ? `https://api.pexels.com/videos/search?query=${encodeURIComponent(query)}&per_page=${perQuery}&page=${randomPage}`
          : `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${perQuery}&page=${randomPage}`;

        const data = await this._fetchJSON(endpoint, {
          'Authorization': this.pexelsKey
        });
        if (!data) continue;

        if (searchType === 'videos' && data.videos) {
          for (const v of data.videos) {
            if (results.length >= count) break;
            const files = v.video_files || [];
            const ordered = [...files].sort((a, b) => (b.width || 0) - (a.width || 0));
            const file = ordered.find(f => (f.width || 0) <= 1280) || ordered[0];
            if (file && file.link) {
              const localPath = await this._downloadFile(file.link, 'video');
              if (localPath) {
                results.push({ path: localPath, type: 'video', source: 'pexels' });
              }
            }
          }
        }
      } catch (e) {
        console.warn(`[WebMedia] Pexels搜索失败: ${query}: ${e.message}`);
      }
    }
    return results;
  }

  // ========== Unsplash Source 搜索（免Key） ==========
  async _searchUnsplash(queries, count) {
    const results = [];
    const sizes = ['720x1280', '1080x1350', '800x1200'];

    for (let i = 0; i < count; i++) {
      const query = queries[i % queries.length];
      const size = sizes[i % sizes.length];
      // Unsplash Source: 免费API，按关键词返回随机高质量图片
      const url = `https://source.unsplash.com/${size}/?${query}&sig=${Date.now() + i}`;

      try {
        // source.unsplash.com 会 302 重定向到真实图片URL
        const finalURL = await this._resolveRedirect(url);
        if (finalURL && finalURL !== url) {
          const localPath = await this._downloadFile(finalURL, 'image');
          if (localPath) results.push({ path: localPath, type: 'image', source: 'unsplash' });
        }
      } catch (e) {
        // 跳过失败的
      }
    }
    return results;
  }

  // ========== Bing 搜索（视频/图片） ==========
  async _searchBing(queries, count, videoMode = false) {
    const results = [];
    const perQuery = Math.min(count, 5);

    for (const query of queries.slice(0, 3)) {
      if (results.length >= count) break;
      try {
        const searchTerm = `${query} factory china`;
        // 视频模式用 Bing Videos，图片模式用 Bing Images
        const searchPath = videoMode ? 'videos/search' : 'images/search';
        const filterParam = videoMode ? '' : '&qft=+filterui:photo-photo';
        const url = `https://www.bing.com/${searchPath}?q=${encodeURIComponent(searchTerm)}&first=1&count=${perQuery}${filterParam}`;

        console.log(`[WebMedia] Bing${videoMode ? '视频' : '图片'}: ${searchTerm}`);
        const html = await this._fetchHTML(url);
        if (!html) continue;

        if (videoMode) {
          // Bing视频搜索结果提取（提取视频页面URL，非直接视频文件）
          const vidRegex = /mediaurl&quot;:&quot;(https?:\\\/\\\/[^&]+?\.(?:mp4|webm)[^&]*?)&quot;/gi;
          const vidMatches = [...html.matchAll(vidRegex)];
          
          for (let i = 0; i < Math.min(vidMatches.length, perQuery); i++) {
            if (results.length >= count) break;
            const rawUrl = vidMatches[i][1]
              .replace(/\\\//g, '/')
              .replace(/&amp;/g, '&');
            
            try {
              const localPath = await this._downloadFile(rawUrl, 'video');
              if (localPath) {
                results.push({ path: localPath, type: 'video', source: 'bing' });
                console.log(`[WebMedia] Bing视频下载: ${path.basename(localPath)}`);
              }
            } catch {}
          }
        } else {
          // Bing图片搜索
          const imgRegex = /murl&quot;:&quot;(https?:\\\/\\\/[^&]+?\.(?:jpg|jpeg|png|webp)[^&]*?)&quot;/gi;
          const matches = [...html.matchAll(imgRegex)];
          
          for (let i = 0; i < Math.min(matches.length, perQuery); i++) {
            if (results.length >= count) break;
            const rawUrl = matches[i][1]
              .replace(/\\\//g, '/')
              .replace(/&amp;/g, '&');
            
            try {
              const localPath = await this._downloadFile(rawUrl, 'image');
              if (localPath) {
                results.push({ path: localPath, type: 'image', source: 'bing' });
              }
            } catch {}
          }
        }
      } catch (e) {
        console.warn(`[WebMedia] Bing查询"${query}"失败:`, e.message);
      }
    }
    console.log(`[WebMedia] Bing${videoMode ? '视频' : '图片'}搜索完成: ${results.length}个`);
    return results;
  }

  // ========== 本地视频素材（v4.0.9 — 英文关键词匹配） ==========
  _getLocalVidsByKeywords(keywords, count) {
    const mediaLib = path.join(__dirname, '..', '..', 'media_library');
    const lowerKeys = keywords.map(k => k.toLowerCase());
    
    // weighted: 核心关键词权重3，通用词1，确保精准匹配排前面
    const videoMap = [
      { path: 'factory/冲压岗视频素材.mp4', 
        core: ['stamp','press','punch','forge','steel','injection','mold','plastic','cast','die','cnc','metal'],
        broad: ['machine','factory','industrial','manufacturing','workshop'] },
      { path: 'factory/视频底图_冲压车间.mp4', 
        core: ['stamp','press','punch','forge','steel','injection','mold','plastic','cnc','metal'],
        broad: ['machine','factory','industrial','manufacturing','workshop'] },
      { path: 'factory/视频底图_电子厂.mp4', 
        core: ['electronics','phone','circuit','pcb','solder','assembly','component','chip'],
        broad: ['factory','product','manufacturing','worker','production','industrial'] },
      { path: 'factory/视频底图_仓库.mp4', 
        core: ['warehouse','storage','logistics','forklift','package','ship','stock','cargo','inventory'],
        broad: ['factory','industrial','work','worker'] },
      { path: 'factory/视频底图_工厂外景.mp4', 
        core: ['exterior','building','entrance','guangzhou','district','recruit','gate','sign'],
        broad: ['factory','plant','china','industrial','company'] },
      { path: 'worker/视频底图_办公室.mp4', 
        core: ['office','computer','desk','admin','hr','interview','meeting','white','collar','paperwork'],
        broad: ['work','worker','company','job'] },
    ];

    const scored = videoMap.map(v => ({
      ...v,
      score: v.core.filter(kw => lowerKeys.some(lk => lk.includes(kw) || kw.includes(lk))).length * 3 +
             v.broad.filter(kw => lowerKeys.some(lk => lk.includes(kw) || kw.includes(lk))).length
    }));

    const matched = scored.filter(v => v.score > 0).sort((a, b) => b.score - a.score).slice(0, count);
    
    // v4.0.9: 至少返回4个视频（减少重复感）
    const fallbackVids = [
      videoMap.find(v => v.path.includes('冲压车间')),
      videoMap.find(v => v.path.includes('电子厂')),
      videoMap.find(v => v.path.includes('外景')),
      videoMap.find(v => v.path.includes('仓库')),
    ].filter(Boolean);
    
    const selected = [];
    // 先用匹配到的
    for (const m of matched) {
      if (!selected.find(s => s.path === m.path)) selected.push(m);
    }
    // 不够4个，用兜底补齐
    for (const f of fallbackVids) {
      if (selected.length >= Math.max(count, 4)) break;
      if (!selected.find(s => s.path === f.path)) selected.push(f);
    }

    const results = [];
    for (const v of selected) {
      const fullPath = path.join(mediaLib, v.path);
      if (fs.existsSync(fullPath)) {
        results.push({ path: fullPath, type: 'video', source: 'web', relevance: 7 + v.score });
        console.log(`[WebMedia] → ${path.basename(v.path)} (score:${v.score})`);
      }
    }
    return results;
  }

  // ========== HTTP 工具 ==========

  /** 下载文件到本地 */
  async _downloadFile(url, type) {
    return new Promise((resolve) => {
      const proto = url.startsWith('https') ? https : http;
      const req = proto.get(url, { timeout: this.timeout }, (res) => {
        // 处理重定向
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          this._downloadFile(res.headers.location, type).then(resolve);
          return;
        }
        if (res.statusCode !== 200) {
          resolve(null);
          return;
        }

        const chunks = [];
        res.on('data', c => chunks.push(c));
        res.on('end', () => {
          try {
            const buffer = Buffer.concat(chunks);
            if (buffer.length < 100) { resolve(null); return; }

            const ext = type === 'video' ? '.mp4' : '.jpg';
            const filename = `web_${Date.now()}_${Math.random().toString(36).slice(2, 6)}${ext}`;
            const filepath = path.join(this.outputDir, filename);
            fs.writeFileSync(filepath, buffer);
            resolve(filepath);
          } catch {
            resolve(null);
          }
        });
      });

      req.on('error', () => resolve(null));
      req.on('timeout', () => { req.destroy(); resolve(null); });
      req.end();
    });
  }

  /** 解析302重定向获取最终URL */
  async _resolveRedirect(url) {
    return new Promise((resolve) => {
      const proto = url.startsWith('https') ? https : http;
      const req = proto.get(url, { timeout: 8000 }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          resolve(res.headers.location);
        } else if (res.statusCode === 200) {
          resolve(url); // 没有重定向，直接返回原URL
        } else {
          resolve(null);
        }
      });
      req.on('error', () => resolve(null));
      req.on('timeout', () => { req.destroy(); resolve(null); });
      req.end();
    });
  }

  /** 获取JSON */
  async _fetchJSON(url, headers = {}) {
    return new Promise((resolve, reject) => {
      const proto = url.startsWith('https') ? https : http;
      const options = {
        headers: { 'User-Agent': 'ContentFactory/3.0', ...headers },
        timeout: this.timeout
      };
      const req = proto.get(url, options, (res) => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => {
          try { resolve(JSON.parse(data)); }
          catch (e) { reject(new Error('JSON parse failed')); }
        });
      });
      req.on('error', reject);
      req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
      req.end();
    });
  }

  /** 获取HTML文本 */
  async _fetchHTML(url, headers = {}) {
    return new Promise((resolve) => {
      const proto = url.startsWith('https') ? https : http;
      const options = {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml',
          'Accept-Language': 'en-US,en;q=0.9,zh-CN;q=0.8',
          ...headers,
        },
        timeout: 12000
      };
      const req = proto.get(url, options, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          this._fetchHTML(res.headers.location, headers).then(resolve);
          return;
        }
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => resolve(data));
      });
      req.on('error', () => resolve(null));
      req.on('timeout', () => { req.destroy(); resolve(null); });
      req.end();
    });
  }
}

module.exports = WebMediaSearcher;
