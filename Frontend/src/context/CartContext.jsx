import React, { createContext, useContext, useState, useEffect } from 'react';
import { VOUCHERS } from '../data/mockData';
import { cartService } from '../services/cartService';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('ai_ecommerce_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [voucherError, setVoucherError] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem('ai_ecommerce_cart', JSON.stringify(cart));
    } catch (err) {
      console.error('Failed to save cart to localStorage', err);
    }
  }, [cart]);

  // Đồng bộ giỏ hàng với server qua GET /cart
  useEffect(() => {
    async function syncCartWithServer() {
      const token = localStorage.getItem('auth_token');
      if (!token) return;
      try {
        const res = await cartService.getCart();
        const serverItems = Array.isArray(res) ? res : res?.items || res?.cart?.items;
        if (serverItems && serverItems.length > 0) {
          setCart(serverItems);
        }
      } catch {
        // Giữ nguyên local cart khi server offline
      }
    }
    syncCartWithServer();
  }, []);

  const addToCart = (product, quantity = 1, variant = null, color = null) => {
    const itemKey = `${product.id}-${variant?.name || 'def'}-${color?.name || 'def'}`;
    const unitPrice = product.price + (variant?.priceDelta || 0);

    // Gọi POST /cart/items lên server
    cartService.addItem({
      productId: product.id,
      quantity,
      variant: variant?.name || null,
      color: color?.name || null,
    }).catch(() => {});

    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.key === itemKey);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: updated[existingIndex].quantity + quantity,
        };
        return updated;
      }
      return [
        ...prev,
        {
          key: itemKey,
          id: product.id,
          name: product.name,
          slug: product.slug,
          image: product.image,
          unitPrice,
          originalPrice: product.originalPrice,
          quantity,
          variant: variant ? variant.name : null,
          color: color ? color.name : null,
          colorCode: color ? color.code : null,
          category: product.category,
        },
      ];
    });
  };

  const removeFromCart = (key) => {
    // Gọi DELETE /cart/items/{itemID}
    cartService.removeItem(key).catch(() => {});
    setCart((prev) => prev.filter((item) => item.key !== key));
  };

  const updateQuantity = (key, delta) => {
    const currentItem = cart.find((item) => item.key === key);
    if (currentItem) {
      const newQty = currentItem.quantity + delta;
      if (newQty > 0) {
        // Gọi PATCH /cart/items/{itemID}
        cartService.updateItemQuantity(key, newQty).catch(() => {});
      } else {
        // Gọi DELETE /cart/items/{itemID}
        cartService.removeItem(key).catch(() => {});
      }
    }

    setCart((prev) =>
      prev
        .map((item) => {
          if (item.key === key) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const clearCart = () => {
    // Gọi DELETE /cart/clear
    cartService.clearCart().catch(() => {});
    setCart([]);
    setAppliedVoucher(null);
  };

  const applyVoucher = (code) => {
    setVoucherError('');
    if (!code || !code.trim()) {
      setVoucherError('Vui lòng nhập mã giảm giá');
      return false;
    }
    const found = VOUCHERS.find((v) => v.code.toUpperCase() === code.trim().toUpperCase());
    if (!found) {
      setVoucherError('Mã giảm giá không hợp lệ hoặc đã hết hạn');
      return false;
    }
    if (found.minOrder && subtotal < found.minOrder) {
      setVoucherError(`Đơn hàng cần tối thiểu ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(found.minOrder)} để áp dụng mã`);
      return false;
    }
    setAppliedVoucher(found);
    return true;
  };

  const removeVoucher = () => {
    setAppliedVoucher(null);
    setVoucherError('');
  };

  // Calculations
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);

  let discountAmount = 0;
  if (appliedVoucher) {
    if (appliedVoucher.discount < 1) {
      // Percentage discount
      discountAmount = Math.min(subtotal * appliedVoucher.discount, appliedVoucher.maxDiscount || Infinity);
    } else {
      // Fixed amount discount
      discountAmount = appliedVoucher.discount;
    }
  }

  const shippingFee = subtotal > 500000 || subtotal === 0 ? 0 : 30000;
  const total = Math.max(0, subtotal - discountAmount + shippingFee);

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        subtotal,
        discountAmount,
        shippingFee,
        total,
        appliedVoucher,
        voucherError,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        applyVoucher,
        removeVoucher,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}
