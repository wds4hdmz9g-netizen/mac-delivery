/**
 * Moark文案提取器 — 用模力方舟API提取抖音文案
 * 和AI数字人口播助手共用同一套 Moark API Key
 * 流程：解析短链 → 下载视频 → FFmpeg提音频 → Moark ASR转写
 */
const BaseScraper = require('./base');
const path = require('path');
const fs = require('fs');
const { execSync, spawnSync } = require('child_process');

// 和 AI数字人口播助手 一样的常量
const DESKTOP_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const MOBILE_UA = 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1';
const MOARK_BASE = 'https://api.moark.com/v1';

// 随机ID
function rid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

// 繁简转换 — whisper-large 有时输出繁体，统一转简体
// 完整覆盖Whisper中文输出常见繁简字（含日常+网络高频字170+）
const T2S_MAP = {
  // 高频多字词（长匹配优先）
  '範圍':'范围','我們':'我们','他們':'他们','你們':'你们','什麼':'什么',
  '怎麼':'怎么','為什麼':'为什么','這樣':'这样','那樣':'那样','時候':'时候',
  '關係':'关系','聯繫':'联系','沒有':'没有','時間':'时间','東西':'东西',
  '問題':'问题','朋友':'朋友','國家':'国家','工作':'工作','公司':'公司',
  '應該':'应该','可以':'可以','已經':'已经','知道':'知道','因為':'因为',
  '所以':'所以','如果':'如果','然後':'然后','開始':'开始','決定':'决定',
  '重要':'重要','簡單':'简单','複雜':'复杂','情況':'情况','影響':'影响',
  '選擇':'选择','發現':'发现','學習':'学习','成功':'成功','特別':'特别',
  '結果':'结果','過程':'过程','繼續':'继续','機會':'机会','開發':'开发',
  // 单字
  '國':'国','軍':'军','點':'点','體':'体','機':'机','對':'对','現':'现',
  '時':'时','樂':'乐','東':'东','長':'长','門':'门','開':'开','關':'关',
  '愛':'爱','氣':'气','馬':'马','風':'风','飛':'飞','電':'电','雲':'云',
  '萬':'万','與':'与','無':'无','為':'为','後':'后','會':'会','學':'学',
  '來':'来','動':'动','個':'个','裡':'里','頭':'头','兒':'儿','們':'们',
  '當':'当','發':'发','見':'见','說':'说','過':'过','還':'还','讓':'让',
  '聽':'听','寫':'写','買':'买','賣':'卖','錢':'钱','車':'车','進':'进',
  '這':'这','書':'书','話':'话','問':'问','間':'间','樣':'样','種':'种',
  '業':'业','義':'义','經':'经','網':'网','線':'线','總':'总','聲':'声',
  '親':'亲','覺':'觉','變':'变','實':'实','應':'应','邊':'边','裡':'里',
  '處':'处','號':'号','衛':'卫','術':'术','際':'际','導':'导',
  '師':'师','帶':'带','從':'从','麼':'么','嗎':'吗','呢':'呢','吧':'吧',
  '給':'给','幹':'干','塊':'块','場':'场','報':'报','準':'准','員':'员',
  '嗎':'吗','壓':'压','廠':'厂','戰':'战','確':'确','歷':'历','選':'选',
  '標':'标','樹':'树','草':'草','備':'备','務':'务','勢':'势',
  '聯':'联','極':'极','構':'构','認':'认','識':'识','計':'计','設':'设',
  '單':'单','參':'参','層':'层','屬':'属','張':'张','強':'强','彈':'弹',
  '數':'数','據':'据','標':'标','權':'权','檢':'检','測':'测','際':'际',
  '雜':'杂','亂':'乱','異':'异','畫':'画','續':'续',
  '羅':'罗','廣':'广','慶':'庆','廳':'厅','庫':'库','廢':'废',
  '齊':'齐','齒':'齿','龍':'龙','龜':'龟',
  // Whisper高频漏网之鱼
  '試':'试','該':'该','貢':'贡','獻':'献','題':'题','鍵':'键',
  '難':'难','歡':'欢','戲':'戏','殺':'杀','態':'态','懷':'怀',
  '剛':'刚','鐵':'铁','鋼':'钢','銀':'银','銅':'铜','鏡':'镜','鐘':'钟',
  '脫':'脱','奮':'奋','鬥':'斗','組':'组','統':'统','劃':'划',
  '熱':'热','滿':'满','團':'团','製':'制','證':'证','嚴':'严',
  '蘇':'苏','響':'响','陽':'阳','陰':'阴','雙':'双',
  '農':'农','藥':'药','醫':'医','舊':'旧','養':'养','護':'护',
  '約':'约','紅':'红','綠':'绿','藍':'蓝','黃':'黄','質':'质',
  '運':'运','遠':'远','園':'园','際':'际','輕':'轻',
};
// 按Key长度降序排列，确保长匹配优先（如"範圍"优先于"範"和"圍"）
const T2S_KEYS = Object.keys(T2S_MAP).sort((a, b) => b.length - a.length);
const T2S_REGEX = new RegExp(T2S_KEYS.join('|'), 'g');
function t2s(text) {
  if (!text) return text;
  return text.replace(T2S_REGEX, (match) => T2S_MAP[match] || match);
}

// FFmpeg路径（本项目自带，兼容多个位置）
function findFFmpeg() {
  const base = path.join(__dirname, '..', '..');
  const candidates = [
    path.join(base, 'ffmpeg.exe'),                     // 项目根目录（优先）
    path.join(base, '.ffmpeg', 'ffmpeg.exe'),
    'C:/Users/dell/WorkBuddy/Claw/ffmpeg/ffmpeg-master-latest-win64-gpl-shared/bin/ffmpeg.exe',
    'ffmpeg',
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) {
      console.log('[MoarkScraper] FFmpeg:', c);
      return c;
    }
  }
  throw new Error('FFmpeg未找到，请确保content-factory/ffmpeg.exe存在');
}

class MoarkScraper extends BaseScraper {
  constructor(config) {
    super(config);
    this.name = 'moark';
    this.apiKey = config.apiKey || '';
    this.tempDir = config.tempDir || 'D:/矩阵工厂数据/temp_media';
    this.ffmpeg = findFFmpeg();
    if (!fs.existsSync(this.tempDir)) fs.mkdirSync(this.tempDir, { recursive: true });
  }

  /**
   * 智能提取：抖音链接走Moark ASR，其他链接走网页抓取
   */
  async extract(input) {
    const isDouyin = /douyin\.com|ixigua\.com/i.test(input);

    if (isDouyin && this.apiKey) {
      try {
        return await this._extractDouyin(input);
      } catch (e) {
        console.warn('[MoarkScraper] 抖音提取失败:', e.message);
        // 失败回退到手动模式
        return {
          success: false,
          text: '',
          source: input,
          method: 'moark',
          error: `抖音文案提取失败：${e.message}。请手动复制文案粘贴。`
        };
      }
    }

    if (isDouyin && !this.apiKey) {
      return {
        success: false,
        text: '',
        source: input,
        method: 'moark',
        error: '请先配置Moark API Key（模力方舟）。获取地址：https://moark.com'
      };
    }

    // 非抖音链接：回退网页抓取
    return this._webScrape(input);
  }

  // ========== 抖音提取（1:1照搬AI数字人口播助手）==========

  async _extractDouyin(input) {
    console.log('[MoarkScraper] 抖音提取开始:', input.substring(0, 60));

    // 1. 解析短链接
    const url = this._getFirstUrl(input);
    const videoUrl = await this._resolveShortUrl(url);
    const videoId = await this._getVideoId(videoUrl);
    console.log('[MoarkScraper] videoId:', videoId);

    // 2. 获取视频信息
    const videoInfo = await this._getVideoInfo(videoId);
    console.log('[MoarkScraper] 视频描述:', (videoInfo.text || '').substring(0, 40));

    // 3. 下载视频
    const mp4Path = await this._downloadVideo(videoInfo.videoUrl);

    // 4. 提取音频
    const audioPath = await this._extractAudio(mp4Path);

    // 5. Moark ASR转写
    const text = await this._transcribe(audioPath);

    // 6. 清理
    try { fs.unlinkSync(mp4Path); } catch (e) {}
    try { fs.unlinkSync(audioPath); } catch (e) {}

    console.log('[MoarkScraper] 提取完成:', (text || '').substring(0, 60));
    return { success: true, text, source: url, method: 'moark_asr' };
  }

  _getFirstUrl(input) {
    const m = input.match(/https:\/\/[^\s]+/g);
    if (!m?.length) throw new Error('未找到有效链接');
    return m[0].replace(/[，。；;、]+$/g, '');
  }

  async _resolveShortUrl(url) {
    if (!url.startsWith('https://v.douyin.com')) return url;
    const r = await fetch(url, {
      headers: { 'user-agent': DESKTOP_UA },
      redirect: 'manual',
      signal: AbortSignal.timeout(8000)
    });
    const loc = r.headers.get('location');
    if (!loc) throw new Error('短链接解析失败');
    return new URL(loc, url).href;
  }

  async _getVideoId(videoUrl) {
    const p = new URL(videoUrl);
    const mid = p.searchParams.get('modal_id');
    if (mid) return mid;
    const parts = p.pathname.replace(/^\/|\/$/g, '').split('/');
    const vid = parts[parts.length - 1];
    if (!vid) throw new Error('视频ID提取失败');
    return vid;
  }

  async _getVideoInfo(videoId) {
    const r = await fetch(`https://m.douyin.com/share/video/${videoId}`, {
      headers: { 'user-agent': MOBILE_UA },
      signal: AbortSignal.timeout(10000)
    });
    if (!r.ok) throw new Error(`获取视频信息失败(${r.status})`);
    const html = await r.text();
    const m = html.match(/window\._ROUTER_DATA\s*=\s*(.*?)<\/script>/s);
    if (!m?.[1]) throw new Error('视频信息解析失败');
    const data = JSON.parse(m[1]);
    const vi = data.loaderData?.['video_(id)/page']?.videoInfoRes?.item_list?.[0];
    const rawUrl = vi?.video?.play_addr?.url_list?.[0];
    if (!rawUrl) throw new Error('无水印地址不存在');
    return {
      text: vi?.desc || '',
      videoUrl: rawUrl.replace('playwm', 'play')
    };
  }

  async _downloadVideo(videoUrl, retry = 3) {
    for (let i = 0; i < retry; i++) {
      const mp4Path = path.join(this.tempDir, `${rid()}.mp4`);
      try {
        const r = await fetch(videoUrl, {
          headers: { 'user-agent': DESKTOP_UA },
          signal: AbortSignal.timeout(30000)
        });
        if (!r.ok) throw new Error(`下载失败(${r.status})`);
        fs.writeFileSync(mp4Path, Buffer.from(await r.arrayBuffer()));
        return mp4Path;
      } catch (e) {
        try { fs.unlinkSync(mp4Path); } catch (ex) {}
        if (i === retry - 1) throw new Error('视频下载失败: ' + e.message);
      }
    }
  }

  async _extractAudio(videoPath) {
    const audioPath = path.join(this.tempDir, `${rid()}.mp3`);
    execSync(`"${this.ffmpeg}" -y -i "${videoPath}" -vn -ac 1 -ar 16000 -b:a 64k "${audioPath}"`,
      { timeout: 30000, windowsHide: true });
    return audioPath;
  }

  async _transcribe(audioPath) {
    const audioBuf = fs.readFileSync(audioPath);
    const formData = new FormData();
    formData.append('file', new Blob([audioBuf], { type: 'audio/mpeg' }), 'audio.mp3');
    // SenseVoiceSmall: 1:1照搬AI口播助手，简体+标点原生支持，秒杀whisper
    formData.append('model', 'SenseVoiceSmall');
    formData.append('language', 'auto');

    const r = await fetch(`${MOARK_BASE}/audio/transcriptions`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.apiKey}` },
      body: formData,
      signal: AbortSignal.timeout(90000)
    });

    if (!r.ok) {
      let msg = `Moark返回${r.status}`;
      try { const ed = await r.json(); if (ed.error?.message) msg = ed.error.message; } catch (e) {}
      throw new Error(msg);
    }
    const data = await r.json();
    if (!data.text?.trim()) throw new Error('转写结果为空');
    return data.text.trim();
  }

  // 智能标点修复（规则引擎，不调API，避免消耗改写配额）
  async _addPunctuation(text) {
    // === 第1步：在明显断句处插入标点 ===
    let result = text;
    
    // 句末语气词后加逗号
    result = result.replace(/([呢吗吧啊呀哦哈嘛呗啦噢哟哇诶嘿])(?![，。！？、\s])/g, '$1，');
    
    // 问句标志后加问号
    result = result.replace(/([吗])(?![，。！？、\s])/g, '$1？');
    
    // "什么/怎么/为什么/谁/哪"引导的问句 → 末尾加问号（看14字内有无"呢/吗"确认）
    result = result.replace(/(什么|怎么|为什么|谁|哪[里个些]|多少)[^，。！？]{3,20}?(呢|吗|啊|呀)?/g, (match) => {
      if (!/[。！？]$/.test(match)) return match + '？';
      return match;
    });
    
    // 转折/因果连接词前加逗号
    result = result.replace(/(但是|可是|不过|然而|所以|因此|那么|然后|而且|并且|或者|如果|因为|其实|毕竟|反正|总之|另外|尤其)(?![，。！？、\s])/g, '，$1');
    
    // === 第2步：按语义块均匀加逗号（每12-20字断一次）===
    // 先把已有的标点当作断点
    const segments = result.split(/[，。！？、\n]+/).filter(s => s.trim());
    const punctuated = [];
    
    for (const seg of segments) {
      const s = seg.trim();
      if (s.length <= 18) {
        punctuated.push(s);
      } else {
        // 长段按字数和自然词组分段
        let remaining = s;
        while (remaining.length > 18) {
          // 尝试在"的/了/到/完/过/会"等字后断开
          const breakChars = ['的', '了', '到', '完', '过', '会', '是', '有', '在'];
          let bestPos = 15; // 默认15字处
          
          for (let i = 12; i < Math.min(22, remaining.length); i++) {
            if (breakChars.includes(remaining[i])) {
              bestPos = i + 1;
              break;
            }
          }
          
          punctuated.push(remaining.substring(0, bestPos));
          remaining = remaining.substring(bestPos);
        }
        if (remaining.length > 0) punctuated.push(remaining);
      }
    }
    
    // 重新拼接：前面用逗号，最后用句号
    if (punctuated.length <= 1) {
      result = punctuated.join('') + '。';
    } else {
      result = punctuated.slice(0, -1).join('，') + '。' + punctuated[punctuated.length - 1];
    }
    
    // 清理多余标点
    result = result.replace(/[，。！？]{2,}/g, (m) => m[0]);
    
    return result;
  }

  // ========== 网页抓取（非抖音链接兜底）==========

  async _webScrape(url) {
    try {
      const r = await fetch(url, {
        headers: { 'User-Agent': DESKTOP_UA },
        redirect: 'follow',
        signal: AbortSignal.timeout(10000),
      });
      const html = await r.text();
      const cleaned = html
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&[a-z]+;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 3000);

      if (cleaned.length < 30) {
        return { success: false, text: '', source: url, method: 'web_scrape', error: '页面内容太少，请手动粘贴文案' };
      }
      return { success: true, text: cleaned, source: url, method: 'web_scrape' };
    } catch (e) {
      return { success: false, text: '', source: url, method: 'web_scrape', error: `抓取失败：${e.message}。请手动粘贴文案` };
    }
  }

  async healthCheck() {
    if (!this.apiKey) return { ok: false, provider: 'moark', error: '未配置API Key' };
    try {
      const r = await fetch(`${MOARK_BASE}/models`, {
        headers: { Authorization: `Bearer ${this.apiKey}` },
        signal: AbortSignal.timeout(5000)
      });
      return { ok: r.ok, provider: 'moark' };
    } catch (e) {
      return { ok: false, provider: 'moark', error: e.message };
    }
  }
}

module.exports = MoarkScraper;
