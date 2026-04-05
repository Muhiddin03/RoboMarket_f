import { BrowserRouter, Routes, Route, useLocation, Link } from 'react-router-dom';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { CustomerProvider } from './context/CustomerContext';
import ProtectedRoute from './components/ui/ProtectedRoute';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import AdminLayout from './components/admin/AdminLayout';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CategoriesPage from './pages/CategoriesPage';
import ContactPage from './pages/ContactPage';
import BlogPage from './pages/BlogPage';
import BlogDetailPage from './pages/BlogDetailPage';
import ProfilePage from './pages/ProfilePage';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCategories from './pages/admin/AdminCategories';
import AdminSettings from './pages/admin/AdminSettings';
import AdminHeroCards from './pages/admin/AdminHeroCards';
import AdminBlog from './pages/admin/AdminBlog';
import AdminReviews from './pages/admin/AdminReviews';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

const PublicLayout = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-[#07050f]">
    <Navbar />
    <main className="flex-1">{children}</main>
    <Footer />
  </div>
);

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthProvider>
        <CartProvider>
          <CustomerProvider>
            <ScrollToTop />
            <Toaster position="bottom-center" toastOptions={{
              duration: 2000,
              style: {
                background: '#0e1420',
                color: '#dde2f0',
                fontSize: '14px',
                borderRadius: '14px',
                padding: '10px 16px',
                fontFamily: 'Sora, sans-serif',
                fontWeight: '600',
                border: '1px solid #1e2d3d',
                marginBottom: '72px',
              },
              success: { iconTheme: { primary: '#8b5cf6', secondary: '#080c14' } },
              error:   { iconTheme: { primary: '#f43f5e', secondary: '#080c14' } },
            }} />
            <Routes>
              <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
              <Route path="/products" element={<PublicLayout><ProductsPage /></PublicLayout>} />
              <Route path="/products/:id" element={<PublicLayout><ProductDetailPage /></PublicLayout>} />
              <Route path="/cart" element={<PublicLayout><CartPage /></PublicLayout>} />
              <Route path="/categories" element={<PublicLayout><CategoriesPage /></PublicLayout>} />
              <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />
              <Route path="/blog" element={<PublicLayout><BlogPage /></PublicLayout>} />
              <Route path="/blog/:id" element={<PublicLayout><BlogDetailPage /></PublicLayout>} />
              <Route path="/profile" element={<PublicLayout><ProfilePage /></PublicLayout>} />
              <Route path="/robomarket-dashboard-2025/login" element={<AdminLogin />} />
              <Route path="/robomarket-dashboard-2025" element={<ProtectedRoute><AdminLayout /></ProtectedRoute>}>
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="blog" element={<AdminBlog />} />
                <Route path="reviews" element={<AdminReviews />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="hero-cards" element={<AdminHeroCards />} />
              </Route>
              <Route path="*" element={
                <PublicLayout>
                  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                    <div className="text-6xl font-black text-slate-700">404</div>
                    <h2 className="text-2xl font-black text-white">Sahifa topilmadi</h2>
                    <Link to="/" className="btn-primary">Bosh sahifaga qaytish</Link>
                  </div>
                </PublicLayout>
              } />
            </Routes>
          </CustomerProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}