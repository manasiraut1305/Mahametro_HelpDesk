// src/components/Sidebar.js
import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
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
import { userResetPasswordFunction } from "../../api/UserResetPassword";
import "../Styles.css";
import { AuthContext } from "../AuthContext";
import logo from "../../assets/images/mahametro.png";

function Sidebar({ setActiveContent }) {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetPassword, setResetPassword] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");

  useEffect(() => {
    if (showResetPassword && user?.email) {
      setResetEmail(user.email);
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
      <aside className="sidebar">
        <nav className="sidebar-nav">
          <ul>
            <li>
              <span>{user.name}'s Dashboard</span>
            </li>
            <hr />

    
              <Link to="" className="nav-item">
            <li onClick={() => setActiveContent("1")}>
                <span>Dashboard</span>
                <MdDashboard className="nav-icon" />
            </li>
              </Link>

              <Link to="AdminCreateUser" className="nav-item">
            <li >
              <span>Add User</span>
              <MdTableChart className="nav-icon me-2" />
            </li>
              </Link>
              
              
              <Link to="AdminEditUser" className="nav-item">
            <li>
              <span>Update User</span>
              <MdTableChart className="nav-icon me-2" />
            </li>
              </Link>
              
              <Link to="AdminRaisedTicket" className="nav-item">
            <li>
              <span>Raised Tickets</span>
              <MdToken className="nav-icon me-2" />
            </li>
              </Link>
              
              <Link to="AdminAssignedTicket" className="nav-item">
            <li >
              <span>Assigned Tickets</span>
              <MdToken className="nav-icon me-2" />
              
            </li>
              </Link>
              <Link to="AdminApprovedTicket" className="nav-item">
            <li>
              <span>Approved Tickets</span>
              <MdToken className="nav-icon me-2" />
            </li>
              </Link>
              <Link to="AdminResolvedTicket" className="nav-item">
            <li>
              <span>Resolved Tickets</span>
              <MdToken className="nav-icon me-2" />
              
            </li>
              </Link>
              <Link to="OperatorRejectedTickets" className="nav-item">
            <li>
              <span>Rejected Tickets</span>
              <MdToken className="nav-icon me-2" />
              
            </li>
              </Link>
            <li className="nav-item-divider"></li> {/* Visual divider */}
            {/* <li className="nav-item">
              <MdNotifications className="nav-icon" />
              <span>Notifications</span>
            </li> */}
              <Link to="CategoryList" className="nav-item">
             <li>
              <span>Category List</span>
              <MdToken className="nav-icon me-2" />
            </li>
              </Link>
              <Link to="AdminDepartmentTable" className="nav-item">
             <li>
              <span>Department List</span>
              <MdToken className="nav-icon me-2" />
            </li>
              </Link>
              <Link to="AdminAssignHead" className="nav-item">
             <li>
              <span>Assign Head</span>
              <MdToken className="nav-icon me-2" />
            </li>
              </Link>
              <Link to="AdminIssueType " className="nav-item">
             <li>
              <span>Issue Type List</span>
              <MdToken className="nav-icon me-2" />
            </li>
              </Link>
              <Link to="AdminUserStatus" className="nav-item">
             <li>
              <span>User Status</span>
              <MdToken className="nav-icon me-2" />
            </li>
              </Link>
            <li
              className="nav-item"
              onClick={() => setShowResetPassword(true)}
              style={{ cursor: "pointer" }}
            >
              <span>Reset Password</span>
              <MdPassword className="nav-icon" />
            </li>
          </ul>
        </nav>
      </aside>

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
                disabled
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
    </>
  );
}

export default Sidebar;
