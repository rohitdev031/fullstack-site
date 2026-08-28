import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { AskPage } from './pages/AskPage';
import { HomePage } from './pages/HomePage';
import { FeaturePage } from './pages/FeaturePage';

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/ask" element={<AskPage />} />
        <Route path="/compare" element={<FeaturePage title="Compare" />} />
        <Route path="/verify" element={<FeaturePage title="Verify" />} />
        <Route path="/files" element={<FeaturePage title="Files" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
export default App;
