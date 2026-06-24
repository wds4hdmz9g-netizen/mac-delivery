/**
 * 一码一机联网验证模块
 * 用于AI口播助手和矩阵内容工厂
 * 
 * 使用方法：
 *   const { verifyOnline, getMachineId } = require('./online_activation');
 *   const result = await verifyOnline(activationCode, 'lipsync'); // or 'matrix'
 *   // result.status: 'activated' | 'valid' | 'rejected' | 'network_error'
 */

const crypto = require('crypto');
const os = require('os');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// ===== 配置（部署时替换） =====
const SUPABASE_URL = 'https://osdjbindqynacswyeqji.supabase.co';
const SUPABASE_KEY = 'sb_publishable_xR3c64MLZPbOl1hPieq2yg_kig7tH8k';

/**
 * 获取机器唯一ID（跨平台）
 */
function getMachineId() {
  try {
    if (process.platform === 'win32') {
      // Windows: 读取主板UUID
      const output = execSync('wmic csproduct get uuid', {
        encoding: 'utf8',
        windowsHide: true,
        timeout: 5000
      });
      const lines = output.split('\n').map(l => l.trim()).filter(l => l && l !== 'UUID');
      if (lines[0] && lines[0].length > 10) {
        return lines[0];
      }
    } else if (process.platform === 'darwin') {
      // macOS: 读取IOPlatformUUID
      const output = execSync(
        "ioreg -rd1 -c IOPlatformExpertDevice | grep IOPlatformUUID",
        { encoding: 'utf8', timeout: 5000 }
      );
      const match = output.match(/"IOPlatformUUID"\s*=\s*"([^"]+)"/);
      if (match && match[1]) {
        return match[1];
      }
    }
  } catch (e) {
    // ignore
  }

  // 兜底方案：MAC地址 + 主机名 的哈希
  try {
    const interfaces = os.networkInterfaces();
    let mac = '';
    for (const iface of Object.values(interfaces)) {
      for (const info of iface) {
        if (!info.internal && info.mac && info.mac !== '00:00:00:00:00:00') {
          mac = info.mac;
          break;
        }
      }
      if (mac) break;
    }
    const raw = mac + '|' + os.hostname() + '|' + os.cpus()[0]?.model;
    return crypto.createHash('sha256').update(raw).digest('hex').slice(0, 36).toUpperCase();
  } catch (e) {
    return 'UNKNOWN-' + Date.now();
  }
}

/**
 * 发送HTTPS请求（不依赖axios，纯原生）
 */
function httpsPost(url, data, headers) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const options = {
      hostname: parsed.hostname,
      port: parsed.port || 443,
      path: parsed.pathname + parsed.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      timeout: 15000
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('timeout')); });
    req.write(JSON.stringify(data));
    req.end();
  });
}

/**
 * 联网验证激活码
 * @param {string} activationCode - 用户输入的激活码原文
 * @param {string} product - 产品标识：'lipsync' 或 'matrix'
 * @returns {object} { status, message }
 *   status: 'activated' | 'valid' | 'rejected' | 'network_error'
 */
async function verifyOnline(activationCode, product) {
  const machineId = getMachineId();
  const codeHash = crypto.createHash('sha256').update(activationCode.trim()).digest('hex');
  const deviceInfo = `${process.platform}_${os.hostname()}_${os.arch()}`;

  try {
    const result = await httpsPost(
      `${SUPABASE_URL}/rest/v1/rpc/verify_activation`,
      {
        p_code_hash: codeHash,
        p_machine_id: machineId,
        p_product: product,
        p_device_info: deviceInfo
      },
      {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    );

    if (result.status === 200 && result.data) {
      return result.data;
    } else {
      console.error('[Activation] Server error:', result.status, result.data);
      return {
        status: 'network_error',
        message: '验证服务响应异常，请稍后重试'
      };
    }
  } catch (err) {
    console.error('[Activation] Network error:', err.message);
    return {
      status: 'network_error',
      message: '无法连接验证服务器，请检查网络连接后重试'
    };
  }
}

/**
 * 完整激活流程（本地哈希验证 + 联网绑定）
 * @param {string} activationCode - 用户输入的激活码
 * @param {string} product - 'lipsync' 或 'matrix'
 * @param {string[]} validHashes - 有效激活码的SHA256哈希列表
 * @param {string} activatedFile - .activated文件路径
 * @returns {object} { success, message }
 */
async function activate(activationCode, product, validHashes, activatedFile) {
  const code = activationCode.trim();
  if (!code) {
    return { success: false, message: '请输入激活码' };
  }

  // Step 1: 本地哈希验证（确认是有效激活码）
  const codeHash = crypto.createHash('sha256').update(code).digest('hex');
  if (!validHashes.includes(codeHash)) {
    return { success: false, message: '无效的激活码' };
  }

  // Step 2: 联网验证（一码一机绑定）
  const onlineResult = await verifyOnline(code, product);

  if (onlineResult.status === 'activated' || onlineResult.status === 'valid') {
    // 激活成功，写入本地标记
    try {
      fs.writeFileSync(activatedFile, '1');
    } catch (e) { /* ignore */ }
    return { success: true, message: onlineResult.message };
  } else if (onlineResult.status === 'rejected') {
    return { success: false, message: onlineResult.message };
  } else {
    // 网络错误 — 首次激活必须联网
    if (!fs.existsSync(activatedFile)) {
      return { success: false, message: '首次激活需要联网，请检查网络连接后重试' };
    }
    // 已激活过的允许离线使用
    return { success: true, message: '离线模式（上次验证有效）' };
  }
}

/**
 * 启动时验证（已激活的情况下）
 * 非阻塞，失败不影响使用
 */
async function startupVerify(activationCode, product) {
  if (!activationCode) return;
  try {
    const result = await verifyOnline(activationCode, product);
    if (result.status === 'rejected') {
      // 被管理员解绑了
      return { valid: false, message: result.message };
    }
    return { valid: true };
  } catch (e) {
    // 网络问题，不阻塞
    return { valid: true };
  }
}

module.exports = {
  getMachineId,
  verifyOnline,
  activate,
  startupVerify,
  SUPABASE_URL,
  SUPABASE_KEY
};
