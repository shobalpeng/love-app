module.exports = {
  bind_request: (id) => `/binding`,
  bind_accepted: (_id) => `/binding`,
  bind_rejected: (_id) => `/binding`,
  bind_unbound: (_id) => `/binding`,
  task_new: (id) => `/tasks/${id}`,
  task_approved: (id) => `/tasks/${id}`,
  task_rejected: (id) => `/tasks/${id}`,
  product_purchased: (id) => `/products/${id}`,
  product_verified: (id) => `/products/${id}`,
  product_expiring: (id) => `/products/${id}`,
  product_refund: (id) => `/products/${id}`
};
