import axios from "axios";
import { useEffect, useState } from "react";
import "./LeaveManagement.css";

const LeaveManagement = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchEmployees();
    fetchLeaveRequests();
  }, []);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:8085/api/employees", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployees(response.data);
    } catch (error) {
      console.error("Error fetching employees:", error);
      setError("Failed to load employees");
    }
  };

  const fetchLeaveRequests = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("http://localhost:8085/api/leaves", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLeaveRequests(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching leave requests:", error);
      setError("Failed to load leave requests");
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        "http://localhost:8085/api/leaves",
        {
          employeeId: selectedEmployee,
          leave: {
            startDate,
            endDate,
            reason,
            status: "PENDING",
          },
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Refresh leave requests
      fetchLeaveRequests();
      // Reset form
      setSelectedEmployee("");
      setStartDate("");
      setEndDate("");
      setReason("");
    } catch (error) {
      console.error("Error submitting leave request:", error);
      setError("Failed to submit leave request");
    }
  };

  const handleStatusChange = async (leaveId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:8085/api/leaves/${leaveId}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      // Refresh leave requests
      fetchLeaveRequests();
    } catch (error) {
      console.error("Error updating leave status:", error);
      setError("Failed to update leave status");
    }
  };

  if (isLoading) {
    return <div className="leave-loading">Loading leave requests...</div>;
  }

  if (error) {
    return <div className="leave-error">{error}</div>;
  }

  return (
    <div className="leave-management">
      <div className="leave-header">
        <h2>Leave Management</h2>
      </div>

      <div className="leave-content">
        <div className="leave-form-section">
          <h3>New Leave Request</h3>
          <form onSubmit={handleSubmit} className="leave-form">
            <div className="form-group">
              <label>Employee</label>
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                required
              >
                <option value="">Select Employee</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.firstName} {employee.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Reason</label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
                placeholder="Enter reason for leave"
              />
            </div>

            <button type="submit" className="submit-button">
              Submit Leave Request
            </button>
          </form>
        </div>

        <div className="leave-requests-section">
          <h3>Leave Requests</h3>
          <div className="leave-requests-list">
            {leaveRequests.map((request) => (
              <div key={request.id} className="leave-request-card">
                <div className="request-header">
                  <h4>
                    {request.employee.firstName} {request.employee.lastName}
                  </h4>
                  <span
                    className={`status-badge ${request.status.toLowerCase()}`}
                  >
                    {request.status}
                  </span>
                </div>
                <div className="request-details">
                  <p>
                    <strong>From:</strong>{" "}
                    {new Date(request.startDate).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>To:</strong>{" "}
                    {new Date(request.endDate).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Reason:</strong> {request.reason}
                  </p>
                </div>
                {request.status === "PENDING" && (
                  <div className="request-actions">
                    <button
                      onClick={() => handleStatusChange(request.id, "APPROVED")}
                      className="approve-button"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleStatusChange(request.id, "REJECTED")}
                      className="reject-button"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveManagement;
