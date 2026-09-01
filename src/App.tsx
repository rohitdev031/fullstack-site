import { Routes, Route } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { HomePage } from './pages/HomePage';
import { AskPage } from './pages/AskPage';
import { ComparePage } from './pages/ComparePage';


function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/ask" element={<AskPage />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="*" element={<div className="p-12 text-center text-muted-foreground">Page not found</div>} />
      </Route>
    </Routes>
  );
}

export default App;
