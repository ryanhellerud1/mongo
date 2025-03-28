import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/admin/Dashboard';
import ProductsManagement from './pages/admin/ProductsManagement';
import ProductForm from './pages/admin/ProductForm';
import ProductVariants from './pages/admin/ProductVariants';
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
          
          {/* Public Routes */}
          <Route path="/" element={
            <div className="App">
              <Header />
              <main className="py-3">
                <div className="container">
                  <Home />
                </div>
              </main>
              <Footer />
            </div>
          } />
          <Route path="/register" element={
            <div className="App">
              <Header />
              <main className="py-3">
                <div className="container">
                  <Register />
                </div>
              </main>
              <Footer />
            </div>
          } />
          <Route path="/login" element={
            <div className="App">
              <Header />
              <main className="py-3">
                <div className="container">
                  <Login />
                </div>
              </main>
              <Footer />
            </div>
          } />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;
