import { apiRequest } from './api';
import { PRODUCTS as INITIAL_PRODUCTS } from '../data/mockData';

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
    thumbnailUrl: image,
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
    if (params.minPrice) query.append('minPrice', params.minPrice);
    if (params.maxPrice) query.append('maxPrice', params.maxPrice);
    if (params.page !== undefined) query.append('page', params.page);
    if (params.limit !== undefined) query.append('limit', params.limit);
    if (params.sort) query.append('sort', params.sort);

    const queryString = query.toString();
    const endpoint = `/products${queryString ? `?${queryString}` : ''}`;

    try {
      const data = await apiRequest(endpoint, { method: 'GET' });
      let rawProducts = [];
      let total = 0;

      if (data && Array.isArray(data.products)) {
        rawProducts = data.products;
        total = data.total !== undefined ? data.total : data.products.length;
      } else if (Array.isArray(data)) {
        rawProducts = data;
        total = data.length;
      } else if (data && Array.isArray(data.data)) {
        rawProducts = data.data;
        total = data.total !== undefined ? data.total : data.data.length;
      }

      // Nếu Backend trả về kết quả
      if (rawProducts.length > 0) {
        return {
          products: rawProducts.map(normalizeProduct),
          total,
        };
      }

      // Nếu Backend trả về mảng rỗng hợp lệ (ví dụ không có sản phẩm nào khớp bộ lọc)
      if (data && (Array.isArray(data.products) || Array.isArray(data) || Array.isArray(data.data))) {
        return { products: [], total: 0 };
      }

      return {
        products: INITIAL_PRODUCTS.map(normalizeProduct),
        total: INITIAL_PRODUCTS.length,
      };
    } catch (err) {
      console.warn('Backend chưa sẵn sàng hoặc lỗi /api/products, sử dụng dữ liệu dự phòng:', err.message);

      // Fallback khi backend chưa chạy
      let filtered = [...INITIAL_PRODUCTS];
      if (searchTerm) {
        const qLower = searchTerm.toLowerCase();
        filtered = filtered.filter((p) => p.name.toLowerCase().includes(qLower));
      }
      if (params.category && params.category !== 'all') {
        filtered = filtered.filter((p) => p.category === params.category || String(p.categoryId) === String(params.category));
      }
      if (params.brand && params.brand !== 'all') {
        filtered = filtered.filter((p) => p.brand?.toLowerCase() === params.brand.toLowerCase());
      }
      return {
        products: filtered.map(normalizeProduct),
        total: filtered.length,
      };
    }
  },

  /**
   * Xem chi tiết sản phẩm theo ID hoặc Slug
   * GET /api/products/{idOrSlug}
   * @param {string|number} idOrSlug
   */
  async getProductById(idOrSlug) {
    try {
      const data = await apiRequest(`/products/${idOrSlug}`, { method: 'GET' });
      const raw = data?.product || data?.data || data;
      if (raw && (raw.id || raw.name)) {
        return normalizeProduct(raw);
      }
      throw new Error('Sản phẩm không tìm thấy trên server');
    } catch (err) {
      console.warn('Backend chưa sẵn sàng hoặc lỗi /api/products/{id}, tìm trong dự phòng:', err.message);
      const found = INITIAL_PRODUCTS.find(
        (p) => String(p.id) === String(idOrSlug) || p.slug === String(idOrSlug)
      );
      return found ? normalizeProduct(found) : null;
    }
  },

  /**
   * Thêm mới sản phẩm (Dành cho Admin)
   * POST /api/products
   * @param {Object} productData
   */
  async createProduct(productData) {
    const payload = {
      name: productData.name,
      slug: productData.slug || productData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: productData.description || '',
      price: typeof productData.price === 'string' ? parseFloat(productData.price) : Number(productData.price) || 0,
      stock: Number(productData.stock) || 0,
      categoryId: productData.categoryId || productData.category_id || null,
      thumbnailUrl: productData.thumbnailUrl || productData.image || '',
      status: productData.status || 'PUBLISHED',
      version: 0,
    };

    return await apiRequest('/products', {
      method: 'POST',
      body: payload,
    });
  },

  /**
   * Cập nhật thông tin sản phẩm, giá, tồn kho
   * PUT /api/products/{id}
   * @param {string|number} id
   * @param {Object} productData
   */
  async updateProduct(id, productData) {
    const payload = {
      ...productData,
      price: productData.price !== undefined ? Number(productData.price) : undefined,
      stock: productData.stock !== undefined ? Number(productData.stock) : undefined,
      thumbnailUrl: productData.thumbnailUrl || productData.image,
    };

    return await apiRequest(`/products/${id}`, {
      method: 'PUT',
      body: payload,
    });
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
