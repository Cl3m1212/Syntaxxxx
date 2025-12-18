import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import Layout from './layouts/Layout';
import Home from './pages/Home';
import Playground from './pages/Playground';

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={
          <Layout currentPageName="Home">
            <Home />
          </Layout>
        } />
        <Route path="/Playground" element={
          <Layout currentPageName="Playground">
            <Playground />
          </Layout>
        } />
      </Routes>
    </BrowserRouter>
  );
}