const db = require('../config/db');

const TaskSubmission = {
  async create({ taskId, submitterId, content, imageUrls }) {
    const [row] = await db('task_submissions')
      .insert({
        task_id: taskId,
        submitter_id: submitterId,
        content: content || null,
        image_urls: imageUrls ? JSON.stringify(imageUrls) : null
      })
      .returning('*');
    return row;
  },

  async findByTaskId(taskId) {
    return db('task_submissions')
      .join('users', 'task_submissions.submitter_id', 'users.id')
      .where('task_submissions.task_id', taskId)
      .select('task_submissions.*', 'users.username as submitter_name')
      .orderBy('task_submissions.submitted_at', 'desc');
  },

  async findLatestPending(taskId) {
    return db('task_submissions')
      .where({ task_id: taskId, status: 'pending' })
      .orderBy('submitted_at', 'desc')
      .first();
  },

  async updateStatus(id, status, reviewComment) {
    const updateData = { status, reviewed_at: db.fn.now() };
    if (reviewComment !== undefined) updateData.review_comment = reviewComment;
    return db('task_submissions').where({ id }).update(updateData);
  }
};

module.exports = TaskSubmission;
