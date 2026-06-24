/**
 * 封面生成提供者 - 基于模力方舟 FLUX.2-dev
 */
const fs = require('fs');
const path = require('path');
const config = require('../config/default');

const MOARK_BASE = config.moark.baseUrl;
let API_KEY = config.moark.apiKey;

function setApiKey(key) { API_KEY = key; }

/**
 * 生成封面图片
 * @param {string} prompt - 图片描述
 * @param {string} style - 风格
 */
async function generate(prompt, style) {
  const fullPrompt = style
    ? `${prompt}，${style}，${config.image.defaultStyle}`
    : `${prompt}，${config.image.defaultStyle}`;

  const response = await fetch(`${MOARK_BASE}/images/generations`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: config.image.model,
      prompt: fullPrompt,
      n: 1,
      size: config.image.size
    })
  });

  if (!response.ok) {
    const errText = await response.text();

    // FLUX模型可能不可用，生成默认封面
    if (response.status === 400 || response.status === 404) {
      console.log('FLUX模型不可用，使用本地默认封面');
      return generateDefaultCover(prompt);
    }

    throw new Error(`封面生成失败 (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const imageUrl = data.data?.[0]?.url;

  if (!imageUrl) {
    throw new Error('封面生成返回数据异常');
  }

  // 下载图片到本地
  const imageResponse = await fetch(imageUrl);
  const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

  const imageFileName = `cover_${Date.now()}.png`;
  const imagePath = path.join(__dirname, '..', 'output', imageFileName);
  fs.writeFileSync(imagePath, imageBuffer);

  return {
    imagePath: `/output/${imageFileName}`,
    imageUrl: imageUrl
  };
}

/**
 * 生成默认封面（文字叠加底图）
 */
function generateDefaultCover(prompt) {
  const imageFileName = `cover_${Date.now()}.png`;
  const imagePath = path.join(__dirname, '..', 'output', imageFileName);

  // 用FFmpeg生成带文字的背景图
  try {
    const { execSync } = require('child_process');
    const escapedText = prompt.replace(/[:'"]/g, '').substring(0, 80);
    execSync(`ffmpeg -y -f lavfi -i "color=c=#1a1a2e:s=1024x1024:d=1" -vf "drawtext=text='${escapedText}':fontsize=36:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2-40,drawtext=text='杨班长·工厂招聘':fontsize=28:fontcolor=#e94560:x=(w-text_w)/2:y=H-120" -frames:v 1 "${imagePath}"`, {
      stdio: 'pipe',
      timeout: 10000
    });
  } catch (e) {
    // FFmpeg不可用，创建最小的1像素PNG占位
    const pngHeader = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');
    fs.writeFileSync(imagePath, pngHeader);
  }

  return {
    imagePath: `/output/${imageFileName}`,
    imageUrl: null
  };
}

module.exports = { generate, setApiKey };
