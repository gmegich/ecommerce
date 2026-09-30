import { Routes, Route, Navigate } from 'react-router-dom';
import CustomerLayout from '../layouts/CustomerLayout';
import SellerLayout from '../layouts/SellerLayout';
import AdminLayout from '../layouts/AdminLayout';
import ProtectedRoute from '../components/ProtectedRoute';

import Home from '../pages/public/Home';
import Products from '../pages/public/Products';
import ProductDetails from '../pages/public/ProductDetails';
import Login from '../pages/public/Login';
import Register from '../pages/public/Register';

import Profile from '../pages/customer/Profile';
import Cart from '../pages/customer/Cart';
import Checkout from '../pages/customer/Checkout';
import Orders from '../pages/customer/Orders';
import OrderDetails from '../pages/customer/OrderDetails';
import Messages from '../pages/customer/Messages';
import Notifications from '../pages/customer/Notifications';

import SellerDashboard from '../pages/seller/SellerDashboard';
import SellerProducts from '../pages/seller/SellerProducts';
import AddProduct from '../pages/seller/AddProduct';
import EditProduct from '../pages/seller/EditProduct';
import SellerOrders from '../pages/seller/SellerOrders';
import SellerProfile from '../pages/seller/SellerProfile';
import SellerMessages from '../pages/seller/SellerMessages';

import AdminDashboard from '../pages/admin/AdminDashboard';
import ManageUsers from '../pages/admin/ManageUsers';
import ManageSellers from '../pages/admin/ManageSellers';
import ManageProducts from '../pages/admin/ManageProducts';
import ManageOrders from '../pages/admin/ManageOrders';
import ManageCategories from '../pages/admin/ManageCategories';
import Reports from '../pages/admin/Reports';

const AppRoutes = () => (
  <Routes>
    <Route element={<CustomerLayout />}>
      <Route path="/" element={<Home />} />
      <Route path="/products" element={<Products />} />
      <Route path="/products/:id" element={<ProductDetails />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/profile" element={<Profile />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/orders/:id" element={<OrderDetails />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/notifications" element={<Notifications />} />
      </Route>
    </Route>

    <Route
      path="/seller"
      element={
        <ProtectedRoute allowedRoles={['seller']}>
          <SellerLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<SellerDashboard />} />
      <Route path="products" element={<SellerProducts />} />
      <Route path="products/new" element={<AddProduct />} />
      <Route path="products/:id/edit" element={<EditProduct />} />
      <Route path="orders" element={<SellerOrders />} />
      <Route path="profile" element={<SellerProfile />} />
      <Route path="messages" element={<SellerMessages />} />
    </Route>

    <Route
      path="/admin"
      element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<AdminDashboard />} />
      <Route path="users" element={<ManageUsers />} />
      <Route path="sellers" element={<ManageSellers />} />
      <Route path="products" element={<ManageProducts />} />
      <Route path="orders" element={<ManageOrders />} />
      <Route path="categories" element={<ManageCategories />} />
      <Route path="reports" element={<Reports />} />
    </Route>

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default AppRoutes;
