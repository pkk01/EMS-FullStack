import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./App.css";
import AdminDashboard from "./components/AdminDashboard";
import AuthPage from "./components/AuthPage";
import Landing from "./components/Landing";

function App() {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />

          {/* Add more routes as needed */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
