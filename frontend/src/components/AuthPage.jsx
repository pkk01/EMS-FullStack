import { useState } from "react";
import {
  ArrowLeft, // Add this
  BarChart2,
  Globe,
  LogIn,
  Shield,
  UserPlus,
  Users,
} from "react-feather";
import { useNavigate } from "react-router-dom";
import "./Auth.css";
import APIService from "./api";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [flipped, setFlipped] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    companyName: "",
    email: "",
    password: "",
  });
  const [alert, setAlert] = useState({ show: false, message: "", type: "" });

  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleFlip = () => {
    setFlipped(!flipped);
    setIsLogin(!isLogin);
  };

  const showAlert = (message, type) => {
    setAlert({ show: true, message, type });
    setTimeout(() => {
      setAlert({ show: false, message: "", type: "" });
    }, 5000); // Hide after 5 seconds
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await APIService.post("/api/admins/register", formData);
      showAlert("Registration successful! Please login.", "success");
      // Clear form data
      setFormData({
        fullName: "",
        companyName: "",
        email: "",
        password: "",
      });
      // Flip to login side after short delay
      setTimeout(() => {
        setFlipped(false);
        setIsLogin(true);
      }, 1500);
    } catch (error) {
      showAlert(
        error.message || "Registration failed. Please try again.",
        "error"
      );
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await APIService.post("/api/admins/login", {
        email: formData.email,
        password: formData.password,
      });

      // Check if response contains token (updated response structure)
      if (response && response.token) {
        localStorage.setItem("token", response.token);
        localStorage.setItem("adminEmail", formData.email); // Store admin email
        showAlert("Login successful!", "success");
        // Navigate to dashboard after a short delay
        setTimeout(() => {
          navigate("/admin-dashboard");
        }, 1000);
      } else {
        showAlert("Invalid credentials or missing token", "error");
      }
    } catch (error) {
      console.error("Login error:", error);
      showAlert(error.message || "Login failed. Please try again.", "error");
    }
  };

  return (
    <div className="auth-container">
      {alert.show && (
        <div className={`alert alert-${alert.type}`}>{alert.message}</div>
      )}
      <div className="auth-background">
        <div className="company-info">
          <h1 className="company-name">
            Staff<span>Sync</span>
          </h1>
          <p className="company-slogan">Empowering HR Excellence</p>
          <div className="feature-list">
            <div className="feature-item">
              <Shield size={20} />
              <span>Enterprise-Grade Security</span>
            </div>
            <div className="feature-item">
              <Users size={20} />
              <span>Advanced Team Management</span>
            </div>
            <div className="feature-item">
              <BarChart2 size={20} />
              <span>Real-time Analytics</span>
            </div>
            <div className="feature-item">
              <Globe size={20} />
              <span>Global Workforce Solutions</span>
            </div>
          </div>
        </div>
      </div>

      <a href="/" className="back-button">
        <ArrowLeft size={20} />
      </a>

      <div className={`auth-card ${flipped ? "flipped" : ""}`}>
        {/* Login Side */}
        <div className="auth-form login-form">
          <div className="auth-header">
            <LogIn size={32} className="auth-icon" />
            <h2>Welcome Back</h2>
            <p>Access your workspace securely</p>
          </div>

          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="your@company.com"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
              />
              <a href="#" className="forgot-password">
                Forgot password?
              </a>
            </div>
            <button type="submit" className="auth-button">
              Sign In <LogIn size={18} />
            </button>
          </form>

          <div className="auth-footer">
            <button onClick={toggleFlip} className="flip-button">
              New to StaffSync? <span>Create Account</span>
            </button>
            <p className="terms">
              By signing in, you agree to our <a href="#">Terms of Service</a>{" "}
              and <a href="#">Privacy Policy</a>
            </p>
          </div>
        </div>

        {/* Register Side */}
        <div className="auth-form register-form">
          <div className="auth-header">
            <UserPlus size={32} className="auth-icon" />
            <h2>Create Account</h2>
            <p>Join thousands of companies using StaffSync</p>
          </div>

          <form onSubmit={handleRegister}>
            <div className="input-group">
              <label>Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="John Doe"
              />
            </div>
            <div className="input-group">
              <label>Company Name</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                placeholder="Your Company Ltd."
              />
            </div>
            <div className="input-group">
              <label>Work Email</label>
              <input
                type="email"
                name="email"
                placeholder="your@company.com"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            <div className="input-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
              />
              <small className="password-hint">
                Must be at least 8 characters
              </small>
            </div>
            <button type="submit" className="auth-button">
              Create Account <UserPlus size={18} />
            </button>
          </form>

          <div className="auth-footer">
            <button onClick={toggleFlip} className="flip-button">
              Already have an account? <span>Sign In</span>
            </button>
            <p className="terms">
              By creating an account, you agree to our{" "}
              <a href="#">Terms of Service</a> and{" "}
              <a href="#">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
