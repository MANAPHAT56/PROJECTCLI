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
import NewProductsall from './components/newproductsAll';
import Admin from './components/Admin';
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
              <Productinsubcategory />
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
          path="/newProductsall"
          element={
            <>
              <NewProductsall />
            </>
            
          }
        />
             <Route path="/admin" element={<><Admin /></>}/>
        {/* 
        <Route path="/products/all" element={<ProductsAll />} />
        <Route path="/products/recommended" element={<ProductsRecommended />} />
        */}
      </Routes>
    </Router>
  );
};

export default App;
