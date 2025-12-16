import React, { useContext, useEffect, useState } from "react";
import GenerateTicket from "../../components/user/GenerateTicket";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/images/mahametro.png";
import { AuthContext } from "../AuthContext";
import { Dropdown, Modal, Button, Form } from "react-bootstrap";
import { userResetPasswordFunction } from "../../api/UserResetPassword";
import { userListFunction } from "../../api/UserList";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightFromBracket, faEye } from "@fortawesome/free-solid-svg-icons";
import { faUser } from "@fortawesome/free-solid-svg-icons";
import "../Styles.css";
import Footer from "../Footer"

const UserCheckStatus = () => {
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

  useEffect(() => {
    if (showResetPassword && user?.email) {
      setResetEmail(user.email);
      setResetPassword("");
      setResetError("");
      setResetSuccess("");
    }
  }, [showResetPassword, user]);

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
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = tickets.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(tickets.length / itemsPerPage);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, =;expires=${new Date(0).toUTCString()};path=/);
    });
    navigate("/");
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
      console.log("data", data);

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

  useEffect(() => {
    getAllData();
  }, []);

  console.log(user);

  return (
    <>
      <div className="min-vh-100 bg-white">
        {/* Navbar */}
        <nav className="p-4 bg-black">
          <div className="container-fluid d-flex align-items-center">
            <div className="container-fluid d-flex justify-content-start align-items-center">
              <img
                src={logo}
                alt="Nagpur Metro Logo"
                style={{ height: "70px" }}
              />

              <h4 className="mb-0 mx-5 text-white">Maha Metro Rail Project</h4>
            </div>
            <div className="d-flex ">
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
                  <span className="fw-semibold text-white"> {user?.name} </span>
                </Dropdown.Toggle>

                <Dropdown.Menu
                  style={{ minWidth: "200px", paddingLeft: "30px" }}
                >
                  <span className="fw-semibold text-black">
                    {user?.name} ({user?.designation})
                  </span>

                  <FontAwesomeIcon
                    icon={faUser}
                    className="me-2"
                    style={{ color: "#f56e00" }}
                  />
                  <div className="d-row">
                    <label> Name: {user?.name} </label>
                    <br />
                    <label>Email: {user?.email} </label>
                    <br />
                    <span>Mobile: {user?.mobile} </span>
                    <br />
                    <span>Designation: {user?.designation} </span>
                    <br />
                    <span>Department: {user?.department}</span>
                    <br />
                  </div>

                  <Dropdown.Item onClick={() => setShowResetPassword(true)}>
                    Reset Password
                  </Dropdown.Item>
                  <Dropdown.Item
                    onClick={() => setShowLogoutConfirmModal(true)}
                  >
                    Logout
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </div>
        </nav>


        {user.password === "Welcome@123" && (
          <span
          style={{
            color: "red",
            fontWeight: "600",
            fontSize: "0.95rem",
            display: "inline-block",
            marginTop: "8px",
          }}
          >
          {user.message}
          </span>
          )}


        
        <div className="container py-5">
          {/* Top Section */}
          <div className="d-flex justify-content-between align-items-center">
            <h6
              className="text-white mb-0 d-flex align-items-center justify-content-center"
              style={{
                background: "orange",
                width: "170px",
                height: "45px",
                borderRadius: "12px 12px 0px 0px",
                fontSize: "1rem",
                fontWeight: "600",
              }}
            >
              Your Ticket Status
            </h6>

            <div className="d-flex align-items-center">
              <h5 style={{ color: "orange", marginBottom: "0" }}>
                Generate Ticket
              </h5>
              <Button
                className="ms-2"
                onClick={() => setShowGenerateTicketModal(true)}
                style={{
                  backgroundColor: "#F6903E",
                  borderColor: "#F6903E",
                  borderRadius: "50%",
                  color: "white",
                  fontWeight: "bold",
                  width: "40px",
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0,
                }}
              >
                +
              </Button>
            </div>
          </div>

          {/* Ticket Table */}
          <div className="card border-0 bg-white">
            {loading ? (
              <div
                className="d-flex justify-content-center align-items-center"
                style={{ paddingBottom: "0rem" }}
              >
                <div className="spinner-border text-warning" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : errorMessage ? (
              <div
                className="alert alert-warning text-center my-3"
                role="alert"
              >
                {errorMessage}
              </div>
            ) : tickets.length > 0 ? (
              <div
                className="
                 table-responsive 
                overflow-y-scroll"
                style={{ maxHeight: "500px" }}
              >
                <table
                  className=" align-middle"
                  style={{
                    width: "100%",
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        backgroundColor: "#fff",
                        borderTop: "2px solid orange",
                      }}
                    >
                      {[
                        "Sr No.",
                        "Created Date",
                        "Ticket Type",
                        "Status",
                        "View",
                      ].map((heading, idx) => (
                        <th
                          key={idx}
                          style={{
                            color: "black",
                            fontWeight: 700,
                            fontSize: "0.95rem",
                            borderBottom: "0.5px solid black",
                            borderTop: "2px solid orange",
                            paddingTop: "15px",
                            paddingBottom: "15px",
                            background: "#FFC55C"
                          }}
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {currentItems.map((result, index) => (
                      <tr
                        key={index}
                        style={{
                          margin: "10px",
                          border: "0px solid #e0e0e0",
                          // borderRadius: "80px",
                          boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                        }}
                      >
                        <td style={{ padding: "14px 12px" }}>{index + 1}</td>
                        <td style={{ padding: "14px 12px" }}>
                          {new Date(result.Created_date).toLocaleString()}
                        </td>
                        <td style={{ padding: "14px 12px" }}>
                          {result.Ticket_type}
                        </td>
                        <td style={{ padding: "14px 12px" }}>
                          <span
                            className="badge rounded-pill px-3 py-2"
                            style={{
                              fontWeight: 500,
                              fontSize: "0.9rem",
                              backgroundColor:
                                result.Status === "Resolved"
                                  ? "#C4F4CE"
                                  : result.Status === "Approved"
                                  ? "#FFF176"
                                  : result.Status === "Pending"
                                  ? "#FF8979"
                                  : result.Status === "Assigned"
                                  ? "#81D4FA"
                                  : "#e0e0e0",
                              color:
                                result.Status === "Resolved"
                                  ? "#000"
                                  : result.Status === "Approved"
                                  ? "#000"
                                  : result.Status === "Pending"
                                  ? "#fff"
                                  : result.Status === "Assigned"
                                  ? "#000"
                                  : "#000",
                            }}
                          >
                            {result.Status}
                          </span>
                        </td>
                        <td style={{ padding: "14px 12px" }}>
                          <FontAwesomeIcon
                            className="text-black ms-2"
                            onClick={() => handleShow(result)}
                            icon={faEye}
                            title="View"
                            style={{ cursor: "pointer", color: "#f57c00" }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-5">
                <p className="lead text-muted">
                  You have no tickets to display.
                </p>
                <p className="text-muted">
                  Click "+ Generate Ticket" to create one.
                </p>
              </div>
            )}
          </div>
        </div>
        {/* Ticket Details Modal */}
        <Modal
          fullscreen
          show={show}
          onHide={handleClose}
          centered
          dialogClassName="custom-modal-size"
        >
          <Modal.Header closeButton style={{ background: "#f0a150" }}>
            <Modal.Title className="text-black">Ticket Details</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            {selectedTicket ? (
              <table
                className="table"
                style={{
                  width: "100%",
                  borderCollapse: "separate",
                  borderSpacing: "0 10px",
                }}
              >
                <tbody>
                  <tr style={{ borderBottom: "1px solid #ddd" }}>
                    <th style={{ color: "#f0a150" }}>Generation Date</th>
                    <td>
                      {new Date(selectedTicket.Created_date).toLocaleString()}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #ddd" }}>
                    <th style={{ color: "#f0a150" }}>Ticket Type</th>
                    <td>{selectedTicket.Ticket_type}</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #ddd" }}>
                    <th style={{ color: "#f0a150" }}>Description</th>
                    <td>{selectedTicket.Description}</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #ddd" }}>
                    <th style={{ color: "#f0a150" }}>Image</th>

                    <td>
                      {Array.isArray(selectedTicket.ImageUrl) &&
                      selectedTicket.ImageUrl.length > 0
                        ? selectedTicket.ImageUrl.map((url, index) => (
                            <a
                              key={index}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <img
                                src={url}
                                alt={Ticket Image ${index + 1}}
                                style={{
                                  maxWidth: "50%",
                                  height: "50%",
                                  marginTop: "10px",
                                }}
                              />
                            </a>
                          ))
                        : "No image provided"}
                    </td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #ddd" }}>
                    <th style={{ color: "#f0a150" }}>Engineer Name</th>
                    <td>{selectedTicket.EngineerName}</td>
                  </tr>
                </tbody>
              </table>
            ) : (
              <div>No ticket selected</div>
            )}
          </Modal.Body>

          
        </Modal>
        
        <Modal
          show={showGenerateTicketModal}
          onHide={() => setShowGenerateTicketModal(false)}
        >
          <Modal.Header style={{ background: "#f0a150" }} closeButton>
            <Modal.Title className="text-dark">Generate New Ticket</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <GenerateTicket
              setModalVisible={setShowGenerateTicketModal}
              generateTicket={getAllData}
            />
          </Modal.Body>
        </Modal>
        {/* <Modal
          show={showProfile}
          onHide={() => setShowProfile(false)}
        >
          <Modal.Header style={{ background: "#f0a150" }} closeButton>
            <Modal.Title className="text-dark">Profile</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <FontAwesomeIcon
                    icon={faUser}
                    className="me-2"
                    style={{ color: "#f56e00"}}
                    
                  />
                <div className="d-row"> 
               <label> Name: {user?.name} </label><br/>
               <label >Email: {user?.email} </label><br/>
               <span >Mobile: {user?.mobile} </span><br/>
               <span >Designation: {user?.designation} </span><br/>
               <span >Department: {user?.department}</span><br/>
                </div>
          </Modal.Body>
        </Modal> */}
        {/* Logout Confirmation Modal */}
        <Modal
          show={showLogoutConfirmModal}
          onHide={() => setShowLogoutConfirmModal(false)}
          centered
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
              onClick={() => setShowLogoutConfirmModal(false)}
              className="px-4"
            >
              Cancel
            </Button>
          </Modal.Footer>
        </Modal>
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
              <Form.Group className="mb-3">
                <Form.Label className="text-dark">New Password</Form.Label>
                <Form.Control
                  type="password"
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                  placeholder="Enter new password"
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
      </div>
      <Footer/>
    </>
  );
};

