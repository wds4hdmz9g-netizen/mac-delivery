// api-bridge.js — 将Electron IPC转换为HTTP调用
// 原版Vue应用通过 window.desktopApi 调用，这里全部转发到后端Express

(function() {
  const BASE = '';
  let uploadId = 0;
  const uploadQueue = new Map();

  // 快速 ArrayBuffer → Base64（O(n)，用浏览器原生 Blob+FileReader，避免逐字节拼接的 O(n²) 灾难）
  function arrayBufferToBase64(buffer) {
    return new Promise((resolve, reject) => {
      const blob = new Blob([buffer]);
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result;
        resolve(dataUrl.split(',')[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  // 通用HTTP调用
  async function http(channel, args = [], method = 'POST') {
    // 文件上传特殊处理
    if (channel === 'video-render:export-all' || channel === 'wavespeed:upload-media') {
      return httpUpload(channel, args);
    }
    // 录音保存特殊处理 (ArrayBuffer → base64，用快速异步方法)
    if (channel === 'voice-moark:save-recording' || channel === 'voice-custom:save-recording') {
      const [arrayBuffer, mimeType] = args;
      const base64 = await arrayBufferToBase64(arrayBuffer);
      const body = { channel, args: [base64, mimeType || 'audio/wav'] };
      const r = await fetch(BASE + '/api/ipc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await r.json();
      if (data.error) throw new Error(data.error);
      return data.result;
    }
    // 试听录音 (base64 → ArrayBuffer，还原为二进制播放)
    if (channel === 'voice-moark:read-audio-file' || channel === 'voice-custom:read-audio-file') {
      const body = { channel, args: Array.isArray(args) ? args : [args] };
      const r = await fetch(BASE + '/api/ipc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await r.json();
      if (data.error) throw new Error(data.error);
      const result = data.result || {};
      // base64 → ArrayBuffer (浏览器原生atob比逐字节拼接快百倍)
      const binaryStr = atob(result.base64 || '');
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
      return { arrayBuffer: bytes.buffer, mimeType: result.mimeType || 'audio/wav' };
    }
    // 视频对口型 — FormData直传，不经过base64（base64对大视频是性能灾难）
    if (channel === 'lipsync-sourcecode:submit') {
      const [payload] = args;
      const fd = new FormData();
      
      // 视频：直接 Blob 附加到 FormData
      if (payload.video?.arrayBuffer) {
        fd.append('video', new Blob([payload.video.arrayBuffer], { type: payload.video.mimeType || 'video/mp4' }), payload.video.fileName || 'video.mp4');
      }
      // 音频：Blob 或者 URL
      if (payload.audio) {
        if (payload.audio.arrayBuffer instanceof ArrayBuffer) {
          fd.append('audio', new Blob([payload.audio.arrayBuffer], { type: payload.audio.mimeType || 'audio/mpeg' }), payload.audio.fileName || 'audio.mp3');
        } else if (payload.audio.url) {
          fd.append('audioUrl', payload.audio.url);
        }
      }
      if (payload.audioUrl) fd.append('audioUrl', payload.audioUrl);
      
      const r = await fetch(BASE + '/api/lipsync', {
        method: 'POST',
        body: fd
      });
      const data = await r.json();
      if (data.error) throw new Error(data.error);
      return data.result;
    }

    const body = { channel, args: Array.isArray(args) ? args : [args] };
    try {
      const r = await fetch(BASE + '/api/ipc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const data = await r.json();
      if (data.error) throw new Error(data.error);
      return data.result;
    } catch (e) {
      if (channel.includes('load-config') || channel.includes('load-active') || channel.includes('list')) {
        return null; // 配置加载失败返回null
      }
      throw e;
    }
  }

  async function httpUpload(channel, args) {
    const fd = new FormData();
    fd.append('channel', channel);
    if (args && args.length > 0) {
      const first = args[0];
      if (first instanceof File || first instanceof Blob) {
        fd.append('file0', first);
      } else if (first && typeof first === 'object') {
        fd.append('payload', JSON.stringify(first));
      }
    }
    if (args && args.length > 1) {
      fd.append('payload', JSON.stringify(args));
    }
    try {
      const r = await fetch(BASE + '/api/ipc-upload', { method: 'POST', body: fd });
      const data = await r.json();
      if (data.error) throw new Error(data.error);
      return data.result;
    } catch (e) { throw e; }
  }

  // 完全1:1映射所有desktopApi方法
  window.desktopApi = {
    getAppVersion: () => Promise.resolve('2.0.0'),
    requestMicrophoneAccess: () => Promise.resolve(true),

    // 抖音提取
    loadDouyinExtractionConfig: () => http('douyin:load-config', [], 'GET'),
    saveDouyinExtractionConfig: (config) => http('douyin:save-config', [config]),
    extractDouyinCopy: (url) => http('douyin:extract-copy', [url]),
    cancelDouyinExtraction: () => http('douyin:cancel-extraction'),

    // 文案改写
    loadCopyCreationConfig: () => http('copy:load-config', [], 'GET'),
    saveCopyCreationConfig: (config) => http('copy:save-config', [config]),
    createRewriteCopy: (payload) => http('copy:create', [payload]),
    cancelCopyCreation: () => http('copy:cancel'),

    // 封面
    generateCoverMeta: (params) => http('cover:generate-meta', [params]),

    // 语音克隆 - active
    loadVoiceCloneActive: () => http('voice:load-active', [], 'GET'),
    saveVoiceCloneActive: (store) => http('voice:save-active', [store]),

    // 语音克隆 - 阿里云
    loadVoiceCloneAliConfig: () => http('voice-ali:load-config', [], 'GET'),
    saveVoiceCloneAliConfig: (config) => http('voice-ali:save-config', [config]),
    listAliVoices: () => http('voice-ali:list', [], 'GET'),
    createAliVoice: (payload) => http('voice-ali:create', [payload]),
    trimAliVoiceAudio: (payload) => http('voice-ali:trim-audio', [payload]),
    synthesizeAliVoice: (payload) => http('voice-ali:synthesize', [payload]),
    adjustAliVoiceSpeed: (payload) => http('voice-ali:adjust-speed', [payload]),
    cancelAliVoiceSynthesis: () => http('voice-ali:cancel-synthesis'),
    updateAliVoice: (payload) => http('voice-ali:update', [payload]),
    deleteAliVoice: (id) => http('voice-ali:delete', [id]),

    // 语音克隆 - 自建模型
    loadVoiceCloneCustomConfig: () => http('voice-custom:load-config', [], 'GET'),
    saveVoiceCloneCustomConfig: (config) => http('voice-custom:save-config', [config]),
    listCustomVoices: () => http('voice-custom:list', [], 'GET'),
    readCustomAudioFile: (filePath) => http('voice-custom:read-audio-file', [filePath]),
    saveCustomRecording: (arrayBuffer, mimeType) => http('voice-custom:save-recording', [arrayBuffer, mimeType]),
    createCustomVoice: (payload) => http('voice-custom:create', [payload]),
    updateCustomVoice: (payload) => http('voice-custom:update', [payload]),
    deleteCustomVoice: (id) => http('voice-custom:delete', [id]),
    synthesizeCustomVoice: (payload) => http('voice-custom:synthesize', [payload]),

    // 语音克隆 - 模力方舟
    loadVoiceCloneMoarkConfig: () => http('voice-moark:load-config', [], 'GET'),
    saveVoiceCloneMoarkConfig: (config) => http('voice-moark:save-config', [config]),
    moarkLogin: () => http('voice-moark:login'),
    moarkVerifyCookie: () => http('voice-moark:verify-cookie'),
    listMoarkVoices: () => http('voice-moark:list', [], 'GET'),
    createMoarkVoice: (payload) => http('voice-moark:create', [payload]),
    updateMoarkVoice: (payload) => http('voice-moark:update', [payload]),
    deleteMoarkVoice: (id) => http('voice-moark:delete', [id]),
    saveMoarkRecording: (arrayBuffer, mimeType) => http('voice-moark:save-recording', [arrayBuffer, mimeType]),
    synthesizeMoarkVoice: (payload) => http('voice-moark:synthesize', [payload]),
    cancelMoarkVoiceSynthesis: () => http('voice-moark:cancel-synthesis'),

    // WaveSpeed
    loadWaveSpeedConfig: () => http('wavespeed:load-config', [], 'GET'),
    saveWaveSpeedConfig: (config) => http('wavespeed:save-config', [config]),
    uploadWaveSpeedMedia: (payload) => http('wavespeed:upload-media', [payload]),
    calculateWaveSpeedPrice: (audioUrl, videoUrl, modelName) => http('wavespeed:calculate-price', [audioUrl, videoUrl, modelName]),
    submitWaveSpeedTask: (audioUrl, videoUrl, modelName) => http('wavespeed:submit', [audioUrl, videoUrl, modelName]),
    getWaveSpeedTaskResult: (requestId) => http('wavespeed:result', [requestId]),

    // 视频对口型 - active
    loadLipSyncActive: () => http('lipsync:load-active', [], 'GET'),
    saveLipSyncActive: (store) => http('lipsync:save-active', [store]),

    // 视频对口型 - 源代码平台(模力方舟)
    loadLipSyncSourceCodeConfig: () => http('lipsync-sourcecode:load-config', [], 'GET'),
    saveLipSyncSourceCodeConfig: (config) => http('lipsync-sourcecode:save-config', [config]),
    submitLipSyncSourceCodeTask: (payload) => http('lipsync-sourcecode:submit', [payload]),
    getLipSyncSourceCodeResult: (taskId) => http('lipsync-sourcecode:result', [taskId]),

    // 字幕识别
    loadSubtitleRecognitionConfig: () => http('subtitle:load-config', [], 'GET'),
    saveSubtitleRecognitionConfig: (config) => http('subtitle:save-config', [config]),
    recognizeSubtitles: (audioUrl, provider, modelName) => http('subtitle:recognize', [audioUrl, provider, modelName]),
    cancelSubtitleRecognition: () => http('subtitle:cancel'),

    // 画中画
    listPipHistory: () => http('pip-history:list', [], 'GET'),
    savePipHistory: (payload) => http('pip-history:save', [payload]),
    deletePipHistory: (id) => http('pip-history:delete', [id]),
    generatePipImage: (payload) => http('pip-image:generate', [payload]),
    loadPipModelConfig: () => http('pip-model:load', [], 'GET'),
    savePipModelConfig: (config) => http('pip-model:save', [config]),

    // 封面保存
    saveImageFile: (dataUrl, defaultName) => http('dialog:save-image', [dataUrl, defaultName]),

    // 视频渲染导出
    exportAll: (options) => http('video-render:export-all', [options]),
    selectAudioFile: () => http('dialog:select-audio-file', [], 'GET'),
    uploadAudioFile: (filePath) => http('dialog:upload-audio-file', [filePath]),
    selectVideoFile: () => http('dialog:select-video-file', [], 'GET'),
    selectVideoRenderOutput: () => http('video-render:select-output', [], 'GET'),
    renderVideo: (payload) => http('video-render:render', [payload]),
    captureVideoFrame: (videoUrl, timePercent) => http('video-render:capture-frame', [videoUrl, timePercent]),
    onVideoRenderProgress: (callback) => {
      const ws = new WebSocket('ws://' + location.host + '/ws/render-progress');
      ws.onmessage = (e) => { try { callback(JSON.parse(e.data)); } catch {} };
      return () => ws.close();
    },
    showVideoInFolder: (filePath) => http('video-render:show-in-folder', [filePath]),
  };

  console.log('[api-bridge] Desktop API bridge loaded. ' + Object.keys(window.desktopApi).length + ' methods');
})();
