import axios from "axios";
import React, { useEffect, useState } from "react";
import { Calendar, CheckCircle, Clock, Download, XCircle } from "react-feather";
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
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:8085/api/attendance/date/${selectedDate}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("Fetched attendance data:", response.data);
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
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://localhost:8085/api/attendance/${employeeId}`,
        null,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            status,
            date: selectedDate,
          },
        }
      );

      setAttendanceData((prevData) =>
        prevData.map((attendance) =>
          attendance.employee?.id === employeeId
            ? { ...attendance, ...response.data, employee: attendance.employee }
            : attendance
        )
      );
    } catch (error) {
      console.error("Error marking attendance:", error);
      alert(error.response?.data?.message || "Error marking attendance");
      fetchAttendance();
    }
  };

  const handleCheckOut = async (attendanceId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `http://localhost:8085/api/attendance/${attendanceId}/checkout`,
        null,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setAttendanceData((prevData) =>
        prevData.map((attendance) =>
          attendance.id === attendanceId
            ? { ...attendance, ...response.data, employee: attendance.employee }
            : attendance
        )
      );
    } catch (error) {
      console.error("Error marking checkout:", error);
      alert(error.response?.data?.message || "Error marking checkout");
      fetchAttendance();
    }
  };

  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return "-";
    try {
      const date = new Date(dateTimeStr);
      return date.toLocaleTimeString();
    } catch (error) {
      console.error("Error formatting date:", error);
      return "-";
    }
  };

  const handleDownloadExcel = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:8085/api/attendance/date/${selectedDate}/download`,
        {
          responseType: "blob",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `attendance_${selectedDate}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading attendance:", error);
      alert("Error downloading attendance data");
    }
  };

  if (loading) return <div className="loading">Loading attendance data...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="attendance-list">
      <h2>Attendance Management</h2>

      <div className="attendance-filters">
        <div className="filter-group">
          <label htmlFor="date">Select Date</label>
          <div className="date-input-wrapper">
            <Calendar size={20} />
            <input
              id="date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
        </div>
        <button className="download-btn" onClick={handleDownloadExcel}>
          <Download size={18} />
          Download Excel
        </button>
      </div>

      <div className="attendance-table-container">
        <table className="attendance-table">
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
            {attendanceData.map((attendance) => {
              const employee = attendance.employee;
              if (!employee) return null;

              const showMarkButtons =
                attendance.status === "NOT_MARKED" || !attendance.status;
              const showCheckOutButton =
                attendance.status === "PRESENT" && !attendance.checkOut;

              console.log("Attendance record:", {
                employeeName: `${employee.firstName} ${employee.lastName}`,
                status: attendance.status,
                showMarkButtons,
                showCheckOutButton,
              });

              return (
                <tr key={`${employee.id}-${attendance.id}`}>
                  <td>{`${employee.firstName} ${employee.lastName}`}</td>
                  <td>
                    <span
                      className={`status-${
                        attendance.status?.toLowerCase() || "not-marked"
                      }`}
                    >
                      {attendance.status || "Not Marked"}
                    </span>
                  </td>
                  <td>{formatDateTime(attendance.checkIn)}</td>
                  <td>{formatDateTime(attendance.checkOut)}</td>
                  <td>
                    <div className="actions">
                      {showMarkButtons && (
                        <>
                          <button
                            className="mark-btn mark-present"
                            onClick={() =>
                              handleMarkAttendance(employee.id, "PRESENT")
                            }
                          >
                            <CheckCircle size={18} />
                            Present
                          </button>
                          <button
                            className="mark-btn mark-absent"
                            onClick={() =>
                              handleMarkAttendance(employee.id, "ABSENT")
                            }
                          >
                            <XCircle size={18} />
                            Absent
                          </button>
                        </>
                      )}
                      {showCheckOutButton && (
                        <button
                          className="mark-btn mark-late"
                          onClick={() => handleCheckOut(attendance.id)}
                        >
                          <Clock size={18} />
                          Check Out
                        </button>
                      )}
                    </div>
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
