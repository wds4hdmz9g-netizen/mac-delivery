// ====== 矩阵内容工厂 v3.0 - 前端交互 ======
const API = '';

let state = {
  extractedText: '',
  rewriteVersions: [],
  selectedVersion: 0,
  selectedBGM: 'auto',
  selectedVoice: 'zh-CN-YunxiNeural',
  subtitleStyle: 'white',
  aspectRatio: '9:16',
  enableSubtitles: true,
  useWebMedia: true,
  useAiVideo: false,    // v4.0
  skipRewrite: false,   // v4.0.9: 跳过AI改写直接生成
  generating: false,
  bgmList: [],
  voices: [],
};

// ====== 初始化 ======
document.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('inputText').focus();
  await loadVoices();
  await loadBGM();
  await loadAspectRatios();
  checkHealth();

  // 字幕开关联动
  document.getElementById('enableSubtitles').addEventListener('change', function() {
    state.enableSubtitles = this.checked;
    document.getElementById('subtitleStyleGroup').style.opacity = this.checked ? '1' : '0.4';
  });

  // v4.0: AI视频模式切换
  document.getElementById('useAiVideo').addEventListener('change', onAiVideoChange);

  // 其他控件事件
  ['voiceSelect','subtitleStyle','aspectRatio','bgmSelect','useWebMedia'].forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('change', function() {
      const key = id === 'bgmSelect' ? 'selectedBGM' :
                  id === 'useWebMedia' ? 'useWebMedia' :
                  id === 'aspectRatio' ? 'aspectRatio' :
                  id === 'subtitleStyle' ? 'subtitleStyle' : 'selectedVoice';
      state[key] = id === 'useWebMedia' ? this.checked : this.value;
      if (id === 'bgmSelect') {
        state.selectedBGM = this.value;
      }
    });
  });
});

// ====== 加载视频比例 ======
async function loadAspectRatios() {
  try {
    const r = await fetch(`${API}/api/aspect-ratios`);
    const data = await r.json();
    if (data.ratios?.length > 0) {
      const sel = document.getElementById('aspectRatio');
      sel.innerHTML = data.ratios.map(rt => 
        `<option value="${rt.id}" ${rt.id === data.default ? 'selected' : ''}>${rt.label}</option>`
      ).join('');
      state.aspectRatio = data.default || '9:16';
    }
  } catch {}
}

// ====== 健康检查 ======
async function checkHealth() {
  try {
    const r = await fetch(`${API}/api/health`);
    if (r.ok) {
      document.getElementById('statusDot').className = 'dot green';
      document.getElementById('statusText').textContent = '已连接';
    }
  } catch {
    document.getElementById('statusDot').className = 'dot red';
    document.getElementById('statusText').textContent = '未连接';
  }
}

// ====== v4.0: AI视频模式切换 ======
function onAiVideoChange() {
  state.useAiVideo = document.getElementById('useAiVideo').checked;
  const hint = document.getElementById('aiVideoHint');
  const webMedia = document.getElementById('useWebMedia');
  
  if (state.useAiVideo) {
    hint.style.display = 'block';
    webMedia.checked = false;
    state.useWebMedia = false;
    // 自动禁用"搜索素材"开关
    webMedia.disabled = true;
  } else {
    hint.style.display = 'none';
    webMedia.disabled = false;
    webMedia.checked = true;
    state.useWebMedia = true;
  }
}

// ====== 直接粘贴文案生成视频（跳过提取和改写） ======
function doDirectText() {
  const text = document.getElementById('inputText').value.trim();
  if (!text) return alert('请粘贴你的文案');
  if (text.length < 10) return alert('文案太短（至少10个字）');

  // 检测是否是URL（如果是URL应该用"提取文案"按钮）
  if (/^https?:\/\//i.test(text) || /douyin\.com|v\.douyin/i.test(text)) {
    if (!confirm('检测到输入像是链接，确定要当作文案直接使用吗？\n（如果要提取抖音文案请点"提取文案"按钮）')) return;
  }

  state.skipRewrite = true;
  state.extractedText = text;

  // 跳过Step2，直接显示Step3（视频设置）
  document.getElementById('secRewrite').style.display = 'none';
  document.getElementById('editText').value = text;
  showStep('secSettings');
  document.getElementById('selectedVersionPreview').innerHTML = `
    <div class="sel-label">📝 直接使用粘贴文案（${text.length}字）</div>
    <div class="sel-text">${escapeHtml(text.slice(0, 400))}${text.length > 400 ? '...' : ''}</div>
  `;
  document.getElementById('secSettings').scrollIntoView({ behavior: 'smooth' });
  showStatus('green', '就绪 — 设置参数后点生成');
}

// ====== Step 1: 提取文案（抖音链接） ======
async function doExtract() {
  const text = document.getElementById('inputText').value.trim();
  if (!text) return alert('请输入链接或文案');

  showStatus('yellow', '提取中...');
  try {
    const r = await fetch(`${API}/api/extract`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ input: text })
    });
    const data = await r.json();
    state.extractedText = data.text || text;

    const box = document.getElementById('extractResult');
    box.style.display = 'block';
    if (data.error) {
      box.innerHTML = `<div class="warning">⚠️ ${data.error}，使用原始输入</div>`;
      state.extractedText = text;
    } else {
      box.innerHTML = `<div class="label">📄 提取文案（${state.extractedText.length}字）</div>
        <div class="text">${escapeHtml(state.extractedText.slice(0, 500))}${state.extractedText.length > 500 ? '...' : ''}</div>`;
    }

    // 显示 Step 2
    const sec2 = document.getElementById('secRewrite');
    sec2.style.display = 'block';
    document.getElementById('editText').value = state.extractedText;
    sec2.scrollIntoView({ behavior: 'smooth' });
    showStatus('green', '就绪');
  } catch (err) {
    state.extractedText = text;
    showStep('secRewrite');
    document.getElementById('editText').value = text;
    showStatus('green', '就绪（使用原始输入）');
  }
}

// ====== 清空输入（只清textarea） ======
function doClear() {
  document.getElementById('inputText').value = '';
  document.getElementById('inputText').focus();
}

// ====== 重新开始（清空所有状态） ======
function doReset() {
  // 清空输入
  document.getElementById('inputText').value = '';
  document.getElementById('editText').value = '';
  // 隐藏所有后续卡片
  document.getElementById('extractResult').style.display = 'none';
  document.getElementById('secRewrite').style.display = 'none';
  document.getElementById('rewriteResult').style.display = 'none';
  document.getElementById('secSettings').style.display = 'none';
  document.getElementById('secResult').style.display = 'none';
  document.getElementById('progressArea').style.display = 'none';
  // 重置状态
  state.extractedText = '';
  state.rewriteVersions = [];
  state.selectedVersion = 0;
  state.generating = false;
  state.useAiVideo = false;
  document.getElementById('useAiVideo').checked = false;
  document.getElementById('aiVideoHint').style.display = 'none';
  document.getElementById('useWebMedia').disabled = false;
  document.getElementById('btnGenerate').disabled = false;
  document.getElementById('btnGenerate').textContent = '🎬 生成视频';
  // 聚焦输入框
  document.getElementById('inputText').focus();
  document.getElementById('inputText').scrollIntoView({ behavior: 'smooth' });
  showStatus('green', '已清空，就绪');
}

// ====== v4.0.9: 跳过改写直接生成 ======
function doSkipRewrite() {
  const text = document.getElementById('editText').value.trim();
  if (!text) return alert('请先提取或编辑文案');
  if (text.length < 10) return alert('文案太短（至少10个字）');

  state.skipRewrite = true;
  state.extractedText = text;
  
  // 隐藏改写结果，直接跳到第3步
  document.getElementById('rewriteResult').style.display = 'none';
  showStep('secSettings');
  document.getElementById('selectedVersionPreview').innerHTML = `
    <div class="sel-label">📝 直接使用原始文案（跳过AI改写）</div>
    <div class="sel-text">${escapeHtml(text.slice(0, 300))}${text.length > 300 ? '...' : ''}</div>
  `;
  document.getElementById('secSettings').scrollIntoView({ behavior: 'smooth' });
  showStatus('green', '就绪 — 可直接生成');
}

// ====== Step 2: AI改写 ======
async function doRewrite() {
  const text = document.getElementById('editText').value.trim();
  if (!text) return alert('请先提取或编辑文案');
  if (text.length < 10) return alert('文案太短（至少10个字）');

  state.skipRewrite = false;
  state.extractedText = text;
  const btn = document.getElementById('btnRewrite');
  btn.disabled = true;
  btn.textContent = '⏳ AI改写中...';
  showStatus('yellow', 'AI改写中...');

  try {
    const r = await fetch(`${API}/api/rewrite`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, versions: 3 })
    });
    const data = await r.json();

    state.rewriteVersions = data.versions || [];
    state.selectedVersion = 0;

    // 渲染3个版本卡片（可点选）
    const container = document.getElementById('rewriteResult');
    container.style.display = 'grid';
    container.innerHTML = data.versions.map((v, i) => `
      <div class="version-card${i === 0 ? ' selected' : ''}" id="vcard${i}" onclick="selectVersion(${i})">
        <div class="vcard-header">
          <span class="vtag">版本${i+1} · 矩阵账号${i+1}</span>
          <span class="vcheck" id="vcheck${i}">${i === 0 ? '✅' : ''}</span>
        </div>
        <div class="vcard-text">${escapeHtml(v.slice(0, 200))}${v.length > 200 ? '...' : ''}</div>
        <div class="vcard-meta">${v.length}字</div>
      </div>
    `).join('');

    // 显示设置区
    showStep('secSettings');
    updateSelectedPreview();
    document.getElementById('secSettings').scrollIntoView({ behavior: 'smooth' });
    showStatus('green', '改写完成 — 请选择版本');
  } catch (err) {
    alert('改写失败: ' + err.message);
  } finally {
    btn.disabled = false;
    btn.textContent = '🤖 AI改写（生成3版）';
  }
}

// ====== 选择版本 ======
function selectVersion(idx) {
  state.selectedVersion = idx;
  document.querySelectorAll('.version-card').forEach(c => c.classList.remove('selected'));
  document.getElementById('vcard' + idx).classList.add('selected');
  document.querySelectorAll('.vcheck').forEach(c => c.textContent = '');
  document.getElementById('vcheck' + idx).textContent = '✅';
  updateSelectedPreview();
}

function updateSelectedPreview() {
  const text = state.rewriteVersions[state.selectedVersion] || '';
  const preview = document.getElementById('selectedVersionPreview');
  preview.innerHTML = `
    <div class="sel-label">📝 已选：版本${state.selectedVersion + 1}</div>
    <div class="sel-text">${escapeHtml(text.slice(0, 300))}${text.length > 300 ? '...' : ''}</div>
  `;
}

// ====== Step 3: 配音音色 ======
async function loadVoices() {
  try {
    const r = await fetch(`${API}/api/voices`);
    const data = await r.json();
    state.voices = data.voices || [];
    populateVoiceSelect('zh-CN');
  } catch {
    state.voices = [
      { id: 'zh-CN-YunxiNeural', name: '云希（男）', lang: 'zh-CN' },
      { id: 'zh-CN-XiaoxiaoNeural', name: '晓晓（女）', lang: 'zh-CN' },
      { id: 'zh-HK-HiuMaanNeural', name: '曉曼（粤语女）', lang: 'zh-HK' },
    ];
    populateVoiceSelect('zh-CN');
  }
}

function populateVoiceSelect(lang) {
  const sel = document.getElementById('voiceSelect');
  const voices = state.voices.filter(v => v.lang === lang);
  sel.innerHTML = voices.map(v => `<option value="${v.id}">${v.name}</option>`).join('');
  if (voices.length > 0) state.selectedVoice = voices[0].id;
}

function onLangChange() {
  const lang = document.getElementById('voiceLang').value;
  populateVoiceSelect(lang);
}

// ====== Step 3: BGM ======
async function loadBGM() {
  try {
    const r = await fetch(`${API}/api/bgm`);
    const data = await r.json();
    state.bgmList = data.bgmList || [];
    renderBGM();
  } catch {
    state.bgmList = [
      { id: 'auto', name: '🎯 智能匹配' },
      { id: 'none', name: '无背景音乐' },
    ];
    renderBGM();
  }
}

function renderBGM() {
  const sel = document.getElementById('bgmSelect');
  sel.innerHTML = state.bgmList.map(b => 
    `<option value="${b.id}">${b.name}</option>`
  ).join('');
}

// ====== Step 3: 生成视频 ======
async function doGenerate() {
  const btn = document.getElementById('btnGenerate');
  
  // v4.0.9: 支持跳过改写直接生成
  const selectedText = state.skipRewrite 
    ? document.getElementById('editText').value.trim()
    : state.rewriteVersions[state.selectedVersion];
  
  if (!selectedText) return alert(state.skipRewrite ? '请先编辑文案' : '请先完成AI改写');
  if (selectedText.length < 10) return alert('文案太短（至少10个字）');
  if (state.generating) return;

  state.generating = true;
  btn.disabled = true;
  btn.textContent = '⏳ 生成中...';
  document.getElementById('progressArea').style.display = 'block';
  setProgress(5, '正在初始化...');
  showStatus('yellow', '生成中');

  try {
    // v4.0: AI视频模式先检查token
    if (state.useAiVideo) {
      setProgress(10, '检查AI服务...');
      const tokenStatus = await fetch(`${API}/api/cloud-token/status`);
      const ts = await tokenStatus.json();
      if (!ts.valid) {
        alert('AI视频生成需要先激活服务，请等待AI助手注入token（或关闭AI模式使用普通搜索）');
        state.generating = false;
        btn.disabled = false;
        btn.textContent = '🎬 生成视频';
        return;
      }
    }

    const r = await fetch(`${API}/api/tasks`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: selectedText,
        options: {
          editedText: state.extractedText,
          ttsVoice: document.getElementById('voiceSelect').value || state.selectedVoice,
          bgmId: state.selectedBGM,
          aspectRatio: state.aspectRatio,
          enableSubtitles: state.enableSubtitles,
          subtitleStyle: state.subtitleStyle,
          useWebMedia: state.useWebMedia,
          useAiVideo: state.useAiVideo,     // v4.0
          skipRewrite: state.skipRewrite,   // v4.0.9: 跳过AI改写
          selectedVersionIndex: state.selectedVersion,
        }
      })
    });

    // 逐步更新进度（模拟 + AI模式差异）
    const steps = state.useAiVideo ? [
      [15, '提取文案...'], [30, 'AI改写...'], [45, '合成语音...'],
      [55, 'AI生成匹配视频...'], [75, '拼合视频片段...'], [85, '准备BGM...'],
      [95, '渲染输出...'],
    ] : [
      [15, '提取文案...'], [30, 'AI改写...'], [45, '合成语音...'],
      [55, '搜索素材...'], [70, '准备BGM...'], [85, '渲染视频...'], [95, '烧录字幕...'],
    ];
    for (const [pct, msg] of steps) {
      setProgress(pct, msg);
      await sleep(300);
    }

    const data = await r.json();
    if (data.error) throw new Error(data.error);

    setProgress(100, '✅ 完成！');
    showResult(data);
    showStatus('green', '就绪');
  } catch (err) {
    alert('生成失败: ' + err.message);
    showStatus('red', '错误');
    setProgress(0, '❌ ' + err.message);
  } finally {
    state.generating = false;
    btn.disabled = false;
    btn.textContent = '🎬 生成视频';
  }
}

// ====== 显示结果 ======
function showResult(data) {
  const section = document.getElementById('secResult');
  section.style.display = 'block';
  const c = document.getElementById('resultContent');

  const v = data.version || (data.versions && data.versions[0]);
  if (!v) {
    c.innerHTML = '<div class="error">未生成视频</div>';
    return;
  }

  const stats = data.stats || {};
  c.innerHTML = `
    <div class="result-item">
      <video controls preload="metadata" style="width:100%;max-width:400px;border-radius:8px;">
        <source src="${v.videoUrl || ''}" type="video/mp4">
        您的浏览器不支持视频播放
      </video>
      <div class="result-info">
        <div class="info-row"><span class="badge">版本${(v.versionIndex || 0) + 1}</span> ${v.duration ? ' ⏱ ' + v.duration + '秒' : ''}</div>
        <div class="info-row">📐 ${stats.resolution || '720x1280'} | 🎵 ${stats.bgm || 'none'} | ✏️ ${stats.subtitles ? '有字幕' : '无字幕'}</div>
        <div class="info-row">📝 ${escapeHtml((v.text || '').slice(0, 150))}...</div>
        <div class="actions">
          <a class="btn small" href="${v.videoUrl || '#'}" download>⬇ 下载视频</a>
          <button class="btn small" onclick="copyTextDirect('${escapeAttr(v.text || '')}')">📋 复制文案</button>
        </div>
      </div>
    </div>
    <div class="all-versions">
      <h3>所有改写版本</h3>
      ${(data.allVersions || []).map((tv, i) => `
        <div class="av-item${i === data.selectedIndex ? ' current' : ''}">
          <span class="av-tag">版本${i+1}${i === data.selectedIndex ? ' ← 已生成' : ''}</span>
          <div class="av-text">${escapeHtml(tv.slice(0, 200))}...</div>
        </div>
      `).join('')}
    </div>
  `;

  section.scrollIntoView({ behavior: 'smooth' });
}

// ====== 工具函数 ======
function showStep(id) { document.getElementById(id).style.display = 'block'; }
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function setProgress(pct, msg) {
  document.getElementById('progressFill').style.width = pct + '%';
  document.getElementById('progressMsg').textContent = msg;
}

function showStatus(type, msg) {
  const colors = { green: 'green', yellow: 'yellow', red: 'red' };
  document.getElementById('statusDot').className = 'dot ' + (colors[type] || 'green');
  document.getElementById('statusText').textContent = msg;
}

function escapeHtml(s) {
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function escapeAttr(s) {
  return String(s||'').replace(/'/g,"\\'").replace(/"/g,'&quot;').replace(/\n/g,'\\n');
}

function copyTextDirect(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => showToast('已复制'));
  }
}

function showToast(msg) {
  const toast = document.createElement('div');
  toast.textContent = msg;
  toast.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);background:#333;color:#fff;padding:10px 24px;border-radius:20px;font-size:14px;z-index:9999;animation:fadeIn .3s';
  document.body.appendChild(toast);
  setTimeout(() => { toast.remove(); }, 2000);
}

// ====== Key 设置管理 ======
async function openSettings() {
  document.getElementById('settingsModal').style.display = 'flex';
  // 加载当前Key状态
  try {
    const r = await fetch(API + '/api/config/key');
    const d = await r.json();
    document.getElementById('keyStatus').textContent = d.hasKey ? '当前Key: ' + d.preview : '状态：未设置';
    if (d.hasKey) {
      document.getElementById('apiKeyInput').placeholder = d.preview + '（重新输入覆盖）';
    }
  } catch (e) {
    document.getElementById('keyStatus').textContent = '状态：加载失败';
  }
}

function closeSettings() {
  document.getElementById('settingsModal').style.display = 'none';
  document.getElementById('keyVerifyResult').innerHTML = '';
}

async function saveKey() {
  const key = document.getElementById('apiKeyInput').value.trim();
  if (!key || key.length < 10) {
    document.getElementById('keyVerifyResult').innerHTML = '<span style="color:#ff6b6b;">Key格式不正确（至少10个字符）</span>';
    return;
  }
  try {
    const r = await fetch(API + '/api/config/key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey: key })
    });
    const d = await r.json();
    if (d.ok) {
      document.getElementById('keyStatus').textContent = '当前Key: ' + d.preview;
      document.getElementById('keyVerifyResult').innerHTML = '<span style="color:#4ecdc4;">✅ Key已保存</span>';
      showToast('Key已保存');
    } else {
      document.getElementById('keyVerifyResult').innerHTML = '<span style="color:#ff6b6b;">保存失败：' + (d.error || '未知') + '</span>';
    }
  } catch (e) {
    document.getElementById('keyVerifyResult').innerHTML = '<span style="color:#ff6b6b;">保存失败：网络错误</span>';
  }
}

async function verifyKey() {
  document.getElementById('keyVerifyResult').innerHTML = '<span style="color:#888;">验证中...</span>';
  try {
    const r = await fetch(API + '/api/config/key/verify', { method: 'POST' });
    const d = await r.json();
    if (d.ok) {
      document.getElementById('keyVerifyResult').innerHTML = '<span style="color:#4ecdc4;">✅ Key有效！' + d.models + '</span>';
    } else {
      document.getElementById('keyVerifyResult').innerHTML = '<span style="color:#ff6b6b;">❌ ' + (d.error || 'Key无效') + '</span>';
    }
  } catch (e) {
    document.getElementById('keyVerifyResult').innerHTML = '<span style="color:#ff6b6b;">验证失败：网络错误</span>';
  }
}
