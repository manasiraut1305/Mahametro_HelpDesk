import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import ProjectCard from "./ProjectCard";
import {
  MdDashboard,
  MdTableChart,
  MdNotifications,
  MdPassword,
  MdToken,
} from "react-icons/md";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import closeEye from "../../assets/images/closeEye.png";
import openEye from "../../assets/images/openEye.png";
import logo from "../../assets/images/mahametro.png";
import "../Styles.css";
import { AuthContext } from "../AuthContext";
import { userResetPasswordFunction } from "../../api/UserResetPassword";

function Sidebar({ setActiveContent }) {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [password, setPassword] = useState(""); // This state seems unused in the provided snippet
  const [showPassword, setShowPassword] = useState(false);

  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showReportClick, setShowReportClick] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetPassword, setResetPassword] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");
   const [showReportModal, setShowReportModal] = useState(false);
  const [showProjectCard, setShowProjectCard] = useState(false);

  const handleReportClick = () => {
    navigate("/ProjectCard");
  };

  useEffect(() => {
    if (showResetPassword && user?.email) {
      setResetEmail(user.email); // Pre-fill email if user is logged in
      setResetPassword("");
      setResetError("");
      setResetSuccess("");
    }
  }, [showResetPassword, user]);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleResetPassword = async () => {
    setResetError("");
    setResetSuccess("");

    if (!resetPassword) {
      setResetError("Please enter a new password.");
      return;
    }

    if (resetPassword.length < 6) {
      setResetError("Password must be at least 6 characters long.");
      return;
    }

    try {
      const data = await userResetPasswordFunction(user.email, resetPassword);

      if (data?.success) {
        setResetSuccess(data.message || "Password reset successfully!");
        navigate("/");
      } else {
        setResetError(data.message || "Failed to reset password.");
      }
    } catch (error) {
      setResetError("API error: " + error.message);
    }
  };

  return (
    <>
      {" "}
      {/* React Fragment to return multiple top-level elements */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <img src={logo} alt="Logo" style={{ height: "50px" }} />
          <h3>Maha Metro Rail Project</h3>
        </div>
        <nav className="sidebar-nav">
          <ul>
            <li
              className="nav-item active"
              onClick={() => setActiveContent("")}
            >
              <MdDashboard className="nav-icon" />
              <span>Dashboard</span>
            </li>
            <li
              className="nav-item"
              onClick={() => setActiveContent("OperatorAddTicket")}
            >
              <MdTableChart className="nav-icon me-2" />
              <span>Add Ticket</span>
            </li>
            <li
  className={`nav-item ${activeContent === "OperatorRaisedTicket" ? "active" : ""}`}
  onClick={() => {
    setActiveContent("OperatorRaisedTicket");
    navigate("/operator-raised-tickets");
  }}
>
  <MdToken className="nav-icon me-2" />
  <span>Raised Tickets</span>
</li>
            <li
              className="nav-item"
              onClick={() => setActiveContent("OperatorAssignedTicket")}
            >
              <MdToken className="nav-icon me-2" />
              <span>Assigned Tickets</span>
            </li>
            <li
              className="nav-item"
              onClick={() => setActiveContent("OperatorApprovedTicket")}
            >
              <MdToken className="nav-icon me-2" />
              <span>Approved Tickets</span>
            </li>
            <li
              className="nav-item"
              onClick={() => setActiveContent("OperatorResolvedTicket")}
            >
              <MdToken className="nav-icon me-2" />
              <span>Resolved Tickets</span>
            </li>
            <li className="nav-item-divider"></li>

           <li
              className="nav-item"
              onClick={() => setActiveContent("ProjectCard")}
            >
              <MdTableChart className="nav-icon me-2" />
              <span>Report</span>
            </li>

            <li
              className="nav-item"
              onClick={() => setShowResetPassword(true)}
              style={{ cursor: "pointer" }}
            >
              <MdPassword className="nav-icon" />
              <span>Reset Password</span>
            </li>
          </ul>
        </nav>
      </aside>
      {/* Reset Password Modal */}
      <Modal
        show={showResetPassword}
        onHide={() => setShowResetPassword(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title style={{ color: "white" }}>
            🔐 Reset Password
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="text-dark">Email</Form.Label>
              <Form.Control
                type="email"
                value={resetEmail}
                disabled // Email is typically disabled for current user's reset
                className="bg-light"
              />
            </Form.Group>

            <Form.Group className="mb-3 position-relative">
              <Form.Label className="text-dark">New Password</Form.Label>
              <Form.Control
                type={showPassword ? "text" : "password"}
                value={resetPassword}
                onChange={(e) => setResetPassword(e.target.value)}
                placeholder="Enter new password"
              />
              <img
                src={showPassword ? openEye : closeEye}
                alt={showPassword ? "Hide password" : "Show password"}
                className="visibility-icon"
                onClick={togglePasswordVisibility}
                role="button"
                tabIndex="0"
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    togglePasswordVisibility();
                  }
                }}
                style={{
                  position: "absolute",
                  right: "10px",
                  top: "38px",
                  cursor: "pointer",
                  height: "20px",
                  zIndex: "2",
                }}
              />
            </Form.Group>

            {resetError && (
              <div className="alert alert-danger py-2 text-center">
                {resetError}
              </div>
            )}

            {resetSuccess && (
              <div className="alert alert-success py-2 text-center">
                {resetSuccess}
              </div>
            )}
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowResetPassword(false)}
            className="px-4"
          >
            Cancel
          </Button>
          <Button
            onClick={handleResetPassword}
            style={{
              backgroundColor: "#4682B4",
              borderColor: "#4682B4",
              color: "white",
              fontWeight: "500",
            }}
            className="px-4"
          >
            Reset
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal
        show={showReportModal} // Changed to the correct state variable
        onHide={() => setShowReportModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title style={{ color: "white" }}>Report</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ProjectCard />
        </Modal.Body>
      </Modal>
    </>
  );
}

export default Sidebar;
