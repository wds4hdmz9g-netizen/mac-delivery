/**
 * BGM 音乐提供器 v3.0
 * 自动从 freepd.com 下载 CC0 免费音乐，无需任何 API Key
 * 支持本地缓存 + 智能场景匹配
 */
const path = require('path');
const fs = require('fs');
const https = require('https');
const http = require('http');

// ========== 预配置 CC0 音乐库（来自 freepd.com） ==========
// 所有音乐均为 CC0 协议，可免费商用，无需署名
const MUSIC_CATALOG = {
  // 活力轻快 — 适合招工、高薪岗位类视频
  upbeat: [
    { name: 'Spring Chicken', url: 'https://freepd.com/api/music/436f6d6564792f537072696e6720436869636b656e2e6d7033', source: 'freepd', mood: 'upbeat' },
    { name: 'Maple Leaf Rag', url: 'https://freepd.com/api/music/436f6d6564792f4d61706c65204c656166205261672e6d7033', source: 'freepd', mood: 'upbeat' },
    { name: 'The Entertainer', url: 'https://freepd.com/api/music/436f6d6564792f54686520456e7465727461696e65722e6d7033', source: 'freepd', mood: 'upbeat' },
  ],
  // 励志温暖 — 适合正式工、稳定岗位类
  inspire: [
    { name: 'Hopeful', url: 'https://freepd.com/api/music/436f6d6564792f486f706566756c2e6d7033', source: 'freepd', mood: 'inspire' },
    { name: 'Take the Ride', url: 'https://freepd.com/api/music/436f6d6564792f54616b652074686520526964652e6d7033', source: 'freepd', mood: 'inspire' },
    { name: 'Fancy Family', url: 'https://freepd.com/api/music/436f6d6564792f46616e63792046616d696c792e6d7033', source: 'freepd', mood: 'inspire' },
  ],
  // 现代科技 — 适合电子厂、CNC等
  modern: [
    { name: 'Busybody', url: 'https://freepd.com/api/music/436f6d6564792f42757379626f64792e6d7033', source: 'freepd', mood: 'modern' },
    { name: 'Rush', url: 'https://freepd.com/api/music/436f6d6564792f527573682e6d7033', source: 'freepd', mood: 'modern' },
    { name: 'Barroom Ballet', url: 'https://freepd.com/api/music/436f6d6564792f426172726f6f6d2042616c6c65742e6d7033', source: 'freepd', mood: 'modern' },
  ],
  // 轻松日常 — 适合宿舍、食堂、环境类
  casual: [
    { name: 'Baltic Levity', url: 'https://freepd.com/api/music/436f6d6564792f42616c746963204c65766974792e6d7033', source: 'freepd', mood: 'casual' },
    { name: 'Foam Rubber', url: 'https://freepd.com/api/music/436f6d6564792f466f616d205275626265722e6d7033', source: 'freepd', mood: 'casual' },
    { name: 'Vintage Party', url: 'https://freepd.com/api/music/436f6d6564792f56696e746167652050617274792e6d7033', source: 'freepd', mood: 'casual' },
  ],
};

// BGM 风格预设（展示用）
const BGM_PRESETS = [
  { id: 'auto', name: '🎯 智能匹配（推荐）', query: '', bpm: '' },
  { id: 'upbeat', name: '活力轻快', query: 'upbeat', bpm: '120' },
  { id: 'inspire', name: '励志温暖', query: 'inspire', bpm: '90' },
  { id: 'modern', name: '现代节奏', query: 'modern', bpm: '110' },
  { id: 'casual', name: '轻松日常', query: 'casual', bpm: '100' },
  { id: 'none', name: '无背景音乐', query: '', bpm: '' },
];

class BGMProvider {
  constructor(config = {}) {
    this.localDir = config.localDir || path.join(process.cwd(), 'bgm_library');
    this.pixabayKey = config.pixabayKey || '';
    this.defaultVolume = config.defaultVolume || 0.15;
    this._downloadedCache = null;
    this._initPromise = null;
  }

  /** 确保本地目录存在 */
  _ensureDir() {
    if (!fs.existsSync(this.localDir)) {
      fs.mkdirSync(this.localDir, { recursive: true });
    }
  }

  /** 懒初始化：首次调用时自动下载CC0音乐 */
  async _ensureInit() {
    if (this._initPromise) return this._initPromise;
    this._initPromise = this._initDownload();
    return this._initPromise;
  }

  async _initDownload() {
    this._ensureDir();

    // 收集所有需要下载的曲目
    const toDownload = [];
    for (const [mood, tracks] of Object.entries(MUSIC_CATALOG)) {
      for (const track of tracks) {
        const localName = `bgm_${mood}_${track.name.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')}.mp3`;
        const localPath = path.join(this.localDir, localName);
        if (!fs.existsSync(localPath)) {
          toDownload.push({ ...track, localPath, localName, mood });
        }
      }
    }

    if (toDownload.length === 0) {
      console.log(`[BGM] 本地已有 ${this.getLocalBGM().length} 首BGM，跳过下载`);
      return;
    }

    console.log(`[BGM] 开始下载 ${toDownload.length} 首CC0免费音乐...`);
    let downloaded = 0;
    for (const track of toDownload) {
      try {
        await this._downloadFile(track.url, track.localPath);
        downloaded++;
        console.log(`[BGM] ✅ ${track.name} (${track.mood})`);
      } catch (e) {
        console.warn(`[BGM] ❌ ${track.name}: ${e.message}`);
      }
    }
    console.log(`[BGM] 下载完成：${downloaded}/${toDownload.length} 首`);
  }

  /** 获取本地音乐文件列表 */
  getLocalBGM() {
    this._ensureDir();
    try {
      const files = fs.readdirSync(this.localDir);
      const bgmFiles = files.filter(f => /\.(mp3|wav|ogg|m4a|flac)$/i.test(f));

      // 建立 mood 映射
      const moodLabels = { upbeat: '活力轻快', inspire: '励志温暖', modern: '现代节奏', casual: '轻松日常' };

      return bgmFiles.map(f => {
        let mood = 'other', label = f.replace(/\.[^.]+$/, '').replace(/bgm_\w+_/, '');
        for (const [m, tracks] of Object.entries(MUSIC_CATALOG)) {
          if (tracks.some(t => f.includes(t.name.replace(/[^a-zA-Z0-9]/g, '_')))) {
            mood = m; break;
          }
        }
        return {
          id: f.replace(/\.[^.]+$/, ''),
          name: label.replace(/[-_]/g, ' '),
          path: path.join(this.localDir, f).replace(/\\/g, '/'),
          mood,
          moodLabel: moodLabels[mood] || '其他',
          source: 'local_cc0'
        };
      });
    } catch {
      return [];
    }
  }

  /** 获取全部可用 BGM */
  getAllBGM() {
    const local = this.getLocalBGM();
    const result = [
      { id: 'auto', name: '🎯 智能匹配（推荐）', path: '', mood: 'auto' },
      { id: 'none', name: '无背景音乐', path: '', mood: 'none' },
    ];

    // 按 mood 分组本地音乐
    const byMood = {};
    for (const b of local) {
      if (!byMood[b.mood]) byMood[b.mood] = [];
      byMood[b.mood].push(b);
    }

    for (const [mood, tracks] of Object.entries(byMood)) {
      result.push(...tracks);
    }

    return result;
  }

  /**
   * 根据文案内容智能匹配 BGM
   */
  matchBGMByText(text) {
    const lt = text.toLowerCase();

    // 高薪/急招 → 活力
    if (/高薪|急招|包吃|包住|月薪|高工资|万元/.test(lt)) return 'upbeat';
    // 正式工/稳定 → 励志
    if (/正式工|长期|稳定|五险|社保|福利/.test(lt)) return 'inspire';
    // 电子厂/CNC/科技 → 现代
    if (/电子|CNC|数控|科技|机械|自动化/.test(lt)) return 'modern';
    // 宿舍/食堂/环境 → 轻松
    if (/宿舍|食堂|环境|住宿|空调|热水/.test(lt)) return 'casual';
    // 默认活力
    return 'upbeat';
  }

  /**
   * 准备 BGM 文件
   * @param {string} bgmId - BGM ID 或 'auto'/'none'
   * @param {number} targetDuration - 目标时长（秒）
   * @param {string} text - 文案（用于智能匹配）
   * @returns {Promise<{bgmPath: string, duration: number, bgmId: string}>}
   */
  async prepareBGM(bgmId, targetDuration, text = '') {
    // 确保本地音乐已下载
    await this._ensureInit();

    // 智能匹配
    if (!bgmId || bgmId === 'auto') {
      const mood = this.matchBGMByText(text);
      const tracks = this.getLocalBGM().filter(b => b.mood === mood);
      if (tracks.length > 0) {
        const pick = tracks[Math.floor(Math.random() * tracks.length)];
        return { bgmPath: pick.path, duration: targetDuration, bgmId: pick.id, mood };
      }
      // 兜底：随机选一首
      const allLocal = this.getLocalBGM();
      if (allLocal.length > 0) {
        const pick = allLocal[Math.floor(Math.random() * allLocal.length)];
        return { bgmPath: pick.path, duration: targetDuration, bgmId: pick.id, mood: pick.mood };
      }
      return { bgmPath: '', duration: 0, bgmId: 'none', mood: 'none' };
    }

    if (bgmId === 'none') {
      return { bgmPath: '', duration: 0, bgmId: 'none', mood: 'none' };
    }

    // 精确匹配本地文件
    const local = this.getLocalBGM();
    const found = local.find(b => b.id === bgmId || b.path === bgmId);
    if (found) {
      return { bgmPath: found.path, duration: targetDuration, bgmId: found.id, mood: found.mood };
    }

    // Pixabay 搜索兜底（需要 API Key）
    if (this.pixabayKey && bgmId.startsWith('preset:')) {
      return this._searchPixabay(bgmId, targetDuration);
    }

    return { bgmPath: '', duration: 0, bgmId: 'none', mood: 'none' };
  }

  /** 从 Pixabay 搜索下载音乐 */
  async _searchPixabay(bgmId, targetDuration) {
    const presetKey = bgmId.replace('preset:', '');
    const preset = BGM_PRESETS.find(p => p.id === presetKey);
    if (!preset || !preset.query) return { bgmPath: '', duration: 0, bgmId: 'none' };

    try {
      const params = new URLSearchParams({
        key: this.pixabayKey,
        q: preset.query,
        category: 'music'
      });
      const url = `https://pixabay.com/api/?${params.toString()}`;

      const data = await this._fetchJSON(url);
      if (data.hits?.length > 0) {
        const track = data.hits[0];
        const audioUrl = track.audio || track.previewURL;
        if (audioUrl) {
          const outputPath = path.join(this.localDir, `pixabay_${Date.now()}.mp3`);
          await this._downloadFile(audioUrl, outputPath);
          return { bgmPath: outputPath, duration: targetDuration, bgmId: presetKey };
        }
      }
    } catch (err) {
      console.warn('[BGM] Pixabay 搜索失败:', err.message);
    }
    return { bgmPath: '', duration: 0, bgmId: 'none' };
  }

  // ========== HTTP 工具 ==========

  _downloadFile(url, destPath) {
    return new Promise((resolve, reject) => {
      const proto = url.startsWith('https') ? https : http;
      const req = proto.get(url, { timeout: 30000 }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          this._downloadFile(res.headers.location, destPath).then(resolve).catch(reject);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}`));
          return;
        }
        const chunks = [];
        res.on('data', c => chunks.push(c));
        res.on('end', () => {
          const buffer = Buffer.concat(chunks);
          if (buffer.length < 1000) {
            reject(new Error('File too small'));
            return;
          }
          fs.writeFileSync(destPath, buffer);
          resolve();
        });
      });
      req.on('error', reject);
      req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
      req.end();
    });
  }

  _fetchJSON(url) {
    return new Promise((resolve, reject) => {
      const proto = url.startsWith('https') ? https : http;
      proto.get(url, { timeout: 10000 }, (res) => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => {
          try { resolve(JSON.parse(data)); }
          catch (e) { reject(new Error('JSON parse failed')); }
        });
      }).on('error', reject);
    });
  }

  /** 获取可用的 BGM 风格预设 */
  getPresets() { return BGM_PRESETS; }

  /** 健康检查 */
  async healthCheck() {
    await this._ensureInit();
    const local = this.getLocalBGM();
    return {
      ok: true,
      localCount: local.length,
      moods: [...new Set(local.map(b => b.mood))],
      sources: [...new Set(local.map(b => b.source))]
    };
  }
}

module.exports = BGMProvider;
