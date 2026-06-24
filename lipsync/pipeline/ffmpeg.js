/**
 * FFmpeg视频处理模块
 * 负责视频合成、字幕烧录、封面叠加
 */
const { execSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// 尝试查找可用的FFmpeg
function getFFmpegPath() {
  // 先找系统路径
  try {
    execSync('ffmpeg -version', { stdio: 'pipe' });
    return 'ffmpeg';
  } catch (e) {
    // 再找内置路径
    const builtinPaths = [
      path.join(__dirname, '..', 'resources', 'ffmpeg', 'ffmpeg.exe'),
      path.join(__dirname, '..', 'resources', 'ffmpeg.exe'),
      'C:\\ffmpeg\\bin\\ffmpeg.exe'
    ];
    for (const p of builtinPaths) {
      if (fs.existsSync(p)) return p;
    }
  }
  return null;
}

const FFMPEG = getFFmpegPath();

/**
 * 合成视频（音频+纯色背景+字幕）
 */
async function compose(options) {
  const { audioPath, coverPath, text, subtitle } = options;
  const outputFileName = `video_${Date.now()}.mp4`;
  const outputPath = path.join(__dirname, '..', 'output', outputFileName);

  if (!FFMPEG) {
    console.warn('FFmpeg不可用，跳过视频合成');
    return audioPath;
  }

  try {
    // 获取音频时长
    const durationOutput = execSync(`"${FFMPEG}" -i "${audioPath}" 2>&1`, { encoding: 'utf-8' });
    const durationMatch = durationOutput.match(/Duration: (\d{2}):(\d{2}):(\d{2}\.\d{2})/);
    let duration = 30;
    if (durationMatch) {
      duration = parseInt(durationMatch[1]) * 3600 + parseInt(durationMatch[2]) * 60 + parseFloat(durationMatch[3]);
    }

    // 如果有封面图，叠加显示
    let filterComplex = '';
    if (coverPath && fs.existsSync(path.join(__dirname, '..', coverPath.replace(/^\//, '')))) {
      const absoluteCoverPath = path.join(__dirname, '..', coverPath.replace(/^\//, ''));
      filterComplex = `[1:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920[v1];[0:v][v1]overlay=0:0`;
    }

    const args = [
      '-y',
      '-f', 'lavfi',
      '-i', `color=c=#0a0a1a:s=1080x1920:d=${Math.ceil(duration) + 2}:r=30`,
      '-i', `"${audioPath}"`
    ];

    if (coverPath) {
      args.splice(4, 0, '-i', `"${path.join(__dirname, '..', coverPath.replace(/^\//, ''))}"`);
    }

    const cmd = `"${FFMPEG}" ${args.join(' ')} -c:v libx264 -c:a aac -shortest -preset ultrafast -pix_fmt yuv420p "${outputPath}"`;

    execSync(cmd, {
      stdio: 'pipe',
      timeout: 120000
    });

    return outputPath;
  } catch (err) {
    console.error('视频合成失败:', err.message);
    return audioPath;
  }
}

/**
 * 给视频添加字幕
 */
async function addSubtitle(videoPath, text) {
  if (!FFMPEG || !videoPath || !fs.existsSync(videoPath)) return videoPath;

  const outputFileName = `subtitled_${Date.now()}.mp4`;
  const outputPath = path.join(__dirname, '..', 'output', outputFileName);

  try {
    // 生成ASS字幕文件
    const assPath = await generateASS(text, videoPath);
    if (!assPath) return videoPath;

    const cmd = `"${FFMPEG}" -y -i "${videoPath}" -vf "ass=${assPath.replace(/\\/g, '/')}" -c:v libx264 -c:a copy -preset ultrafast "${outputPath}"`;

    execSync(cmd, {
      stdio: 'pipe',
      timeout: 60000
    });

    // 清理临时文件
    try { fs.unlinkSync(assPath); } catch (e) {}

    return outputPath;
  } catch (err) {
    console.error('字幕添加失败:', err.message);
    return videoPath;
  }
}

/**
 * 生成ASS字幕文件
 */
async function generateASS(text, videoPath) {
  try {
    // 获取视频时长
    const durationOutput = execSync(`"${FFMPEG}" -i "${videoPath}" 2>&1`, { encoding: 'utf-8' });
    const durationMatch = durationOutput.match(/Duration: (\d{2}):(\d{2}):(\d{2}\.\d{2})/);
    const duration = durationMatch
      ? parseInt(durationMatch[1]) * 3600 + parseInt(durationMatch[2]) * 60 + parseFloat(durationMatch[3])
      : 30;

    // 分割文字为短句
    const sentences = splitSentences(text);
    const timePerSentence = duration / sentences.length;

    // 生成ASS内容
    let assContent = `[Script Info]
Title: 超级IP智能体字幕
ScriptType: v4.00+
WrapStyle: 2
ScaledBorderAndShadow: yes
PlayResX: 1080
PlayResY: 1920

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default,Microsoft YaHei,36,&H00FFFFFF,&H000000FF,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,3,1,2,50,50,150,1
Style: Highlight,Microsoft YaHei,42,&H00FFCC00,&H000000FF,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,4,2,2,50,50,150,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

    for (let i = 0; i < sentences.length; i++) {
      const startTime = formatASSTime(i * timePerSentence);
      const endTime = formatASSTime((i + 1) * timePerSentence);
      const style = i === 0 ? 'Highlight' : 'Default';
      assContent += `Dialogue: 0,${startTime},${endTime},${style},,0,0,0,,${sentences[i]}\n`;
    }

    const assPath = path.join(__dirname, '..', 'output', `subtitle_${Date.now()}.ass`);
    fs.writeFileSync(assPath, assContent, 'utf-8');
    return assPath;
  } catch (err) {
    console.error('字幕文件生成失败:', err.message);
    return null;
  }
}

/**
 * 分割长文本为短句
 */
function splitSentences(text, maxChars = 18) {
  // 按标点分割
  const raw = text.split(/(?<=[，。！？；、\n])/);
  const sentences = [];

  for (const s of raw) {
    const trimmed = s.trim();
    if (!trimmed) continue;

    if (trimmed.length > maxChars) {
      // 进一步分割长句
      for (let i = 0; i < trimmed.length; i += maxChars) {
        sentences.push(trimmed.substring(i, i + maxChars));
      }
    } else {
      sentences.push(trimmed);
    }
  }

  return sentences;
}

/**
 * 格式化ASS时间
 */
function formatASSTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 100);
  return `${h.toString().padStart(1, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
}

module.exports = { compose, addSubtitle };
