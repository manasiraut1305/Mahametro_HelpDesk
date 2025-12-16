import React, { useContext, useEffect, useState } from "react";
import GenerateTicket from "../../components/user/GenerateTicket";
import logo from "../../assets/images/mahametro.png";
import { AuthContext } from "../AuthContext";
import { Dropdown, Modal, Button, Form } from "react-bootstrap";
import { userResetPasswordFunction } from "../../api/UserResetPassword";
import { userListFunction } from "../../api/UserList";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightFromBracket, faEye } from "@fortawesome/free-solid-svg-icons";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import "../Styles.css";
import { useNavigate } from "react-router-dom";
import Footer from "../Footer";
import { Pagination } from "react-bootstrap";
import closeEye from "../../assets/images/closeEye.png";
import openEye from "../../assets/images/openEye.png";
import usericon from "../../assets/images/user.png";
import logouticon from "../../assets/images/logout.png";
import reseticon from "../../assets/images/reset.png";
import UserRaisedTicket from "../user/UserRaisedTicket";
import UserAssignedTickets from "../user/UserAssignedTicket";
import UserApprovedTicket from "./UserApprovedTicket";
import UserResolvedTicket from "../user/UserResolvedTicket";

const UserCheckStatus = () => {
  const [activeContent, setActiveContent] = useState("UserRaisedTicket");
  const { user, logout } = useContext(AuthContext);
  const [showGenerateTicketModal, setShowGenerateTicketModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [show, setShow] = useState(false);
  const [showLogoutConfirmModal, setShowLogoutConfirmModal] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
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
  const handleShow = (ticket) => {
    setSelectedTicket(ticket);
    setShow(true);
  };

  const handleClose = () => {
    setShow(false);
    setSelectedTicket(null);
  };

  const getAllData = async () => {
    setLoading(true);
    setErrorMessage("");
    try {
      const data = await userListFunction({ id: user?.id });
      

      if (!data?.result || data.result.length === 0) {
        setErrorMessage("No ticket data found.");
        setTickets([]);
      } else {
        setTickets(data.result);
      }
    } catch (err) {
      setErrorMessage("API error occurred: " + err.message);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const [showDefaultPasswordMessage, setShowDefaultPasswordMessage] =
    useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    getAllData();
  }, []);

  useEffect(() => {
    if (
      user?.message === "This is default password. You can reset your password."
    ) {
      setShowDefaultPasswordMessage(true);
      setFadeOut(false);

      const fadeTimer = setTimeout(() => {
        setFadeOut(true);
      }, 4000);

      const hideTimer = setTimeout(() => {
        setShowDefaultPasswordMessage(false);
      }, 5000);

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [user]);

  

  return (
    <>
      <div className="min-vh-100 ">
        {/* Navbar */}
        <nav className="p-3 bg-layout">
          <div className="container-fluid d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
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
                  className="text-white text-decoration-none d-flex align-items-center"
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

        

          {/* Ticket Table */}
          <div className="flex-grow-1 px-5 pt-5 pb-0 card border-0 bg-white">
            {loading ? (
              <div className="d-flex justify-content-center align-items-center">
                <div className="spinner-border text-warning" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : errorMessage ? (
              <div className="alert alert-warning text-center my-3">
                {errorMessage}
              </div>
            ) : tickets.length > 0 ? (
              <>
                {/* Top Section */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h6 className="text-black fw-bold mb-0">
                    Your Ticket Status
                  </h6>

                  <div className="d-flex align-items-center">
                    <h5 className="text-warning mb-0 me-2">Generate Ticket</h5>
                    <Button
                      onClick={() => setShowGenerateTicketModal(true)}
                      style={{
                        backgroundColor: "#ffa500",
                        borderColor: "#F6903E",
                        borderRadius: "50%",
                        color: "white",
                        fontWeight: "bold",
                        width: "30px",
                        height: "30px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: 0,
                      }}
                      className="ms-2"
                    >
                      +
                    </Button>
                  </div>
                </div>

                {/* You can place your ticket listing component/table here */}
              </>
            ) : null}
          </div>

          

          {/* Generate Ticket Modal */}
          <Modal
            show={showGenerateTicketModal}
            onHide={() => setShowGenerateTicketModal(false)}
          >
            <Modal.Header style={{ background: "#4682B4" }} closeButton>
              <Modal.Title className="text-dark">
                Generate New Ticket
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <GenerateTicket
                setModalVisible={setShowGenerateTicketModal}
                generateTicket={getAllData}
              />
            </Modal.Body>
          </Modal>

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

          <Modal
            show={showProfile}
            onHide={() => setShowProfile(false)}
            centered
          >
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


          <div className="container py-5 d-flex">
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
                onClick={() => setActiveContent("UserRaisedTicket")}
                style={{
                  backgroundColor:
                    activeContent === "UserRaisedTicket"
                      ? "rgb(250, 165, 86)"
                      : "black",
                  boxShadow:
                    activeContent === "UserRaisedTicket"
                      ? "4px 4px 0px 0px rgba(255, 224, 208, 0.9)"
                      : "none",
                  width: "100%",
                  marginBottom: "15px",
                  textAlign: "left",
                  color: activeContent === "UserRaisedTicket" ? "#fff" : "#fff",

                  fontWeight:
                    activeContent === "UserRaisedTicket" ? "600" : "normal",
                  // borderRadius: "20px",
                }}
              >
                Raised Tickets
              </button>
              <button
                className="btn border-0 py-4 ps-4 "
                onClick={() => setActiveContent("UserAssignedTickets")}
                style={{
                  backgroundColor:
                    activeContent === "UserAssignedTickets"
                      ? "rgb(250, 165, 86)"
                      : "black",

                  boxShadow:
                    activeContent === "UserAssignedTickets"
                      ? "4px 4px 0px 0px rgba(255, 224, 208, 0.9)"
                      : "none",
                  width: "100%",
                  marginBottom: "15px",
                  textAlign: "left",
                  color:
                    activeContent === "UserAssignedTickets"
                      ? "#000"
                      : "#fff",
                  fontWeight:
                    activeContent === "UserAssignedTickets"
                      ? "600"
                      : "normal",
                  // borderRadius:"20px",
                }}
              >
                Assigned Tickets
              </button>
              <button
                className="btn border-0 py-4 px-4"
                onClick={() => setActiveContent("UserApprovedTicket")}
                style={{
                  backgroundColor:
                    activeContent === "UserApprovedTicket"
                      ? "rgb(250, 165, 86)"
                      : "black",
                  boxShadow:
                    activeContent === "UserApprovedTicket"
                      ? "4px 4px 0px 0px rgba(255, 224, 208, 0.9)"
                      : "none",
                  width: "100%",
                  marginBottom: "15px",
                  textAlign: "left",
                  color:
                    activeContent === "UserApprovedTicket"
                      ? "#000"
                      : "white",
                  fontWeight:
                    activeContent === "UserApprovedTicket" ? "600" : "700",

                  // borderRadius: "20px",
                }}
              >
                Approved Tickets
              </button>
              <button
                className="btn border-0 py-4 px-4"
                onClick={() => setActiveContent("UserResolvedTicket")}
                style={{
                  backgroundColor:
                    activeContent === "UserResolvedTicket"
                      ? "rgb(250, 165, 86)"
                      : "black",
                  boxShadow:
                    activeContent === "UserResolvedTicket"
                      ? "4px 4px 0px 0px rgba(255, 224, 208, 0.9)"
                      : "none",
                  width: "100%",
                  marginBottom: "15px",
                  textAlign: "left",
                  color:
                    activeContent === "UserResolvedTicket"
                      ? "#000"
                      : "white",
                  fontWeight:
                    activeContent === "UserResolvedTicket" ? "600" : "700",
                  // borderRadius:"20px",
                }}
              >
                Resolved Tickets
              </button>
            </div>
          </div>

          <div className="flex-grow-1 px-5 pt-5 pb-0">
            {activeContent === "UserRaisedTicket" && (
              <UserRaisedTicket getAllData={tickets} />
            )}
            {activeContent === "UserAssignedTickets" && (
              <UserAssignedTickets getAllData={tickets}/>
            )}
            {activeContent === "UserApprovedTicket" && (
              <UserApprovedTicket getAllData={tickets}/>
            )}
            {activeContent === "UserResolvedTicket" && (
              <UserResolvedTicket getAllData={tickets}/>
            )}
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default UserCheckStatus;
