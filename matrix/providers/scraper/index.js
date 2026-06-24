/**
 * Scraper Provider 工厂
 */
const ManualScraper = require('./manual');
const EnhancedScraper = require('./enhanced');
const CyanlisScraper = require('./cyanlis');
const MoarkScraper = require('./moark');

function createScraper(config) {
  const activeName = config.active;
  const providerConfig = config.providers[activeName] || {};

  console.log(`[Scraper] 激活: ${activeName}`);

  switch (activeName) {
    case 'moark':
      return new MoarkScraper({...providerConfig, active: activeName});
    case 'enhanced':
    case 'manual':
      return new EnhancedScraper(providerConfig);
    case 'cyanlis':
      return new CyanlisScraper(providerConfig);
    case 'mock':
      return new EnhancedScraper({});
    default:
      return new EnhancedScraper({});
  }
}

module.exports = { createScraper };
