/**
 * 字幕系统
 * 从文本 + TTS 时长生成 SRT，支持多种样式，FFmpeg 烧录到视频
 */
const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

// 字幕样式预设
const SUBTITLE_STYLES = [
  {
    id: 'white', name: '白字黑边',
    fontColor: 'white', borderColor: 'black', borderW: 2,
    fontName: 'Microsoft YaHei', fontSize: 36,
    alignment: 2 // bottom center
  },
  {
    id: 'yellow', name: '黄字黑边',
    fontColor: 'yellow', borderColor: 'black', borderW: 2,
    fontName: 'Microsoft YaHei', fontSize: 36,
    alignment: 2
  },
  {
    id: 'neon', name: '霓虹绿',
    fontColor: '#00FF00', borderColor: '#003300', borderW: 3,
    fontName: 'Microsoft YaHei', fontSize: 38,
    alignment: 2
  },
  {
    id: 'clean', name: '简约白字透明底',
    fontColor: 'white', borderColor: '#00000066', borderW: 4,
    fontName: 'Microsoft YaHei', fontSize: 34,
    alignment: 2
  },
  {
    id: 'bold_yellow', name: '大号黄字',
    fontColor: 'yellow', borderColor: 'black', borderW: 3,
    fontName: 'SimHei', fontSize: 42,
    alignment: 2
  },
];

class SubtitleEngine {
  constructor() {
    this.styles = SUBTITLE_STYLES;
  }

  /** 获取可用字幕样式 */
  getStyles() {
    return this.styles;
  }

  /**
   * 生成 ASS 字幕（样式内嵌，兼容 Windows FFmpeg）
   * ASS 格式把字体/颜色/描边直接写在文件头部，命令行只传 ass=path.ass
   * 彻底避开 force_style 的逗号逃逸问题
   */
  generateASS(text, duration, styleId = 'white', resolution = { width: 720, height: 1280 }) {
    const style = this.styles.find(s => s.id === styleId) || this.styles[0];
    const sentences = this._splitSentences(text);
    if (sentences.length === 0) return { ass: '', segments: [] };

    // v4.0.8: 改进时间分配——按字数加权 + 标点停顿
    const charsPerSec = 3.5; // 中文TTS平均语速
    const pauseAfterComma = 0.25;  // 逗号后停顿
    const pauseAfterPeriod = 0.5;  // 句号后停顿

    let segments = [];
    let currentTime = 0;

    for (const sent of sentences) {
      const charCount = sent.replace(/\s/g, '').length;
      let segDuration = (charCount / charsPerSec);
      const lastChar = sent.slice(-1);
      if (/[。！？.!?]/.test(lastChar)) segDuration += pauseAfterPeriod;
      else if (/[，,、；;：:]/.test(lastChar)) segDuration += pauseAfterComma;
      segDuration = Math.max(segDuration, 0.8);
      segments.push({ text: sent, start: currentTime, end: currentTime + segDuration });
      currentTime += segDuration;
    }

    // 缩放匹配实际音频时长
    if (currentTime > 0 && Math.abs(currentTime - duration) > 2) {
      const scale = duration / currentTime;
      let t = 0;
      segments = segments.map(seg => {
        const d = (seg.end - seg.start) * scale;
        const r = { text: seg.text, start: t, end: t + d };
        t += d;
        return r;
      });
    }

    // ASS 颜色格式: &HAABBGGRR (Alpha + BGR)
    const toASSColor = (c) => {
      const hex = this._colorToHex(c);
      return `&H00${hex}`;
    };

    // ASS 时间格式: H:MM:SS.cc (百分秒)
    const fmtTime = (sec) => {
      const h = Math.floor(sec / 3600);
      const m = Math.floor((sec % 3600) / 60);
      const s = Math.floor(sec % 60);
      const cs = Math.floor((sec % 1) * 100);
      return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${String(cs).padStart(2,'0')}`;
    };

    // 构建 ASS 文件
    let ass = '[Script Info]\n';
    ass += 'Title: Content Factory\n';
    ass += 'ScriptType: v4.00+\n';
    ass += `PlayResX: ${resolution.width}\n`;
    ass += `PlayResY: ${resolution.height}\n`;
    ass += 'WrapStyle: 2\n';
    ass += 'ScaledBorderAndShadow: yes\n';
    ass += '\n';
    ass += '[V4+ Styles]\n';
    ass += 'Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\n';
    ass += `Style: Default,${style.fontName},${style.fontSize},${toASSColor(style.fontColor)},&H00000000,${toASSColor(style.borderColor)},&H00000000,0,0,0,0,100,100,0,0,1,${style.borderW},0,${style.alignment},20,20,60,1\n`;
    ass += '\n';
    ass += '[Events]\n';
    ass += 'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n';

    for (const seg of segments) {
      ass += `Dialogue: 0,${fmtTime(seg.start)},${fmtTime(seg.end)},Default,,0,0,0,,${seg.text}\n`;
    }

    return { ass, segments };
  }

  /**
   * 生成 SRT 内容
   * @param {string} text - 完整文案
   * @param {number} duration - 总时长（秒）
   * @param {number} charsPerSec - 每秒字数（中文约3-4）
   */
  generateSRT(text, duration, charsPerSec = 3.5) {
    // 按标点断句
    const sentences = this._splitSentences(text);
    if (sentences.length === 0) return { srt: '', segments: [] };

    // 计算每句时长
    const totalChars = sentences.reduce((sum, s) => sum + s.length, 0);
    const segments = [];
    let currentTime = 0;

    for (const sent of sentences) {
      const segDuration = Math.max((sent.length / totalChars) * duration, 1.0);
      segments.push({
        text: sent,
        start: currentTime,
        end: currentTime + segDuration
      });
      currentTime += segDuration;
    }

    // 生成 SRT 格式
    let srt = '';
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      srt += `${i + 1}\n`;
      srt += `${this._formatTime(seg.start)} --> ${this._formatTime(seg.end)}\n`;
      srt += `${seg.text}\n\n`;
    }

    return { srt, segments };
  }

  /**
   * 用 FFmpeg 把字幕烧进视频
   * @param {string} videoPath - 输入视频路径
   * @param {string} srtContent - SRT 内容
   * @param {string} outputPath - 输出视频路径
   * @param {string} styleId - 字幕样式 ID
   */
  burnSubtitles(videoPath, srtContent, outputPath, styleId = 'white') {
    const style = this.styles.find(s => s.id === styleId) || this.styles[0];

    // 先把 SRT 写入临时文件
    const srtPath = outputPath.replace(/\.mp4$/, '.srt');
    fs.writeFileSync(srtPath, srtContent, 'utf-8');

    const ffmpeg = this._findFFmpeg();
    const srtEscaped = srtPath.replace(/\\/g, '/').replace(/:/g, '\\:');

    const cmd = [
      `"${ffmpeg}"`,
      `-i "${videoPath.replace(/\\/g, '/')}"`,
      `-vf "subtitles='${srtEscaped}':force_style='FontName=${style.fontName},FontSize=${style.fontSize},PrimaryColour=&H${this._colorToHex(style.fontColor)},OutlineColour=&H${this._colorToHex(style.borderColor)},Outline=${style.borderW},Alignment=${style.alignment},MarginV=60'"`,
      `-c:v libx264 -preset fast -crf 23`,
      `-c:a copy`,
      `-y`,
      `"${outputPath.replace(/\\/g, '/')}"`
    ].join(' ');

    try {
      execSync(cmd, { stdio: 'pipe', timeout: 120000 });
      // 删除临时 SRT
      try { fs.unlinkSync(srtPath); } catch {}
      return outputPath;
    } catch (err) {
      console.warn('[Subtitle] 烧录失败:', err.message);
      return videoPath;
    }
  }

  /** 按标点断句 */
  _splitSentences(text) {
    return text
      .split(/[。，！？,.!?、；;：:\n]+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }

  /** 格式化时间为 SRT 时间码 */
  _formatTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
  }

  /** 颜色转 FFmpeg 用 BGR hex（倒序） */
  _colorToHex(color) {
    const c = color.replace('#', '');
    if (c.length === 6) {
      return c[4] + c[5] + c[2] + c[3] + c[0] + c[1]; // RGB → BGR
    }
    if (c === 'white') return 'FFFFFF';
    if (c === 'black') return '000000';
    if (c === 'yellow') return '00FFFF';
    return 'FFFFFF';
  }

  _findFFmpeg() {
    const localPath = path.join(process.cwd(), 'ffmpeg.exe');
    if (fs.existsSync(localPath)) return localPath;
    return 'ffmpeg';
  }
}

module.exports = SubtitleEngine;
