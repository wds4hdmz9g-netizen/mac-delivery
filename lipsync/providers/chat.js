/**
 * AI改写提供者 - 基于模力方舟 DeepSeek-R1
 */
const config = require('../config/default');

const MOARK_BASE = config.moark.baseUrl;
let API_KEY = config.moark.apiKey;

function setApiKey(key) { API_KEY = key; }

/**
 * 改写文案
 * @param {string} text - 原始文案
 * @param {string} style - 风格：'yangbanzhang' | 'koushui' | 'zhuanye'
 */
async function rewrite(text, style) {
  const systemPrompts = {
    'yangbanzhang': `你是"杨班长"，退伍老兵，广州劳务行业6年经验。你的风格：
- 口语化、接地气、亲切直接
- 用"工友""兄弟"称呼对方
- 会分享具体工厂经历和防坑建议
- 内容250-350字，自然分段
- 格式：开头打招呼 + 岗位介绍 + 薪资福利 + 防坑提醒 + 联系方式引导`,

    'koushui': `你是一个接地气的工厂招工内容创作者。你的风格：
- 通俗口语，像跟朋友聊天
- 直接说重点，不绕弯子
- 突出薪资和福利
- 内容200-300字`,

    'zhuanye': `你是一个专业的招聘顾问。你的风格：
- 专业但不生硬
- 数据准确，信息完整
- 突出岗位优势和职业发展
- 内容300-400字`
  };

  const prompt = systemPrompts[style] || systemPrompts['yangbanzhang'];

  const response = await fetch(`${MOARK_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: config.chat.model,
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: `请将以下内容改写为适合抖音口播的文案：\n\n${text}` }
      ],
      max_tokens: config.chat.maxTokens,
      temperature: config.chat.temperature
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`AI改写失败 (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const rewritten = data.choices[0].message.content;

  return {
    text: rewritten.trim(),
    versions: [rewritten.trim()]
  };
}

module.exports = { rewrite, setApiKey };
