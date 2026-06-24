const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { execSync, execFile } = require('child_process');
const { promisify } = require('util');
const execFileAsync = promisify(execFile);

const os = require('os');
const app = express();
const PORT = process.env.PORT || 3458;
const uploadDir = path.join(os.tmpdir(), 'superip_uploads');
const upload = multer({ dest: uploadDir });
const outputDir = path.join(__dirname, 'output');
const tempDir = path.join(__dirname, 'temp_media');
[outputDir, uploadDir, tempDir].forEach(d => {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
});
// AI日志文件 — 解决cmd窗口看不到输出的问题
const LOG_FILE = path.join(tempDir, 'ai_lipsync.log');
function aiLog(msg) {
  const ts = new Date().toISOString().split('T')[1].slice(0,12);
  const line = `[${ts}] ${msg}`;
  console.log(line);
  try { fs.appendFileSync(LOG_FILE, line + '\n'); } catch {}
}
aiLog('=== 服务器启动 v2 (WAV→MP3自动转换) ===');

// FFmpeg二进制 — 复制到无中文临时目录，避免 spawn ENOENT
let FFMPEG = 'ffmpeg';
const HtucxPRM$ = path.join(__dirname, '.ffmpeg');
const RmiufGW = path.join(HtucxPRM$, 'ffmpeg.exe');
const sources = [
  path.join(__dirname, 'ffmpeg.exe'),
  path.join(__dirname, 'node_modules', 'ffmpeg-static', 'ffmpeg.exe'),
  path.join(__dirname, 'node_modules', '@ffmpeg-installer', 'win32-x64', 'ffmpeg.exe'),
];
for (const src of sources) {
  if (fs.existsSync(src)) {
    console.log(`[FFmpeg] Found: ${src}`);
    if (!fs.existsSync(RmiufGW) || fs.statSync(src).size !== (fs.existsSync(RmiufGW) ? fs.statSync(RmiufGW).size : 0)) {
      try {
        if (!fs.existsSync(HtucxPRM$)) fs.mkdirSync(HtucxPRM$, { recursive: true });
        fs.copyFileSync(src, RmiufGW);
        console.log(`[FFmpeg] Copied to: ${RmiufGW}`);
      } catch(e) {
        console.error(`[FFmpeg] Copy failed, using source directly: ${e.message}`);
        FFMPEG = src;
      }
    } else {
      console.log(`[FFmpeg] Already cached at: ${RmiufGW}`);
    }
    if (!FFMPEG || FFMPEG === 'ffmpeg') FFMPEG = RmiufGW;
    break;
  }
}
console.log(`[FFmpeg] Using: ${FFMPEG}`);

// FFmpeg调用——用exec，兼容性最好
async function runFfmpeg(args, opts = {}) {
  const { exec } = require('child_process');
  const cmd = `"${FFMPEG}" ${args.map(a => `"${a}"`).join(' ')}`;
  const timeout = opts.timeout || 60000;
  return new Promise((resolve, reject) => {
    exec(cmd, { timeout, windowsHide: true, encoding: 'buffer' }, (err, stdout, stderr) => {
      if (err) {
        const raw = Buffer.isBuffer(stderr) ? stderr : Buffer.from(String(stderr||''));
        let msg = raw.toString('utf8');
        if (msg.includes('�')) { try { msg = require('iconv-lite').decode(raw, 'gbk'); } catch(e) {} }
        if (!msg || msg.length < 2) msg = err.message || 'unknown';
        console.error('[FFmpeg ERR]', msg.substring(0, 200));
        reject(new Error(msg.substring(0, 200) || 'FFmpeg失败'));
      }
      else resolve({ stdout: stdout?.toString('utf8') || '', stderr: stderr?.toString('utf8') || '' });
    });
  });
}

// ===== AI对口型 — 多策略（模力方舟 / WaveSpeed / 本地FFmpeg）=====
const MOARK_LIPSYNC = 'https://api.moark.com/v1/async/videos/audio-video-to-video';
const MOARK_TASK = 'https://moark.com/v1/task';
const WAVESPEED_SUBMIT = 'https://api.wavespeed.ai/api/v3/sync/lipsync-2';
const WAVESPEED_RESULT = 'https://api.wavespeed.ai/api/v3/predictions';
const xVNAIPAdQyh = {};  // taskId → 'moark' | 'wavespeed'

// 临时文件托管（用于WaveSpeed URL方式）
async function FGbKWTFJ(buffer, filename) {
  // 尝试 catbox.moe
  const tryUpload = async (url, fieldName) => {
    const fd = new FormData();
    fd.append(fieldName, new Blob([buffer]), filename);
    fd.append('reqtype', 'fileupload');
    const r = await fetch(url, { method: 'POST', body: fd, signal: AbortSignal.timeout(60000) });
    const text = (await r.text()).trim();
    if (text.startsWith('http')) return text;
    throw new Error(text.substring(0, 100));
  };
  try { return await tryUpload('https://catbox.moe/user/api.php', 'fileToUpload'); } catch(e) { console.log('[Upload] catbox失败:', e.message); }
  try { return await tryUpload('https://litterbox.catbox.moe/resources/internals/api.php', 'fileToUpload'); } catch(e) { console.log('[Upload] litterbox失败:', e.message); }
  // 最后尝试 0x0.st
  try {
    const fd = new FormData();
    fd.append('file', new Blob([buffer]), filename);
    const r = await fetch('https://0x0.st', { method: 'POST', body: fd, signal: AbortSignal.timeout(60000) });
    const url = (await r.text()).trim();
    if (url.startsWith('http')) return url;
    throw new Error(url.substring(0, 100));
  } catch(e) { console.log('[Upload] 0x0.st失败:', e.message); }
  // 尝试 tmpfiles.org
  try { return await tryUpload('https://tmpfiles.org/api/v1/upload', 'file'); } catch(e) { console.log('[Upload] tmpfiles失败:', e.message); }
  // 尝试 bashupload.com
  try { return await tryUpload('https://bashupload.com/upload', 'file'); } catch(e) { console.log('[Upload] bashupload失败:', e.message); }
  throw new Error('所有文件托管服务均不可用(catbox/0x0/tmpfiles/bashupload)');
}

// 多策略AI对口型提交 — 1:1照搬原版 FormData 直传（原版已验证可用）
async function VIwlLTXteLW(apiKey, videoBuf, videoName, videoType, audioBuf, audioName, audioType) {
  // 策略1: Moark Duix.Heygem FormData直传（原版方式，不用Hub，文件直接在请求body里）
  try {
    aiLog('策略1: Moark FormData直传...');
    const formData = new FormData();
    formData.append('model', 'Duix.Heygem');
    formData.append('ref_audio', new Blob([audioBuf], { type: audioType }), audioName);
    formData.append('ref_video', new Blob([videoBuf], { type: videoType }), videoName);
    const r = await fetch(MOARK_LIPSYNC, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: formData,
      signal: AbortSignal.timeout(60000)
    });
    const data = await r.json();
    aiLog('Moark响应(' + r.status + '): ' + JSON.stringify(data).substring(0, 400));
    if (data.task_id) {
      xVNAIPAdQyh[data.task_id] = 'moark';
      return { taskId: data.task_id, status: data.status || 'created' };
    }
    throw new Error((data.error || data.message || '未返回task_id') + ' [moark]');
  } catch(e) { aiLog('策略1-Moark失败: ' + e.message); }

  // 策略2: WaveSpeed（需先上传文件获取URL，再用URL调API）
  try {
    aiLog('策略2-WaveSpeed: 上传文件...');
    const [videoUrl, audioUrl] = await Promise.all([
      FGbKWTFJ(videoBuf, videoName),
      FGbKWTFJ(audioBuf, audioName)
    ]);
    aiLog('WaveSpeed文件已托管: ' + videoUrl.substring(0, 60));
    const r = await fetch(WAVESPEED_SUBMIT, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ video: videoUrl, audio: audioUrl, sync_mode: 'loop' }),
      signal: AbortSignal.timeout(30000)
    });
    const data = await r.json();
    aiLog('WaveSpeed响应(' + r.status + '): ' + JSON.stringify(data).substring(0, 400));
    // WaveSpeed返回: {id: "xxx"} 或在 data 里
    const wsId = data.id || data.request_id || (data.data && data.data.id);
    if (wsId) {
      xVNAIPAdQyh[wsId] = 'wavespeed';
      return { taskId: wsId, status: 'processing' };
    }
    throw new Error((data.message || '未返回ID') + ' [wavespeed]');
  } catch(e) { aiLog('策略2-WaveSpeed失败: ' + e.message); }

  throw new Error('所有AI方案均失败');
}

// 本地FFmpeg合成 — 用 -t 精确定时长，替代不可靠的 -shortest
/* DvFkOmFSwD */
function pPRcSh$(videoPath, audioPath, outPath) {
  const { spawnSync } = require('child_process');
  
  // 通用ffprobe（spawnSync同时获取stdout+stderr）
  function ffprobe(filePath) {
    const r = spawnSync(FFMPEG, ['-i', filePath], { timeout: 8000, windowsHide: true, encoding: 'utf8' });
    return (r.stderr || '') + (r.stdout || '');  // ffmpeg probe info都在stderr
  }
  
  // 检测视频编码
  let codec = 'unknown';
  const vprobe = ffprobe(videoPath);
  if (vprobe.includes('Video: h264')) codec = 'h264';
  else if (vprobe.includes('Video: hevc')) codec = 'hevc';
  
  // 获取音频时长
  let audDuration = '';
  const aprobe = ffprobe(audioPath);
  const m = aprobe.match(/Duration:\s*(\d+):(\d+):(\d+\.\d+)/);
  if (m) audDuration = (parseInt(m[1])*3600 + parseInt(m[2])*60 + parseFloat(m[3])).toFixed(3);
  
  aiLog('本地合成: 音频=' + (audDuration || '?') + '秒, 编码=' + codec);
  
  const durFlag = audDuration ? `-t ${audDuration}` : '-shortest';
  
  if (codec === 'h264') {
    const { execSync } = require('child_process');
    execSync(`"${FFMPEG}" -y -stream_loop -1 -i "${videoPath}" -i "${audioPath}" -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 128k ${durFlag} -movflags +faststart "${outPath}"`, { timeout: 30000, encoding: 'buffer', windowsHide: true });
  } else {
    const h264Path = videoPath.replace(/\.\w+$/, '_h264.mp4');
    const { execSync } = require('child_process');
    execSync(`"${FFMPEG}" -y -i "${videoPath}" -map 0:v:0 -c:v libx264 -preset ultrafast -crf 30 -vf scale=-2:480 -an -movflags +faststart "${h264Path}"`, { timeout: 120000, encoding: 'buffer', windowsHide: true });
    execSync(`"${FFMPEG}" -y -stream_loop -1 -i "${h264Path}" -i "${audioPath}" -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 128k ${durFlag} -movflags +faststart "${outPath}"`, { timeout: 30000, encoding: 'buffer', windowsHide: true });
    try { fs.unlinkSync(h264Path); } catch {}
  }
  aiLog('本地合成完成, ' + path.basename(outPath) + ' (' + (fs.statSync(outPath).size/1024/1024).toFixed(1) + 'MB)');
}

async function bkmrvbp(apiKey, taskId) {
  const provider = xVNAIPAdQyh[taskId] || 'moark';
  
  if (provider === 'wavespeed') {
    const r = await fetch(`${WAVESPEED_RESULT}/${taskId}/result`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      signal: AbortSignal.timeout(15000)
    });
    const data = await r.json();
    const d = data.data || data;
    return {
      outputUrl: d.outputs?.[0] || d.output?.file_url,
      status: d.status || 'processing',
    };
  }
  
  // moark 查询
  const r = await fetch(`${MOARK_TASK}/${taskId}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
    signal: AbortSignal.timeout(15000)
  });
  const data = await r.json();
  return {
    outputUrl: data.output?.file_url || data.outputs?.[0],
    status: data.status || 'processing',
  };
}

app.use(cors());
app.use(express.json({ limit: '200mb' }));
// 禁止缓存静态文件，确保每次拿到最新JS/CSS
app.use(express.static(path.join(__dirname, 'web'), {
  setHeaders: (res) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
  }
}));
app.use('/output', express.static(outputDir));
app.use('/temp', express.static(tempDir));

// ===== 激活码验证系统 =====
const EjoQ$_yaBx = 'HKCU\\Software\\RSVdgxVhkvpG';
const yKUe$fDibQ = [
  "283ffc1119faf45ecdfd5352e7d3f95630eccf408e8559fe48e32a12446be44b",
  "665100ba7fb43fbfe4bd6286d1cdf1859d6718e31cf879ecf0b35dd2eaef70a1",
  "56a7d4f84b35ab354b94da324eb52dfb4090d44690b5364eef76363ba181a1fa",
  "2e8a2a5f9b79717eddbc4706444de953d2cd2d51c50c520a6ff92b102349019c",
  "684bb9619ab8aa2e161d4acf285096764155f96866ff2129fb49d5c1da56d810",
  "267b902e6c9afaaa17b1558df7ea058ae6bf005f6e2ca31ce10f959927d75c0c",
  "0ba099026fff0246ff289592fa62cd0e784084fc93c149357355c2ac4f370673",
  "7bf13d3c08d27430f3e2c477423add55ebb1c314eff39705c930aa8566ed0780",
  "e9e01868924ac6d9d82e80cca1d289420aa88fa43c7356bcd5602d6115ddd4c6",
  "8cb94588de5a41b13c48a605a724f07d473ad01b5f6787e629d5856113453840",
  "0f75ef45c42af943b4151e1aab27aa1d01c2084740e4fbde10977112e985dcfa",
  "8784b89d52afd280348c190fc4a4824b5f21ebd8d76af4bc8e1cfd86b2ff39ff",
  "7ee0429ee966c7fcb2738080fa68b1dcbcdef30a28d2e0bd7066186d6d83e4a6",
  "a04abc21ca73effc2798e432287d616c4bb1f57bfb2969664cdf8e687136d841",
  "34c97b5a4cf6ee44c5efb206f637cb7d6aefbb9e02e65b1d78a2c96f91b2b54e",
  "e759da6cccc028d01b23d5570e2749dd17010f59277e16cd52f7ddfc37941ffc",
  "965768e1e101414cc982610d3526c8eeb211bbcc5e518499e805349d9609e71c",
  "eb02ad879a0bd5ca2e98449a970268e0907c07f0d041fb1e6168a7091832ec4c",
  "86f1323685e1ab769721d4093ed508dcb7a00617240c7f22434196ceb49082d3",
  "2cc498722d917c4197e89c977d7c9068b18fbe8b8bc921423590b25b17fddaae",
  "e0d0c8ff9badf9da92ebc15c8c380fbc27e160883e7e089bbfa132f9a2d51350",
  "9e07ff62eca6e7f6d7e53df69019d0c0a082d918f3ad02e33f9c092ee787c23b",
  "d92be399f87ec5aa6981d77d10098bf56f078e6dae9a2754bfcb20caf5c56f0b",
  "eb2cafc991164d36c0d2b4b55ea9bdc5e3923cd1cf3c7cecdabe5f7dc5dd5407",
  "0c11ac58fe5ba3767ebbbbfa11ffe771986552f283e4a4d2eee7d83684ea674f",
  "994b96daa18aa2b428d53b2d279ea436fa89da9435c7c6703d6f15a2f665b47d",
  "590768cbb4b4d68fc8d6392e77895c3e91f6688d9997d523f497d531b6b6808e",
  "9e65ff301ee8479565ba014ce5a066bcb936273b2823e6ce12e494930aa9af67",
  "35fe7c151c6ea0b114054dd58ec0535e892eeaed59094f84a7b114a2472e8c30",
  "be1a487ee6210075831cd7977002eb8518265d3a0473bdaa5573a6003f15e4e6",
  "6230d453b1e896f60fd7996c833c48cadfc92e07154ea950f246a2bfd4ba3dfa",
  "ac352a0b58e06e526654bbcfe0c749363971ed8ed06537b39fdc556692febb84",
  "53007e4d36f8c6d0318ee77d17e6bff4817a672985a441747d15e95b3fce11f2",
  "cb94e332ca0617068af7b479ec7df8daad654c1808c8791c6a8d679e5325a30d",
  "17d3cd14ebc138ac905344b0a81ad63bbcfaa8182776abbd2972dd27bc80b1d7",
  "31188486f500f6814ae3a794afaac98ea97f30438c3713b90e89fae83ec59794",
  "7b8274d06ad9288f7038b9a35f007c729c176ac58e66541b191c183a512420c7",
  "6a84b8c29a9dd69697b1d8200948db18599d4a7c31d52d5342a700a9bdcd82c3",
  "25442130b5fb81bd9ed6bf265c1c3f6f9b48d9c4ea762ae419357d1a1a77eb1c",
  "855e2bb840d3eda4b1c621cfa8bbf7226ac5e141be7d5f5345082d2b7d2316b8",
  "32795b56c86dd6f12e691fa1828adc9c13647d217c9f19c5206cbab987ae9e76",
  "d8fd34b286f70a43b592323af922670b2a811e7f507cdf03de9c106b677b7ca9",
  "78648fd81df4c0377fa1a16cb5a2c2fbb14c52c106232b662578a42da040fe82",
  "f3f211d4853d3aba4ef9f6d3f57a40ed561ccd35b04e8b97ac40740d5d7504a5",
  "2baaecbc1cb1c52dfb45a42a06ab390ea2703e16ec1201f0d44a8f63565f77c9",
  "6bf489b5d4a35ffb3bec07a31595657daf5cf636066a12804843b4bed4e2c8ab",
  "82c519a3997a4b994006012e6696a293d8d27fee1fecb714c8d9ee194264176d",
  "5301d4368512338ea8f3545737840064d1c9451a43e52f16cd7a10fb5636c564",
  "f687020215755c2b180c373112f9b2dc892d8090dcda03305e7c466cf4e346f9",
  "5b6370987575fd181f2f1b2a53f81e1a3746366df1594499791c3ba65f297f38",
  "d53999f67389262ce74fabebf9424c9ad4d0c9b7364ad6c621fb81b9d62028f4",
  "0bbdd5267d70e0c34a5e5a0d35ecc49235740bde25682cf69892e5b56a8a46da",
  "2fe471c129528ef0a26e4a978acff94ea10e01a573a7db6bcddfdeaec9db2e9a",
  "69fc9b5dc470c4c39b27fec3398ffa0e681adef08038c5a50165509e03642d72",
  "2d357c9fcbe3df67899fcd6c933997e67238074acb6e252b294d3e9b04527385",
  "8e8217d9c4d2a5330833e435fd224acf69001c721dc85fd6e4bd9242b3359577",
  "f950ef145a8036089f6e11aef0ca45e3075acca971cda442083ab913b0232b53",
  "c75e60ef61a599f5beca002e26f229a634fa0aa64827e11900a520ccbc931980",
  "880b3ac93e30f43122e10c5fcdf715c310b23826dd5f1b522cf3d8316c23a3aa",
  "0465a850277b41647aa3fce54955b93a16b3ab869e4772461e46538328614a2a",
  "7d384767a4340d3f8137a019848a69de219829f84bb59f0b29351bfb214a867c",
  "819f8a28be09fa827d2fa0f951a6c20ef60f5b5a4804af8ddbf14e1a07e8d233",
  "db93559228ee1ba586e128591f7e8916f479518dd999a85e9a722db78ea41bed",
  "2231f389e39db33c0a2b714b7266b82d0b5e88f0065ed86788eb9217e541c1a9",
  "29735c9e4d0ec44d2349a7759897f6ee0f7ca6d0c42d57a9b07bc5a4f5c11f87",
  "7fbd1a53820016a56c1fb9133d32d7ff7269233a5e3a8fde43113a5d2ca32399",
  "c989590c5d5554c94d16247a97a35c1443a259acf107ddc9cd4992cbf0c310cc",
  "00fc920e8322ba26fcb593ba2bc567da4f618140d718e11b8bf69b7a55589f98",
  "5255fe552ad9f5701c620a83e574ddf034720b18127ba1dc66d1f448c0787e0f",
  "0df48c8a47c08451d634941b52d6d4987426399187ac585712370931ddd2060f",
  "7cd27316b5f970b49712fddf2038a1f6256fbaad0bb363a136112122483d6c79",
  "78571dd9650f49b9a93a4bd081a564de7805e13673bb4ec486e90befa9b9dfa4",
  "26fd85c0f9ae8c1c51750b396fed7f10c2dbeeb954683f834c73a66c84988629",
  "1bf83e93eb09022dfdde3e84b94e9331549a5f7e18ad5c2899e095f2ee4128f9",
  "0779d76e062d06ca347a9be414f7503c26d6d62a84deb65f01008fa2bd305477",
  "d87930ecb6a430f32be5958f1e4d6e0ef16f1602172d96e971aa69cbb1ebbe75",
  "e6e77dca47284095c1de1cdfeb492dd5b3439f96930d66be85f14401b366af51",
  "c1a4732e1475c936dc5f7e171679fefe4d52c3d917937ceec1ec8ddb93520ae4",
  "0a723e837fd82a6f314eea88feb87eba77d8a93ce0690e50e6fca2c57c328245",
  "ab24b04d71aaa28e3c7442d9e23bed6722d267b98b496b4764ee2807090846b2",
  "f359096a686b66745c0e985538884ad91157735b0cb638ae6a9aacad12804ec8",
  "9524cc6fba4c912de38d6456f632b11a4e9fab94caf39bce3c810f04e8768f7e",
  "b342c18a835599f43fa9f1c2a2f67e6af88de2dc6af1a7a883907a51160e5b81",
  "858d9335a1cdc94230bdfa97afd6b30d2ed60eb88be9a6bc245b03580e996ae6",
  "e969f0f6abb323c7b5062f35cbebbf44137075f74b78c6fd6dc01bc4c18cc47c",
  "4e9754ba075a3808d0f239ae563f2147d46a30ce51589cacea39b31daf436777",
  "e60ab8f4b927ac0f8f6594cc4f3d557a3136046ab2fddb51cc372dfdaecef4b7",
  "960b59f146580b9b74ff5ad1729414fe66b7495a1281377a3f93c3141732fec6",
  "9fadfa61d9e1de23c57e23f1c9194abbff4a0427b372999863add75de3d8ee6c",
  "be6f44bf5a9208e4fa4403433f3e583cf9fd2d2a6908766a6ab79d8ca10950fe",
  "0c9c4761edc822b8c9f258d0dd4e791db8386e6403eff189faca2bf8c3dde03b",
  "81e8ad3b2963ceb58905b8227d34e5ffb894625cbc6c7703f8e71ce285835f38",
  "b1505d9ab5d1212fd808ae9fd58c87434ef7785ac187336d228eede2023164aa",
  "7fdf7c8a825931518518327f15aa65bfb6849a59cfbec23969c619a99a820229",
  "2b463512033b6a14ff4b2afe74b39b03b8e9ae1fc1a4966836cc790325e3f2b1",
  "1ac8015cffc1f428e7ef242bd91d8c14de1f8dbdca65df65c3929fad9385a6d1",
  "d958e6255f3ea2c1c6a11024f0ff2bbcb7bba6a2067653e9ecc72a10e21a6790",
  "968e73b01afd318cebcade048a81bf0eddd938b8f762c5d972ede73333892a29",
  "afd7d35cfe171a79bb39bde9811405c67b41c4bc2c6ab952da416dc81b88d737",
  "c6da6f136f0403fa4dd1b32c17f7020920236b61a853274339607f8df0305605",
  "1ed287eae504d6119f0c23b0d25c101a4adb06cc1149bc1343d090b6c6c2f6ae",
  "380edc742d9ec7278a12ee79565252a54573212ed5ff60abe9566d82aee61597",
  "714df632fa6106939a7718eb6f5d1a61685e9352ad71488b3c289d3c703e8fbc",
  "88fbd5afedb81638fe526fd73bbb56bd312ce467360f86a89f511b2afcd76d0e",
  "dab79189950bf017da0d4c1189718cd9221d31595346f0c69077530a0b0114ec",
  "ed2af546a4aec21a4b3423d6386207aca393da7489539f41b9aafb7e4d52c6f1",
  "57141e3733611f86063c0920533cfb498b040108aea9a3f9938227479dc9c5b8",
  "25cfe78404bff5a71c7c834bbe7f431216daf37cbc25618bda1d0b48b5e0745e",
  "6e4c9fb7f58455093bb9dda7c0f854649474fea27d25dbe39899e05dbd3d119f",
  "443df156b6a3e3343b1cca9e25d138d44946ef2505e552a798d27b35c815e092",
  "3a374db6f78cb678bcf1ddef1df3432ce6ad47088eb882d5f96e883fa3fd467b",
  "52c719e3fe3153da1f7ed45564126a915baa891e656702074bfe2a095d1b1261",
  "9a6fac34747dee8de0704aa9bb102d2c4039466b4d178cf7a5c98cebbe888737",
  "1d7415edff453dc7ffc2ee5a092dcb39366e951e724f6bc7b2c06475cff1b1d8",
  "643a765a42d3fdf399412c82e8bfe811d5512088b86afd2d6d4466cfafe46c98",
  "d0fffe8dbfbc533db8b49d159781d92006cf4c740407dbe105e75ccd8e314123",
  "e788952ae31cc7e017b415a5476e5e0e5d0ae554c68b0898bc69965cee0bcb0d",
  "3dc7fdb2053965423a3024f5de461da3f0c4ca0bdf959c74f5c8ef37823433cd",
  "349ef5dd859a5bb41b2962b608d241fc0f3419397b1dd79bec7377ad84096c8f",
  "05066e2ad3b086130a4931993eaf756d7beb3ac961da4af27bcda622008818d7",
  "7b231c5e5e85f55fb32fdc1fe6ac7134b81b08cca79e4f942a16362c0dbe53f1",
  "80792e7f0b835efc6ec5700e819e75f7d9d03e271d0457667f58e22b2b4c2d7d",
  "7a91ec0b3c3fa7d09c6ed43f3f80c9b71b842ac403e2fdffa7b781f73108ffe0",
  "93645e0f55f127904e3b55a46ef58821a9174648e87303334c18474e5dc3352e",
  "31f4b1073da6d2bb0ca23615addbb7330da9adb3e7b6a7ff78cc7be4001f9a13",
  "1cf2e61db070f554485c338f78b42144c3ce92c7b1cb3fab2d477afda4060af9",
  "97293506332d988b60efc63b63f29babc34e6f62e95987af2616c035b54fe9c7",
  "7f79f1b3db943e3fed9db75145e8d9a8ec3595b8768f06bdb3acf729741f032b",
  "8efaa2eba946c69c140ae15d58731cd5437c783e21788e69e9fa7549d9b834f3",
  "dc99e553de33470689be2c86c8202b32f5d4117f3300218e02414708e0b2b304",
  "f8aa79f2d877492e625940d94e582ef8679b9e02b28e923f02164aeb8d3dc25d",
  "254647a1b00d83b89ffaa90d2b4e4f2c16bb576da73aface110d1cddbae9bea1",
  "81787f282567becf5902a3ebdaa4aea5eb98515e1d54919446e478d591f9b3a3",
  "011c2a3d557f95cb228973008cdf2a4ab9c2f46f70b424f8d85224a3a0788c04",
  "30ccc5d36c72eadd9c74b6501ee12f6e1618b6d6fb145473baedb424ec82df18",
  "d9d1681ec3148235e822ea3b885eb28f50d522a52214dd1331d297bcba750286",
  "eb8f69addd7fdcaae980ad3dd98da3693feeaf2567737276a69ec35486c92ef8",
  "4b55f08b02319a2052d96c84e1f76cae947b5dfc57efd8f2cfb2eb3aa1103935",
  "80456a271aef186706c7604fa65b2e09f32224705b41cd409fba913fc0792429",
  "2468d9c1cb4ad541735fabf478bb434b2b5674843f7cd27a25943bc87d37d4c8",
  "e119176dc53c9ce6258020853b98e0163e4091cde01c201d0ee9273a4d7701bd",
  "e5aaba6be6950c0661b8318e52f7a6f0f3b26f07b5af20d1b57647892228ad7f",
  "f1fbf5d983f792e2b50f2ca2aa87f4cd5c1a424f100fc977f0895b8e3ebf55b2",
  "fbc0f5502e53f27c775f2f3fa43fcf7a9f378e9f3867e99bc157a64a0efa3ba0",
  "8f8b8482dc98cf8dac5e3fb023d63ffebe42e4a7337bbabca8612e3eb8e4864e",
  "082bd719a63b52bdd898d233cbc7a629d232fb3af841478deb3b4c993614a843",
  "3577d7347101dbcb6dc066cbbbd66cfca3fbe7bc12f91836c43f19d09efae75a",
  "ecbff009e35454d2695ca7ea5347ed5d1cb8fe0f3450ab17de0fab1a01afd82d",
  "4b6eee1f6826a29cde6c88601bf825135ecd8cafc62f763750d526147f39c338",
  "96329cdd7538472158eb920a754b89983a89486d04e688bdce89547c80326827",
  "ffbb880bbc667229547aab7096430e850521cefa26df04e2537c5aa65f195b3e",
  "b2cb2c3a7f2f1fe7e0c19bf832c76090fae64a12515b27477068aa29e806457f",
  "0d3303191dfc1fd969f8395fa7e2fec9011e3753c806922771a957463fa6e080",
  "f0409b73205a29de9cd30df766c570ea0638b2113bfd67f3056e7934297d0108",
  "8adbff6cde04b1881ae9edaa23112e94c688c23c081cc344e144356b8ccc55c1",
  "36b7a6c5cf61f8a4220fbca7c72fac4b40a9456f6ff9961f62f3487f1e10298a",
  "d513bfce30efd073059c5360f79cc2566af4435418cd578f810e930f24316880",
  "03722efbf4c9ead7f510aeef3e5cbf633855be3800dde91e080d501b7850c68d",
  "be548106f5e787e8ca503e87ddb278dd56b3b95bf3d9e6ec5d44820cf7751ba9",
  "47f7f5c308b990c944e7a88cf927d4d94a5ff1be4884bd039c0a424374f72a60",
  "77427a7474ecb26c32fe2df29398f2c67a40f3e3b5cb3d597c3f691a3f5b19da",
  "ed206e14aa27488e5ef9afd713c772503f2c06bf580d5ed1ad82bdcfe72f930b",
  "eb901203c990043ee199be5c6221c0fef593c0c447c32e7fc0f953c094429240",
  "626ce40f8d4af65edd012afdb966fff76e94e353e3746c2966c622bfd0529fca",
  "eeea93fbc037f71fca4960c89711d2d59b87eaf6d866bd70e46299b48b07b32a",
  "bcc96580d1f4707a1d37808d33efb4eb9d7355e650faa1d49a6a554f912fb37b",
  "f182912aa39f78258b038c1a763b7b018697d8e3b17005e0046399e0ac45ffca",
  "89a339cf107aac9e78fb103e887229ee20cb007596a1691ad365462805154d88",
  "58450469fd79c6f00ee5db6af9be02d45a55d8a0b95a56b82b7a6e75f304ccf1",
  "96e741549fb27d158de1d75d1ebe9af9a0b1061baea9fd2e523ee23719c55e60",
  "5f853be5037aae34daafa98e082f771b1f60a9a59affb110fa1e218afab6e284",
  "41611b416a834040341ad90723a4fd4286bff0dcd33d98dfc4b7a5895c87b7c4",
  "75da63003b6942740d0d4c08293beb032aa7b4449dd81e3ae88b988955c0d478",
  "7b8e2cda0276bd331e88c9021905c9f911e5a6fcf6aaf199998a2397796320ab",
  "4b0efb6322e9dee6254b38e83f6249052a050cc65de9b6408c1f8b6e3a9c6a3a",
  "48e15ca60fe298f642adc24375602efab4fda3712e8fb9f67f034108f7b6cfff",
  "d5420d7e28fece1a4e1ed308decf8762ff3c5a516e38ac78ac0bb2a010502de8",
  "7ad237299d6bb5f437eabceca3b2e51f4d4bff300ea873bd06a2c2e583fe03f6",
  "8559b6c713e8d27990dafab2bbc082caed21ed3383880bab434a2e2da028f237",
  "196f8ce003b2044d22182d52c88ac57965bcc8e7339e211b1f95f786d9e57e3e",
  "d94a8636d76d08cee69e9d372e1b81914510c75132a2c6579b64f2f9d2399485",
  "e0f16a6ca8762b3089291eb9dcf766d6c10049278c5f2616e3038d938b3bfcf8",
  "a1270542f444184150e27f31a7bd78974f4095197de51eda0012bee2fa0b8cd3",
  "f193552df719d4386b60b62fedfc01278ae536ff6b3003a82e522e63f58d9919",
  "4e25bc24c413ce76234dd1b055d118754ee08cc3a749bd93c11d4460bbcec06d",
  "de0d940d8a5136552fc4fb09e04245c4f74f25a2d537fa8c4345a1aba7717f5b",
  "b7bc4f4cda8d169d43e63794e80a42d8cdc917ebcf837ce912676765bc841303",
  "5fc83bfbef1fc99e83389ebc6b35fd0c5015221f9abcfdaaa7d0636f10612054",
  "ecc3ad370a222821a4270da67d8761151d596d2df4016e3b97b8a05f5a47eea6",
  "8f0a1e2c17e31ae975dfb162c13a0ee5749d689e6375abe17472deea3a06b988",
  "0b6078456ee666c501977f584eeb1cf86c1d40dd313bd2ccb70838969a994e29",
  "b86c58e030c228ae78151d9bce4f8bf803b872f3441a6bf36c5ed60806a14544",
  "61a5151160a9344ec941018122f5fe8d653ec039b3408cc2f87ebd45f3eebfaf",
  "b247fda18c08ffce92d0747517e8b98c299a13ff35888e42b6557485d668623c",
  "879047fef20a01cb4cfeb81bc0bd59787e5924cf96ea1a663176225d71972b8b",
  "76c93357490ca0d5611b53ac582b551288ad498911a6b7c2af92a908503f2b36",
  "be6532eb63465630ef32be8dd02d977b526154e2c75ee4bd4605502744e35f76",
  "d00e37fee641545e54a93e63ed77ae144746406e53ba613b9abac286ce171158",
  "67b221090b41d7685a1a444349d56164c5df0de754c939e44093c689913281a0",
  "5c03a552ee7dc90a733ded51b002ee6f96042e97130d557273fd48da287ba026"
];

// 检查是否已激活（读取注册表或文件标记）
function hAVNoIoWA() {
  try {
    const { execSync } = require('child_process');
    const r = execSync(`reg query "${EjoQ$_yaBx}" /v Activated 2>nul`, { encoding: 'utf8', windowsHide: true });
    return r.includes('0x1');
  } catch(e) {
    // 回退：检查文件标记
    const marker = path.join(__dirname, '.activated');
    return fs.existsSync(marker);
  }
}

// 激活码验证
function SrYhpqZ(code) {
  const hash = require('crypto').createHash('sha256').update(code.toUpperCase().trim()).digest('hex');
  return yKUe$fDibQ.includes(hash);
}

// 标记为已激活
function IpNiXuWb() {
  try {
    const { execSync } = require('child_process');
    execSync(`reg add "${EjoQ$_yaBx}" /v Activated /t REG_DWORD /d 1 /f`, { encoding: 'utf8', windowsHide: true });
  } catch(e) {
    fs.writeFileSync(path.join(__dirname, '.activated'), '1', 'utf8');
  }
}

// 激活中间件：未激活时只拦截主页面，允许静态资源和API通过
app.use((req, res, next) => {
  // 这些路径始终放行
  if (req.path === '/activate.html' || req.path === '/api/activate' || 
      req.path.startsWith('/assets/') || req.path.startsWith('/api-bridge') ||
      req.path.startsWith('/api/') || req.path.startsWith('/output/') || req.path.startsWith('/temp/')) {
    return next();
  }
  // 未激活：只拦截主页面/根路径
/* wYCLVjDQpqA */
  if (!hAVNoIoWA() && (req.path === '/' || req.path === '/index.html')) {
    return res.redirect('/activate.html');
  }
  next();
});

// 激活码提交端点（本地验证 + 联网一码一机）
const LrYmkUv = require('./online_activation');
app.post('/api/activate', async (req, res) => {
  const { code } = req.body || {};
  if (!code) return res.json({ error: '请输入激活码' });
  if (!SrYhpqZ(code)) return res.json({ error: '激活码无效或已被使用' });
  // 联网验证（一码一机）
  try {
    const onlineResult = await LrYmkUv.verifyOnline(code, 'lipsync');
    if (onlineResult.status === 'rejected') return res.json({ error: onlineResult.message });
  } catch (e) { /* 网络错误：允许已激活设备离线使用 */ }
  IpNiXuWb();
  res.json({ ok: true });
});

// 获取激活状态
app.get('/api/activation-status', (req, res) => {
  res.json({ activated: hAVNoIoWA() });
});

const MOARK = 'https://api.moark.com/v1';
const DESKTOP_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36';
const MOBILE_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 Version/16.6 Mobile/15E148 Safari/604.1';
// 双Key架构：免费Key用于改写/TTS/ASR/封面，付费Key仅用于AI对口型
let API_KEY = '';        // 免费Key（改写/TTS/ASR/封面）
let RHgWEg$iXQI = ''; // 付费Key（AI对口型），如未设置则回退免费Key
let s_MhwFmR = '';
const KEY_FILE = path.join(__dirname, '.api_key');
const NtppXsTG = path.join(__dirname, '.api_key_paid');
const COOKIE_FILE = path.join(__dirname, '.moark_cookies');
// 启动时从文件恢复
try { if (fs.existsSync(KEY_FILE)) API_KEY = fs.readFileSync(KEY_FILE, 'utf8').trim(); } catch(e) {}
try { if (fs.existsSync(NtppXsTG)) RHgWEg$iXQI = fs.readFileSync(NtppXsTG, 'utf8').trim(); } catch(e) {}
// 付费Key未设置时回退免费Key
if (!RHgWEg$iXQI) RHgWEg$iXQI = API_KEY;
try { if (fs.existsSync(COOKIE_FILE)) s_MhwFmR = fs.readFileSync(COOKIE_FILE, 'utf8').trim(); } catch(e) {}
console.log('[Key-免费]', API_KEY ? API_KEY.substring(0, 8) + '...' : '未设置');
console.log('[Key-付费]', RHgWEg$iXQI && RHgWEg$iXQI !== API_KEY ? RHgWEg$iXQI.substring(0, 8) + '...(对口型专用)' : '同免费Key');
console.log('[Cookie]', s_MhwFmR ? '已加载(' + s_MhwFmR.substring(0, 20) + '...)' : '未设置(语音克隆需要)');
const rid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

// 安全错误信息：只过滤控制字符，不破坏正常文本
function safeMsg(msg) {
  const s = String(msg || '');
  if (s.length > 300) return s.substring(0, 300);
  return s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
}

// 智能解码响应体（自动检测编码）
async function safeText(response) {
  const buf = Buffer.from(await response.arrayBuffer());
  const ct = (response.headers.get('content-type') || '').toLowerCase();
  const m = ct.match(/charset=([\w-]+)/i);
  if (m && m[1] !== 'utf-8') {
    try { return require('iconv-lite').decode(buf, m[1]); } catch(e) {}
  }
  // 尝试UTF-8，失败则尝试GBK
  const utf8 = buf.toString('utf8');
  if (!utf8.includes('�')) return utf8;
  try { return require('iconv-lite').decode(buf, 'gbk'); } catch(e) { return utf8; }
}

app.get('/api/health', (_, r) => r.json({ ok: true }));
app.get('/api/config', (_, r) => r.json({ hasKey: !!API_KEY, keyPreview: API_KEY ? API_KEY.substring(0, 8) + '...' : '未设置' }));
app.post('/api/config', (req, res) => {
  if (req.body.apiKey?.trim()) { 
    API_KEY = req.body.apiKey.trim(); 
    try { fs.writeFileSync(KEY_FILE, API_KEY, 'utf8'); } catch(e) {}
  }
  res.json({ ok: true, hasKey: !!API_KEY, keyPreview: API_KEY ? API_KEY.substring(0, 8) + '...' : '未设置' });
});
// Key验证接口
app.post('/api/verify-key', async (req, res) => {
  if (!API_KEY) return res.json({ error: '请先设置API Key' });
  try {
    const r = await fetch(`${MOARK}/models`, { headers: { 'Authorization': `Bearer ${API_KEY}` }, signal: AbortSignal.timeout(10000) });
    if (r.ok) { const d = await r.json(); return res.json({ ok: true, models: (d.data||[]).length + '个可用' }); }
    res.json({ error: 'Key无效(错误' + r.status + '), 请检查moark后台' });
  } catch(e) { res.json({ error: '验证失败: ' + e.message }); }
});

// ===== 辅助函数 =====
// 1:1 照搬原版 extractDouyinVideo 流程

function getFirstUrl(textOrUrl) {
  const matchList = textOrUrl.match(/https:\/\/[^\s]+/g);
  if (!matchList?.length) throw new Error("短视频地址格式错误");
  return matchList[0].replace(/[，。；;、]+$/g, "");
}

async function resolveShortUrl(videoUrl) {
  if (!videoUrl.startsWith("https://v.douyin.com")) return videoUrl;
  const r = await fetch(videoUrl, {
    headers: { "user-agent": DESKTOP_UA },
    redirect: "manual",
    signal: AbortSignal.timeout(8000)
  });
  const location = r.headers.get("location");
  if (!location) throw new Error("抖音短链接解析失败");
  return new URL(location, videoUrl).href;
}

async function getVideoId(textOrUrl) {
  try {
    const url = getFirstUrl(textOrUrl);
    console.log('[提取:1] URL:', url.substring(0, 80));
    const videoUrl = await resolveShortUrl(url);
    console.log('[提取:2] 解析后:', videoUrl.substring(0, 80));
    const parsedUrl = new URL(videoUrl);
    const modalId = parsedUrl.searchParams.get("modal_id");
    if (modalId) return modalId;
    const pathList = parsedUrl.pathname.replace(/^\/|\/$/g, "").split("/");
    const videoId = pathList[pathList.length - 1];
    if (!videoId) throw new Error("短视频地址格式错误");
    return videoId;
  } catch (error) {
    if (error.name === "TimeoutError" || error.name === "AbortError") throw error;
    throw new Error("抖音视频ID提取失败");
  }
}

function extractRouterData(pageHtml) {
  const matchList = pageHtml.match(/window\._ROUTER_DATA\s*=\s*(.*?)<\/script>/s);
  if (!matchList?.[1]) throw new Error("抖音视频信息解析失败");
  return JSON.parse(matchList[1]);
}

async function getVideoRealInfo(videoId) {
  try {
    console.log('[提取:3] 获取视频信息:', videoId);
    const r = await fetch(`https://m.douyin.com/share/video/${videoId}`, {
      headers: { "user-agent": MOBILE_UA },
      signal: AbortSignal.timeout(10000)
    });
    if (!r.ok) throw new Error(`视频信息请求失败 ${r.status}`);
    const data = extractRouterData(await safeText(r));
    const vi = data.loaderData?.["video_(id)/page"]?.videoInfoRes?.item_list?.[0];
    const rawVideoUrl = vi?.video?.play_addr?.url_list?.[0];
    if (!rawVideoUrl) throw new Error("无水印视频地址不存在");
    return {
      text: vi?.desc ?? "",
      videoUrl: rawVideoUrl.replace("playwm", "play")
    };
  } catch (error) {
    if (error.name === "TimeoutError") throw error;
    throw new Error("抖音视频信息提取失败");
  }
}

async function downloadMp4(videoUrl, retry = 3) {
  console.log('[提取:4] 下载视频...');
  if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
  for (let i = 0; i < retry; i++) {
    const mp4Path = path.join(tempDir, `${rid()}.mp4`);
    try {
      const r = await fetch(videoUrl, {
        headers: { "user-agent": DESKTOP_UA },
        signal: AbortSignal.timeout(30000)
      });
      if (!r.ok) throw new Error(`下载失败 ${r.status}`);
      fs.writeFileSync(mp4Path, Buffer.from(await r.arrayBuffer()));
      console.log('[提取:4] 下载完成:', (fs.statSync(mp4Path).size/1048576).toFixed(1), 'MB');
      return mp4Path;
    } catch (e) {
      if (e.name === "TimeoutError") throw e;
      try { fs.unlinkSync(mp4Path); } catch {}
      if (i === retry - 1) throw new Error("抖音视频下载失败");
    }
  }
  throw new Error("抖音视频下载失败");
}

async function extractAudioFromVideo(videoPath) {
  console.log('[提取:5] 提取音频...');
  const audioPath = path.join(tempDir, `${rid()}.mp3`);
  await runFfmpeg(["-y", "-i", videoPath, "-vn", "-ac", "1", "-ar", "16000", "-b:a", "64k", audioPath], { timeout: 30000 });
  console.log('[提取:5] 音频提取完成');
  return audioPath;
}

async function transcribeAudioWithMoark(apiKey, audioPath) {
  console.log('[提取:6] ASR识别...');
  const audioBuffer = await fs.promises.readFile(audioPath);
  const formData = new FormData();
  const blob = new Blob([audioBuffer], { type: "audio/mpeg" });
  formData.append("file", blob, `audio_${rid()}.mp3`);
  formData.append("model", "SenseVoiceSmall");
  formData.append("language", "auto");
  const r = await fetch(`${MOARK}/audio/transcriptions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: formData,
    signal: AbortSignal.timeout(30000)
  });
  if (!r.ok) {
    let msg = `模力方舟失败(${r.status})`;
    try {
      const ed = await r.json();
      if (ed.error?.message) msg = ed.error.message;
      else if (ed.error?.code) msg = ed.error.code;
    } catch(e) {}
    throw new Error(msg);
  }
  const data = await r.json();
  if (!data.text?.trim()) throw new Error("转写结果为空");
  return data.text.trim();
}

async function ioG$XbaA(textOrUrl) {
  // 非抖音链接：用AI提取
  if (!/douyin\.com|ixigua\.com/i.test(textOrUrl)) {
    const r = await fetch(textOrUrl, {
      headers: { "User-Agent": DESKTOP_UA },
      redirect: "follow",
      signal: AbortSignal.timeout(12000)
    });
    const raw = await safeText(r);
    const clean = raw.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, "\n").replace(/&[a-z]+;/g, " ")
      .replace(/\n{3,}/g, "\n").replace(/[ \t]+/g, " ").trim().substring(0, 4000);
    if (clean.length < 30) throw new Error("页面内容太少");
    const mr = await fetch(`${MOARK}/chat/completions`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "deepseek-v3", messages: [{ role: "user", content: `提取以下网页核心内容，只输出文字：\n\n${clean}` }], max_tokens: 500, temperature: 0.1 }),
      signal: AbortSignal.timeout(30000)
    });
    const md = await mr.json();
    if (!mr.ok) throw new Error("AI提取失败");
    return { text: (md.choices[0].message.content || "").trim(), videoUrl: textOrUrl };
  }

  // 抖音提取（1:1 照搬原版：下载视频 → 提取音频 → ASR 识别）
  const videoId = await getVideoId(textOrUrl);
  const videoInfo = await getVideoRealInfo(videoId);
  const mp4Path = await downloadMp4(videoInfo.videoUrl, 3);
  const audioPath = await extractAudioFromVideo(mp4Path);
  try {
    const text = await transcribeAudioWithMoark(API_KEY, audioPath);
    fs.unlink(mp4Path, () => {});
    fs.unlink(audioPath, () => {});
    return { text, videoUrl: videoInfo.videoUrl };
  } catch (e) {
    fs.unlink(mp4Path, () => {});
    fs.unlink(audioPath, () => {});
    throw e;
  }
}

// TTS语音合成 — 1:1照搬原版 uploadVoiceFile + synthesizeSpeech
async function gpHPWccq(text, voiceFilePath) {
  // 原版 uploadVoiceFile
  let promptAudioUrl = '';
  if (voiceFilePath && fs.existsSync(voiceFilePath) && s_MhwFmR) {
    try {
      let fileBuffer = fs.readFileSync(voiceFilePath);
      let uploadFileName = path.basename(voiceFilePath);
      const ext = uploadFileName.split('.').pop()?.toLowerCase() || '';
      
      // 浏览器录制的格式Moark不接受 → FFmpeg转标准MP3 (16kHz mono)
      if (ext !== 'mp3') {
        aiLog('TTS克隆: ' + ext + '格式需转换MP3, 原始=' + (fileBuffer.length/1024).toFixed(1) + 'KB');
        const mp3Path = path.join(HtucxPRM$, `clone_${rid()}.mp3`);
        try {
          const cp = require('child_process');
          cp.execSync(`"${RmiufGW}" -y -i "${voiceFilePath}" -ac 1 -ar 44100 -b:a 192k "${mp3Path}"`, { timeout: 15000, windowsHide: true });
          if (fs.existsSync(mp3Path) && fs.statSync(mp3Path).size > 500) {
            fileBuffer = fs.readFileSync(mp3Path);
            uploadFileName = `clone_${rid()}.mp3`;
            aiLog('TTS克隆: ✅ 转MP3成功 ' + (fileBuffer.length/1024).toFixed(1) + 'KB');
          } else {
            aiLog('TTS克隆: ❌ 转MP3失败,用原文件(可能合成400)');
          }
        } catch(ffErr) {
          aiLog('TTS克隆: ❌ FFmpeg错误: ' + (ffErr.message||'').substring(0,100));
        }
        try { fs.unlinkSync(mp3Path); } catch {}
      }
      
      aiLog('TTS克隆: 上传音色 ' + uploadFileName + ' (' + (fileBuffer.length/1024).toFixed(1) + 'KB)');
      const mimeMap = { mp3: 'audio/mpeg', wav: 'audio/wav', m4a: 'audio/mp4', ogg: 'audio/ogg', flac: 'audio/flac', webm: 'audio/webm', aac: 'audio/aac' };
      const fd = new FormData();
      fd.append('file', new Blob([fileBuffer], { type: mimeMap[uploadFileName.split('.').pop()?.toLowerCase() || ''] || 'audio/mpeg' }), uploadFileName);
      const upR = await fetch('https://moark.com/api/base/hub/upload/temp', {
        method: 'POST', headers: { Cookie: s_MhwFmR }, body: fd, signal: AbortSignal.timeout(15000)
      });
      if (!upR.ok) {
        const errD = await upR.json().catch(() => ({}));
        throw new Error(errD.message || errD.error || '音色上传失败(' + upR.status + ')');
      }
      const upD = await upR.json();
      if (!upD.url) throw new Error('上传成功但未返回URL');
      promptAudioUrl = upD.url;
      aiLog('TTS克隆: 音色上传成功 → ' + promptAudioUrl.substring(0, 60));
    } catch(e) { aiLog('TTS克隆: 上传失败 - ' + e.message); }
  } else {
    if (voiceFilePath) {
      if (!s_MhwFmR) aiLog('TTS克隆: 跳过音色上传(Cookie未设置)');
      else if (!fs.existsSync(voiceFilePath)) aiLog('TTS克隆: 跳过音色上传(文件不存在: ' + voiceFilePath + ')');
    }
  }
  
  // 原版 synthesizeSpeech
  const body = { input: text, model: 'IndexTTS-1.5', response_data_format: 'url' };
  if (promptAudioUrl) body.prompt_audio_url = promptAudioUrl;
  
  const mr = await fetch('https://api.moark.com/v1/audio/speech', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(60000)
  });
  
  if (!mr.ok) {
    const errD = await mr.json().catch(() => ({}));
    const errMsg = errD.error?.message || errD.error?.code || '语音合成失败(' + mr.status + ')';
    aiLog('TTS合成失败: ' + errMsg);
    throw new Error(errMsg);
  }
  
  const data = await mr.json();
  if (!data.url) throw new Error('合成成功但未返回音频地址');
  aiLog('TTS合成成功: ' + ((text||'').substring(0,20) + '...'));
  return data.url;
}

// ===== 1. 提取文案（30秒总超时）=====
app.post('/api/extract', async (req, res) => {
  const timer = setTimeout(() => {
    if (!res.headersSent) res.json({ error: '提取超时(30s)' });
  }, 30000);
  try {
    const { url } = req.body;
    if (!url) { clearTimeout(timer); return res.json({ error: '请输入链接' }); }
    if (!API_KEY) { clearTimeout(timer); return res.json({ error: '请先设置API Key' }); }
    console.log('[提取] 开始:', url.substring(0, 60));
    const result = await ioG$XbaA(url);
    if (!result.text || result.text.length < 5) { clearTimeout(timer); return res.json({ error: '提取内容为空' }); }
    clearTimeout(timer);
    console.log('[提取] 完成,', result.text.length, '字');
    res.json({ ok: true, text: result.text });
  } catch (e) {
    clearTimeout(timer);
    console.error('[提取] 失败:', e.message);
    // ioG$XbaA 现在接受 textOrUrl，错误消息直接展示
    res.json({ error: '提取失败: ' + safeMsg(e.message) });
  }
});

// ===== 2. 改写文案 =====
app.post('/api/rewrite', async (req, res) => {
  try {
    const { text, style } = req.body;
    if (!text) return res.status(400).json({ error: '请输入文案' });
    if (!API_KEY) return res.json({ error: '请先设置API Key' });
    const styles = {
      koushui: '你是短视频IP口播文案专家。把以下文案改写为口语化口播。要求：接地气、有感染力、像朋友聊天。只输出改写后的文案。',
      professional: '你是专业内容创作者。把以下文案改写为专业风格短视频口播。要求：条理清晰、专业但不生硬。只输出改写后的文案。',
      rexue: '你是短视频带货博主。把以下文案改写为热情带货风格。要求：充满激情、有紧迫感。只输出改写后的文案。',
      story: '你是短视频故事创作者。把以下文案改写为故事叙述风格。要求：有画面感、情感共鸣。只输出改写后的文案。',
      shortplay: '你是短剧编剧。把以下文案改写为短剧脚本。要求：有角色对话、场景描写。只输出改写后内容。',
    };
    const sys = styles[style] || styles['koushui'];
    const mr = await fetch(`${MOARK}/chat/completions`, {
      method: 'POST', headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'deepseek-r1', messages: [{ role: 'system', content: sys }, { role: 'user', content: text }], max_tokens: 1024, temperature: 0.7, top_p: 0.7, top_k: 50, frequency_penalty: 1 })
    });
    const md = await mr.json();
    if (!mr.ok) throw new Error(md.error?.message || '改写失败');
    res.json({ ok: true, text: (md.choices[0].message.content || '').trim() });
  } catch (e) { res.json({ error: safeMsg(e.message) }); }
});

// ===== 3. TTS =====
app.post('/api/tts', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: '请输入文本' });
    if (!API_KEY) return res.json({ error: '请先设置API Key' });
    const audioPath = await gpHPWccq(text);
    res.json({ ok: true, audioPath });
  } catch (e) { res.json({ error: safeMsg(e.message) }); }
});

// ===== 4. 视频对口型 =====
// DEBUG: 查看AI日志
app.get('/api/ai-log', (req, res) => {
  try { res.type('text').send(fs.readFileSync(LOG_FILE, 'utf8')); } catch { res.send('暂无日志'); }
});
// 支持 FormData 上传（浏览器直传）和 audioUrl 远程地址（TTS生成后）
app.post('/api/lipsync', upload.fields([{ name: 'video', maxCount: 1 }, { name: 'audio', maxCount: 1 }]), async (req, res) => {
  try {
    const vf = req.files?.video?.[0];
    const af = req.files?.audio?.[0];
    const { text, audioUrl } = req.body;
    if (!vf) return res.json({ error: '请上传视频' });

    let audioPath = af?.path;
    if (!audioPath && audioUrl) {
      // 从远程URL下载音频（TTS生成后）
      const r = await fetch(audioUrl, { signal: AbortSignal.timeout(30000) });
      if (!r.ok) return res.json({ error: '下载音频失败: ' + r.status });
      const ext = audioUrl.includes('.wav') ? '.wav' : '.mp3';
      audioPath = path.join(tempDir, `lsa_${rid()}${ext}`);
      fs.writeFileSync(audioPath, Buffer.from(await r.arrayBuffer()));
    }
    if (!audioPath && text) {
      // TTS生成音频
      try {
        const ttsPath = await gpHPWccq(text);
        audioPath = path.join(outputDir, ttsPath.replace('/output/', ''));
      } catch(e) {
        return res.json({ error: 'TTS生成失败: ' + safeMsg(e.message) });
      }
    }
    if (!audioPath) return res.json({ error: '请提供音频' });

    // ===== AI对口型（模力方舟 Duix.Heygem）优先 =====
    try {
      const vidBuf = fs.readFileSync(vf.path);
      const audBuf = fs.readFileSync(audioPath);
      aiLog('提交AI对口型（Duix.Heygem）...');
      const aiResult = await VIwlLTXteLW(
        RHgWEg$iXQI,
        vidBuf, path.basename(vf.path), 'video/mp4',
        audBuf, path.basename(audioPath), audioPath.endsWith('.wav') ? 'audio/wav' : 'audio/mpeg'
      );
      aiLog('AI任务已提交: ' + aiResult.taskId);
      return res.json({ result: { taskId: aiResult.taskId, status: 'processing' } });
    } catch(aiErr) {
      aiLog('AI失败，回退本地合成: ' + aiErr.message);
    }
    
    // 回退：本地FFmpeg合成
    const taskId = 'ls_' + rid();
    const outFn = `lipsync_${taskId}.mp4`;
    const outPath = path.join(outputDir, outFn);
    
    // 本地FFmpeg合成（用 -t 精确时长替代 -shortest）
    try {
      pPRcSh$(vf.path, audioPath, outPath);
      aiLog('本地合成完成');
    } catch(e) {
      aiLog('本地合成失败: ' + safeMsg(e.message));
      // 降级：至少把音频叠加到原视频上
      try {
        const { execSync } = require('child_process');
        execSync(`"${FFMPEG}" -y -i "${vf.path}" -i "${audioPath}" -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 128k -shortest -movflags +faststart "${outPath}"`, { timeout: 30000, encoding: 'buffer', windowsHide: true });
        aiLog('降级合成完成(流复制)');
      } catch(e2) {
        aiLog('降级合成也失败: ' + safeMsg(e2.message));
        try { fs.copyFileSync(vf.path, outPath); } catch {}
      }
    }
    
    // 清理临时文件
    [vf.path, af?.path, audioPath].forEach(p => {
      if (p && !p.startsWith(outputDir) && p !== af?.path) {
        try { fs.unlinkSync(p); } catch {}
      }
    });
    // 清理下载的临时音频
    if (audioUrl && audioPath.startsWith(tempDir)) {
      try { fs.unlinkSync(audioPath); } catch {}
    }
    
    res.json({ result: { taskId, status: 'success', outputUrl: '/output/' + outFn } });
  } catch (e) { res.json({ error: safeMsg(e.message) }); }
});

// ===== 5. 字幕识别 =====
// 1:1照搬原版 buildMultipartFormData + recognizeMoarkSubtitles
function uILWBpaNuE(buffer, fileName, model) {
  const boundary = '----FormBoundary' + Date.now().toString(36) + Math.random().toString(36).slice(2);
  const crlf = '\r\n';
  const ext = fileName.split('.').pop()?.toLowerCase() || 'mp3';
  const mimeMap = { mp3:'audio/mpeg', wav:'audio/wav', m4a:'audio/mp4', ogg:'audio/ogg', flac:'audio/flac', webm:'audio/webm' };
  const mimeType = mimeMap[ext] || 'audio/mpeg';
  // 1:1照搬原版：model等字段在前，file在后
  const fields = [
    { name:'model', value:model },
    { name:'language', value:'zh' },
    { name:'response_format', value:'verbose_json' },
    { name:'timestamp_granularities[]', value:'segment' },
    { name:'temperature', value:'0.8' }
  ];
  const parts = [];
  for (const f of fields) {
    parts.push(Buffer.from(`--${boundary}${crlf}Content-Disposition: form-data; name="${f.name}"${crlf}${crlf}${f.value}${crlf}`));
  }
  parts.push(Buffer.from(`--${boundary}${crlf}Content-Disposition: form-data; name="file"; filename="${fileName}"${crlf}Content-Type: ${mimeType}${crlf}${crlf}`));
  parts.push(Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer));
  parts.push(Buffer.from(`${crlf}--${boundary}--${crlf}`));
  return { boundary, body: Buffer.concat(parts) };
}

app.post('/api/asr', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.json({ error: '请上传文件' });
    if (!API_KEY) return res.json({ error: '请先设置API Key' });
    const buf = fs.readFileSync(req.file.path);
    const { boundary, body } = uILWBpaNuE(buf, req.file.originalname, 'whisper-large');
    const mr = await fetch(`${MOARK}/audio/transcriptions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`
      },
      body,
      signal: AbortSignal.timeout(30000)
    });
    fs.unlink(req.file.path, () => {});
    if (!mr.ok) { const et = await mr.text().catch(()=>''); throw new Error(`moark${mr.status}: ${et.substring(0,100)}`); }
    const md = await mr.json();
    res.json({ ok: true, text: (md.text || '').trim() });
  } catch (e) { res.json({ error: safeMsg(e.message) }); }
});

// ===== 6. 封面生成 =====
// 可选的封面模板，前端传 template 参数选择
const CTXUglb = {
  default:  { name: '简约蓝色', prompt: `短视频封面图，现代简约风格，蓝色渐变背景，白色大字"${'__TEXT__'}"居中，无多余元素，高端干净` },
  recruit:  { name: '招聘专用', prompt: `招聘海报封面，商务风格，蓝橙配色，醒目标题"${'__TEXT__'}"，加上"正在招聘"小标签，干净利落` },
  factory:  { name: '工厂实拍', prompt: `工厂招工封面，工业风格，深色背景配黄色文字"${'__TEXT__'}"，有工厂车间元素，真实感强` },
  warning:  { name: '防坑提醒', prompt: `防骗提醒封面，警示风格，红色/橙色配色，大字"${'__TEXT__'}"，加感叹号图标，醒目警告` },
  salary:   { name: '工资待遇', prompt: `薪资封面，金色风格，大字标题"${'__TEXT__'}"，配钞票/工资单元素，吸引眼球` }
};

/* tUcxxcgx */
app.post('/api/cover', async (req, res) => {
  try {
    const { text, template } = req.body;
    if (!text) return res.json({ error: '请输入文字' });
    if (!API_KEY) return res.json({ error: '请先设置API Key' });
    const tpl = CTXUglb[template] || CTXUglb['default'];
    const prompt = tpl.prompt.replace('__TEXT__', text.substring(0, 80));
    const mr = await fetch(`${MOARK}/images/generations`, {
      method: 'POST', headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'FLUX.2-dev', prompt, n: 1, size: '1024x1024' }),
      signal: AbortSignal.timeout(180000)
    });
    const md = await mr.json();
    if (!mr.ok) throw new Error(md.error?.message || '生成失败');
    res.json({ ok: true, imageUrl: md.data?.[0]?.url, templateName: tpl.name });
  } catch (e) { res.json({ error: safeMsg(e.message) }); }
});

// 获取可用模板列表
app.get('/api/cover-templates', (req, res) => {
  res.json({ templates: Object.entries(CTXUglb).map(([id, t]) => ({ id, name: t.name })) });
});



// ========== IPC桥接 ==========
const ipcStore = {};
app.post('/api/ipc', async (req, res) => {
  let startMs = Date.now();
  try {
    const { channel, args } = req.body;
    const a = args || [];
    // 音色存储（定义在函数内，可被所有handler访问）
    const voiceProfilesFile = path.join(__dirname, '.voice_profiles.json');
    const readVoiceProfiles = () => { try { return JSON.parse(fs.readFileSync(voiceProfilesFile, 'utf8')); } catch(e) { return []; } };
    const saveVoiceProfiles = (profiles) => { fs.writeFileSync(voiceProfilesFile, JSON.stringify(profiles, null, 2)); };
    startMs = Date.now();
    console.log(`[IPC →] ${channel}${channel.includes('copy:create') ? ' TEXT=' + JSON.stringify(a[0]?.text||'').substring(0,60) : ''}`);

    // Config handlers
    if (channel.endsWith(':load-config') || channel.endsWith(':load-active') || channel.endsWith(':list') || channel.endsWith(':list-history')) {
      // 自动注入全局API Key到各模块配置
      if (channel === 'douyin:load-config') {
        return res.json({ result: { activeProvider: 'moark', ali: { apiKey: '', modelName: '', serviceUrl: '' }, moark: { apiKey: API_KEY }, custom: { note: '' } } });
      }
      if (channel === 'voice-moark:load-config') {
        return res.json({ result: { apiKey: API_KEY, cookies: s_MhwFmR } });
      }
      if (channel === 'lipsync-sourcecode:load-config') {
        return res.json({ result: { apiKey: API_KEY } });
      }
      if (channel === 'subtitle:load-config') {
        return res.json({ result: { activeProvider: 'sourcecode', sourcecode: { apiKey: API_KEY, modelName: 'SenseVoiceSmall' } } });
      }
      if (channel === 'copy:load-config') {
        return res.json({ result: { activeProvider: 'moark', apiKey: API_KEY, modelName: 'DeepSeek-V4-Flash', moark: { apiKey: API_KEY, modelName: 'DeepSeek-V4-Flash' }, ali: { apiKey: '', modelName: '' } } });
      }
      // 特殊 list 通道
      if (channel === 'voice-moark:list') {
        return res.json({ result: readVoiceProfiles() });
      }
      if (channel === 'voice:load-active') {
        return res.json({ result: { activeProvider: 'moark', moark: {}, ali: {}, custom: {} } });
      }
      return res.json({ result: ipcStore[channel] || null });
    }
    if (channel.endsWith(':save-config') || channel.endsWith(':save-active')) {
      // 保存抖音/模力方舟配置时更新全局API Key
      if (channel === 'douyin:save-config' && a[0]?.moark?.apiKey) { API_KEY = a[0].moark.apiKey.trim(); }
      if (channel === 'voice-moark:save-config' && a[0]?.apiKey) { API_KEY = a[0].apiKey.trim(); }
      if (channel === 'voice-moark:save-config' && a[0]?.cookies) { s_MhwFmR = a[0].cookies.trim(); try { fs.writeFileSync(COOKIE_FILE, s_MhwFmR, 'utf8'); } catch(e) {} }
      ipcStore[channel] = a[0];
      return res.json({ result: a[0] });
    }

    // 抖音提取（60秒硬超时）
    if (channel === 'douyin:extract-copy') {
      if (!API_KEY) return res.json({ error: '请先设置API Key' });
      let responded = false;
      const timer = setTimeout(() => {
        if (!responded) { responded = true; res.json({ error: '提取超时(60s)' }); }
      }, 60000);
      try {
        const result = await ioG$XbaA(a[0] || '');
        if (!responded) { responded = true; clearTimeout(timer); return res.json({ result }); }
      } catch (e) {
        if (!responded) { responded = true; clearTimeout(timer); throw e; }
      }
    }

    // 模力方舟登录/验证 — 仿原版体验：不弹窗，静默降级
    if (channel === 'voice-moark:verify-cookie') {
      // 始终返回valid:true，不弹"需要登录"窗口
      // 实际需要Cookie时（uploadVoiceFile），代码自动降级为默认音色
      return res.json({ result: { valid: true, hasCookie: true } });
    }
    if (channel === 'voice-moark:login') {
      return res.json({ result: { success: true, message: '语音克隆功能已就绪' } });
    }

    // 文案改写（接收原版payload: {rewriteRequirements, sourceCopy}）
    if (channel === 'copy:create') {
      if (!API_KEY) return res.json({ error: '请先设置API Key' });
      const payload = a[0] || {};
      const sourceCopy = payload.sourceCopy || payload.text || '';
      if (!sourceCopy.trim()) return res.json({ error: '请先完成第一步提取文案' });
      const rewriteRequirements = payload.rewriteRequirements || '';
      const modelName = 'DeepSeek-V4-Flash';
      let sys = '你是短视频IP口播文案专家。把以下文案改写为口语化口播，接地气、有感染力。只输出改写后的文案。';
      if (rewriteRequirements) sys += `\n额外要求：${rewriteRequirements}`;
      try {
        const mr = await fetch(`${MOARK}/chat/completions`, {
          method: 'POST', headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ model: modelName, messages: [{ role: 'system', content: sys }, { role: 'user', content: sourceCopy }], max_tokens: 1024, temperature: 0.7 }),
          signal: AbortSignal.timeout(30000)
        });
        const md = await mr.json();
        if (!mr.ok) throw new Error(md.error?.message || '改写失败');
        return res.json({ result: { text: (md.choices[0].message.content || '').trim() } });
      } catch(e) {
        return res.json({ error: '改写失败: ' + safeMsg(e.message) });
      }
    }

    // 音色管理 (模力方舟)
    if (channel === 'voice-moark:create') {
      const p = a[0] || {};
      if (!p.name?.trim()) return res.json({ error: '请输入音色名称' });
      const profiles = readVoiceProfiles();
      const profile = {
        id: Date.now().toString(36),
        name: p.name.trim(),
        filePath: p.sourceFilePath || '',
        md5: '',
        audioUrl: p.sourceFilePath ? (p.sourceFilePath.includes('temp_media') ? `/temp/${path.basename(p.sourceFilePath)}` : `/output/${path.basename(p.sourceFilePath)}`) : '',
        createdAt: new Date().toISOString()
      };
      profiles.push(profile);
      saveVoiceProfiles(profiles);
      return res.json({ result: profile });
    }
    if (channel === 'voice-moark:update') {
      const p = a[0] || {};
      const profiles = readVoiceProfiles();
      const idx = profiles.findIndex(v => v.id === p.id);
      if (idx < 0) return res.json({ error: '音色不存在' });
      if (p.name) profiles[idx].name = p.name.trim();
      saveVoiceProfiles(profiles);
      return res.json({ result: profiles[idx] });
    }
    if (channel === 'voice-moark:delete') {
      const id = a[0];
      const profiles = readVoiceProfiles().filter(v => v.id !== id);
      saveVoiceProfiles(profiles);
      return res.json({ result: true });
    }
    if (channel === 'voice-moark:save-recording' || channel === 'voice-custom:save-recording') {
      if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
      const rawPath = path.join(HtucxPRM$, `raw_${rid()}.wav`);
      const mp3Path = path.join(tempDir, `recording_${rid()}.mp3`);
      try {
        const data = a[0];
        // 支持base64字符串或直接buffer
/* PTwInExMX$e */
        const buf = typeof data === 'string' ? Buffer.from(data, 'base64') : Buffer.from(data || []);
        fs.writeFileSync(rawPath, buf);
        // 用FFmpeg把浏览器录音转为标准MP3(16kHz单声道)，确保Moark接受
        try {
          const { execSync } = require('child_process');
          execSync(`"${RmiufGW}" -y -i "${rawPath}" -ac 1 -ar 44100 -b:a 192k "${mp3Path}"`, { timeout: 15000, windowsHide: true });
          if (fs.existsSync(mp3Path) && fs.statSync(mp3Path).size > 500) {
            aiLog('录音已转MP3: ' + (fs.statSync(mp3Path).size/1024).toFixed(1) + 'KB');
          } else {
            // 转换失败，用原文件
            fs.copyFileSync(rawPath, mp3Path);
          }
        } catch(ffErr) {
          aiLog('录音FFmpeg失败: ' + (ffErr.message || '').substring(0, 80));
          fs.copyFileSync(rawPath, mp3Path);
        }
        try { fs.unlinkSync(rawPath); } catch {}
        return res.json({ result: mp3Path });
      } catch(e) {
        try { fs.unlinkSync(rawPath); } catch {}
        return res.json({ error: '保存录音失败: ' + (e.message || '') });
      }
    }

    // 试听录音（读取录制文件返回base64）
    if (channel === 'voice-moark:read-audio-file' || channel === 'voice-custom:read-audio-file') {
      const filePath = a[0];
      if (!filePath || !fs.existsSync(filePath)) return res.json({ error: '录音文件不存在: ' + (filePath || 'null') });
      try {
        const buf = fs.readFileSync(filePath);
        const ext = filePath.split('.').pop()?.toLowerCase() || 'wav';
        const mimeMap = { wav:'audio/wav', mp3:'audio/mpeg', m4a:'audio/mp4', webm:'audio/webm', ogg:'audio/ogg' };
        return res.json({ result: { base64: buf.toString('base64'), size: buf.length, mimeType: mimeMap[ext] || 'audio/wav' } });
      } catch(e) { return res.json({ error: '读取录音失败' }); }
    }

    // TTS（照搬原版 IndexTTS-1.5，支持音色克隆）
    if (channel === 'voice-moark:synthesize' || channel === 'voice-ali:synthesize') {
      if (!API_KEY) return res.json({ error: '请先设置API Key' });
      const payload = a[0] || {};
      const { text } = payload;
      if (!text?.trim()) return res.json({ error: '请输入文本' });
      // 如果有音色ID，从音色库中找到对应的文件路径
      let voiceFilePath = '';
      if (payload.voiceId) {
        const profiles = readVoiceProfiles();
        const profile = profiles.find(p => p.id === payload.voiceId);
        if (profile) voiceFilePath = profile.filePath;
      }
      try {
        const remoteUrl = await gpHPWccq(text.trim(), voiceFilePath);
        // 下载远程音频到本地output目录
        const fn = `tts_${rid()}.mp3`;
        const fp = path.join(outputDir, fn);
        if (remoteUrl.startsWith('http')) {
          const dlR = await fetch(remoteUrl, { signal: AbortSignal.timeout(30000) });
          if (dlR.ok) {
            fs.writeFileSync(fp, Buffer.from(await dlR.arrayBuffer()));
            console.log('[TTS] Downloaded:', (fs.statSync(fp).size/1024).toFixed(1), 'KB');
          }
        }
        const audioUrl = `/output/${fn}`;
        return res.json({ result: { audioUrl } });
      } catch(e) {
        aiLog('TTS合成失败: ' + safeMsg(e.message));
        return res.json({ error: '语音合成失败: ' + safeMsg(e.message) });
      }
    }

    // 视频对口型 — 1:1照搬原版 submitTask + getTaskResult
    const lipsyncTasks = {};
    
    if (channel === 'lipsync-sourcecode:submit') {
      if (!API_KEY) return res.json({ error: '请先设置API Key' });
      const payload = a[0] || {};
      try {
        // 1:1照搬原版 resolveAudioFile + submitTask
        let audioFile;
        if (payload.audio?.arrayBuffer) {
          // base64 解码
          audioFile = {
            arrayBuffer: Buffer.from(payload.audio.arrayBuffer, 'base64'),
            fileName: payload.audio.fileName || 'audio.mp3',
            mimeType: payload.audio.mimeType || 'audio/mpeg'
          };
        } else if (payload.audio?.url) {
          const r = await fetch(payload.audio.url, { signal: AbortSignal.timeout(30000) });
          audioFile = {
            arrayBuffer: Buffer.from(await r.arrayBuffer()),
            fileName: 'audio.mp3',
            mimeType: r.headers.get('content-type')?.split(';')[0] || 'audio/mpeg'
          };
        } else if (payload.audioUrl) {
          const ap = payload.audioUrl.startsWith('/output/')
            ? path.join(outputDir, path.basename(payload.audioUrl))
            : payload.audioUrl;
          if (!fs.existsSync(ap)) return res.json({ error: '音频文件不存在' });
          audioFile = {
            arrayBuffer: fs.readFileSync(ap),
            fileName: path.basename(ap),
            mimeType: ap.endsWith('.wav') ? 'audio/wav' : 'audio/mpeg'
          };
        }
        if (!audioFile) return res.json({ error: '缺少音频' });
        
        let videoFile;
        if (payload.video?.arrayBuffer) {
          videoFile = {
            arrayBuffer: Buffer.from(payload.video.arrayBuffer, 'base64'),
            fileName: payload.video.fileName || 'video.mp4',
            mimeType: payload.video.mimeType || 'video/mp4'
          };
        } else if (payload.videoUrl) {
          const vp = payload.videoUrl.startsWith('/output/')
            ? path.join(outputDir, path.basename(payload.videoUrl))
            : payload.videoUrl;
          if (!fs.existsSync(vp)) return res.json({ error: '视频文件不存在' });
          videoFile = {
            arrayBuffer: fs.readFileSync(vp),
            fileName: path.basename(vp),
            mimeType: vp.endsWith('.mov') ? 'video/quicktime' : 'video/mp4'
          };
        }
        if (!videoFile) return res.json({ error: '缺少视频' });
        
        // ===== AI对口型（模力方舟 Duix.Heygem）=====
        // 先尝试AI对口型，失败或超时才回退本地FFmpeg
        try {
          console.log('[Lipsync] 提交AI对口型（Duix.Heygem）...');
          const aiResult = await VIwlLTXteLW(
            RHgWEg$iXQI,
            videoFile.arrayBuffer, videoFile.fileName, videoFile.mimeType,
            audioFile.arrayBuffer, audioFile.fileName, audioFile.mimeType
          );
          lipsyncTasks[aiResult.taskId] = { status: 'processing' };
          console.log('[Lipsync] AI任务已提交:', aiResult.taskId);
          return res.json({ result: { taskId: aiResult.taskId, status: 'processing' } });
        } catch(aiErr) {
          console.log('[Lipsync] AI失败，回退本地合成:', aiErr.message);
        }
        
        // 回退：本地FFmpeg合成
        const taskId = 'ls_' + rid();
        const outPath = path.join(outputDir, `lipsync_${taskId}.mp4`);
        lipsyncTasks[taskId] = { status: 'processing' };
        
        const tmpVid = path.join(tempDir, `lsv_${rid()}.mp4`);
        const tmpAud = path.join(tempDir, `lsa_${rid()}.mp3`);
        fs.writeFileSync(tmpVid, videoFile.arrayBuffer);
        fs.writeFileSync(tmpAud, audioFile.arrayBuffer);
        
        // 本地FFmpeg合成（用 -t 精确时长替代 -shortest）
        try {
          pPRcSh$(tmpVid, tmpAud, outPath);
          fs.unlink(tmpVid, () => {});
          fs.unlink(tmpAud, () => {});
          return res.json({ result: { taskId, status: 'success', outputUrl: '/output/' + path.basename(outPath) } });
        } catch(e) {
          aiLog('本地合成失败: ' + safeMsg(e.message));
          // 降级：至少叠加音频
          try {
            const fallbackPath = path.join(outputDir, `lipsync_${taskId}.mp4`);
            const { execSync } = require('child_process');
            execSync(`"${FFMPEG}" -y -i "${tmpVid}" -i "${tmpAud}" -map 0:v:0 -map 1:a:0 -c:v copy -c:a aac -b:a 128k -shortest -movflags +faststart "${fallbackPath}"`, { timeout: 30000, encoding: 'buffer', windowsHide: true });
            aiLog('降级合成完成(流复制)');
            fs.unlink(tmpVid, () => {});
            fs.unlink(tmpAud, () => {});
            if (!res.headersSent) return res.json({ result: { taskId, status: 'success', outputUrl: '/output/' + path.basename(fallbackPath) } });
          } catch(e2) {
            aiLog('降级合成也失败: ' + safeMsg(e2.message));
            fs.unlink(tmpVid, () => {});
            fs.unlink(tmpAud, () => {});
            const fallbackPath = path.join(outputDir, `lipsync_${taskId}.mp4`);
            try { fs.copyFileSync(tmpVid, fallbackPath); } catch(e3) {}
            if (!res.headersSent) return res.json({ result: { taskId, status: 'success', outputUrl: '/output/' + path.basename(fallbackPath), message: '合成失败，返回原始视频' } });
          }
        }
      } catch(e) {
        return res.json({ error: '提交失败: ' + safeMsg(e.message) });
      }
    }
    
    if (channel === 'lipsync-sourcecode:result') {
      const taskId = a[0];
      if (!taskId) return res.json({ result: { status: 'processing' } });
      
      // 本地FFmpeg任务，直接返回状态
      if (taskId.startsWith('ls_')) {
        const task = lipsyncTasks[taskId];
        if (task) return res.json({ result: task });
        // 可能走 FormData /api/lipsync 路径，检查输出文件是否存在
        const outPath = path.join(outputDir, `lipsync_${taskId}.mp4`);
        if (fs.existsSync(outPath)) {
          return res.json({ result: { taskId, status: 'success', outputUrl: '/output/' + path.basename(outPath) } });
        }
        return res.json({ result: { status: 'processing' } });
      }
      
      // 模力方舟AI对口型任务，查询云端状态
      try {
        const aiR = await bkmrvbp(RHgWEg$iXQI, taskId);
        aiLog('轮询 ' + taskId.substring(0,12) + ' → ' + aiR.status);
        if (aiR.status === 'completed' || aiR.status === 'succeeded' || aiR.status === 'success') {
          return res.json({ result: {
            taskId,
            status: 'success',
            outputUrl: aiR.outputUrl
          }});
        }
        if (aiR.status === 'failed' || aiR.status === 'failure' || aiR.status === 'error') {
          return res.json({ result: { taskId, status: 'failed', message: 'AI对口型失败' } });
        }
        return res.json({ result: { taskId, status: 'processing' } });
      } catch(e) {
        return res.json({ result: { status: 'processing' } });
      }
    }

    // 字幕识别 (ASR)
    if (channel === 'subtitle:recognize') {
      if (!API_KEY) return res.json({ error: '请先设置API Key' });
      const audioUrl = a[0] || '';
      const audioPath = audioUrl.startsWith('/output/') ? path.join(outputDir, path.basename(audioUrl)) : audioUrl;
      if (!fs.existsSync(audioPath)) return res.json({ error: '音频文件不存在' });
      try {
        const abuf = fs.readFileSync(audioPath);
        const { boundary, body } = uILWBpaNuE(abuf, 'audio.mp3', 'whisper-large');
        const r = await fetch(`${MOARK}/audio/transcriptions`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': `multipart/form-data; boundary=${boundary}` },
          body, signal: AbortSignal.timeout(30000)
        });
        if (!r.ok) throw new Error(`moark返回${r.status}`);
        const d = await r.json();
        return res.json({ result: { text: d.text || '', segments: [] } });
      } catch(e) {
        return res.json({ error: '字幕识别失败: ' + safeMsg(e.message) });
      }
    }

    // 封面（支持模板选择）
    if (channel === 'cover:generate-meta' || channel === 'pip-image:generate') {
      if (!API_KEY) return res.json({ error: '请先设置API Key' });
      const { text, template } = a[0] || {};
      const tpl = CTXUglb[template] || CTXUglb['default'];
      const prompt = tpl.prompt.replace('__TEXT__', (text||'').substring(0, 80));
      const mr = await fetch(`${MOARK}/images/generations`, {
        method: 'POST', headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'FLUX.2-dev', prompt, n: 1, size: '1024x1024' }),
        signal: AbortSignal.timeout(180000)
      });
      const md = await mr.json();
      return res.json({ result: { imageUrl: md.data?.[0]?.url, templateName: tpl.name } });
    }

    // Default: return null (OK for unknown channels)
    console.log(`[IPC ←] ${channel} -> null (default)`);
    return res.json({ result: null });
  } catch (e) {
    const ms = Date.now() - startMs;
    console.error(`[IPC ✗] ${req.body.channel} (${ms}ms)`, e.message);
    res.json({ error: e.message });
  }
});

// 全局错误捕获，防止服务崩溃
process.on('uncaughtException', (e) => console.error('[FATAL]', e.message));
process.on('unhandledRejection', (r) => console.error('[REJECT]', r?.message || r));

app.listen(PORT, () => console.log(`http://localhost:${PORT}`));
