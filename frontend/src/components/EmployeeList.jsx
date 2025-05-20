import axios from "axios";
import React, { useEffect, useState } from "react";
import { Edit, Eye, Trash2 } from "react-feather";
import "./EmployeeList.css";
import Watermark from "./Watermark";

const EmployeeList = ({ onEdit }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      console.log("Fetching employees...");
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:8085/api/employees", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Response received:", response.data);
      setEmployees(response.data);
      setLoading(false);
      setError(null);
    } catch (err) {
      console.error("Error fetching employees:", err);
      setError(
        err.response?.data?.message ||
          "Failed to fetch employees. Please check if the backend server is running."
      );
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      try {
        console.log("Deleting employee with ID:", id);
        const token = localStorage.getItem("token");
        await axios.delete(`http://localhost:8085/api/employees/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Employee deleted successfully");
        fetchEmployees();
      } catch (err) {
        console.error("Error deleting employee:", err);
        setError(err.response?.data?.message || "Failed to delete employee");
      }
    }
  };

  const handleViewDetails = (employee) => {
    setSelectedEmployee(employee);
    setShowDetailsModal(true);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatSalary = (salary) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(salary);
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error)
    return (
      <div className="error">
        <p>{error}</p>
        <button onClick={fetchEmployees} className="retry-btn">
          Retry
        </button>
      </div>
    );

  return (
    <div className="employee-list">
      <Watermark />
      <h2>Employee List</h2>
      {employees.length === 0 ? (
        <p className="no-employees">
          No employees found. Add your first employee!
        </p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Position</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <tr key={employee.id}>
                <td>{`${employee.firstName} ${employee.lastName}`}</td>
                <td>{employee.email}</td>
                <td>{employee.department}</td>
                <td>{employee.position}</td>
                <td className="actions">
                  <button
                    className="view-btn"
                    onClick={() => handleViewDetails(employee)}
                    title="View Details"
                  >
                    <Eye size={18} />
                  </button>
                  <button
                    className="edit-btn"
                    onClick={() => onEdit(employee)}
                    title="Edit"
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(employee.id)}
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showDetailsModal && selectedEmployee && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Employee Details</h2>
              <button
                className="close-btn"
                onClick={() => setShowDetailsModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <span className="detail-label">Full Name:</span>
                <span className="detail-value">
                  {`${selectedEmployee.firstName} ${selectedEmployee.lastName}`}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{selectedEmployee.email}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Phone:</span>
                <span className="detail-value">
                  {selectedEmployee.phoneNumber}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Department:</span>
                <span className="detail-value">
                  {selectedEmployee.department}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Position:</span>
                <span className="detail-value">
                  {selectedEmployee.position}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Salary:</span>
                <span className="detail-value">
                  {formatSalary(selectedEmployee.salary)}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Joining Date:</span>
                <span className="detail-value">
                  {formatDate(selectedEmployee.joiningDate)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeList;
