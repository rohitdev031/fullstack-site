import { Routes, Route } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { HomePage } from './pages/HomePage';
import { AskPage } from './pages/AskPage';

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/ask" element={<AskPage />} />
        {/* When you click Compare, Verify, or Files in the sidebar, they will fall back to this 404 page */}
        <Route path="*" element={<div className="p-12 text-center text-muted-foreground">Page not found</div>} />
      </Route>
    </Routes>
  );
}

export default App;
