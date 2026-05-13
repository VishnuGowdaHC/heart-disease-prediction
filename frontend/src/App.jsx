import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Import your two pages
import InputFormPage from './pages/InputFormPage';
import ResultsDashboard from './pages/ResultsDashboard';

const App = () => {
  return (
    // BrowserRouter provides the context that useLocation and useNavigate need
    <BrowserRouter>
      <Routes>
        {/* The default route loads your input form */}
        <Route path="/" element={<InputFormPage />} />
        
        {/* The /results route loads your dynamic dashboard */}
        <Route path="/results" element={<ResultsDashboard />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;