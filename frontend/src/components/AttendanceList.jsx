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
    if (!employeeId || !status) {
      alert("Invalid employee or status");
      return;
    }

    try {
      console.log(
        `Marking attendance for employee ${employeeId} with status ${status} on date ${selectedDate}`
      );

      // Optimistically update the UI
      setAttendanceData((prevData) => {
        return prevData.map((attendance) => {
          if (attendance.employee && attendance.employee.id === employeeId) {
            return {
              ...attendance,
              status: status,
              checkIn: new Date().toISOString(),
            };
          }
          return attendance;
        });
      });

      const response = await axios.post(
        `http://localhost:8085/api/attendance/${employeeId}`,
        null,
        {
          params: {
            status,
            date: selectedDate,
          },
        }
      );

      console.log("Attendance marked successfully:", response.data);

      // Update with the actual server response
      setAttendanceData((prevData) => {
        return prevData.map((attendance) => {
          if (attendance.employee && attendance.employee.id === employeeId) {
            return {
              ...attendance,
              ...response.data,
              employee: attendance.employee,
            };
          }
          return attendance;
        });
      });
    } catch (error) {
      console.error("Error marking attendance:", error);
      // Revert the optimistic update on error
      fetchAttendance();

      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else if (error.message.includes("already marked")) {
        alert("Attendance already marked for this employee today");
      } else if (error.message.includes("Invalid status")) {
        alert("Invalid attendance status");
      } else {
        alert("Error marking attendance. Please try again.");
      }
    }
  };

  const handleCheckOut = async (attendanceId) => {
    if (!attendanceId) {
      alert("Invalid attendance ID");
      return;
    }

    try {
      console.log(`Marking checkout for attendance record ${attendanceId}`);

      // Optimistically update the UI
      setAttendanceData((prevData) => {
        return prevData.map((attendance) => {
          if (attendance.id === attendanceId) {
            return {
              ...attendance,
              checkOut: new Date().toISOString(),
            };
          }
          return attendance;
        });
      });

      const response = await axios.put(
        `http://localhost:8085/api/attendance/${attendanceId}/checkout`
      );

      console.log("Checkout marked successfully:", response.data);

      // Update with the actual server response
      setAttendanceData((prevData) => {
        return prevData.map((attendance) => {
          if (attendance.id === attendanceId) {
            return {
              ...attendance,
              ...response.data,
              employee: attendance.employee,
            };
          }
          return attendance;
        });
      });
    } catch (error) {
      console.error("Error marking checkout:", error);
      // Revert the optimistic update on error
      fetchAttendance();

      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else if (error.message.includes("already marked")) {
        alert("Checkout already marked for this attendance record");
      } else {
        alert("Error marking checkout. Please try again.");
      }
    }
  };

  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return "-";
    try {
      const date = new Date(dateTimeStr);
      if (isNaN(date.getTime())) {
        console.error("Invalid date:", dateTimeStr);
        return "-";
      }
      return date.toLocaleTimeString();
    } catch (error) {
      console.error("Error formatting date:", error);
      return "-";
    }
  };

  const handleDownloadExcel = async () => {
    try {
      const response = await axios.get(
        `http://localhost:8085/api/attendance/date/${selectedDate}/download`,
        { responseType: "blob" }
      );

      // Create a blob from the response data
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);

      // Create a temporary link element
      const link = document.createElement("a");
      link.href = url;
      link.download = `attendance_${selectedDate}.xlsx`;

      // Append link to body, click it, and remove it
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up the URL
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading attendance:", error);
      alert("Error downloading attendance data. Please try again.");
    }
  };

  if (loading) return <div className="loading">Loading attendance data...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="attendance-list">
      <div className="attendance-header">
        <h2>Attendance Management</h2>
        <div className="header-actions">
          <div className="date-picker">
            <Calendar size={20} />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </div>
          <button className="download-btn" onClick={handleDownloadExcel}>
            <Download size={18} />
            Download Excel
          </button>
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
