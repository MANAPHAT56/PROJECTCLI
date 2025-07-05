import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/navbar';
import ProductCategoriesSection from './components/ProductCategoriesSection';

// Lazy loaded components
const ProductsEachCategories = React.lazy(() => import('./components/ProductsEachCategories'));
const ProductEachSubCategories = React.lazy(() => import('./components/ProductEachSubCategories'));
const ProductsDetail = React.lazy(() => import('./components/ProductsDetail'));
const Productinsubcategory = React.lazy(() => import('./components/Productinsubcategory'));
const Aboutus = React.lazy(() => import('./components/Aboutus'));
const HowtoBuy = React.lazy(() => import('./components/HowtoBuy'));
const Admin = React.lazy(() => import('./components/Admin'));
const Works = React.lazy(() => import('./components/Works'));
const WorksDetail = React.lazy(() => import('./components/WorksDetail'));
const ProductImagesManagement = React.lazy(() => import('./components/Imagemenagemant'));
const WorksImages = React.lazy(()=>import('./components/ImageWorks'))
import { Toaster } from 'react-hot-toast';
const App = () => {
  return (
    <Router>
      <Navbar />
  <Toaster position="top-center" />
      <Suspense fallback={<div>กำลังโหลดหน้า...</div>}>
        <Routes>
          <Route path="/" element={<ProductCategoriesSection />} />

          <Route path="/categories-with-products" element={<ProductsEachCategories />} />

          <Route path="/category/:categoryId" element={<ProductEachSubCategories />} />

          <Route path="/detailProducts/:productId" element={<ProductsDetail />} />

          <Route path="/P_insubcategory/:subcategoryId" element={<Productinsubcategory />} />

          <Route path="/Aboutus" element={<Aboutus />} />

          <Route path="/HowtoBuy" element={<HowtoBuy />} />

          <Route path="/works" element={<Works />} />

          <Route path="/admin" element={<Admin />} />

          <Route path="/worksDetail/:workId" element={<WorksDetail />} />

          <Route path="/images/:productId" element={<ProductImagesManagement />} />
          <Route path="/images/works/:workId/page"    element= {<WorksImages />}   /> 
        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;
