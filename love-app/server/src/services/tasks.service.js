const taskModel = require('../models/task.model');
const taskSubmissionModel = require('../models/taskSubmission.model');
const integralRecordModel = require('../models/integralRecord.model');
const notificationService = require('./notifications.service');

const TasksService = {
  async create({ publisherId, assignedToId, boundPairId, title, description, imageUrls, points, deadline }) {
    const task = await taskModel.create({ publisherId, assignedToId, boundPairId, title, description, imageUrls, points, deadline });

    await notificationService.create({
      userId: assignedToId,
      type: 'task_new',
      title: '新任务',
      content: `你的伴侣发布了一个新任务：${title}`,
      referenceType: 'task',
      referenceId: task.id
    });

    return task;
  },

  async getList(userId, boundPairId, filter, search, status, page, pageSize) {
    return taskModel.findByUserId(userId, boundPairId, filter, search, status, page, pageSize);
  },

  async getDetail(taskId) {
    const task = await taskModel.findById(taskId);
    if (!task) {
      const err = new Error('任务不存在');
      err.status = 404;
      throw err;
    }
    const submissions = await taskSubmissionModel.findByTaskId(taskId);
    return { ...task, submissions };
  },

  async submit({ taskId, submitterId, content, imageUrls }) {
    const task = await taskModel.findById(taskId);
    if (!task) {
      const err = new Error('任务不存在');
      err.status = 404;
      throw err;
    }
    if (task.assigned_to_id !== submitterId) {
      const err = new Error('只有被指派者才能提交任务');
      err.status = 403;
      throw err;
    }
    if (task.status !== 'pending') {
      const err = new Error('任务当前状态不可提交');
      err.status = 400;
      throw err;
    }

    const submission = await taskSubmissionModel.create({ taskId, submitterId, content, imageUrls });
    await taskModel.updateStatus(taskId, 'submitted');

    await notificationService.create({
      userId: task.publisher_id,
      type: 'task_submitted',
      title: '任务待审核',
      content: `"${task.title}"已提交完成，请前往审核`,
      referenceType: 'task',
      referenceId: task.id
    });

    return submission;
  },

  async review({ taskId, reviewerId, status, comment }) {
    const task = await taskModel.findById(taskId);
    if (!task) {
      const err = new Error('任务不存在');
      err.status = 404;
      throw err;
    }
    if (task.publisher_id !== reviewerId) {
      const err = new Error('只有发布者才能审核');
      err.status = 403;
      throw err;
    }
    if (task.status !== 'submitted') {
      const err = new Error('任务当前状态不可审核');
      err.status = 400;
      throw err;
    }

    const submission = await taskSubmissionModel.findLatestPending(taskId);
    if (!submission) {
      const err = new Error('没有待审核的提交');
      err.status = 400;
      throw err;
    }

    if (status === 'approved') {
      await taskSubmissionModel.updateStatus(submission.id, 'approved', comment);
      await taskModel.updateStatus(taskId, 'approved');

      const balance = await integralRecordModel.getBalance(task.assigned_to_id);
      const newBalance = balance + task.points;
      await integralRecordModel.create({
        userId: task.assigned_to_id,
        amount: task.points,
        type: 'task_reward',
        referenceId: task.id,
        balanceAfter: newBalance,
        description: `完成任务：${task.title}`
      });

      await notificationService.create({
        userId: task.assigned_to_id,
        type: 'task_approved',
        title: '任务审核通过',
        content: `你的任务"${task.title}"审核通过，获得 ${task.points} 积分`,
        referenceType: 'task',
        referenceId: task.id
      });
    } else {
      await taskSubmissionModel.updateStatus(submission.id, 'rejected', comment);
      await taskModel.updateStatus(taskId, 'pending');

      await notificationService.create({
        userId: task.assigned_to_id,
        type: 'task_rejected',
        title: '任务审核未通过',
        content: comment ? `评语：${comment}` : '你的任务提交未通过审核，请修改后重新提交',
        referenceType: 'task',
        referenceId: task.id
      });
    }

    return { status };
  },

  async update({ taskId, publisherId, title, description, points, deadline }) {
    const task = await taskModel.findById(taskId);
    if (!task) { const err = new Error('任务不存在'); err.status = 404; throw err; }
    if (task.publisher_id !== publisherId) { const err = new Error('只有发布者才能编辑'); err.status = 403; throw err; }
    if (task.status !== 'pending') { const err = new Error('只有待完成状态的任务才能编辑'); err.status = 400; throw err; }
    const result = await taskModel.update(taskId, { title, description, points, deadline });

    await notificationService.create({
      userId: task.assigned_to_id,
      type: 'task_updated',
      title: '任务已修改',
      content: `"${task.title}"已被发布者修改，请查看最新内容`,
      referenceType: 'task',
      referenceId: taskId
    });

    return result;
  },

  async delete({ taskId, publisherId }) {
    const task = await taskModel.findById(taskId);
    if (!task) { const err = new Error('任务不存在'); err.status = 404; throw err; }
    if (task.publisher_id !== publisherId) { const err = new Error('只有发布者才能删除'); err.status = 403; throw err; }
    if (task.status !== 'pending') { const err = new Error('只有待完成状态的任务才能删除'); err.status = 400; throw err; }

    await notificationService.create({
      userId: task.assigned_to_id,
      type: 'task_deleted',
      title: '任务已删除',
      content: `"${task.title}"已被发布者删除`,
      referenceType: 'task',
      referenceId: taskId
    });

    return taskModel.deleteById(taskId);
  }
};

module.exports = TasksService;
