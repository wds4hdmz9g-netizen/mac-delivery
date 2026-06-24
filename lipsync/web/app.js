const $=id=>document.getElementById(id);
const S={key:'',style:'koushui',ttsAudio:null,lvFile:null,savedVoices:{},recording:false,recorder:null,recStart:0};

document.addEventListener('DOMContentLoaded',()=>{
  S.key=localStorage.getItem('aik')||'';
  if(S.key){$('settingsApiKey').value=S.key;setKey(S.key)}
  else setTimeout(()=>$('settingsModal').removeAttribute('hidden'),500);
  updateBadge();
  $('btnCloseSettings').onclick=()=>$('settingsModal').setAttribute('hidden','');
  $('btnSaveSettings').onclick=()=>{
    const k=$('settingsApiKey').value.trim();if(!k)return;
    S.key=k;localStorage.setItem('aik',k);setKey(k);updateBadge();
    $('settingsModal').setAttribute('hidden','');toast('✅ 已保存');
  };
  $('rewriteStyle').onchange=()=>S.style=$('rewriteStyle').value;
  loadVoices();
});

function openSettings(){$('settingsModal').removeAttribute('hidden');$('settingsApiKey').value=S.key}
function updateBadge(){$('keyStatus').textContent=S.key?'🔑 已连接':'🔑 未设置'}
async function setKey(k){try{await fetch('/api/config',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({apiKey:k})})}catch(e){}}
async function call(url,opts={}){const r=await fetch(url,opts);const d=await r.json();if(d.error)throw new Error(d.error);return d}
function toast(m){const t=$('toast');t.textContent=m;t.removeAttribute('hidden');setTimeout(()=>t.setAttribute('hidden',''),2500)}
function showResult(t,html){$('resultTitle').textContent=t;$('resultBody').innerHTML=html;$('resultModal').removeAttribute('hidden')}
function dl(url,n){const a=document.createElement('a');a.href=url;a.download=n;a.click()}
function clearAll(){['linkUrl','rewriteInput','rewriteOutput','ttsText','lipsyncText','subResult','coverText'].forEach(id=>{const e=$(id);if(e)e.value=''});S.lvFile=null;S.ttsAudio=null;['rewriteOutput','rewriteActions','ttsAudio','subResult','coverPreview','vidPreview','extractHint'].forEach(id=>{const e=$(id);if(e)e.style.display='none'});try{$('vidPreview').src=''}catch(e){}}

// ===== 1. 提取 =====
async function extractLink(){
  const r=$('linkUrl').value.trim();if(!r||!S.key)return;
  const b=$('btnLink'),h=$('extractHint');b.disabled=true;b.textContent='提取中...';h.style.display='block';h.textContent='⏳ 提取中...';h.style.color='var(--accent)';
  try{const d=await call('/api/extract',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({url:r})});
    $('rewriteInput').value=d.text;h.textContent='✅ 提取成功';h.style.color='var(--green)';
  }catch(e){h.textContent='❌ '+e.message;h.style.color='var(--red)'}
  b.disabled=false;b.textContent='📥 提取文案';
}

// ===== 2. 改写 =====
async function doRewrite(){
  const t=$('rewriteInput').value.trim();if(!t||!S.key)return;
  const b=$('btnRewrite');b.disabled=true;b.textContent='改写中...';
  try{const d=await call('/api/rewrite',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:t,style:S.style})});
    $('rewriteOutput').style.display='block';$('rewriteOutput').value=d.text;
    $('rewriteActions').style.display='flex';$('ttsText').value=d.text;$('lipsyncText').value=d.text;
    toast('✅ 改写完成');
  }catch(e){toast('❌ '+e.message)}
  b.disabled=false;b.textContent='✨ 开始改写';
}

// ===== 3. TTS =====
function sendToTTS(){const t=$('rewriteOutput').value||$('rewriteInput').value;if(t)$('ttsText').value=t}
async function doTTS(){
  const t=$('ttsText').value.trim();if(!t||!S.key)return;
  const b=$('btnTTS');b.disabled=true;b.textContent='合成中...';
  try{const d=await call('/api/tts',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:t})});
    S.ttsAudio=d.audioPath;$('ttsAudio').style.display='block';$('ttsAudio').querySelector('audio').src=d.audioPath;toast('✅ 完成');
  }catch(e){toast('❌ '+e.message)}
  b.disabled=false;b.textContent='🔊 生成语音';
}

function sendToLipsync(){if(S.ttsAudio)toast('已准备好，上传视频后即可对口型');const t=$('rewriteOutput').value||$('ttsText').value;if(t)$('lipsyncText').value=t}

// ===== 录音/声音管理 =====
async function toggleRecord(){
  if(S.recording){stopRecord();return}
  try{const s=await navigator.mediaDevices.getUserMedia({audio:true});S.recorder=new MediaRecorder(s);const c=[];
    S.recorder.ondataavailable=e=>c.push(e.data);S.recorder.onstop=async()=>{s.getTracks().forEach(t=>t.stop());
      const b=new Blob(c,{type:'audio/webm'});const n=$('voiceName').value.trim()||'录制';
      S.savedVoices[n]={name:n,blob:b,time:new Date().toLocaleString()};saveVoices();renderVoices();toast('✅ 已保存: '+n)};
    S.recorder.start();S.recording=true;S.recStart=Date.now();
    $('btnRec').textContent='⏹ 停止';$('recBar').style.display='flex';
    S.recTimer=setInterval(()=>{$('recTime').textContent=Math.floor((Date.now()-S.recStart)/1000)},500);
    setTimeout(()=>{if(S.recording)stopRecord()},30000);
  }catch(e){toast('❌ 无法访问麦克风')}
}
function stopRecord(){if(!S.recording)return;clearInterval(S.recTimer);S.recorder.stop();S.recording=false;$('recBar').style.display='none'}
function handleVoiceFile(i){const f=i.files[0];if(!f)return;const n=$('voiceName').value.trim()||f.name.replace(/\.[^.]+$/,'');S.savedVoices[n]={name:n,blob:f,time:new Date().toLocaleString()};saveVoices();renderVoices();toast('✅ 已保存: '+n)}
function saveVoices(){const o={};Object.entries(S.savedVoices).forEach(([k,v])=>{o[k]={name:v.name,time:v.time}});localStorage.setItem('aiv',JSON.stringify(o))}
function loadVoices(){try{const o=JSON.parse(localStorage.getItem('aiv')||'{}');Object.entries(o).forEach(([k,v])=>{S.savedVoices[k]={name:v.name,time:v.time,blob:null}});renderVoices()}catch(e){}}
function renderVoices(){let h='';Object.entries(S.savedVoices).forEach(([k,v])=>{h+=`<span class="voice-tag" onclick="toast('已选择: ${v.name}')">🎤 ${v.name}</span>`});$('voiceList').innerHTML=h}

// ===== 4. 对口型 =====
function handleVideoFile(i){const f=i.files[0];if(!f)return;S.lvFile=f;const p=$('vidPreview');p.src=URL.createObjectURL(f);p.style.display='block'}
async function doLipsync(){
  if(!S.lvFile||!S.key)return;
  let t=$('lipsyncText').value.trim();if(!t)t=$('rewriteOutput').value.trim()||$('ttsText').value.trim();if(!t)return toast('请先改写文案');
  const b=$('btnLipsync');b.disabled=true;b.textContent='处理中...';
  try{const fd=new FormData();fd.append('video',S.lvFile);fd.append('text',t);
    const d=await call('/api/lipsync',{method:'POST',body:fd});
    showResult('✅ 完成',`<video src="${d.videoPath}" controls style="width:100%;border-radius:6px;max-height:400px"></video><div style="margin-top:8px"><button class="btn primary" onclick="dl('${d.videoPath}','video.mp4')">💾 下载视频</button></div>`);
  }catch(e){toast('❌ '+e.message)}
  b.disabled=false;b.textContent='👄 开始对口型';
}

// ===== 5. 字幕 =====
function handleSubFile(i){if(i.files[0])toast('✅ 已选择文件')}
async function doSubtitle(){
  const f=$('subFile').files[0];if(!f||!S.key)return;
  const b=$('btnSub');b.disabled=true;b.textContent='识别中...';
  try{const fd=new FormData();fd.append('file',f);const d=await call('/api/asr',{method:'POST',body:fd});
    $('subResult').style.display='block';$('subResult').value=d.text;toast('✅ 完成');
  }catch(e){toast('❌ '+e.message)}
  b.disabled=false;b.textContent='💬 识别字幕';
}

// ===== 6. 封面 =====
async function doCover(){
  const t=$('coverText').value.trim()||$('rewriteOutput').value.trim()||$('rewriteInput').value.trim();if(!t||!S.key)return;
  const b=$('btnCover');b.disabled=true;b.textContent='生成中...';
  try{const d=await call('/api/cover',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:t,template:$('coverTpl').value})});
    if(d.imageUrl){$('coverPreview').style.display='block';$('coverPreview').querySelector('img').src=d.imageUrl;toast('✅ 完成')}
  }catch(e){toast('❌ '+e.message)}
  b.disabled=false;b.textContent='🖼️ 生成封面';
}
