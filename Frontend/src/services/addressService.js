import { apiRequest } from './api';
import { addressPayload, normalizeAddress, normalizeAddresses } from './addressModel.js';
export const addressService = {
  async list() { return normalizeAddresses(await apiRequest('/addresses')); },
  async save(id, form) {
    const row = normalizeAddress(await apiRequest('/addresses' + (id ? '/' + id : ''), {
      method: id ? 'PUT' : 'POST', body: addressPayload(form),
    }));
    if (id && row.id !== id) throw new Error('Máy chủ chưa xác nhận đúng địa chỉ.');
    return row;
  },
  async makeDefault(id) {
    const row = normalizeAddress(await apiRequest('/addresses/' + id + '/default', { method: 'PATCH' }));
    if (row.id !== id || !row.isDefault) throw new Error('Máy chủ chưa xác nhận địa chỉ mặc định.');
    return row;
  },
  async remove(id) { await apiRequest('/addresses/' + id, { method: 'DELETE' }); },
};
