/**
 * AI图片生成器 v1.0
 * 调用 buddy-cloud.py 文生图，作为在线搜索的可靠兜底
 */
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const os = require('os');

const SKILL_DIR = 'D:\\workbuddy\\resources\\app.asar.unpacked\\resources\\builtin-skills\\buddy-multimodal-generation';
const PYTHON = 'C:\\Users\\dell\\.workbuddy\\binaries\\python\\versions\\3.13.12\\python.exe';

/**
 * 调用 buddy-cloud.py 生成图片
 */
function _callBuddyCloudImage(token, prompt) {
  return new Promise((resolve, reject) => {
    const tokenFile = path.join(os.tmpdir(), `buddy_img_token_${Date.now()}.txt`);
    fs.writeFileSync(tokenFile, token, 'utf-8');

    const scriptPath = `"${SKILL_DIR}\\scripts\\buddy-cloud.py"`;
    const safePrompt = `"${prompt.replace(/"/g, '\\"')}"`;
    const cmd = `type "${tokenFile}" | "${PYTHON}" -u ${scriptPath} image ${safePrompt} --token-stdin`;

    exec(cmd, { timeout: 60000, maxBuffer: 1024 * 1024, windowsHide: true }, (error, stdout, stderr) => {
      try { fs.unlinkSync(tokenFile); } catch {}
      
      if (error) {
        reject(new Error(`AI图片生成失败: ${stderr ? stderr.slice(-200) : error.message}`));
        return;
      }
      try {
        const jsonMatch = stdout.match(/\{[\s\S]*\}/);
        if (!jsonMatch) { reject(new Error(`无JSON: ${stdout.slice(-100)}`)); return; }
        const result = JSON.parse(jsonMatch[0]);
        if (result.error) { reject(new Error(result.message || result.error)); return; }
        // buddy-cloud.py image 返回格式可能是 {result_url: "..."} 或 {url: "..."} 或 {images: [...]}
        console.log('[AIImage] API返回keys:', Object.keys(result));
        resolve(result);
      } catch (e) { reject(new Error(`解析失败: ${stdout.slice(-100)}`)); }
    });
  });
}

/**
 * 下载文件
 */
function downloadFile(url, outputPath) {
  return new Promise((resolve, reject) => {
    const proto = url.startsWith('https') ? require('https') : require('http');
    const file = fs.createWriteStream(outputPath);
    const req = proto.get(url, { timeout: 30000 }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        resolve(downloadFile(res.headers.location, outputPath));
        return;
      }
      if (res.statusCode !== 200) { reject(new Error(`HTTP ${res.statusCode}`)); return; }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(outputPath); });
      file.on('error', reject);
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('下载超时')); });
  });
}

/**
 * 根据中文文案生成匹配的图片
 * @param {string} text - 中文文案
 * @param {number} count - 需要几张图片
 * @param {string} outputDir - 输出目录
 * @param {string} token - cloud token
 * @returns {Promise<Array<{path:string, type:string, source:string}>>}
 */
async function generateImages(text, count, outputDir, token) {
  if (!token) throw new Error('缺少token');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  // 从文案提取关键词生成 prompt
  const prompts = _buildImagePrompts(text, count);
  console.log(`[AIImage] 生成${count}张图片，prompts=`, prompts.map(p => p.slice(0, 50)));

  const results = [];
  for (let i = 0; i < prompts.length; i++) {
    try {
      console.log(`[AIImage] 生成 ${i+1}/${prompts.length}: ${prompts[i].slice(0, 80)}...`);
      const result = await _callBuddyCloudImage(token, prompts[i]);
      
      // buddy-cloud.py 可能返回多种格式
      let imgUrl = null;
      if (typeof result.result_url === 'string') imgUrl = result.result_url;
      else if (typeof result.url === 'string') imgUrl = result.url;
      else if (Array.isArray(result.images) && result.images.length > 0) {
        imgUrl = typeof result.images[0] === 'string' ? result.images[0] : result.images[0]?.url;
      } else if (Array.isArray(result.result_url) && result.result_url.length > 0) {
        imgUrl = result.result_url[0];
      }
      
      if (imgUrl && typeof imgUrl === 'string') {
        const localPath = path.join(outputDir, `ai_img_${Date.now()}_${i}.jpg`);
        await downloadFile(imgUrl, localPath);
        if (fs.existsSync(localPath) && fs.statSync(localPath).size > 1000) {
          results.push({ path: localPath, type: 'image', source: 'ai_gen', relevance: 9 });
          console.log(`[AIImage] 下载成功: ${path.basename(localPath)}`);
        }
      }
    } catch (e) {
      console.warn(`[AIImage] 图片${i+1}失败:`, e.message);
    }
  }

  console.log(`[AIImage] 完成: ${results.length}/${count}张`);
  return results;
}

/**
 * 中文文案 → 英文图片生成 prompt
 */
function _buildImagePrompts(text, count) {
  // v4.0.8-fix: 精确关键词优先 + 写实风格
  const keywordMap = [
    // 越具体越靠前（按匹配长度加分，避免 CNC 被"电子"覆盖）
    { cn: ['CNC','数控','加工中心'], en: 'realistic documentary photo, cnc machining center workshop, precision metal parts on machine bed, worker in blue uniform checking measurements, clean modern factory floor, natural fluorescent lighting, no sparks no CGI', score: 3 },
    { cn: ['冲压','冲床','压机'], en: 'realistic documentary photo, metal stamping workshop, hydraulic press machine with metal sheet, worker wearing safety helmet and gloves, industrial factory interior, natural lighting, photorealistic', score: 3 },
    { cn: ['注塑','注塑机','塑料件'], en: 'realistic documentary photo, plastic injection molding workshop, rows of injection machines, worker removing plastic parts from mold, clean organized factory floor, natural industrial lighting', score: 3 },
    { cn: ['打磨','抛光'], en: 'realistic documentary photo, metal polishing workstation, worker using grinding wheel on metal part, protective goggles, factory workshop with safety signs, natural lighting, no effects', score: 3 },
    { cn: ['组装','装配','流水线'], en: 'realistic documentary photo, electronics assembly line, workers in blue anti-static uniforms at workstations, conveyor belt with circuit boards, bright clean workshop, photorealistic', score: 2 },
    { cn: ['仓库','物流','仓储'], en: 'realistic documentary photo, factory warehouse interior, metal shelving with cardboard boxes, forklift in background, clean organized storage area, natural fluorescent lighting', score: 2 },
    { cn: ['宿舍','住宿','公寓'], en: 'realistic documentary photo, clean factory dormitory room, simple bunk beds with neat bedding, air conditioner on wall, bright natural light from window, lived-in but tidy', score: 2 },
    { cn: ['食堂','包吃','餐厅','包住'], en: 'realistic documentary photo, chinese factory canteen interior, workers sitting at long tables eating lunch, steam from food trays, clean bright dining hall, natural candid shot', score: 2 },
    { cn: ['电子厂','电子','电路板','PCB'], en: 'realistic documentary photo, electronics factory workshop, workers in white anti-static suits at assembly tables, soldering circuit boards under magnifying lamps, bright clean room environment, photorealistic', score: 1 },
    { cn: ['广州','黄埔','广东'], en: 'realistic documentary photo, modern factory building exterior in guangzhou huangpu district, clear sky, company sign in chinese, industrial park setting, photorealistic architecture shot', score: 1 },
    { cn: ['长白班','白班'], en: 'realistic documentary photo, daytime factory workshop interior, natural sunlight through large windows, workers at production line in blue uniforms, clean organized environment, photorealistic', score: 1 },
    { cn: ['夜班','加班','通宵'], en: 'realistic documentary photo, night shift factory interior, workers under bright fluorescent lights, evening production work, clean workshop, natural candid atmosphere, no effects', score: 1 },
    { cn: ['招工','招聘','报名'], en: 'realistic documentary photo, factory entrance gate with recruitment banner in chinese, job applicants waiting in line, HR desk with forms, morning light, candid street photography style', score: 1 },
    { cn: ['工资','月薪','时薪','高薪'], en: 'realistic documentary photo, factory payroll office, worker receiving pay slip at counter, smiling expression, clean office interior with company calendar on wall, natural lighting', score: 1 },
    { cn: ['小时工','临时工','日结'], en: 'realistic documentary photo, temporary workers at factory time clock machine, punching in for shift, blue uniforms, morning atmosphere, industrial entrance area, documentary style', score: 1 },
  ];

  const lower = text.toLowerCase();
  // 按匹配分数排序，同分按关键词长度降序（更具体优先）
  const matched = keywordMap
    .filter(kw => kw.cn.some(c => lower.includes(c)))
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      const aLen = Math.max(...a.cn.map(c => c.length));
      const bLen = Math.max(...b.cn.map(c => c.length));
      return bLen - aLen;
    });
  
  const prompts = [];
  for (let i = 0; i < count; i++) {
    if (matched.length > 0) {
      prompts.push(matched[i % matched.length].en);
    } else {
      const generics = [
        'realistic documentary photo, modern chinese factory workshop, workers in blue uniforms operating machines, clean industrial environment, natural fluorescent lighting, photorealistic, no effects',
        'realistic documentary photo, factory production line, workers assembling products at workstations, organized workspace, bright clean atmosphere, candid documentary style',
        'realistic documentary photo, chinese manufacturing plant interior, conveyor belt system, workers in safety gear, quality inspection station, natural industrial lighting',
        'realistic documentary photo, factory workers focused at individual workstations, precision assembly tasks, blue collar manufacturing, clean floor, professional environment',
        'realistic documentary photo, modern industrial factory exterior, guangdong province manufacturing facility, clear sky, company entrance with signage, architecture photography',
      ];
      prompts.push(generics[i % generics.length]);
    }
  }
  return prompts.slice(0, count);
}

module.exports = { generateImages };
