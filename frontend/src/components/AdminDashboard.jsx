import axios from "axios";
import { useEffect, useState } from "react";
import { Calendar, FileText, LogOut, Plus, User } from "react-feather";
import { useNavigate } from "react-router-dom";
import AdminProfile from "./AdminProfile";
import AttendanceList from "./AttendanceList";
import "./Dashboard.css";
import EmployeeForm from "./EmployeeForm";
import EmployeeList from "./EmployeeList";
import LeaveManagement from "./LeaveManagement";
import Watermark from "./Watermark";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [adminName, setAdminName] = useState("Admin");
  const [activeTab, setActiveTab] = useState("employees");

  useEffect(() => {
    const fetchAdminDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No token found");
          return;
        }

        console.log("Fetching admin details with token");

        const response = await axios.get(
          "http://localhost:8085/api/admins/current",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Admin details response:", response.data);

        if (response.data) {
          setAdminName(response.data.fullName || "Admin");
        }
      } catch (error) {
        console.error("Error fetching admin details:", error.response || error);
        setAdminName("Admin");
      }
    };

    fetchAdminDetails();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("adminEmail");
    navigate("/");
  };

  const handleAddEmployee = () => {
    setSelectedEmployee(null);
    setShowForm(true);
  };

  const handleEditEmployee = (employee) => {
    setSelectedEmployee(employee);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setSelectedEmployee(null);
  };

  const handleFormSave = () => {
    setShowForm(false);
    setSelectedEmployee(null);
  };

  const renderContent = () => {
    if (showForm) {
      return (
        <EmployeeForm
          employee={selectedEmployee}
          onSave={handleFormSave}
          onCancel={handleFormClose}
        />
      );
    }

    switch (activeTab) {
      case "employees":
        return <EmployeeList onEdit={handleEditEmployee} />;
      case "attendance":
        return <AttendanceList />;
      case "reports":
        return <LeaveManagement />;
      case "settings":
        return <AdminProfile />;
      default:
        return <EmployeeList onEdit={handleEditEmployee} />;
    }
  };

  return (
    <div className="dashboard-container">
      <Watermark />
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <h2>StaffSync</h2>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li
              className={activeTab === "employees" ? "active" : ""}
              onClick={() => setActiveTab("employees")}
            >
              <User size={20} />
              <span>Employees</span>
            </li>
            <li
              className={activeTab === "attendance" ? "active" : ""}
              onClick={() => setActiveTab("attendance")}
            >
              <Calendar size={20} />
              <span>Attendance</span>
            </li>
            <li
              className={activeTab === "reports" ? "active" : ""}
              onClick={() => setActiveTab("reports")}
            >
              <FileText size={20} />
              <span>Leaves</span>
            </li>
            <li
              className={activeTab === "settings" ? "active" : ""}
              onClick={() => setActiveTab("settings")}
            >
              <User size={20} />
              <span>My Profile</span>
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
          <h1>Welcome, {adminName}</h1>
          {activeTab === "employees" && (
            <button className="add-employee-btn" onClick={handleAddEmployee}>
              <Plus size={20} />
              <span>Add Employee</span>
            </button>
          )}
        </header>
        <div className="dashboard-content">{renderContent()}</div>
      </main>
    </div>
  );
};

export default AdminDashboard;
