import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AiChatWidget from './components/AiChatWidget';
import ScrollToTop from './components/ScrollToTop';
import AdminRoute from './components/AdminRoute';
import AdminLayout from './layouts/AdminLayout';

// Customer Pages
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrdersPage from './pages/OrdersPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';

// Admin Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';

// Customer Layout với Navbar, Footer và Floating AI Widget riêng
function CustomerLayout({ isAiOpen, setIsAiOpen }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col antialiased selection:bg-indigo-500 selection:text-white">
      <ScrollToTop />
      <Navbar onOpenAiChat={() => setIsAiOpen(true)} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <AiChatWidget
        isOpen={isAiOpen}
        onClose={() => setIsAiOpen(!isAiOpen)}
      />
    </div>
  );
}

export default function App() {
  const [isAiOpen, setIsAiOpen] = useState(false);

  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* ================= NHÓM TRANG KHÁCH HÀNG (USER) ================= */}
            <Route element={<CustomerLayout isAiOpen={isAiOpen} setIsAiOpen={setIsAiOpen} />}>
              <Route path="/" element={<HomePage onOpenAiChat={() => setIsAiOpen(true)} />} />
              <Route path="/products" element={<ProductsPage onOpenAiChat={() => setIsAiOpen(true)} />} />
              <Route path="/products/:id" element={<ProductDetailPage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            </Route>

            {/* ================= NHÓM TRANG QUẢN TRỊ (ADMIN) ================= */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboardPage />} />
              <Route path="products" element={<AdminProductsPage />} />
              <Route path="orders" element={<AdminOrdersPage />} />
              <Route path="categories" element={<AdminCategoriesPage />} />
            </Route>

            {/* Redirect alias /dashboard -> /admin/dashboard */}
            <Route path="/dashboard" element={<Navigate to="/admin/dashboard" replace />} />

            {/* 404 Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}