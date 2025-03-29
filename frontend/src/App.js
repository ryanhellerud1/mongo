import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Profile from './pages/Profile';
import UserOrders from './pages/Orders';
import ProductDetail from './pages/ProductDetail';
import Dashboard from './pages/admin/Dashboard';
import ProductsManagement from './pages/admin/ProductsManagement';
import ProductForm from './pages/admin/ProductForm';
import ProductVariants from './pages/admin/ProductVariants';
import Categories from './pages/admin/Categories';
import Orders from './pages/admin/Orders';
import Users from './pages/admin/Users';
import AdminLayout from './components/admin/AdminLayout';
import { UserProvider } from './context/UserContext';
import './App.css';

// Admin Route wrapper component
const AdminRoute = ({ element }) => {
  return (
    <AdminLayout>
      {element}
    </AdminLayout>
  );
};

// Standard Layout wrapper
const StandardLayout = ({ children }) => {
  return (
    <div className="App">
      <Header />
      <main className="py-3">
        <div className="container">
          {children}
        </div>
      </main>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <UserProvider>
      <Router>
        <Routes>
          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<AdminRoute element={<Dashboard />} />} />
          <Route path="/admin/products" element={<AdminRoute element={<ProductsManagement />} />} />
          <Route path="/admin/products/new" element={<AdminRoute element={<ProductForm />} />} />
          <Route path="/admin/products/:id" element={<AdminRoute element={<ProductForm />} />} />
          <Route path="/admin/products/:id/variants" element={<AdminRoute element={<ProductVariants />} />} />
          <Route path="/admin/categories" element={<AdminRoute element={<Categories />} />} />
          <Route path="/admin/orders" element={<AdminRoute element={<Orders />} />} />
          <Route path="/admin/users" element={<AdminRoute element={<Users />} />} />
          
          {/* User Account Routes */}
          <Route path="/profile" element={<StandardLayout><Profile /></StandardLayout>} />
          <Route path="/orders" element={<StandardLayout><UserOrders /></StandardLayout>} />
          
          {/* Product Routes */}
          <Route path="/product/:id" element={<StandardLayout><ProductDetail /></StandardLayout>} />
          
          {/* Public Routes */}
          <Route path="/" element={<StandardLayout><Home /></StandardLayout>} />
          <Route path="/register" element={<StandardLayout><Register /></StandardLayout>} />
          <Route path="/login" element={<StandardLayout><Login /></StandardLayout>} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
