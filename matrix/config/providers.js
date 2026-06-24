/**
 * ============================================
 *  矩阵内容工厂 - Provider 配置中心 v3.0
 *  一键切换所有 Provider + 全自动零配置
 * ============================================
 */

module.exports = {
  // ============ AI 改写 Provider ============
  rewriter: {
    active: 'deepseek',
    providers: {
      deepseek: {
        // 用模力方舟的 DeepSeek 端点（客户通过页面设置Key，或个人配置.api_key文件）
        baseURL: 'https://api.moark.com/v1',
        apiKey: process.env.DEEPSEEK_API_KEY || '',
        model: 'DeepSeek-V4-Flash',
        temperature: 0.8,
        maxTokens: 2000,
      },
      openai: {
        baseURL: 'https://api.openai.com/v1',
        apiKey: process.env.OPENAI_API_KEY || '',
        model: 'gpt-4o',
        temperature: 0.8,
        maxTokens: 2000,
      },
      claude: {
        baseURL: 'https://api.anthropic.com/v1',
        apiKey: process.env.ANTHROPIC_API_KEY || '',
        model: 'claude-3-5-sonnet-20241022',
        temperature: 0.8,
        maxTokens: 2000,
      },
      qwen: {
        baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
        apiKey: process.env.QWEN_API_KEY || '',
        model: 'qwen-max',
        temperature: 0.8,
        maxTokens: 2000,
      },
      mock: { enabled: true },
    }
  },

  // ============ TTS 语音合成 ============
  tts: {
    active: 'edgetts',
    providers: {
      edgetts: {
        voice: 'zh-CN-YunxiNeural',
        rate: '+10%',
        pitch: '+0Hz',
      },
      volcengine: {
        appId: process.env.VOLC_APP_ID || '',
        accessToken: process.env.VOLC_TOKEN || '',
        voice: 'zh_male_qingrun',
      },
      openai: {
        apiKey: process.env.OPENAI_API_KEY || '',
        model: 'tts-1',
        voice: 'alloy',
      },
      mock: { enabled: true },
    }
  },

  // ============ 文案扒取 ============
  scraper: {
    active: 'moark',
    providers: {
      moark: {
        apiKey: '',
        baseURL: 'https://api.moark.com/v1',
      },
      manual: { enabled: true },
      enhanced: { enabled: true },
      cyanlis: {
        apiKey: process.env.CYANLIS_API_KEY || '',
        baseURL: 'https://api.cyanlis.cn',
      },
      mock: { enabled: true },
    }
  },

  // ============ 视频比例预设 ============
  aspectRatios: {
    '9:16':  { width: 720,  height: 1280, label: '9:16 竖屏（抖音）' },
    '16:9': { width: 1280, height: 720,  label: '16:9 横屏（YouTube）' },
    '4:3':  { width: 960,  height: 720,  label: '4:3 传统（iPad）' },
    '3:4':  { width: 720,  height: 960,  label: '3:4 竖屏（小红书）' },
    '1:1':  { width: 1080, height: 1080, label: '1:1 正方形（朋友圈）' },
  },
  defaultAspectRatio: '9:16',

  // ============ 素材匹配 ============
  media: {
    active: 'local',
    providers: {
      local: {
        basePath: './media_library',
        categories: {
          factory: { path: 'factory', tags: ['车间','流水线','工厂','设备','机器','CNC','冲压','打磨','组装','电子厂','注塑'] },
          canteen: { path: 'canteen', tags: ['食堂','吃饭','餐厅','饭菜','餐饮'] },
          dorm: { path: 'dorm', tags: ['宿舍','住宿','房间','床铺','空调宿舍','热水'] },
          street: { path: 'street', tags: ['广州','黄埔','街景','地铁','公交','商圈'] },
          worker: { path: 'worker', tags: ['工人','打工','工作','上班','普工','劳务'] },
        }
      },
      pexels: {
        apiKey: process.env.PEXELS_API_KEY || '',
        baseURL: 'https://api.pexels.com',
      },
      pixabay: {
        apiKey: process.env.PIXABAY_API_KEY || '',
        baseURL: 'https://pixabay.com/api',
      },
      mock: { enabled: true },
    }
  },

  // ============ BGM 背景音乐 ============
  bgm: {
    active: 'local',
    localDir: './bgm_library',
    pixabayKey: process.env.PIXABAY_API_KEY || '',
    defaultVolume: 0.15,
  },

  // ============ 字幕设置 ============
  subtitle: {
    defaultStyle: 'white',
    autoGenerate: true,
  },

  // ============ 网络素材搜索 ============
  web_media: {
    enabled: true,
    pexelsKey: process.env.PEXELS_API_KEY || 'AAtpdyq8W2pAlKZ9l2aFqSS26mdgh9AMyQSWQAlVYNsJt3z2duPWSi2U',
    pixabayKey: process.env.PIXABAY_API_KEY || '',
    maxDownload: 5,
  },

  // ============ 全局设置 ============
  general: {
    output: {
      fps: 30,
      videoBitrate: '2M',
      audioBitrate: '128k',
      format: 'mp4',
      outputDir: 'D:/矩阵工厂数据/output',  // 存D盘，不占C盘空间
    },
    rewrite: {
      versionCount: 3,
      minLength: 80,
      maxLength: 300,
    },
    tasks: {
      maxHistory: 50,
      autoCleanDays: 7,
    }
  }
};
