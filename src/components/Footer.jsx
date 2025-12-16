import React from "react";
import "./Styles.css"

const Footer = () => {
  return (
    <footer
      className="text-white py-3"
      style={{
        background: "black",
        position: "relative",
        bottom: 0,
        width: "100vw",
      }}
    >
      <div className="container text-center ">
        <p className="mb-1">&copy; {new Date().getFullYear()} Maha Metro Rail Project</p>
        <p className="mb-0">
          Designed and Developed by <strong>It Craft Pvt. Ltd</strong>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
