/**
 * 本地素材库 Provider
 * 最贴切工厂招工场景，优先使用
 * 
 * 素材放在 media_library/ 目录下，按分类存放：
 *   factory/  - 车间流水线
 *   canteen/  - 食堂
 *   dorm/     - 宿舍
 *   street/   - 广州街景
 *   worker/   - 工人日常
 */
const BaseMediaProvider = require('./base');
const path = require('path');
const fs = require('fs');

class LocalMediaProvider extends BaseMediaProvider {
  constructor(config) {
    super(config);
    this.name = 'local';
    this.basePath = path.resolve(config.basePath || './media_library');
    this.categories = config.categories || {};
    this._cache = null;  // 素材索引缓存
  }

  /**
   * 根据关键词在本地素材库中搜索
   */
  async search(keywords, count = 5) {
    const allMedia = await this._indexAllMedia();
    
    if (allMedia.length === 0) {
      return [];  // 素材库为空，返回空数组
    }

    // 按关键词匹配度排序
    const scored = allMedia.map(media => {
      const score = this._matchScore(keywords, media.tags || []);
      return { ...media, score };
    });

    scored.sort((a, b) => b.score - a.score);

    // 取 top N，0分的过滤掉
    const results = scored
      .filter(m => m.score > 0)
      .slice(0, count);

    // 如果本地不够，循环补充
    if (results.length < count && scored.length > 0) {
      const fillerCount = count - results.length;
      const fillers = scored
        .filter(m => !results.includes(m))
        .slice(0, fillerCount);
      results.push(...fillers);
    }

    return results.map(m => ({
      url: m.path,
      type: m.type,
      duration: m.duration || 3,
      source: 'local',
      tags: m.tags,
      category: m.category
    }));
  }

  async healthCheck() {
    const allMedia = await this._indexAllMedia();
    return {
      ok: true,
      provider: 'local',
      totalFiles: allMedia.length,
      categories: Object.keys(this.categories)
    };
  }

  /** 建立素材索引 */
  async _indexAllMedia() {
    if (this._cache) return this._cache;

    const media = [];
    const supportedExts = ['.mp4', '.mov', '.avi', '.webm', '.jpg', '.jpeg', '.png', '.gif', '.webp'];

    // 扫描分类子目录
    for (const [catName, catConfig] of Object.entries(this.categories)) {
      const catPath = path.join(this.basePath, catConfig.path);
      if (!fs.existsSync(catPath)) continue;
      this._scanDir(catPath, catName, catConfig.tags || [], supportedExts, media);
    }

    // 兜底：也扫描根目录（有些素材直接放在根目录没归类）
    if (fs.existsSync(this.basePath)) {
      this._scanDir(this.basePath, 'general', ['工厂','招工','打工','劳务'], supportedExts, media);
    }

    this._cache = media;
    return media;
  }

  /** 扫描目录下的媒体文件 */
  _scanDir(dirPath, category, defaultTags, supportedExts, result) {
    try {
      const files = fs.readdirSync(dirPath);
      for (const file of files) {
        const filePath = path.join(dirPath, file);
        // 跳过子目录
        if (fs.statSync(filePath).isDirectory()) continue;
        
        const ext = path.extname(file).toLowerCase();
        if (supportedExts.includes(ext)) {
          const isVideo = ['.mp4', '.mov', '.avi', '.webm'].includes(ext);
          result.push({
            path: filePath.replace(/\\/g, '/'),
            type: isVideo ? 'video' : 'image',
            duration: isVideo ? 5 : 3,
            category: category,
            tags: defaultTags,
            filename: file
          });
        }
      }
    } catch (err) {
      console.warn(`[LocalMedia] 读取 ${dirPath} 失败:`, err.message);
    }
  }

  /** 计算关键词匹配分数 */
  _matchScore(keywords, mediaTags) {
    let score = 0;
    const lowerKeywords = keywords.map(k => k.toLowerCase());
    
    for (const tag of mediaTags) {
      const lowerTag = tag.toLowerCase();
      for (const kw of lowerKeywords) {
        if (lowerTag.includes(kw) || kw.includes(lowerTag)) {
          score += 2;
        }
      }
      // 文件名也参与匹配
      for (const kw of lowerKeywords) {
        if (lowerTag.includes(kw)) score += 1;
      }
    }
    
    return score;
  }

  /** 清除缓存（素材库有更新时调用） */
  clearCache() {
    this._cache = null;
  }
}

module.exports = LocalMediaProvider;
