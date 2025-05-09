import { Calendar, FileText, LogOut, Settings, User } from "react-feather";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
const AdminDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="dashboard-container">
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2>StaffSync</h2>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li className="active">
              <User size={20} />
              <span>Employees</span>
            </li>
            <li>
              <Calendar size={20} />
              <span>Attendance</span>
            </li>
            <li>
              <FileText size={20} />
              <span>Reports</span>
            </li>
            <li>
              <Settings size={20} />
              <span>Settings</span>
            </li>
          </ul>
        </nav>
        <button className="logout-button" onClick={handleLogout}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </aside>
      <main className="dashboard-main">
        <header className="dashboard-header">
          <h1>Welcome to Admin Dashboard</h1>
        </header>
        <div className="dashboard-content">
          {/* Add your dashboard content here */}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
