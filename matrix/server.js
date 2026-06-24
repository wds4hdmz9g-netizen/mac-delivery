/**
 * 矩阵内容工厂 v4.0.9 - 主服务入口
 * 启动: node server.js / 双击 run.bat
 * 访问: http://localhost:3456
 * 
 * v4.0.9: Pexels视频搜索 + 跳过AI改写 + 便携部署
 */
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const providerConfig = require('./config/providers');
const { createRewriter } = require('./providers/rewriter');
const { createTTS } = require('./providers/tts');
const { createScraper } = require('./providers/scraper');
const { createMediaProvider } = require('./providers/media');
const BGMProvider = require('./providers/bgm');
const SubtitleEngine = require('./providers/subtitle');
const WebMediaSearcher = require('./providers/media/web_searcher');
const aiVideoGen = require('./providers/media/ai_video_generator');
const aiImageGen = require('./providers/media/ai_image_generator');  // v4.0.8
const localVideoMatcher = require('./providers/media/local_video_matcher');  // v4.0.9

// ===== 客户Key管理系统 =====
const KEY_FILE = path.join(__dirname, '.api_key');

function loadMoarkKey() {
  try {
    if (fs.existsSync(KEY_FILE)) {
      const raw = fs.readFileSync(KEY_FILE, 'utf8');
      // 跳过注释行，取第一个非空有效行
      const key = raw.split('\n')
        .map(l => l.trim())
        .filter(l => l && !l.startsWith('#') && !l.startsWith('//'))
        .join('');
      if (key && key.length > 10 && /^[A-Za-z0-9_-]+$/.test(key.substring(0, 10))) {
        console.log('[Key] 已从 .api_key 加载客户Key:', key.substring(0, 10) + '...');
        return key;
      }
    }
  } catch (e) {}
  const builtin = providerConfig.scraper?.providers?.moark?.apiKey || '';
  if (builtin) console.log('[Key] 使用内置Key:', builtin.substring(0, 10) + '...');
  return builtin;
}

const MOARK_KEY = loadMoarkKey();
providerConfig.scraper.providers.moark.apiKey = MOARK_KEY;
providerConfig.rewriter.providers.deepseek.apiKey = MOARK_KEY;

const bgm = new BGMProvider(providerConfig.bgm || {});
const subtitle = new SubtitleEngine();
const webSearcher = new WebMediaSearcher({...providerConfig.web_media, outputDir: path.join(providerConfig.general?.output?.outputDir || './output', 'web_media')});

// v4.0: 云端 token 管理（由 AI 助手通过 /api/cloud-token 写入，自动持久化）
const TOKEN_FILE = path.join(__dirname, '.cloud_token.json');
let _cloudToken = null;
let _cloudTokenExpiry = 0;

// v4.0.9: 启动时自动载入已保存的 token
try {
  if (fs.existsSync(TOKEN_FILE)) {
    const saved = JSON.parse(fs.readFileSync(TOKEN_FILE, 'utf-8'));
    if (saved.token && saved.expiry > Date.now()) {
      _cloudToken = saved.token;
      _cloudTokenExpiry = saved.expiry;
      console.log('[CloudToken] 已载入持久化Token, 有效期至:', new Date(saved.expiry).toLocaleString());
    }
  }
} catch (e) { /* 忽略 */ }

const providers = {
  rewriter: createRewriter(providerConfig.rewriter),
  tts: createTTS(providerConfig.tts),
  scraper: createScraper(providerConfig.scraper),
  media: createMediaProvider(providerConfig.media),
  bgm,
  subtitle,
  webSearcher,
  aiVideoGen,  // v4.0: AI视频生成模块
  aiImageGen,  // v4.0.8: AI图片生成兜底
  localVideoMatcher,  // v4.0.9: 本地真实工厂视频匹配
};

const VideoPipeline = require('./pipeline/orchestrator');
const pipeline = new VideoPipeline(providers, providerConfig);

const app = express();
const PORT = process.env.PORT || 3456;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ===== 激活码验证系统 =====
const activation = require('./activation');

// 激活码提交端点（本地验证 + 联网一码一机）
app.post('/api/activate', async (req, res) => {
  const { code } = req.body || {};
  if (!code) return res.json({ error: '请输入激活码' });
  if (!activation.verifyCode(code)) return res.json({ error: '激活码无效或已被使用' });
  // 联网验证（一码一机）
  try {
    const onlineResult = await activation.verifyOnline(code, 'matrix');
    if (onlineResult.status === 'rejected') return res.json({ error: onlineResult.message });
  } catch (e) { /* 网络错误：允许已激活设备离线使用 */ }
  activation.markActivated(__dirname);
  res.json({ ok: true });
});

// 获取激活状态
app.get('/api/activation-status', (req, res) => {
  res.json({ activated: activation.isActivated(__dirname) });
});

// 激活中间件：未激活时拦截主页面，重定向到激活页
app.use((req, res, next) => {
  // 这些路径始终放行
  if (req.path === '/activate.html' || req.path === '/api/activate' ||
      req.path === '/api/activation-status' || req.path === '/api/health' ||
      req.path.startsWith('/api/config') || req.path.startsWith('/output/') ||
      /\.(css|js|ico|png|jpg|svg|woff|ttf)$/i.test(req.path)) {
    return next();
  }
  // 未激活：拦截主页面
  if (!activation.isActivated(__dirname) && (req.path === '/' || req.path === '/index.html')) {
    return res.redirect('/activate.html');
  }
  next();
});

app.use(express.static(path.join(__dirname, 'web')));
// 视频和素材存D盘（不占C盘空间）
const OUTPUT_DIR = providerConfig.general?.output?.outputDir || path.join(__dirname, 'output');
app.use('/output', express.static(path.resolve(OUTPUT_DIR)));
app.use('/bgm_library', express.static(path.join(__dirname, 'bgm_library')));

// v4.0.9: 启动时自动创建 output 子目录
['output/video', 'output/audio', 'output/web_media', 'output/ai_video', 'output/ai_img'].forEach(d => {
  const dir = path.join(__dirname, d);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});
console.log('[Init] output 目录已就绪');

// ============ 健康检查 ============
app.get('/api/health', async (req, res) => {
  const results = {};
  for (const [name, p] of Object.entries(providers)) {
    try { results[name] = await p.healthCheck?.() || { ok: true }; }
    catch (err) { results[name] = { ok: false, error: err.message }; }
  }
  res.json({
    status: 'running', uptime: process.uptime(),
    providers: results,
    config: {
      rewriter: providerConfig.rewriter.active,
      tts: providerConfig.tts.active,
      scraper: providerConfig.scraper.active,
      media: providerConfig.media.active
    }
  });
});

// ============ 配音音色列表 ============
app.get('/api/voices', (req, res) => {
  try {
    const voices = providers.tts.getVoices();
    const langs = [...new Set(voices.map(v => v.lang))];
    res.json({ voices, langs });
  } catch (err) {
    const EdgeTTS = require('./providers/tts/edgetts');
    const e = new EdgeTTS({});
    res.json({ voices: e.getVoices(), langs: ['zh-CN','zh-HK','en-US','en-GB'] });
  }
});

// ============ 背景音乐列表 ============
app.get('/api/bgm', async (req, res) => {
  try {
    const all = bgm.getAllBGM();
    res.json({ bgmList: all });
  } catch (err) {
    res.json({ bgmList: [
      { id: 'auto', name: '智能匹配（推荐）' },
      { id: 'none', name: '无背景音乐' },
    ]});
  }
});

// ============ 字幕样式列表 ============
app.get('/api/subtitle-styles', (req, res) => {
  res.json({ styles: subtitle.getStyles() });
});

// ============ 视频比例列表 ============
app.get('/api/aspect-ratios', (req, res) => {
  const ratios = providerConfig.aspectRatios || {};
  const list = Object.entries(ratios).map(([key, val]) => ({
    id: key, label: val.label, width: val.width, height: val.height
  }));
  res.json({ ratios: list, default: providerConfig.defaultAspectRatio || '9:16' });
});

// ============ 配置接口 ============
// Key 管理（客户自行配置模力方舟Key）
app.get('/api/config/key', (req, res) => {
  res.json({
    hasKey: !!MOARK_KEY && MOARK_KEY.length > 10,
    preview: MOARK_KEY ? MOARK_KEY.substring(0, 10) + '...' : '未设置'
  });
});

app.post('/api/config/key', (req, res) => {
  const { apiKey } = req.body;
  if (!apiKey || apiKey.trim().length < 10) {
    return res.status(400).json({ error: 'Key格式不正确（至少10个字符）' });
  }
  MOARK_KEY = apiKey.trim();
  providerConfig.scraper.providers.moark.apiKey = MOARK_KEY;
  providerConfig.rewriter.providers.deepseek.apiKey = MOARK_KEY;
  try { fs.writeFileSync(KEY_FILE, MOARK_KEY, 'utf8'); } catch (e) {}
  // 重建用了Key的providers
  providers.scraper = createScraper(providerConfig.scraper);
  providers.rewriter = createRewriter(providerConfig.rewriter);
  res.json({ ok: true, preview: MOARK_KEY.substring(0, 10) + '...' });
});

app.post('/api/config/key/verify', async (req, res) => {
  if (!MOARK_KEY) return res.json({ ok: false, error: '请先设置API Key' });
  try {
    const r = await fetch('https://api.moark.com/v1/models', {
      headers: { Authorization: 'Bearer ' + MOARK_KEY },
      signal: AbortSignal.timeout(8000)
    });
    if (r.ok) {
      const d = await r.json();
      return res.json({ ok: true, models: (d.data || []).length + '个可用' });
    }
    res.json({ ok: false, error: 'Key无效(错误' + r.status + ')，请检查moark后台' });
  } catch (e) {
    res.json({ ok: false, error: '验证失败: ' + e.message });
  }
});

app.get('/api/config', (req, res) => {
  res.json({
    rewriter: { active: providerConfig.rewriter.active, options: Object.keys(providerConfig.rewriter.providers) },
    tts: { active: providerConfig.tts.active, options: Object.keys(providerConfig.tts.providers) },
    scraper: { active: providerConfig.scraper.active, options: Object.keys(providerConfig.scraper.providers) },
    media: { active: providerConfig.media.active, options: Object.keys(providerConfig.media.providers) },
    bgm: { defaultVolume: providerConfig.bgm?.defaultVolume || 0.15 },
    subtitle: { defaultStyle: providerConfig.subtitle?.defaultStyle || 'white' },
    aspectRatios: providerConfig.aspectRatios,
    defaultAspectRatio: providerConfig.defaultAspectRatio || '9:16',
  });
});

app.post('/api/config/switch', (req, res) => {
  const { type, provider: newProvider } = req.body;
  if (!type || !newProvider) return res.status(400).json({ error: '需要 type 和 provider 参数' });

  try {
    providerConfig[type].active = newProvider;
    const factories = { rewriter: createRewriter, tts: createTTS, scraper: createScraper, media: createMediaProvider };
    if (factories[type]) providers[type] = factories[type](providerConfig[type]);
    res.json({ ok: true, message: `${type} → ${newProvider}` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ 核心接口：创建视频任务 ============
app.post('/api/tasks', async (req, res) => {
  const { input, options = {} } = req.body;
  if (!input || input.trim().length < 5) {
    return res.status(400).json({ error: '请输入视频链接或文案内容（至少5个字）' });
  }

  try {
    // v4.0.5: 始终传递 token（搜索模式可自动回退到AI生成）
    if (_cloudToken && Date.now() < _cloudTokenExpiry) {
      options.cloudToken = _cloudToken;
    }
    const result = await pipeline.run(input, options, (progress) => {
      console.log(`[${progress.step}/${progress.total}] ${progress.message}`);
    });

    if (result.status === 'need_input') {
      return res.json({ status: 'need_input', message: '请手动粘贴视频文案', extracted: result.extracted });
    }
    if (result.status === 'error') {
      return res.status(500).json({ error: result.error });
    }

    res.json({
      success: true, taskId: result.taskId, status: result.status,
      version: result.versions[0] ? {
        versionIndex: result.versions[0].versionIndex,
        text: result.versions[0].text,
        videoPath: result.versions[0].videoPath,
        duration: result.versions[0].duration,
        videoUrl: result.versions[0].videoPath ? `/output/video/${path.basename(result.versions[0].videoPath)}` : null,
        info: result.versions[0].info || {},
      } : null,
      allVersions: result.allVersions,
      selectedIndex: result.selectedIndex,
      stats: result.stats,
      input: result.input
    });
  } catch (err) {
    console.error('[Pipeline Error]', err);
    res.status(500).json({ error: `视频生成失败: ${err.message}` });
  }
});

// ============ 提取文案 ============
app.post('/api/extract', async (req, res) => {
  const { input } = req.body;
  if (!input) return res.status(400).json({ error: '请输入链接或文案' });
  try {
    const result = await providers.scraper.extract(input);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ AI改写文案 ============
app.post('/api/rewrite', async (req, res) => {
  const { text, versions = 3 } = req.body;
  if (!text) return res.status(400).json({ error: '请输入文案' });
  try {
    const result = await providers.rewriter.rewrite(text, { versionCount: versions, minLength: 80, maxLength: 300 });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ 网络搜索素材 ============
app.post('/api/search-media', async (req, res) => {
  const { text, count = 5 } = req.body;
  if (!text) return res.status(400).json({ error: '请输入文案' });
  try {
    const results = await webSearcher.searchAndDownload(text, count);
    res.json({ success: true, media: results, count: results.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============ v4.0: 云端Token管理 ============
// AI 助手通过此接口写入多模态生成 token
app.post('/api/cloud-token', (req, res) => {
  const { token, ttl } = req.body;
  if (!token) return res.status(400).json({ error: '缺少 token' });
  _cloudToken = token;
  _cloudTokenExpiry = Date.now() + (ttl || 3600000); // 默认1小时
  console.log('[CloudToken] Token已更新, 有效期至:', new Date(_cloudTokenExpiry).toLocaleString());
  // v4.0.9: 持久化到磁盘（重启后自动载入）
  try { fs.writeFileSync(TOKEN_FILE, JSON.stringify({ token, expiry: _cloudTokenExpiry }), 'utf-8'); } catch {}
  res.json({ ok: true, expiresAt: new Date(_cloudTokenExpiry).toISOString() });
});

// 检查 token 状态
app.get('/api/cloud-token/status', (req, res) => {
  const valid = _cloudToken && Date.now() < _cloudTokenExpiry;
  res.json({ valid, expiresAt: valid ? new Date(_cloudTokenExpiry).toISOString() : null });
});

// ============ 文件列表 ============
app.get('/api/files', (req, res) => {
  const outputDir = path.join(__dirname, 'output');
  const files = { audio: [], video: [], bgm: [], web_media: [] };
  try {
    ['audio','video','bgm','web_media'].forEach(sub => {
      const d = path.join(outputDir, sub);
      if (fs.existsSync(d)) {
        files[sub] = fs.readdirSync(d)
          .filter(f => !f.endsWith('.txt') && !f.endsWith('.srt'))
          .map(f => ({
            name: f, url: `/output/${sub}/${f}`, size: fs.statSync(path.join(d, f)).size
          }));
      }
    });
  } catch {}
  res.json(files);
});

// ============ 启动 ============
app.listen(PORT, () => {
  console.log('');
  console.log('  ╔══════════════════════════════════════╗');
  console.log('  ║   矩阵内容工厂 v4.0.9 已启动          ║');
  console.log(`  ║   http://localhost:${PORT}              ║`);
  console.log('  ║   🎬 Pexels视频+跳过改写+便携  ║');
  console.log('  ╚══════════════════════════════════════╝');
  console.log('');
  console.log(`  📝 改写: ${providerConfig.rewriter.active}  | 🔊 TTS: ${providerConfig.tts.active}`);
  console.log(`  🔍 扒取: ${providerConfig.scraper.active}  | 🎬 素材: ${providerConfig.media.active}`);
  console.log(`  🤖 AI视频: 多模态Skill  | 🎬 搜索: 视频优先(Pexels/Bing)`);
  console.log(`  🎵 BGM: freepd.com(CC0) | 🎬 格式: 9:16/16:9/4:3/3:4/1:1`);
  console.log('');
});

module.exports = app;
