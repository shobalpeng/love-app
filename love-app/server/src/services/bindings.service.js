const userModel = require('../models/user.model');
const bindingModel = require('../models/binding.model');
const bindRequestModel = require('../models/bindRequest.model');
const notificationService = require('./notifications.service');

const BindingsService = {
  async sendRequest(fromUserId, toUsername) {
    const toUser = await userModel.findByUsername(toUsername);
    if (!toUser) {
      const err = new Error('用户不存在');
      err.status = 404;
      throw err;
    }
    if (toUser.id === fromUserId) {
      const err = new Error('不能与自己绑定');
      err.status = 400;
      throw err;
    }

    const existingBinding = await bindingModel.findActiveByUserId(fromUserId);
    if (existingBinding) {
      const err = new Error('你已有活跃绑定关系，请先解除');
      err.status = 400;
      throw err;
    }

    const targetBinding = await bindingModel.findActiveByUserId(toUser.id);
    if (targetBinding) {
      const err = new Error('对方已有活跃绑定关系');
      err.status = 400;
      throw err;
    }

    const pending = await bindRequestModel.findPendingBetween(fromUserId, toUser.id);
    if (pending) {
      const err = new Error('已有一个待处理的绑定申请');
      err.status = 400;
      throw err;
    }

    const request = await bindRequestModel.create(fromUserId, toUser.id);

    await notificationService.create({
      userId: toUser.id,
      type: 'bind_request',
      title: '收到绑定申请',
      content: '有用户向你发起了绑定申请',
      referenceType: 'bind_request',
      referenceId: request.id
    });

    return request;
  },

  async getRequests(userId) {
    return bindRequestModel.findPendingByToUser(userId);
  },

  async acceptRequest(userId, requestId) {
    const request = await bindRequestModel.findById(requestId);
    if (!request || request.to_user_id !== userId) {
      const err = new Error('申请不存在');
      err.status = 404;
      throw err;
    }
    if (request.status !== 'pending') {
      const err = new Error('申请已被处理');
      err.status = 400;
      throw err;
    }

    const myBinding = await bindingModel.findActiveByUserId(userId);
    if (myBinding) {
      const err = new Error('你已有活跃绑定关系');
      err.status = 400;
      throw err;
    }
    const theirBinding = await bindingModel.findActiveByUserId(request.from_user_id);
    if (theirBinding) {
      const err = new Error('对方已有活跃绑定关系');
      err.status = 400;
      throw err;
    }

    await bindRequestModel.updateStatus(requestId, 'accepted');

    let binding;
    const oldBinding = await bindingModel.findInactiveByUserPair(userId, request.from_user_id);
    if (oldBinding) {
      await bindingModel.reactivate(oldBinding.id);
      binding = { ...oldBinding, status: 'active' };
    } else {
      binding = await bindingModel.create(userId, request.from_user_id);
    }

    await notificationService.create({
      userId: request.from_user_id,
      type: 'bind_accepted',
      title: '绑定申请已通过',
      content: '对方同意了你的绑定申请',
      referenceType: 'binding',
      referenceId: binding.id
    });

    return binding;
  },

  async rejectRequest(userId, requestId) {
    const request = await bindRequestModel.findById(requestId);
    if (!request || request.to_user_id !== userId) {
      const err = new Error('申请不存在');
      err.status = 404;
      throw err;
    }
    if (request.status !== 'pending') {
      const err = new Error('申请已被处理');
      err.status = 400;
      throw err;
    }

    await bindRequestModel.updateStatus(requestId, 'rejected');

    await notificationService.create({
      userId: request.from_user_id,
      type: 'bind_rejected',
      title: '绑定申请被拒绝',
      content: '对方拒绝了你的绑定申请'
    });

    return { status: 'rejected' };
  },

  async unbind(userId) {
    const binding = await bindingModel.findActiveByUserId(userId);
    if (!binding) {
      const err = new Error('当前无活跃绑定关系');
      err.status = 400;
      throw err;
    }

    await bindingModel.deactivate(binding.id);

    const partnerId = binding.user_id_1 === userId ? binding.user_id_2 : binding.user_id_1;

    await notificationService.create({
      userId: partnerId,
      type: 'bind_unbound',
      title: '对方已解除绑定',
      content: '你的伴侣解除了绑定关系'
    });

    return { status: 'unbound' };
  },

  async getStatus(userId) {
    const binding = await bindingModel.findActiveByUserId(userId);
    if (!binding) {
      return { bound: false, partner: null };
    }

    const partnerId = binding.user_id_1 === userId ? binding.user_id_2 : binding.user_id_1;
    const partner = await userModel.findById(partnerId);

    return {
      bound: true,
      bindingId: binding.id,
      boundAt: binding.bound_at,
      partner: partner ? { id: partner.id, username: partner.username, avatar_url: partner.avatar_url } : null
    };
  }
};

module.exports = BindingsService;
