import React, { useContext, useState, useEffect } from "react";
import OperatorRaisedTicket from "./OperatorRaisedTicket";
import OperatorAssignedTicket from "./OperatorAssignedTicket";
import { raisedTicketFunction } from "../../api/RaisedTicket";
import OperatorApprovedTickets from "./OperatorApprovedTickets";
import OperatorResolvedTicket from "./OperatorResolvedTicket";
import { Dropdown, Modal, Button, Form } from "react-bootstrap";
import logo from "../../assets/images/mahametro.png";
import "../Styles.css";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import Footer from "../Footer";
import { userResetPasswordFunction } from "../../api/UserResetPassword";
import closeEye from "../../assets/images/closeEye.png";
import openEye from "../../assets/images/openEye.png";
import usericon from "../../assets/images/user.png";
import logouticon from "../../assets/images/logout.png";
import reseticon from "../../assets/images/reset.png";
import addticketicon from "../../assets/images/add_ticket.png";
import OperatorAddTicket from "./OperatorAddTicket";

const OperatorDashboard = () => {
  const [activeContent, setActiveContent] = useState("OperatorRaisedTicket");
  const [showGenerateTicket, setShowGenerateTicket] = useState(false);
  const { user, logout, hideLoading, showLoading } = useContext(AuthContext);
  const [resetEmail, setResetEmail] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetSuccess, setResetSuccess] = useState("");
  const [resetPassword, setResetPassword] = useState("");
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showPassword, setShowPassword] = useState("");
  const [showAddTicket, setShowAddTicket] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [raisedData, setRaisedData] = useState([]);
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

   const [showModal, setShowModal] = useState(false);

  const handleOpen = () => setShowModal(true);
  const handleClose = () => setShowModal(false);
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

  const getAllData = async () => {
      try {
        showLoading();
        const data = await raisedTicketFunction();
        hideLoading();
  
        if (!data?.result) setErrorMessage("No ticket data found.");
        else setRaisedData(data.result);
      } catch (err) {
        hideLoading();
        setErrorMessage("API error occurred: " + err.message);
      }
    };
  
    useEffect(() => {
      getAllData();
    }, []);

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
        className="d-flex flex-column"
        style={{ minHeight: "100vh", width: "100vw" }}
      >
        {/* Navbar */}
        <nav className="p-3 bg-layout">
          <div className="container-fluid d-flex align-items-center">
            <div className="container-fluid d-flex justify-content-start align-items-center ">
              <img
                src={logo}
                alt="Nagpur Metro Logo"
                style={{ height: "70px" }}
              />

              <h4 className="mb-0 mx-5 text-black">Maha Metro Rail Project</h4>
            </div>
            <div className="d-flex loginsect loginpop">
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
                  <Dropdown.Item onClick={handleOpen}>
                    <img src={addticketicon} height="20px" alt="" />{" "}
                    Add Ticket
                  </Dropdown.Item>

                  <Modal show={showModal} onHide={handleClose} size="lg">
                    <Modal.Header
                      closeButton
                      style={{ backgroundColor: "#f0a150" }}
                    >
                      <Modal.Title>Add New Ticket</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      <OperatorAddTicket 
                      onClose={handleClose}
                      setModalVisible={setShowModal}
                      getAllData={getAllData}
                       />
                    </Modal.Body>
                  </Modal>

                  {/* Conditionally render the component */}
                  {showAddTicket && <OperatorAddTicket />}
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
                backgroundColor: "rgb(242, 140, 40)",
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
            <Modal.Title className="text-dark">🔐 Reset Password</Modal.Title>
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
        {/* Main Body */}
        <div className="container mt-5 flex-grow-1 d-flex flex-row px-0">
          <div
            className="d-flex flex-column align-items-start leftpanel"
            style={{ maxHeight: "570px" }}
          >
            <div
              style={{
                marginTop: "70px",
              }}
            >
              <button
                className="btn border-0 py-4 ps-4"
                onClick={() => setActiveContent("OperatorRaisedTicket")}
                style={{
                  backgroundColor:
                    activeContent === "OperatorRaisedTicket"
                      ? "rgb(250, 165, 86)"
                      : "black",
                  boxShadow:
                    activeContent === "OperatorRaisedTicket"
                      ? "4px 4px 0px 0px rgba(255, 224, 208, 0.9)"
                      : "none",
                  width: "100%",
                  marginBottom: "15px",
                  textAlign: "left",
                  color:
                    activeContent === "OperatorRaisedTicket" ? "#fff" : "#fff",

                  fontWeight:
                    activeContent === "OperatorRaisedTicket" ? "600" : "normal",
                  // borderRadius: "20px",
                }}
              >
                Raised Tickets
              </button>
              <button
                className="btn border-0 py-4 ps-4 "
                onClick={() => setActiveContent("OperatorAssignedTicket")}
                style={{
                  backgroundColor:
                    activeContent === "OperatorAssignedTicket"
                      ? "rgb(250, 165, 86)"
                      : "black",

                  boxShadow:
                    activeContent === "OperatorAssignedTicket"
                      ? "4px 4px 0px 0px rgba(255, 224, 208, 0.9)"
                      : "none",
                  width: "100%",
                  marginBottom: "15px",
                  textAlign: "left",
                  color:
                    activeContent === "OperatorAssignedTicket"
                      ? "#000"
                      : "#fff",
                  fontWeight:
                    activeContent === "OperatorAssignedTicket"
                      ? "600"
                      : "normal",
                  // borderRadius:"20px",
                }}
              >
                Assigned Tickets
              </button>
              <button
                className="btn border-0 py-4 px-4"
                onClick={() => setActiveContent("OperatorApprovedTickets")}
                style={{
                  backgroundColor:
                    activeContent === "OperatorApprovedTickets"
                      ? "rgb(250, 165, 86)"
                      : "black",
                  boxShadow:
                    activeContent === "OperatorApprovedTickets"
                      ? "4px 4px 0px 0px rgba(255, 224, 208, 0.9)"
                      : "none",
                  width: "100%",
                  marginBottom: "15px",
                  textAlign: "left",
                  color:
                    activeContent === "OperatorApprovedTickets"
                      ? "#000"
                      : "white",
                  fontWeight:
                    activeContent === "OperatorApprovedTickets" ? "600" : "700",

                  // borderRadius: "20px",
                }}
              >
                Approved Tickets
              </button>
              <button
                className="btn border-0 py-4 px-4"
                onClick={() => setActiveContent("OperatorResolvedTicket")}
                style={{
                  backgroundColor:
                    activeContent === "OperatorResolvedTicket"
                      ? "rgb(250, 165, 86)"
                      : "black",
                  boxShadow:
                    activeContent === "OperatorResolvedTicket"
                      ? "4px 4px 0px 0px rgba(255, 224, 208, 0.9)"
                      : "none",
                  width: "100%",
                  marginBottom: "15px",
                  textAlign: "left",
                  color:
                    activeContent === "OperatorResolvedTicket"
                      ? "#000"
                      : "white",
                  fontWeight:
                    activeContent === "OperatorResolvedTicket" ? "600" : "700",
                  // borderRadius:"20px",
                }}
              >
                Resolved Tickets
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-grow-1 px-5 pt-5 pb-0">
            {activeContent === "OperatorRaisedTicket" && (
              <OperatorRaisedTicket 
              raisedData={raisedData}
              getAllData={getAllData}
              />
            )}
            {activeContent === "OperatorAssignedTicket" && (
              <OperatorAssignedTicket />
            )}
            {activeContent === "OperatorApprovedTickets" && (
              <OperatorApprovedTickets />
            )}
            {activeContent === "OperatorResolvedTicket" && (
              <OperatorResolvedTicket />
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default OperatorDashboard;
