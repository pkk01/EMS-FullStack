import React, { useEffect, useState } from "react";
import {
  BarChart2,
  Bell,
  CheckCircle,
  Clock,
  Database,
  HelpCircle,
  LogIn,
  Mail,
  Moon,
  PlayCircle,
  Settings,
  Shield,
  Sun,
  Users,
} from "react-feather";
import "./Landing.css";

const Landing = () => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [darkMode]);

  return (
    <div className="landing-container">
      {/* Glass Navbar */}
      <nav className="navbar">
        <div className="logo">
          <Users size={28} className="logo-icon" />
          <span>StaffSync</span>
        </div>
        <div className="nav-links">
          <a href="#features">
            <BarChart2 size={18} /> Features
          </a>
          <a href="#solutions">
            <Settings size={18} /> Solutions
          </a>
          <a href="#security">
            <Shield size={18} /> Security
          </a>
          <a href="#contact">
            <Mail size={18} /> Contact
          </a>
          <button
            className="theme-toggle"
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Toggle theme"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
        <button className="nav-button" onClick={() => window.location.href = "/auth"}>
          <LogIn size={18} /> Login
        </button>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>
            Modern Employee Management <span>Simplified</span>
          </h1>
          <p className="hero-description">
            StaffSync empowers HR teams with intuitive tools to manage the
            entire employee lifecycle — from onboarding to offboarding — all in
            one unified platform.
          </p>
          <div className="hero-buttons">
            <button className="primary-button" onClick={() => window.location.href = "/auth"}>
              Get Started <LogIn size={18} />
            </button>
            <button className="secondary-button">
              Watch Demo <PlayCircle size={18} />
            </button>
          </div>
        </div>
        <div className="hero-image">
          <div className="floating-card">
            <Database size={24} />
            <h3>Centralized Data</h3>
            <p>All employee records in one secure location</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="section-header">
          <h2>Powerful Features</h2>
          <p>Everything you need to manage your workforce effectively</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">
              <Clock size={24} />
            </div>
            <h3>Time Tracking</h3>
            <p>
              Automated attendance and leave management with real-time reporting
            </p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <BarChart2 size={24} />
            </div>
            <h3>Analytics</h3>
            <p>Comprehensive workforce analytics and visual dashboards</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <Shield size={24} />
            </div>
            <h3>Security</h3>
            <p>Enterprise-grade security with role-based access controls</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">
              <Bell size={24} />
            </div>
            <h3>Alerts</h3>
            <p>Custom notifications for important HR events and deadlines</p>
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section id="solutions" className="solutions-section">
        <div className="solution-box">
          <div className="solution-content">
            <h2>
              HR Solutions <span>Tailored to Your Needs</span>
            </h2>
            <p>
              Whether you're a growing startup or an established enterprise,
              StaffSync scales with your business. Our modular approach lets you
              start with what you need and add functionality as you grow.
            </p>
            <ul className="solution-list">
              <li>
                <CheckCircle size={16} /> Employee database management
              </li>
              <li>
                <CheckCircle size={16} /> Payroll integration
              </li>
              <li>
                <CheckCircle size={16} /> Performance tracking
              </li>
              <li>
                <CheckCircle size={16} /> Recruitment tools
              </li>
            </ul>
          </div>
          <div className="solution-image">
            <div className="stats-card">
              <h4>98%</h4>
              <p>Customer Satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="security-section">
        <div className="security-box">
          <div className="security-icon">
            <Shield size={48} />
          </div>
          <h2>Enterprise-Grade Security</h2>
          <p>
            Your data's security is our top priority. StaffSync employs
            bank-level encryption, regular security audits, and compliance with
            global data protection regulations.
          </p>
          <div className="security-features">
            <div className="security-item">
              <CheckCircle size={18} /> GDPR Compliant
            </div>
            <div className="security-item">
              <CheckCircle size={18} /> SOC 2 Certified
            </div>
            <div className="security-item">
              <CheckCircle size={18} /> Two-Factor Authentication
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-box">
          <h2>Ready to Transform Your HR Operations?</h2>
          <p>
            Join thousands of companies who trust StaffSync for their employee
            management needs
          </p>
          <button className="cta-button">
            Request Demo <HelpCircle size={18} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-logo">
            <Users size={24} />
            <span>StaffSync</span>
          </div>
          <div className="footer-links">
            <div className="link-group">
              <h4>Product</h4>
              <a href="#">Features</a>
              <a href="#">Pricing</a>
              <a href="#">Integrations</a>
            </div>
            <div className="link-group">
              <h4>Company</h4>
              <a href="#">About Us</a>
              <a href="#">Careers</a>
              <a href="#">Blog</a>
            </div>
            <div className="link-group">
              <h4>Support</h4>
              <a href="#">Help Center</a>
              <a href="#">Contact Us</a>
              <a href="#">Status</a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} StaffSync. All rights reserved.</p>
          <div className="legal-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Cookies</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
