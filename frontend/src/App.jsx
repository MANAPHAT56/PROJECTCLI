import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/navbar';
import ProductCategoriesSection from './components/ProductCategoriesSection';
const ProductsEachCategories = React.lazy(() => import('./components/ProductsEachCategories'));
import ProductEachSubCategories from './components/ProductEachSubCategories';
import ProductsDetail from './components/ProductsDetail';
import Productinsubcategory from './components/Productinsubcategory';
import Aboutus from './components/Aboutus';
import HowtoBuy from './components/HowtoBuy';
import Admin from './components/Admin';
import Works from './components/Works';
import WorksDetail from './components/WorksDetail';
import ProductImagesManagement from './components/Imagemenagemant';
const App = () => {
  return (
    <Router>
      {/* นำ Navbar ไว้ด้านบนเพื่อแสดงทุกหน้า */}
      <Navbar />

      <Routes>
        {/* Route ไปยังหมวดหมู่ */}
        <Route
          path="/categories-with-products"
          element={
            <>
              <ProductsEachCategories />
            </>
          }
        />
        <Route
          path="/category/:categoryId"
          element={
            <>
              <ProductEachSubCategories />
            </>
          }
        />
         <Route
          path="/"
          element={
            <>
              <ProductCategoriesSection />
            </>
            
          }
        />
          <Route
          path="/detailProducts/:productId"
          element={
            <>
              <ProductsDetail />
            </>
            
          }
        />
        <Route
          path="/P_insubcategory/:subcategoryId"
          element={
            <>
              <Productinsubcategory  />
            </>
            
          }
        />
          <Route
          path="/Aboutus"
          element={
            <>
              <Aboutus />
              
            </>
            
          }
        />
          <Route
          path="/HowtoBuy"
          element={
            <>
              <HowtoBuy />
            </>
            
          }
        />
         <Route
          path="/works"
          element={
            <>
              <Works />
            </>
            
          }
        />
             <Route path="/admin" element={<><Admin /></>}/>
            <Route path="/worksDetail/:workId" element={<><WorksDetail /></>}/>
            <Route path="/images/:productId" element={<><ProductImagesManagement /></>}/>
        {/* 
        <Route path="/products/all" element={<ProductsAll />} />
        <Route path="/products/recommended" element={<ProductsRecommended />} />
        */}
      </Routes>
    </Router>
  );
};

export default App;
