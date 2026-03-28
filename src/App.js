import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { getCookie } from './api/axios'; 
import './App.css';

import Login from './login';
import ChangePass from './forgot_password'; 
import ResetConfirm from './ResetConfirm'; 

import DashboardLayout from './Dashboard.jsx'; 
import FarmerList from './FarmerList.jsx'; 
import CropList from './croplist.jsx'; 
import StockList from './stock.jsx'; 
import WholesalerList from './WholesalerList.jsx';
import FarmerStock from './farmerstock.jsx'; 

import CropListing from './CropListing.jsx'; 

import WholesalerStockMaster from './WholesalerStockMaster.jsx'; 

import WholesalerStockDetail from './WholesalerStockDetail.jsx'; 


import WholesalerBidding from './WholesalerBidding.jsx';


import WholesalerOrders from './WholesalerOrders.jsx';

const ProtectedRoute = ({ children }) => {

  const token = getCookie("access_token") || localStorage.getItem("access_token");
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const DashboardOverview = () => (
  <div style={{ padding: '20px' }}>
    <h2 style={{ color: '#1b5e20', fontWeight: '900', fontSize: '24px', marginBottom: '10px' }}>
      ADMIN CONTROL CENTER
    </h2>
    <p style={{ color: '#666', fontSize: '14px', fontWeight: '500' }}>
      Logged in as System Administrator. Monitoring all Farmer and Wholesaler activities.
    </p>
  </div>
);

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          
          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route path="/login" element={<Login />} />
          <Route path="/forgot_password" element={<ChangePass />} />
          <Route path="/password-reset-confirm/:uidb64/:token" element={<ResetConfirm />} />

          <Route 
            path="/admin-dashboard" 
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardOverview />} />
            
            <Route path="farmers" element={<FarmerList />} />
            <Route path="crops" element={<CropList />} />
            <Route path="farmer-stock" element={<FarmerStock />} />
            <Route path="stock" element={<StockList />} />

            <Route path="crop-listing" element={<CropListing />} />
            
            <Route path="wholesalers" element={<WholesalerList />} />
            
            <Route path="wholesaler-stock" element={<WholesalerStockMaster />} />
            
            <Route path="wholesaler-stock-detail" element={<WholesalerStockDetail />} /> 
                 
            
            <Route path="wholesaler-bidding/:l_id" element={<WholesalerBidding />} />

            
            <Route path="wholesaler-orders" element={<WholesalerOrders />} />
            
          </Route>

          
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;