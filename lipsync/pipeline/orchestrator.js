/**
 * 主流程编排器
 * 协调各服务完成完整视频生成
 */
const path = require('path');
const fs = require('fs');
const ttsProvider = require('../providers/tts');
const chatProvider = require('../providers/chat');
const imageProvider = require('../providers/image');
const lipSyncProvider = require('../providers/lip-sync');
const ffmpeg = require('./ffmpeg');
const config = require('../config/default');

// 任务状态存储
const tasks = new Map();

/**
 * 完整视频生成
 * @param {Object} options
 * @param {string} options.text - 输入文案
 * @param {string} options.style - 视频风格
 * @param {string} options.voiceId - 音色ID
 * @param {string} options.mode - 模式：'full' | 'lipsync' | 'voice'
 * @param {string} options.videoFile - 上传的视频文件（用于对口型）
 * @param {string} options.audioFile - 上传的音频文件
 */
async function generateFullVideo(options) {
  const taskId = `task_${Date.now()}`;
  tasks.set(taskId, {
    status: 'processing',
    progress: 0,
    startedAt: new Date().toISOString()
  });

  try {
    updateTask(taskId, { progress: 5, step: '开始处理文案...' });

    // Step 1: AI改写文案（可选）
    let finalText = options.text;
    if (options.mode !== 'voice' && options.text.length > 10) {
      updateTask(taskId, { progress: 10, step: 'AI改写文案...' });
      const rewritten = await chatProvider.rewrite(options.text, options.style || 'yangbanzhang');
      finalText = rewritten.text;
    }

    // Step 2: 语音合成
    updateTask(taskId, { progress: 30, step: '生成语音...' });
    let audioResult;
    if (options.audioFile) {
      audioResult = {
        audioPath: options.audioFile,
        absolutePath: options.audioFile,
        duration: 30
      };
    } else {
      audioResult = await ttsProvider.synthesize(finalText, options.voiceId);
    }
    updateTask(taskId, { progress: 50, step: '语音生成完成' });

    // Step 3: 生成封面图
    updateTask(taskId, { progress: 55, step: '生成封面...' });
    let coverResult;
    try {
      coverResult = await imageProvider.generate(finalText.substring(0, 100), options.style);
    } catch (e) {
      console.log('封面生成失败，跳过:', e.message);
    }

    // Step 4: 视频处理和合成
    let finalVideoPath;
    if (options.mode === 'lipsync' && options.videoFile) {
      // 对口型模式
      updateTask(taskId, { progress: 60, step: '生成对口型视频...' });
      const lipResult = await lipSyncProvider.syncVideoAudio(options.videoFile, audioResult.absolutePath);
      finalVideoPath = lipResult.absolutePath;
    } else {
      // 标准模式：音频+纯色背景
      updateTask(taskId, { progress: 60, step: '合成视频...' });
      finalVideoPath = await ffmpeg.compose({
        audioPath: audioResult.absolutePath,
        coverPath: coverResult?.imagePath,
        text: finalText,
        subtitle: true
      });
    }

    updateTask(taskId, { progress: 90, step: '视频合成完成' });

    // Step 5: 添加字幕
    if (finalVideoPath && !options.mode) {
      updateTask(taskId, { progress: 95, step: '添加字幕...' });
      finalVideoPath = await ffmpeg.addSubtitle(finalVideoPath, finalText);
    }

    // 完成
    const outputFileName = path.basename(finalVideoPath);
    const result = {
      status: 'completed',
      progress: 100,
      step: '完成',
      videoPath: `/output/${outputFileName}`,
      absolutePath: finalVideoPath,
      text: finalText,
      completedAt: new Date().toISOString()
    };

    tasks.set(taskId, result);

    // 自动清理旧输出
    cleanupOldOutputs();

    return result;
  } catch (err) {
    console.error('视频生成失败:', err);
    tasks.set(taskId, {
      status: 'failed',
      progress: 0,
      error: err.message
    });
    throw err;
  }
}

function updateTask(taskId, update) {
  const task = tasks.get(taskId) || {};
  Object.assign(task, update);
  tasks.set(taskId, task);
}

function getTaskStatus(taskId) {
  return tasks.get(taskId) || null;
}

/**
 * 清理旧输出文件
 */
function cleanupOldOutputs() {
  if (!config.output.autoCleanup) return;

  const outputDir = path.join(__dirname, '..', 'output');
  if (!fs.existsSync(outputDir)) return;

  const files = fs.readdirSync(outputDir)
    .filter(f => f.match(/\.(mp4|mp3|png|jpg)$/))
    .map(f => ({
      name: f,
      time: fs.statSync(path.join(outputDir, f)).mtime
    }))
    .sort((a, b) => b.time - a.time);

  // 保留最近N个文件
  const toDelete = files.slice(config.output.keepRecent);
  for (const file of toDelete) {
    try {
      fs.unlinkSync(path.join(outputDir, file.name));
      console.log('清理旧文件:', file.name);
    } catch (e) {
      // ignore
    }
  }
}

module.exports = { generateFullVideo, getTaskStatus };
