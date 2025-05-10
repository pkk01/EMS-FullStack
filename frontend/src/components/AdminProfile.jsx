import axios from "axios";
import { useEffect, useState } from "react";
import "./AdminProfile.css";

const AdminProfile = () => {
  const [adminDetails, setAdminDetails] = useState({
    fullName: "",
    email: "",
    companyName: "",
    role: "Administrator",
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAdminDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No authentication token found");
          setIsLoading(false);
          return;
        }

        const response = await axios.get(
          "http://localhost:8085/api/admins/current",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data) {
          setAdminDetails({
            fullName: response.data.fullName || "",
            email: response.data.email || "",
            companyName: response.data.companyName || "",
            role: "Administrator",
          });
        }
      } catch (error) {
        console.error("Error fetching admin details:", error);
        setError("Failed to load profile details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminDetails();
  }, []);

  if (isLoading) {
    return <div className="profile-loading">Loading profile...</div>;
  }

  if (error) {
    return <div className="profile-error">{error}</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <h2>My Profile</h2>
      </div>
      <div className="profile-content">
        <div className="profile-section">
          <div className="profile-field">
            <label>Full Name</label>
            <div className="field-value">{adminDetails.fullName}</div>
          </div>
          <div className="profile-field">
            <label>Email</label>
            <div className="field-value">{adminDetails.email}</div>
          </div>
          <div className="profile-field">
            <label>Company</label>
            <div className="field-value">{adminDetails.companyName}</div>
          </div>
          <div className="profile-field">
            <label>Role</label>
            <div className="field-value">{adminDetails.role}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
