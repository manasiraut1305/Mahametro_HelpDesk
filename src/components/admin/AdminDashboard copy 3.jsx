import React, { useContext, useEffect, useState } from "react";
import AdminRaisedTickets from "./AdminRaisedTickets";
import AdminAssignedTickets from "./AdminAssignedTickets";
import AdminApprovedTickets from "./AdminApprovedTickets";
import AdminResolvedTickets from "./AdminResolvedTickets";
import { Dropdown, Modal, Button, Form } from "react-bootstrap";

import { userResetPasswordFunction } from "../../api/UserResetPassword";
// import logo from "../../assets/images/mahametro.png";
import "../Styles.css";
import { useNavigate } from "react-router-dom";

import { AuthContext } from "../AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import { adminAddUserFunction } from "../../api/AdminAddUser";
import Footer from "../Footer";
import AdminCreateUser from "./AdminCreateUser";

import closeEye from "../../assets/images/closeEye.png";
import openEye from "../../assets/images/openEye.png";
import usericon from "../../assets/images/user.png";
import logouticon from "../../assets/images/logout.png";
import reseticon from "../../assets/images/reset.png";
import adduser from "../../assets/images/user.webp";
import Sidebar from "../admin/Sidebar";
import "../Styles.css";

import supporticon from "../../assets/images/HelpDeskIcon-removebg-preview.png";

const AdminDashboard = () => {
  const [activeContent, setActiveContent] = useState("AdminRaisedTickets");
  const [showGenerateTicket, setShowGenerateTicket] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const [resetEmail, setResetEmail] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");
  const [resetPassword, setResetPassword] = useState("");
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showPassword, setShowPassword] = useState("");
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (showResetPassword && user?.email) {
      setResetEmail(user.email);
      setResetPassword("");
      setResetError("");
      setResetSuccess("");
    }
  }, [showResetPassword, user]);

  const handleLogout = () => {
    logout();
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, `=;expires=${new Date(0).toUTCString()};path=/`);
    });
    navigate("/");
  };

  const [showDefaultPasswordMessage, setShowDefaultPasswordMessage] =
    useState(false);
  const [fadeOut, setFadeOut] = useState(false);

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
      const data = await userResetPasswordFunction(resetEmail, resetPassword);

      if (data?.success) {
        setResetSuccess(data.message || "Password reset successfully!");

        setTimeout(() => {
          setShowResetPassword(false);
          setResetEmail("");
          setResetPassword("");
          setResetSuccess("");
        }, 2000);
      } else {
        setResetError(data.message || "Failed to reset password.");
      }
    } catch (error) {
      setResetError("API error: " + error.message);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  useEffect(() => {
    if (
      user?.message === "This is default password. You can reset your password."
    ) {
      setShowDefaultPasswordMessage(true);
      setFadeOut(false); // Ensure it's visible first

      const fadeTimer = setTimeout(() => {
        setFadeOut(true); // Start fading after 4 seconds
      }, 4000);

      const hideTimer = setTimeout(() => {
        setShowDefaultPasswordMessage(false); // Remove after 5 seconds
      }, 5000);

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [user]);

  return (
    <>
      <div
        className="d-flex overflow-scroll-hidden"
        style={{ minHeight: "100vh", backgroundColor: "white" }}
      >
        <Sidebar />

        <div
          className="d-flex flex-column"
          style={{ marginLeft: "200px", width: "calc(100% - 200px)" }} // Add margin and adjust width
        >
          {/* Navbar */}
          <nav className="p-2 " style={{background: "rgba(250, 226, 207, 1)"}}>
            <div className="container-fluid d-flex align-items-center">
              <div className="container-fluid d-flex justify-content-start align-items-center ">
                <h4 className="mb-0 mx-0 text-black">
                  Maha Metro Rail Project
                </h4>
              </div>
              <div className="d-flex loginsect loginpopup">
                <Dropdown align="end">
                  <Dropdown.Toggle
                    variant="link"
                    className="text-white text-decoration-none d-flex align-items-center "
                    style={{ fontSize: "1.2rem", cursor: "pointer" }}
                  >
                    <FontAwesomeIcon
                      icon={faUser}
                      className="me-2"
                      style={{ color: "#f56e00" }}
                    />
                    <span className="fw-semibold text-black">{user?.name}</span>
                  </Dropdown.Toggle>

                  <Dropdown.Menu className="dd-pop">
                    <Dropdown.Item onClick={() => setShowGenerateTicket(true)}>
                      {/* <img src={addticketicon} height={"20px"} /> Add Ticket */}
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => setShowProfile(true)}>
                      <img src={usericon} height={"20px"} /> Profile
                    </Dropdown.Item>

                    <Dropdown.Item onClick={() => setShowResetPassword(true)}>
                      <img src={reseticon} height={"20px"} /> Reset Password
                    </Dropdown.Item>
                    <Dropdown.Item onClick={() => setShowLogoutModal(true)}>
                      <img src={logouticon} height={"18px"} /> Logout
                    </Dropdown.Item>
                    <div className="toparrow"></div>
                  </Dropdown.Menu>
                </Dropdown>
              </div>
            </div>
          </nav>

          <div style={{ position: "relative" }}>
            {showDefaultPasswordMessage && (
              <span
                className={`fade-message ${fadeOut ? "fade-out" : ""}`}
                style={{
                  position: "absolute",
                  top: 15,
                  left: 0,
                  right: 0,
                  textAlign: "center",
                  color: "red",
                  fontWeight: "600",
                  fontSize: "0.95rem",
                  zIndex: 10,
                }}
              >
                This is default password. You can reset your password.
              </span>
            )}
          </div>

          <div className="container fluid px-0 " >
            <div
              className="container d-flex p-3 mt-3 mx-3"
              style={{ background: "rgb(112 204 239 / 34%)", width:"97%" }}
            >
              <div className="col-4 text-center">
                <img
                  className=" helpdesk-icon"
                  src={supporticon}
                  height={"300px"}
                />
              </div>

              <div className="col-4 helpdesk-text">
                How Can I help you Today?
              </div>
            </div>
         

          <div className="container mt-2 flex-grow-1px-0">
            <div
              className="d-flex flex-row align-items-start leftpanel"
              style={{ width: "200px" }}
            >
              <button
                className="btn border-0 py-4 ps-4"
                onClick={() => navigate("/AdminRaisedTickets")}
                style={{
                  background: "rgb(255 165 0 / 61%)",
                  textTransform: "uppercase",
                  fontFamily: "serif",
                  boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px",
                  color: "#000",
                  width: "100%",
                  marginBottom: "15px",
                  textAlign: "left",
                }}
              >
                Raised Ticket
                <small className="d-block fw-bold mt-3 ticketdetails">
                  75 Ticket Raised
                </small>
                {/* <p className="d-block" style={{padding:'20px 20px 0', fontSize:'16px'}}>Raised ticket is commonly used it IT support</p> */}
              </button>

              <button
                className="btn border-0 py-4 ps-4"
                onClick={() => navigate("/AdminAssignedTickets")}
                style={{
                  background: "rgb(255 165 0 / 61%)",
                  textTransform: "uppercase",
                  fontFamily: "serif",
                  boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px",
                  color: "#000",
                  width: "100%",
                  marginBottom: "15px",
                  textAlign: "left",
                }}
              >
                Assigned Tickets
                <small className="d-block fw-bold mt-3 ticketdetails">
                  65 Ticket Assigned
                </small>
                {/* <p className="d-block" style={{padding:'20px 20px 0', fontSize:'16px'}}>Raised ticket is commonly used it IT support</p> */}
              </button>

              <button
                className="btn border-0 py-4 ps-4"
                onClick={() => navigate("/AdminApprovedTickets")}
                style={{
                  background: "rgb(255 165 0 / 61%)",
                  textTransform: "uppercase",
                  fontFamily: "serif",
                  boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px",
                  color: "#000",
                  width: "100%",
                  marginBottom: "15px",
                  textAlign: "left",
                }}
              >
                Approved Tickets
                <small className="d-block fw-bold mt-3 ticketdetails">
                  55 Ticket Approved
                </small>
                {/* <p className="d-block" style={{padding:'20px 2px 0', fontSize:'16px'}}>Raised ticket is commonly used it IT support</p> */}
              </button>

              <button
                className="btn border-0 py-4 ps-4"
                onClick={() => navigate("/AdminResolvedTickets")}
                style={{
                  background: "rgb(255 165 0 / 61%)",
                  textTransform: "uppercase",
                  fontFamily: "serif",
                  boxShadow: "rgba(99, 99, 99, 0.2) 0px 2px 8px 0px",
                  color: "#000",
                  width: "100%",
                  marginBottom: "15px",
                  textAlign: "left",
                }}
              >
                Resolved Tickets
                <small className="d-block fw-bold mt-3 ticketdetails">
                  50 Ticket Resolved
                </small>
              </button>
            </div>
          </div>
        </div>
      </div>
       </div>

      <Modal
        show={showLogoutModal}
        onHide={() => setShowLogoutModal(false)}
        centered
        dialogClassName="custom-modal"
      >
        <Modal.Header closeButton style={{ borderBottom: "none" }}>
          <Modal.Title className="text-dark">🔒 Confirm Logout</Modal.Title>
        </Modal.Header>
        <Modal.Body
          className="text-dark"
          style={{ fontSize: "1rem", padding: "20px" }}
        >
          <p>Are you sure you want to log out?</p>
        </Modal.Body>
        <Modal.Footer style={{ borderTop: "none" }}>
          <Button
            onClick={handleLogout}
            style={{
              backgroundColor: "#ffa500ad",
              borderColor: "#ff7f50",
              color: "white",
              fontWeight: "500",
            }}
            className="px-4"
          >
            Yes, Logout
          </Button>
          <Button
            variant="secondary"
            onClick={() => setShowLogoutModal(false)}
            className="px-4"
          >
            Cancel
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showProfile} onHide={() => setShowProfile(false)} centered>
        <Modal.Header closeButton style={{ borderBottom: "none" }}>
          <Modal.Title className="text-dark"></Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="fw-semibold text-black">
            <div className="d-row mt-2">
              <label>Name: {user?.name}</label>
              <br />
              <label>Email: {user?.email}</label>
              <br />
              <span>Mobile: {user?.mobile}</span>
              <br />
              <span>Designation: {user?.designation}</span>
              <br />
              <span>Department: {user?.department}</span>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer style={{ borderTop: "none" }}></Modal.Footer>
      </Modal>

      {/* Reset Password Modal */}
      <Modal
        show={showResetPassword}
        onHide={() => setShowResetPassword(false)}
        centered
      >
        <Modal.Header closeButton>
          {/* <Modal.Title className="text-dark"><img src={resetpopupicon} height={"30px"} /> Reset Password</Modal.Title> */}
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
              backgroundColor: "rgb(242, 140, 40)",
              borderColor: "#ff7f50",
              color: "white",
              fontWeight: "500",
            }}
            className="px-4"
          >
            Reset
          </Button>
        </Modal.Footer>
      </Modal>

      <Footer />
    </>
  );
};

export default AdminDashboard;
