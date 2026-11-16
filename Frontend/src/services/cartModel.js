export function normalizeCart(data) {
  if (!data || !Array.isArray(data.items)
      || !Number.isFinite(Number(data.subtotal))
      || !Number.isFinite(Number(data.itemCount))) {
    throw new Error('Dữ liệu giỏ hàng không hợp lệ');
  }
  return {
    subtotal: Number(data.subtotal),
    itemCount: Number(data.itemCount),
    items: data.items.map((item) => {
      if (!Number.isInteger(item.itemId) || !Number.isInteger(item.productId)
          || !Number.isInteger(item.quantity) || item.quantity < 1
          || !Number.isFinite(Number(item.unitPrice))) {
        throw new Error('Dữ liệu sản phẩm trong giỏ không hợp lệ');
      }
      return {
        ...item,
        key: String(item.itemId),
        id: item.productId,
        unitPrice: Number(item.unitPrice),
        lineTotal: Number(item.lineTotal),
        stock: Number(item.stock),
        image: item.thumbnailUrl || '/favicon.svg',
        available: item.available === true,
      };
    }),
  };
}
