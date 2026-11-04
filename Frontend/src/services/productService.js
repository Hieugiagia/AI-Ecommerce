import { apiRequest } from './api';


/**
 * Hàm chuẩn hóa đối tượng Sản phẩm nhận về từ PostgreSQL Backend:
 * - Đảm bảo cả thumbnailUrl và image đều có giá trị (tương thích 100% với UI)
 * - Chuyển đổi price và stock thành kiểu số (Number)
 * - Tự động thiết lập gallery, slug, status và categoryId
 */
export function normalizeProduct(p) {
  if (!p) return null;
  const image =
    p.thumbnailUrl ||
    p.thumbnail_url ||
    p.image ||
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500';

  const price = typeof p.price === 'string' ? parseFloat(p.price) : Number(p.price) || 0;
  const originalPrice = p.originalPrice
    ? (typeof p.originalPrice === 'string' ? parseFloat(p.originalPrice) : Number(p.originalPrice))
    : (price > 0 ? Math.round(price * 1.1) : 0);

  return {
    ...p,
    id: p.id,
    name: p.name || 'Sản phẩm công nghệ',
    slug: p.slug || (p.id ? `sp-${p.id}` : 'san-pham'),
    description: p.description || '',
    price,
    originalPrice,
    stock: p.stock !== undefined ? Number(p.stock) : 0,
    version: p.version !== undefined ? Number(p.version) : 0,
    thumbnailUrl: p.thumbnailUrl ?? p.thumbnail_url ?? p.image ?? '',
    image, // Hỗ trợ UI cũ truy cập .image
    gallery: Array.isArray(p.gallery) && p.gallery.length > 0 ? p.gallery : [image],
    status: p.status || 'PUBLISHED',
    categoryId: p.categoryId || p.category_id || null,
    category: p.categorySlug || p.category || (p.categoryId ? String(p.categoryId) : 'dien-thoai'),
    brand: p.brand || (p.name?.toLowerCase().includes('iphone') || p.name?.toLowerCase().includes('macbook') ? 'Apple' : (p.name?.toLowerCase().includes('galaxy') ? 'Samsung' : 'Chính Hãng')),
    createdAt: p.createdAt || p.created_at,
  };
}

/**
 * Product Service
 * Khớp chuẩn 100% với PostgreSQL Database & Spring Boot Controller:
 * Bảng products:
 * - id: Long (PK)
 * - category_id: Long (FK -> categories.id)
 * - name: String (NOT NULL)
 * - slug: String (UNIQUE)
 * - description: Text
 * - price: BigDecimal / Number (NOT NULL)
 * - stock: Integer (NOT NULL)
 * - version: Long (Optimistic Locking)
 * - thumbnail_url: String (thumbnailUrl)
 * - status: Enum (DRAFT, PUBLISHED, OUT_OF_STOCK, ARCHIVED)
 *
 * Endpoints:
 * - GET    /api/products           : Danh sách sản phẩm (hỗ trợ q, category, brand, minPrice, maxPrice, page, limit, sort)
 * - GET    /api/products/{idOrSlug}: Chi tiết 1 sản phẩm
 * - POST   /api/products           : Tạo mới sản phẩm
 * - PUT    /api/products/{id}      : Cập nhật sản phẩm
 * - DELETE /api/products/{id}      : Xóa sản phẩm
 */

export const productService = {
  /**
   * Lấy danh sách sản phẩm với bộ lọc & phân trang
   * GET /api/products
   * @param {Object} params - { q, search, category, brand, minPrice, maxPrice, page, limit, sort }
   * @returns {Promise<{ products: Array, total: number }>}
   */
  async getProducts(params = {}) {
    const query = new URLSearchParams();
    const searchTerm = params.q || params.search;
    if (searchTerm) query.append('q', searchTerm);
    if (params.category && params.category !== 'all') query.append('category', params.category);
    if (params.brand && params.brand !== 'all') query.append('brand', params.brand);
    if (params.minPrice !== undefined) query.append('minPrice', params.minPrice);
    if (params.maxPrice !== undefined) query.append('maxPrice', params.maxPrice);
    if (params.page !== undefined) query.append('page', params.page);
    if (params.limit !== undefined) query.append('limit', params.limit);
    if (params.sort) query.append('sort', params.sort);

    const queryString = query.toString();
    const endpoint = `/products${queryString ? `?${queryString}` : ''}`;

    const data = await apiRequest(endpoint, { method: 'GET' });
    if (!Array.isArray(data?.products)) {
      throw new Error('Dữ liệu danh sách sản phẩm không hợp lệ');
    }
    return { products: data.products.map(normalizeProduct), total: data.total };
  },

  async getAdminProducts(params = {}) {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== '' && value !== 'all') {
        query.set(key, value);
      }
    }
    const data = await apiRequest(`/admin/products?${query}`);
    if (!Array.isArray(data?.products)) {
      throw new Error('Dữ liệu danh sách sản phẩm không hợp lệ');
    }
    return { products: data.products.map(normalizeProduct), total: data.total };
  },

  async getAdminProductById(id) {
    const data = await apiRequest(`/admin/products/${id}`);
    return normalizeProduct(data.product);
  },

  /**
   * Xem chi tiết sản phẩm theo ID hoặc Slug
   * GET /api/products/{idOrSlug}
   * @param {string|number} idOrSlug
   */
  async getProductById(idOrSlug) {
    try {
      const data = await apiRequest(`/products/${idOrSlug}`, { method: 'GET' });
      return normalizeProduct(data.product);
    } catch (error) {
      if (error.status === 404) return null;
      throw error;
    }
  },

  /**
   * Thêm mới sản phẩm (Dành cho Admin)
   * POST /api/products
   * @param {Object} productData
   */
  async createProduct(productData) {
    const data = await apiRequest('/products', {
      method: 'POST',
      body: productPayload(productData),
    });
    return normalizeProduct(data);
  },

  /**
   * Cập nhật thông tin sản phẩm, giá, tồn kho
   * PUT /api/products/{id}
   * @param {string|number} id
   * @param {Object} productData
   */
  async updateProduct(id, productData) {
    const data = await apiRequest(`/products/${id}`, {
      method: 'PUT',
      body: { ...productPayload(productData), version: productData.version },
    });
    return normalizeProduct(data);
  },

  /**
   * Xóa sản phẩm khỏi kho
   * DELETE /api/products/{id}
   * @param {string|number} id
   */
  async deleteProduct(id) {
    return await apiRequest(`/products/${id}`, {
      method: 'DELETE',
    });
  },
};

export default productService;

function productPayload(product) {
  return {
    name: product.name.trim(),
    slug: product.slug,
    description: product.description || '',
    price: Number(product.price),
    stock: Number(product.stock),
    categoryId: Number(product.categoryId),
    thumbnailUrl: product.thumbnailUrl ?? '',
    status: product.status,
  };
}
