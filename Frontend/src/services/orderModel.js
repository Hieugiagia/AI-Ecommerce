export const ORDER_STATUSES = {
  PENDING: 'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  PROCESSING: 'Đang đóng gói',
  SHIPPED: 'Đang giao hàng',
  DELIVERED: 'Đã giao hàng',
  CANCELLED: 'Đã hủy',
};
export const PAYMENT_STATUSES = {
  PENDING: 'Chờ thanh toán', SUCCESS: 'Đã thanh toán',
  FAILED: 'Thất bại', REFUNDED: 'Đã hoàn tiền', CANCELLED: 'Đã hủy',
};
export const PAYMENT_METHODS = { COD: 'Thanh toán khi nhận hàng (COD)', VNPAY: 'VNPay', MOMO: 'MoMo', BANK_TRANSFER: 'Chuyển khoản' };

function amount(value, nullable = false) {
  if (nullable && value == null) return null;
  if (value == null || value === '' || !Number.isFinite(Number(value)) || Number(value) < 0) {
    throw new Error('Dữ liệu số tiền đơn hàng không hợp lệ.');
  }
  return Number(value);
}

export function normalizeOrder(data) {
  if (!data || !Number.isInteger(data.id) || data.id < 1 || typeof data.orderCode !== 'string'
      || !data.orderCode || !Object.hasOwn(ORDER_STATUSES, data.status) || !Array.isArray(data.items)) {
    throw new Error('Dữ liệu đơn hàng không hợp lệ.');
  }
  return {
    ...data,
    total: amount(data.total),
    subtotal: amount(data.subtotal, true),
    shippingFee: amount(data.shippingFee, true),
    canCancel: data.canCancel === true && data.status === 'PENDING'
      && data.paymentMethod === 'COD' && data.paymentStatus === 'PENDING',
    items: data.items.map((item) => {
      if (!Number.isInteger(item.productId) || !Number.isInteger(item.quantity) || item.quantity < 1 || typeof item.name !== 'string') {
        throw new Error('Chi tiết sản phẩm trong đơn không hợp lệ.');
      }
      return { ...item, price: amount(item.price), lineTotal: amount(item.lineTotal) };
    }),
  };
}

export function normalizeOrderList(data) {
  if (!data || !Array.isArray(data.orders) || !Number.isInteger(data.total) || data.total < 0
      || !Number.isInteger(data.page) || data.page < 1 || !Number.isInteger(data.limit) || data.limit < 1
      || !Number.isInteger(data.totalPages) || data.totalPages < 0) {
    throw new Error('Danh sách đơn hàng không hợp lệ.');
  }
  return { ...data, orders: data.orders.map(normalizeOrder) };
}

export function orderListQuery({ page = 1, limit = 10, status = 'all' } = {}) {
  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 50
      || (status !== 'all' && !Object.hasOwn(ORDER_STATUSES, status))) {
    throw new Error('Bộ lọc đơn hàng không hợp lệ.');
  }
  const query = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (status !== 'all') query.set('status', status);
  return query.toString();
}

export function cancellationReason(reason) {
  const value = String(reason ?? '').trim();
  if (!value || value.length > 500) throw new Error('Lý do hủy phải từ 1 đến 500 ký tự.');
  return value;
}
