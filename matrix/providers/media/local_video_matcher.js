/**
 * 本地视频素材库 v1.0
 * 真实工厂视频 + 关键词匹配 → 有人物在动的画面
 */
const path = require('path');
const fs = require('fs');

// 视频关键词映射 — 文件名 → 匹配关键词
const VIDEO_MAP = [
  { file: '冲压岗视频素材.mp4', dir: 'factory', keywords: ['冲压','冲床','压机','冲压工','冲压岗','五金'] },
  { file: '视频底图_冲压车间.mp4', dir: 'factory', keywords: ['冲压','冲床','车间','机器','设备','操作'] },
  { file: '视频底图_电子厂.mp4', dir: 'factory', keywords: ['电子厂','电子','手机','组装','配件','电路板','PCB','流水线','插件','检测','无尘'] },
  { file: '视频底图_仓库.mp4', dir: 'factory', keywords: ['仓库','仓储','物流','打包','发货','搬运','叉车','货物'] },
  { file: '视频底图_工厂外景.mp4', dir: 'factory', keywords: ['工厂','园区','外景','厂区','门口','招聘','报名','广州','黄埔'] },
  { file: '视频底图_办公室.mp4', dir: 'worker', keywords: ['办公室','文员','白领','管理','人事','行政','面试','电脑'] },
];

/**
 * 根据文案匹配最相关的本地视频
 * @param {string} text - 中文文案
 * @param {string} mediaDir - media_library根目录
 * @returns {Array<{path:string, score:number, keywords:string[]}>}
 */
function matchLocalVideos(text, mediaDir) {
  const lower = text.toLowerCase();
  const matches = [];

  for (const v of VIDEO_MAP) {
    const fullPath = path.join(mediaDir, v.dir, v.file);
    if (!fs.existsSync(fullPath)) continue;

    const hitKeywords = v.keywords.filter(kw => lower.includes(kw));
    if (hitKeywords.length > 0) {
      matches.push({
        path: fullPath,
        score: hitKeywords.length,
        keywords: hitKeywords,
        file: v.file,
        src: 'local_video',
      });
    }
  }

  // 按匹配度排序
  matches.sort((a, b) => b.score - a.score);
  return matches.slice(0, 4);
}

module.exports = { matchLocalVideos, VIDEO_MAP };
