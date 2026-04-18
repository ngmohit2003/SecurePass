
// export default App;
import { Navbar } from "./components/Navbar.jsx";
import { Route, Routes, useLocation } from "react-router-dom";

import { Home } from "./pages/Home.jsx";
import { Login } from "./pages/Login.jsx";
import { Dashboard } from "./pages/Dashboard.jsx";
import PassGenerator from "./pages/PassGenerator.jsx";
import Hash_gen from "./pages/Hash_gen.jsx";
import CrackPage from "./pages/CrackPage.jsx";
import  PassManager  from "./pages/PassManager.jsx";
import PrivateRoute from "./components/PrivateRoute.jsx";
import  PacketAnalyzer  from "./pages/PacketAnalyzer.jsx";
import ReconIntel from "./pages/ReconIntel.jsx";
import Footer from "./components/Footer.jsx";
function App() {
  const location = useLocation();

  return (
    <div>
      {location.pathname === "/" && <Navbar />}

      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/password-generator" element={<PassGenerator />} />
          <Route path="/hash-generator" element={<Hash_gen />} />
          <Route path="/crack-page" element={<CrackPage />} />
          <Route path="/pass-manager" element={<PassManager />} />
          <Route path="/packet-analyzer" element={<PacketAnalyzer />} />
          <Route path="/recon-intel" element={<ReconIntel />} />
        </Route>
      </Routes>

      <Footer />
    </div>
  );
}

export default App;
