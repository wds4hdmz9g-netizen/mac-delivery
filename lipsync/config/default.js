module.exports = {
  // ===== 多供应商架构 =====
  // providers列表，用户可在界面中切换
  providers: {
    // 模力方舟（免费额度+付费）
    moark: {
      name: '模力方舟',
      baseUrl: 'https://api.moark.com/v1',
      models: {
        chat: 'deepseek-r1',          // 改写（推理质量高）
        chatFast: 'deepseek-v3',     // 提取（速度快）
        tts: 'ChatTTS',               // 语音合成
        asr: 'whisper-large',         // 语音识别
        image: 'FLUX.2-dev',          // 图片生成
        lipsync: 'live-portrait'      // 视频对口型
      }
    },

    // DeepSeek官方（付费，效果好）
    deepseek: {
      name: 'DeepSeek官方',
      baseUrl: 'https://api.deepseek.com/v1',
      apiKeyRequired: true,
      models: {
        chat: 'deepseek-reasoner',    // R1推理模型
      }
    },

    // OpenAI（付费）
    openai: {
      name: 'OpenAI',
      baseUrl: 'https://api.openai.com/v1',
      apiKeyRequired: true,
      models: {
        chat: 'gpt-4o',
        tts: 'tts-1',
        asr: 'whisper-1',
        image: 'dall-e-3'
      }
    },

    // SiliconFlow（国内免费+低价）
    siliconflow: {
      name: '硅基流动',
      baseUrl: 'https://api.siliconflow.cn/v1',
      apiKeyRequired: true,
      models: {
        chat: 'deepseek-ai/DeepSeek-R1',
        tts: 'FunAudioLLM/CosyVoice2-0.5B',
        asr: 'FunAudioLLM/SenseVoiceSmall'
      }
    },

    // EdgeTTS（微软免费，无需Key）
    edgetts: {
      name: '微软EdgeTTS',
      free: true,
      noKey: true
    }
  },

  // 默认供应商（用户可切换）
  defaultProvider: 'moark',

  // TTS音色（通用，不分特定人物）
  tts: {
    model: 'ChatTTS',
    voices: [
      { id: 'alloy', name: 'Alloy', description: '中性自然音色' },
      { id: 'echo', name: 'Echo', description: '沉稳男声' },
      { id: 'fable', name: 'Fable', description: '英式口音' },
      { id: 'onyx', name: 'Onyx', description: '深沉男声' },
      { id: 'nova', name: 'Nova', description: '温柔女声' },
      { id: 'shimmer', name: 'Shimmer', description: '清脆女声' },
      { id: 'coral', name: 'Coral', description: '温暖女声' },
      { id: 'sage', name: 'Sage', description: '知性男声' }
    ]
  },

  // AI改写 — 通用风格，不分特定行业
  chat: {
    model: 'deepseek-r1',
    maxTokens: 2000,
    temperature: 0.8
  },

  // 口播风格（通用，面向各行各业的实体店老板）
  styles: {
    koushui: { name: '口语化', desc: '像朋友聊天一样自然', icon: '💬', prompt: '你是一个口播内容创作者。用最自然、最接地气的口语化表达改写文案。像跟朋友面对面聊天那样说话，不要书面语，不要AI味。直接、干脆、有感染力。' },
    zhuanye: { name: '专业风格', desc: '数据详实，条理清晰', icon: '📋', prompt: '你是一个专业的内容策划师。改写文案要数据准确、信息完整、逻辑清晰。适合中高端客户群体。' },
    reqing: { name: '热情带货', desc: '感染力强，适合带货', icon: '🔥', prompt: '你是一个带货主播。用热情、有感染力、有煽动性的语言改写文案。制造紧迫感，强调痛点解决方案，引导行动。' },
    gushi: { name: '故事叙述', desc: '讲故事，有共鸣', icon: '📖', prompt: '你是一个故事讲述者。用叙事的方式改写文案，要有场景、有细节、有情感共鸣。让人看完觉得"这就是在说我"。' },
    duanju: { name: '短剧脚本', desc: '节奏快，冲突强', icon: '🎬', prompt: '你是一个短视频编剧。把文案改成短剧脚本风格：有冲突、有反转、节奏快。适合15-60秒短视频口播。' }
  },

  // 封面生成
  image: {
    model: 'FLUX.2-dev',
    size: '1024x1024'
  },

  // 视频对口型
  lipSync: {
    model: 'live-portrait'
  },

  // 输出配置
  output: {
    dir: 'output',
    keepRecent: 20,
    autoCleanup: true
  }
};
