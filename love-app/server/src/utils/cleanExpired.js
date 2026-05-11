const cron = require('node-cron');
const productModel = require('../models/product.model');
const anniversariesService = require('../services/anniversaries.service');
const notificationService = require('../services/notifications.service');

function startCleanExpiredJob() {
  cron.schedule('0 3 * * *', async () => {
    console.log('[CRON] 扫描超时商品...');
    try {
      const expiredProducts = await productModel.findExpired();
      for (const product of expiredProducts) {
        await notificationService.create({
          userId: product.publisher_id,
          type: 'product_expiring',
          title: '商品即将超时',
          content: `你的商品"${product.name}"已超过截止时间，请选择续期或标记超时`,
          referenceType: 'product',
          referenceId: product.id
        });
      }
      console.log(`[CRON] 发现 ${expiredProducts.length} 个超时商品，已发送通知`);
    } catch (err) {
      console.error('[CRON] 扫描超时商品失败:', err.message);
    }
  });
}

function startAnniversaryReminderJob() {
  cron.schedule('0 8 * * *', async () => {
    console.log('[CRON] 检查纪念日提醒...');
    try {
      await anniversariesService.checkUpcoming(notificationService);
      console.log('[CRON] 纪念日提醒检查完成');
    } catch (err) {
      console.error('[CRON] 纪念日提醒检查失败:', err.message);
    }
  });
}

module.exports = { startCleanExpiredJob, startAnniversaryReminderJob };
