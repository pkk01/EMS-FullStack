import React from "react";
import "./Watermark.css";

const Watermark = () => {
  const currentYear = new Date().getFullYear();
  return (
    <div className="watermark">
      <span className="watermark-text">
        © {currentYear} Developed by Pratham
      </span>
    </div>
  );
};

export default Watermark;
