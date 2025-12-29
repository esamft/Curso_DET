import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Dashboard } from '@/pages/Dashboard';
import { Results } from '@/pages/Results';
import { Menu } from '@/pages/Menu';
import { ReadSelect } from '@/pages/ReadSelect';
import { Writing } from '@/pages/Writing';
import { ReadComplete } from '@/pages/ReadComplete';
import { Speaking } from '@/pages/Speaking';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/results" element={<Results />} />
        <Route path="/practice/read-select" element={<ReadSelect />} />
        <Route path="/practice/writing" element={<Writing />} />
        <Route path="/practice/read-complete" element={<ReadComplete />} />
        <Route path="/practice/speaking" element={<Speaking />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
