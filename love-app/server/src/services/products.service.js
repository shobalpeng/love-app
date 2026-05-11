const db = require('../config/db');
const productModel = require('../models/product.model');
const purchaseRecordModel = require('../models/purchaseRecord.model');
const integralRecordModel = require('../models/integralRecord.model');
const notificationService = require('./notifications.service');

async function getFrozenBalance(userId) {
  const rows = await db('purchase_records')
    .where({ buyer_id: userId }).whereIn('status', ['frozen', 'verified'])
    .sum('points_frozen as total')
    .first();
  return Number(rows.total) || 0;
}

const ProductsService = {
  async create({ publisherId, boundPairId, name, description, imageUrls, price, deadline }) {
    return productModel.create({ publisherId, boundPairId, name, description, imageUrls, price, deadline });
  },

  async getList(boundPairId, search, status, page, pageSize) {
    return productModel.findAll(boundPairId, search, status, page, pageSize);
  },

  async getDetail(productId, userId) {
    const product = await productModel.findById(productId);
    if (!product) {
      const err = new Error('商品不存在');
      err.status = 404;
      throw err;
    }
    // 返回该商品最新的购买记录（双方都可见流转记录）
    const records = await purchaseRecordModel.findByProductId(productId);
    product.purchase_record = records.length > 0 ? records[0] : null;
    // 同时返回当前用户的购买记录用于操作判断
    if (userId) {
      const myRecord = records.find(r => r.buyer_id === userId);
      product.my_purchase = myRecord || null;
    }
    return product;
  },

  async purchase({ productId, buyerId }) {
    const product = await productModel.findById(productId);
    if (!product) {
      const err = new Error('商品不存在');
      err.status = 404;
      throw err;
    }
    if (product.publisher_id === buyerId) {
      const err = new Error('不能购买自己发布的商品');
      err.status = 400;
      throw err;
    }
    if (product.status !== 'available') {
      const err = new Error('商品已不可购买');
      err.status = 400;
      throw err;
    }

    const existing = await purchaseRecordModel.findByProductAndBuyer(productId, buyerId);
    if (existing) {
      const err = new Error('你已经购买过该商品');
      err.status = 400;
      throw err;
    }

    const balance = await integralRecordModel.getBalance(buyerId);
    const frozen = await getFrozenBalance(buyerId);
    const available = balance - frozen;

    if (available < product.price) {
      const err = new Error('积分不足');
      err.status = 400;
      throw err;
    }

    const record = await purchaseRecordModel.create({
      productId,
      buyerId,
      pointsFrozen: product.price
    });

    await productModel.updateStatus(productId, 'purchased');

    await notificationService.create({
      userId: product.publisher_id,
      type: 'product_purchased',
      title: '商品被购买',
      content: `你的商品"${product.name}"已被购买，请核销`,
      referenceType: 'product',
      referenceId: product.id
    });

    return record;
  },

  async verify({ productId, publisherId }) {
    const product = await productModel.findById(productId);
    if (!product) {
      const err = new Error('商品不存在');
      err.status = 404;
      throw err;
    }
    if (product.publisher_id !== publisherId) {
      const err = new Error('只有发布者才能核销');
      err.status = 403;
      throw err;
    }
    if (product.status !== 'purchased') {
      const err = new Error('商品当前状态不可核销');
      err.status = 400;
      throw err;
    }

    const records = await purchaseRecordModel.findByProductId(productId);
    const pendingRecord = records.find(r => r.status === 'frozen');
    if (!pendingRecord) {
      const err = new Error('没有待核销的购买记录');
      err.status = 400;
      throw err;
    }

    await purchaseRecordModel.updateStatus(pendingRecord.id, 'verified');
    await productModel.updateStatus(productId, 'verified');

    await notificationService.create({
      userId: pendingRecord.buyer_id,
      type: 'product_verified',
      title: '商品已核销',
      content: `"${product.name}"已核销，请确认收货`,
      referenceType: 'product',
      referenceId: product.id
    });

    return { status: 'verified' };
  },

  async confirm({ productId, buyerId }) {
    const product = await productModel.findById(productId);
    if (!product) {
      const err = new Error('商品不存在');
      err.status = 404;
      throw err;
    }
    if (product.status !== 'verified') {
      const err = new Error('商品当前状态不可确认收货');
      err.status = 400;
      throw err;
    }

    const record = await purchaseRecordModel.findByProductAndBuyer(productId, buyerId);
    if (!record || record.status !== 'verified') {
      const err = new Error('没有待确认的购买记录');
      err.status = 400;
      throw err;
    }

    await purchaseRecordModel.updateStatus(record.id, 'confirmed');
    await productModel.updateStatus(productId, 'used');

    const balance = await integralRecordModel.getBalance(buyerId);
    const newBalance = balance - record.points_frozen;
    await integralRecordModel.create({
      userId: buyerId,
      amount: -record.points_frozen,
      type: 'product_purchase',
      referenceId: product.id,
      balanceAfter: newBalance,
      description: `兑换商品：${product.name}`
    });

    await notificationService.create({
      userId: product.publisher_id,
      type: 'product_confirmed',
      title: '商品已确认收货',
      content: `"${product.name}"已被确认收货，积分已到账`,
      referenceType: 'product',
      referenceId: product.id
    });

    return { status: 'used' };
  },

  async extend({ productId, publisherId, newDeadline }) {
    const product = await productModel.findById(productId);
    if (!product) {
      const err = new Error('商品不存在');
      err.status = 404;
      throw err;
    }
    if (product.publisher_id !== publisherId) {
      const err = new Error('只有发布者才能续期');
      err.status = 403;
      throw err;
    }

    await productModel.update(productId, { deadline: newDeadline, extended_at: db.fn.now() });
    return { status: 'extended' };
  },

  async expire({ productId, publisherId }) {
    const product = await productModel.findById(productId);
    if (!product) {
      const err = new Error('商品不存在');
      err.status = 404;
      throw err;
    }
    if (product.publisher_id !== publisherId) {
      const err = new Error('只有发布者才能标记超时');
      err.status = 403;
      throw err;
    }
    if (!['purchased', 'verified'].includes(product.status)) {
      const err = new Error('只有已购买或已核销的商品才能标记超时');
      err.status = 400;
      throw err;
    }

    await productModel.updateStatus(productId, 'expired');

    const records = await purchaseRecordModel.findByProductId(productId);
    for (const record of records) {
      if (record.status === 'frozen' || record.status === 'verified') {
        await purchaseRecordModel.updateStatus(record.id, 'expired');

        await notificationService.create({
          userId: record.buyer_id,
          type: 'product_expired',
          title: '商品已过期',
          content: `商品"${product.name}"已过期，冻结积分 ${record.points_frozen} 已解冻`,
          referenceType: 'product',
          referenceId: product.id
        });
      }
    }

    return { status: 'expired' };
  },

  async update({ productId, publisherId, name, description, imageUrls, price, deadline }) {
    const product = await productModel.findById(productId);
    if (!product) { const err = new Error('商品不存在'); err.status = 404; throw err; }
    if (product.publisher_id !== publisherId) { const err = new Error('只有发布者才能编辑'); err.status = 403; throw err; }
    if (product.status !== 'available') { const err = new Error('只有可兑换状态的商品才能编辑'); err.status = 400; throw err; }
    const data = { name, description, price };
    if (imageUrls !== undefined) data.image_urls = imageUrls.length ? JSON.stringify(imageUrls) : null;
    return productModel.update(productId, data);
  },

  async delete({ productId, publisherId }) {
    const product = await productModel.findById(productId);
    if (!product) { const err = new Error('商品不存在'); err.status = 404; throw err; }
    if (product.publisher_id !== publisherId) { const err = new Error('只有发布者才能删除'); err.status = 403; throw err; }
    if (product.status !== 'available') { const err = new Error('只有可兑换状态的商品才能删除'); err.status = 400; throw err; }
    return productModel.deleteById(productId);
  }
};

module.exports = ProductsService;
