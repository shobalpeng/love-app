const anniversaryModel = require('../models/anniversary.model');

const AnniversariesService = {
  async create({ name, date, boundPairId }) {
    return anniversaryModel.create({ name, date, boundPairId });
  },

  async getList(boundPairId) {
    return anniversaryModel.findByBoundPairId(boundPairId);
  },

  async delete({ id, boundPairId }) {
    const item = await anniversaryModel.findById(id);
    if (!item) {
      const err = new Error('事件不存在');
      err.status = 404;
      throw err;
    }
    if (item.bound_pair_id !== boundPairId) {
      const err = new Error('无权删除');
      err.status = 403;
      throw err;
    }
    return anniversaryModel.deleteById(id);
  },

  async togglePin({ id, boundPairId }) {
    const item = await anniversaryModel.findById(id);
    if (!item) {
      const err = new Error('事件不存在');
      err.status = 404;
      throw err;
    }
    if (item.bound_pair_id !== boundPairId) {
      const err = new Error('无权操作');
      err.status = 403;
      throw err;
    }
    return anniversaryModel.updatePin(id, !item.is_pinned);
  },

  // 检查即将到来的纪念日（未来5天内），发送提醒
  async checkUpcoming(notificationService) {
    const all = await anniversaryModel.findAll();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const anni of all) {
      const d = new Date(anni.date);
      // 计算今年的纪念日日期
      const thisYear = new Date(today.getFullYear(), d.getMonth(), d.getDate());
      thisYear.setHours(0, 0, 0, 0);

      // 如果今年的已经过了，跳过
      if (thisYear < today) continue;

      const diffDays = Math.floor((thisYear.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      // 在未来5天内
      if (diffDays >= 1 && diffDays <= 5) {
        // 查找该纪念日所属的绑定对中的两个用户
        const db = require('../config/db');
        const binding = await db('bindings').where('id', anni.bound_pair_id).first();
        if (!binding) continue;

        const content = `"${anni.name}"还有 ${diffDays} 天就是纪念日了！`;
        const title = '纪念日提醒';

        for (const userId of [binding.user_id_1, binding.user_id_2]) {
          // 检查今天是否已经发送过提醒
          const existing = await db('notifications')
            .where({
              user_id: userId,
              type: 'anniversary_reminder',
              reference_type: 'anniversary',
              reference_id: anni.id
            })
            .whereRaw('created_at::date = CURRENT_DATE')
            .first();

          if (!existing) {
            await notificationService.create({
              userId,
              type: 'anniversary_reminder',
              title,
              content,
              referenceType: 'anniversary',
              referenceId: anni.id
            });
          }
        }
      }
    }
  }
};

module.exports = AnniversariesService;
