/**
 * EdgeTTS - 微软Edge免费TTS
 * v3.2 修复：移除不稳定的音色 + 自动fallback
 */
const BaseTTS = require('./base');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// 已验证可用的音色列表（2026-05-24 实测）
const VOICE_CATALOG = [
  { id: 'zh-CN-YunjianNeural', name: '云健（男·稳重）', lang: 'zh-CN', gender: 'male', style: '稳重' },
  { id: 'zh-CN-YunyangNeural', name: '云扬（男·新闻）', lang: 'zh-CN', gender: 'male', style: '新闻' },
  { id: 'zh-CN-XiaoxiaoNeural', name: '晓晓（女·温柔）', lang: 'zh-CN', gender: 'female', style: '温柔' },
  { id: 'zh-CN-XiaoyiNeural', name: '晓伊（女·亲切）', lang: 'zh-CN', gender: 'female', style: '亲切' },
  { id: 'zh-CN-YunxiaNeural', name: '云夏（女·活泼）', lang: 'zh-CN', gender: 'female', style: '活泼' },
  { id: 'zh-HK-HiuMaanNeural', name: '曉曼（女·粤语）', lang: 'zh-HK', gender: 'female', style: '粤语' },
  { id: 'zh-HK-WanLungNeural', name: '雲龍（男·粤语）', lang: 'zh-HK', gender: 'male', style: '粤语' },
  { id: 'en-US-JennyNeural', name: 'Jenny（女·美式）', lang: 'en-US', gender: 'female', style: '美式' },
  { id: 'en-US-GuyNeural', name: 'Guy（男·美式）', lang: 'en-US', gender: 'male', style: '美式' },
  { id: 'en-US-AriaNeural', name: 'Aria（女·美式）', lang: 'en-US', gender: 'female', style: '美式' },
  { id: 'en-GB-SoniaNeural', name: 'Sonia（女·英式）', lang: 'en-GB', gender: 'female', style: '英式' },
  { id: 'en-GB-RyanNeural', name: 'Ryan（男·英式）', lang: 'en-GB', gender: 'male', style: '英式' },
];

// 自动fallback序列（按稳定性排序）
const FALLBACK_VOICES = [
  'zh-CN-YunjianNeural',
  'zh-CN-YunyangNeural',
  'zh-CN-XiaoxiaoNeural',
  'zh-CN-XiaoyiNeural',
  'zh-CN-YunxiaNeural',
];

class EdgeTTS extends BaseTTS {
  constructor(config) {
    super(config);
    this.name = 'edgetts';
    this.voice = config.voice || 'zh-CN-YunjianNeural';
    this.rate = config.rate || '+10%';
    this.pitch = config.pitch || '+0Hz';
    this.bridgeScript = path.join(__dirname, 'edge_tts_bridge.py');
  }

  getVoices() { return VOICE_CATALOG; }
  getVoicesByLang(lang) { return VOICE_CATALOG.filter(v => v.lang === lang); }

  async synthesize(text, options = {}) {
    const voice = options.voice || this.voice;
    const rate = options.rate || this.rate;
    const pitch = options.pitch || this.pitch;

    const outputDir = path.join(process.cwd(), 'output', 'audio');
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const timestamp = Date.now();
    const outputFile = path.join(outputDir, `tts_${timestamp}.mp3`);

    const pythonBin = 'C:\\Users\\dell\\.workbuddy\\binaries\\python\\versions\\3.13.12\\python.exe';

    // 构建 fallback 序列：首选音色 + 备用音色
    const voiceSequence = [voice];
    for (const fv of FALLBACK_VOICES) {
      if (fv !== voice) voiceSequence.push(fv);
    }

    const maxRetries = Math.min(voiceSequence.length, 4);
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      const tryVoice = voiceSequence[attempt];

      if (attempt > 0) {
        console.log(`[EdgeTTS] 音色 ${voice} 失败，fallback到 ${tryVoice}`);
      }

      const inputFile = path.join(outputDir, `tts_input_${timestamp}_${attempt}.json`);
      const inputPayload = { voice: tryVoice, rate, pitch, text, output: outputFile };
      fs.writeFileSync(inputFile, JSON.stringify(inputPayload), 'utf-8');

      try {
        const result = await this._runBridge(pythonBin, this.bridgeScript, inputFile, outputFile);
        try { fs.unlinkSync(inputFile); } catch {}
        return { ...result, voiceUsed: tryVoice };
      } catch (err) {
        try { fs.unlinkSync(inputFile); } catch {}
        console.warn(`[EdgeTTS] ${tryVoice} 失败:`, err.message);
        if (attempt === maxRetries - 1) throw err;
      }
    }
  }

  _runBridge(pythonBin, scriptPath, inputFile, outputFile) {
    return new Promise((resolve, reject) => {
      console.log(`[EdgeTTS] 启动桥接脚本`);
      const child = spawn(pythonBin, [scriptPath, inputFile], {
        timeout: 120000,
        windowsHide: true,
      });

      let stdout = '';
      let stderr = '';

      child.stdout.on('data', (d) => { stdout += d.toString(); });
      child.stderr.on('data', (d) => { stderr += d.toString(); });

      child.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`EdgeTTS桥接失败(退出码${code}): ${stderr || stdout}`));
          return;
        }

        try {
          const result = JSON.parse(stdout.trim());
          if (!result.ok) {
            reject(new Error(`EdgeTTS合成失败: ${result.error}`));
            return;
          }
          if (!fs.existsSync(outputFile)) {
            reject(new Error('EdgeTTS合成完成但未生成文件'));
            return;
          }
          resolve({
            audioPath: outputFile,
            duration: this._estimateDuration(
              fs.existsSync(inputFile) ? JSON.parse(fs.readFileSync(inputFile, 'utf-8')).text : ''
            ),
            format: 'mp3',
            size: result.size || fs.statSync(outputFile).size,
          });
        } catch (e) {
          reject(new Error(`EdgeTTS解析输出失败: ${e.message}`));
        }
      });

      child.on('error', (err) => {
        reject(new Error(`EdgeTTS进程启动失败: ${err.message}`));
      });
    });
  }

  async healthCheck() {
    const pythonBin = 'C:\\Users\\dell\\.workbuddy\\binaries\\python\\versions\\3.13.12\\python.exe';
    return new Promise((resolve) => {
      const child = spawn(pythonBin, ['-c', 'import edge_tts; print("ok")'], { timeout: 5000 });
      child.on('close', (code) => {
        resolve({ ok: code === 0, provider: 'edgetts', voices: VOICE_CATALOG });
      });
      child.on('error', () => {
        resolve({ ok: false, provider: 'edgetts', error: 'edge-tts/Python未安装' });
      });
    });
  }

  _estimateDuration(text) {
    const charCount = text.replace(/\s/g, '').length;
    return Math.ceil(charCount / 3);
  }
}

module.exports = EdgeTTS;
