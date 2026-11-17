import { orderService } from './orderService';
import { productService } from './productService';
import { apiRequest } from './api';

export async function loadStoreOverview() {
  const requests = [
    ['Đơn gần đây', () => orderService.getAllOrders({ page: 1, limit: 50 })],
    ['Đơn chờ xác nhận', () => orderService.getAllOrders({ page: 1, limit: 6, status: 'PENDING' })],
    ['Đơn đang giao', () => orderService.getAllOrders({ page: 1, limit: 6, status: 'SHIPPED' })],
    ['Sản phẩm', () => productService.getAdminProducts({ page: 1, limit: 4 })],
    ['Danh mục', async () => {
      const categories = await apiRequest('/categories');
      if (!Array.isArray(categories)) throw new Error('Dữ liệu danh mục không hợp lệ');
      return categories;
    }],
  ];
  const results = await Promise.allSettled(requests.map(([, request]) => request()));
  const values = results.map((result) => result.status === 'fulfilled' ? result.value : null);
  return {
    recent: values[0], pending: values[1], shipping: values[2], products: values[3], categories: values[4],
    errors: results.flatMap((result, index) => result.status === 'rejected' ? [requests[index][0]] : []),
    updatedAt: new Date().toISOString(),
  };
}
