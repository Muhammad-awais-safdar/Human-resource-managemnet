import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/core/context/AuthContext';
import { ProductTourProvider } from '@/core/context/ProductTourContext';
import { AppRouter } from '@/router/AppRouter';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ProductTourProvider>
          <AppRouter />
        </ProductTourProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
