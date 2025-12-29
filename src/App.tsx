import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from '@/pages/Dashboard';
import { Results } from '@/pages/Results';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/results" element={<Results />} />
        {/* Future routes to be added:
          - /menu - Menu page
          - /speaking - Interactive Speaking
          - /read-complete - Read and Complete
          - /read-select - Read and Select
          - /writing - Interactive Writing
        */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
