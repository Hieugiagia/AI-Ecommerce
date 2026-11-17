import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { cartService } from '../services/cartService';
import { normalizeCart } from '../services/cartModel';
import { useAuth } from './AuthContext';
import { checkoutStorageKey, readCheckoutAttempt, saveCheckoutAttempt } from '../services/checkoutModel';

const CartContext = createContext();
const emptyCart = () => ({ items: [], itemCount: 0, subtotal: 0 });

export function CartProvider({ children }) {
  const { user, token } = useAuth();
  const authenticated = !!(user && token);
  const session = authenticated ? JSON.stringify([user.id || user.email, token]) : 'guest';
  // Remount on account/session changes: old responses cannot populate another cart.
  return <CartSession key={session} authenticated={authenticated} account={user?.id || user?.email || null}>{children}</CartSession>;
}

function CartSession({ children, authenticated, account }) {
  const [snapshot, setSnapshot] = useState(authenticated ? null : emptyCart);
  const [cartError, setCartError] = useState('');
  const [cartBusy, setCartBusy] = useState(false);
  const [voucherError, setVoucherError] = useState('');
  const [pendingCheckout, setPendingCheckout] = useState(() => readCheckoutAttempt(sessionStorage, account));
  const pendingRef = useRef(pendingCheckout);
  const inFlight = useRef(false);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    let active = true;
    // Do not migrate the old shared browser cart into any account.
    localStorage.removeItem('ai_ecommerce_cart');
    if (authenticated) {
      inFlight.current = true;
      cartService.getCart().then(normalizeCart).then((data) => {
        if (active) setSnapshot(data);
      }).catch((error) => {
        if (active) setCartError(error.message);
      }).finally(() => { if (active) inFlight.current = false; });
    }
    return () => { active = false; mounted.current = false; };
  }, [authenticated]);

  const cart = snapshot?.items || [];
  const cartLoading = authenticated && snapshot === null && !cartError;

  async function perform(task, { loadingRequired = true, allowDuringCheckout = false } = {}) {
    if (!authenticated) {
      return { success: false, requiresAuth: true, error: 'Vui lòng đăng nhập để lưu giỏ hàng.' };
    }
    if (pendingRef.current && !allowDuringCheckout) return { success: false, error: 'Đơn hàng đang chờ xác nhận kết quả. Vui lòng mở trang thanh toán.' };
    if (inFlight.current) return { success: false, error: 'Giỏ hàng đang cập nhật. Vui lòng thử lại.' };
    if (loadingRequired && !snapshot) {
      return { success: false, error: 'Chưa tải được giỏ hàng. Vui lòng mở giỏ và thử tải lại.' };
    }
    inFlight.current = true;
    setCartBusy(true);
    setCartError('');
    try {
      const data = await task();
      if (!mounted.current) return { success: false, error: 'Phiên đăng nhập đã thay đổi.' };
      setSnapshot(data);
      return { success: true };
    } catch (error) {
      if (mounted.current) setCartError(error.message);
      return { success: false, error: error.message };
    } finally {
      inFlight.current = false;
      if (mounted.current) setCartBusy(false);
    }
  }

  const reloadCart = () => perform(async () => normalizeCart(await cartService.getCart()), { loadingRequired: false, allowDuringCheckout: true });

  const addToCart = (product, quantity = 1, variant = null, color = null) => {
    if (variant || color) return Promise.resolve({ success: false, error: 'Sản phẩm có lựa chọn màu hoặc phiên bản hiện chưa được hỗ trợ.' });
    if (!Number.isInteger(quantity) || quantity < 1) return Promise.resolve({ success: false, error: 'Số lượng phải là số nguyên từ 1.' });
    return perform(async () => normalizeCart(await cartService.addItem({ productId: product.id, quantity })));
  };

  const updateQuantity = (key, delta) => perform(async () => {
    const item = cart.find((entry) => entry.key === key);
    if (!item) throw new Error('Không tìm thấy sản phẩm trong giỏ.');
    const quantity = item.quantity + delta;
    if (quantity <= 0) {
      await cartService.removeItem(item.itemId);
      return normalizeCart(await cartService.getCart());
    }
    return normalizeCart(await cartService.updateItemQuantity(item.itemId, quantity));
  });

  const removeFromCart = (key) => perform(async () => {
    const item = cart.find((entry) => entry.key === key);
    if (!item) throw new Error('Không tìm thấy sản phẩm trong giỏ.');
    await cartService.removeItem(item.itemId);
    return normalizeCart(await cartService.getCart());
  });

  const clearCart = () => perform(async () => {
    await cartService.clearCart();
    return emptyCart();
  });

  const subtotal = snapshot?.subtotal || 0;
  const shippingFee = subtotal >= 500000 || subtotal === 0 ? 0 : 30000;
  const canCheckout = authenticated && !!snapshot && !cartLoading && !cartBusy && !cartError
    && !pendingCheckout && cart.length > 0 && cart.every((item) => item.available);
  function beginCheckout(payload) {
    if (!canCheckout || inFlight.current || pendingRef.current) {
      return { success: false, error: 'Giỏ hàng chưa sẵn sàng hoặc có đơn đang chờ xác nhận.' };
    }
    try {
      const saved = saveCheckoutAttempt(sessionStorage, account, payload);
      pendingRef.current = saved;
      setPendingCheckout(saved);
      return { success: true, payload: saved };
    } catch {
      return { success: false, error: 'Không lưu được phiên đặt hàng trong trình duyệt. Vui lòng kiểm tra quyền lưu trữ rồi thử lại.' };
    }
  }

  function finishCheckout() {
    // A stale key left by a storage failure can only replay the same order.
    try { sessionStorage.removeItem(checkoutStorageKey(account)); } catch { /* Storage unavailable. */ }
    pendingRef.current = null;
    setPendingCheckout(null);
  }

  const applyVoucher = () => {
    setVoucherError('Mã giảm giá hiện chưa được hỗ trợ.');
    return false;
  };

  return <CartContext.Provider value={{
    cart, cartCount: snapshot?.itemCount || 0, subtotal, shippingFee,
    total: subtotal + shippingFee, discountAmount: 0, appliedVoucher: null, voucherError,
    cartLoading, cartBusy, cartError, canCheckout, pendingCheckout, beginCheckout, finishCheckout,
    addToCart, updateQuantity, removeFromCart, clearCart, reloadCart, applyVoucher,
    removeVoucher: () => setVoucherError(''),
  }}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}
