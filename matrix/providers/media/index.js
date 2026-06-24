/**
 * Media Provider 工厂
 */

const LocalMediaProvider = require('./local');

function createMediaProvider(config) {
  const activeName = config.active;
  const providerConfig = config.providers[activeName];

  if (!providerConfig) {
    throw new Error(`未知的素材源: "${activeName}"`);
  }

  console.log(`[Media] 激活: ${activeName}`);

  switch (activeName) {
    case 'local':
      return new LocalMediaProvider(providerConfig);
    case 'pexels':
      console.log('[Media] Pexels 待实现，使用空素材');
      return new LocalMediaProvider({ basePath: './media_library', categories: {} });
    case 'pixabay':
      console.log('[Media] Pixabay 待实现，使用空素材');
      return new LocalMediaProvider({ basePath: './media_library', categories: {} });
    case 'mock':
      return new LocalMediaProvider({ basePath: './media_library', categories: {} });
    default:
      throw new Error(`素材源 "${activeName}" 尚未实现`);
  }
}

module.exports = { createMediaProvider };
