import axios from "axios";
import React, { useEffect, useState } from "react";
import "./EmployeeForm.css";

const EmployeeForm = ({ employee, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    department: "",
    position: "",
    salary: "",
    joiningDate: "",
  });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (employee) {
      setFormData(employee);
    }
  }, [employee]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError(null); // Clear error when user makes changes
  };

  const validateForm = () => {
    if (!formData.firstName.trim()) return "First name is required";
    if (!formData.lastName.trim()) return "Last name is required";
    if (!formData.email.trim()) return "Email is required";
    if (!formData.phoneNumber.trim()) return "Phone number is required";
    if (!formData.department.trim()) return "Department is required";
    if (!formData.position.trim()) return "Position is required";
    if (!formData.salary) return "Salary is required";
    if (!formData.joiningDate) return "Joining date is required";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      console.log("Submitting employee data:", formData);
      const token = localStorage.getItem("token");
      if (employee) {
        await axios.put(
          `http://localhost:8085/api/employees/${employee.id}`,
          formData,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        console.log("Employee updated successfully");
      } else {
        await axios.post("http://localhost:8085/api/employees", formData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log("Employee created successfully");
      }
      onSave();
    } catch (error) {
      console.error("Error saving employee:", error);
      setError(
        error.response?.data?.message ||
          "Failed to save employee. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="employee-form">
      <h2>{employee ? "Edit Employee" : "Add New Employee"}</h2>
      {error && <div className="form-error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>First Name:</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Last Name:</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Phone Number:</label>
          <input
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Department:</label>
          <input
            type="text"
            name="department"
            value={formData.department}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Position:</label>
          <input
            type="text"
            name="position"
            value={formData.position}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Salary:</label>
          <input
            type="number"
            name="salary"
            value={formData.salary}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
          />
        </div>
        <div className="form-group">
          <label>Joining Date:</label>
          <input
            type="date"
            name="joiningDate"
            value={formData.joiningDate}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-buttons">
          <button type="submit" className="save-btn" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="cancel-btn"
            disabled={isSubmitting}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EmployeeForm;
