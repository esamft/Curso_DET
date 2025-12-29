import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from '@/pages/Dashboard';
import { Results } from '@/pages/Results';
import { Menu } from '@/pages/Menu';
import { ReadSelect } from '@/pages/ReadSelect';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/results" element={<Results />} />
        <Route path="/practice/read-select" element={<ReadSelect />} />
        {/* Future routes to be added:
          - /practice/speaking - Interactive Speaking
          - /practice/read-complete - Read and Complete
          - /practice/writing - Interactive Writing
        */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
