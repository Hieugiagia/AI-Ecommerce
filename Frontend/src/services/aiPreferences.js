export function buildAdvicePrompt({ category, brand = '', maxPrice = '' }) {
  if (!category || typeof category.name !== 'string' || !category.name.trim() || !category.slug) {
    throw new Error('Vui lòng chọn loại sản phẩm.');
  }
  const name = String(brand).trim().replace(/\s+/g, ' ');
  if (name.length > 50) throw new Error('Tên thương hiệu tối đa 50 ký tự.');
  let budget = '';
  if (String(maxPrice).trim()) {
    const price = Number(maxPrice);
    if (!Number.isSafeInteger(price) || price < 1 || price > 9999999999999) {
      throw new Error('Ngân sách phải là số tiền nguyên dương, tối đa 13 chữ số.');
    }
    budget = ` Ngân sách tối đa ${price} đồng.`;
  }
  return `Nhu cầu mới: Tôi muốn ${category.name.trim()}${name ? ' của ' + name : ''}.${budget} Chỉ gợi ý đúng loại${name ? ' và thương hiệu' : ''} này, đang còn hàng tại Zentro Store. Không dùng thương hiệu hay ngân sách của nhu cầu trước. Nếu không có sản phẩm phù hợp, hãy nói rõ.`;
}
