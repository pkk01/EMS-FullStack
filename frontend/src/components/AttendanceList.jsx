import axios from "axios";
import React, { useEffect, useState } from "react";
import { Calendar, CheckCircle, Clock, XCircle } from "react-feather";
import "./AttendanceList.css";

const AttendanceList = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate]);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:8085/api/attendance/date/${selectedDate}`
      );
      console.log("Raw attendance data received:", response.data);
      setAttendanceData(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching attendance:", err);
      setError("Failed to fetch attendance data");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = async (employeeId, status) => {
    if (!employeeId) {
      setError("Invalid employee ID");
      return;
    }

    try {
      await axios.post(
        `http://localhost:8085/api/attendance/${employeeId}`,
        null,
        {
          params: {
            status: status,
            date: selectedDate,
          },
        }
      );
      fetchAttendance();
    } catch (err) {
      console.error("Error marking attendance:", err);
      setError("Failed to mark attendance");
    }
  };

  const handleCheckOut = async (attendanceId) => {
    if (!attendanceId) {
      setError("Invalid attendance ID");
      return;
    }

    try {
      await axios.put(
        `http://localhost:8085/api/attendance/${attendanceId}/checkout`
      );
      fetchAttendance();
    } catch (err) {
      console.error("Error marking checkout:", err);
      setError("Failed to mark checkout");
    }
  };

  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return "Not checked out";
    const date = new Date(dateTimeStr);
    return date.toLocaleTimeString();
  };

  if (loading) return <div className="loading">Loading attendance data...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="attendance-list">
      <div className="attendance-header">
        <h2>Attendance Management</h2>
        <div className="date-picker">
          <Calendar size={20} />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      </div>

      <div className="attendance-table">
        <table>
          <thead>
            <tr>
              <th>Employee Name</th>
              <th>Status</th>
              <th>Check In</th>
              <th>Check Out</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {attendanceData.map((attendance, index) => {
              const employee = attendance.employee;
              if (!employee) {
                console.warn(
                  "No employee data for attendance record:",
                  attendance
                );
                return null;
              }

              console.log(`Row ${index} - Employee:`, employee);
              console.log(`Row ${index} - Attendance:`, attendance);

              return (
                <tr key={`${employee.id}-${index}`}>
                  <td>{`${employee.firstName} ${employee.lastName}`}</td>
                  <td>
                    {attendance.status ? (
                      <span
                        className={`status-badge ${attendance.status.toLowerCase()}`}
                      >
                        {attendance.status}
                      </span>
                    ) : (
                      <span className="status-badge not-marked">
                        Not Marked
                      </span>
                    )}
                  </td>
                  <td>
                    {attendance.checkIn
                      ? formatDateTime(attendance.checkIn)
                      : "-"}
                  </td>
                  <td>
                    {attendance.checkOut
                      ? formatDateTime(attendance.checkOut)
                      : "-"}
                  </td>
                  <td>
                    {attendance.status === "NOT_MARKED" ? (
                      <div className="attendance-actions">
                        <button
                          className="mark-present-btn"
                          onClick={() =>
                            handleMarkAttendance(employee.id, "PRESENT")
                          }
                        >
                          <CheckCircle size={18} />
                          Present
                        </button>
                        <button
                          className="mark-absent-btn"
                          onClick={() =>
                            handleMarkAttendance(employee.id, "ABSENT")
                          }
                        >
                          <XCircle size={18} />
                          Absent
                        </button>
                      </div>
                    ) : (
                      attendance.status === "PRESENT" &&
                      !attendance.checkOut && (
                        <button
                          className="checkout-btn"
                          onClick={() => handleCheckOut(attendance.id)}
                        >
                          <Clock size={18} />
                          Check Out
                        </button>
                      )
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceList;
