import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Contests from './pages/Contests';
import Bookmarks from './pages/Bookmarks';
import Solutions from './pages/Solutions';
import Pricing from './pages/Pricing';
import Admin from './pages/Admin';

const App = () => (
  <BrowserRouter>
    <Navbar />
    <Routes>
      <Route path="/" element={<Dashboard />} /> {/* Default to Dashboard */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/contests" element={<Contests />} />
      <Route path="/bookmarks" element={<Bookmarks />} />
      <Route path="/solutions" element={<Solutions />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  </BrowserRouter>
);

export default App;