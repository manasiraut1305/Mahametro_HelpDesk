import React, { useContext ,useState, useEffect, useRef } from "react"; 
import { operatorRejectedTicketFunction } from "../../api/OperatorRejectedTicket";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

import { getCommentFunction } from "../../api/GetComments";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faUser } from "@fortawesome/free-solid-svg-icons"; 
import $ from "jquery";

import { AuthContext } from "../AuthContext";
import "datatables.net-dt";
import "datatables.net-dt/css/dataTables.dataTables.min.css";

const OperatorRejectedTickets = () => {
  
    const { user } = useContext(AuthContext);
    const engineerId = user?.id|| "";
  const [errorMessage, setErrorMessage] = useState("");
  const [rejectedData, setrejectedData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false); 
  const [comments, setComments] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const dataTableInstance = useRef(null); 

 
  useEffect(() => {
    const interval = setInterval(() => window.location.reload(), 1_800_000);
    return () => clearInterval(interval);
  }, []);

  
  useEffect(() => {
    const fetchResolvedTickets = async () => {
      try {
        setLoading(true);
        const res = await operatorRejectedTicketFunction();
        if (!res?.result) {
          setErrorMessage("No ticket data found.");
          setrejectedData([]); 
        } else {
          setrejectedData(res.result);
        }
      } catch (err) {
        setErrorMessage("API error: " + err.message);
        setrejectedData([]); 
      } finally {
        setLoading(false);
      }
    };
    fetchResolvedTickets();
  }, []); 


  useEffect(() => {
    const tableId = "#adminRejectedTicketTable";

    // Destroy any existing DataTable instance
    if (dataTableInstance.current) {
      dataTableInstance.current.destroy();
      dataTableInstance.current = null;
    }

    // Only initialize if there's data to display
    if (rejectedData.length > 0) {
      // Use a timeout to ensure the table DOM is ready
      setTimeout(() => {
        dataTableInstance.current = $(tableId).DataTable({
          paging: true,
          searching: true,
          ordering: true,
          responsive: true,
          pageLength: 10,
          lengthMenu: [5, 10, 25, 50, 100],
          columnDefs: [{ targets: -1, orderable: false }],
        });
      }, 0);
    }

    
    return () => {
      if (dataTableInstance.current) {
        dataTableInstance.current.destroy();
        dataTableInstance.current = null;
      }
    };
  }, [rejectedData]); // Re-run effect when rejectedData changes

  
  const fetchComments = async (token) => {
    if (!token) {
      setComments([]);
      return;
    }
    try {
      setErrorMessage(""); 
      const response = await getCommentFunction({ Token: token }); 
      if (response?.result && Array.isArray(response.result)) {
        const formattedComments = response.result.map((item) => ({
          comment: item.Comments,
          timestamp: new Date(item.CreatedDate).toLocaleString(),
          Name: item.Name,
        }));
        setComments(formattedComments);
      } else {
        setComments([]);
      }
    } catch (err) {
      console.error("Error fetching comments:", err);
      setComments([]);
      setErrorMessage("Failed to load comments.");
    }
  };

  // Effect to call fetchComments when selectedTicket or showModal changes
  useEffect(() => {
    if (selectedTicket && showModal) {
      fetchComments(selectedTicket.Token); // Assuming selectedTicket has a 'Token' property
    } else if (!showModal) {
      setComments([]); // Clear comments when modal closes
      setErrorMessage(""); // Clear error message too
    }
  }, [selectedTicket, showModal]);

  // Handler to show the modal
  const handleShowModal = (ticket) => {
    // Renamed from handleShow
    setSelectedTicket(ticket);
    setShowModal(true); // Use showModal
  };

  
  const handleCloseModal = () => {
    setShowModal(false); // Use showModal
    setSelectedTicket(null);
  };

  return (
    <>
      
      <div className="container-fluid mt-0 px-0">
        {loading && <div className="alert alert-info">Loading…</div>}
        {errorMessage && (
          <div className="alert alert-danger">{errorMessage}</div>
        )}

        {rejectedData.length > 0 ? (
          <>
                <h4 className="text-center">Rejected Tickets</h4>
            <div className="dashboard-card">
              <div>
              </div>
              <div
                className="table-responsive mt-0 table-bord"
                style={{ minHeight: "570px" }}
              >
                <table
                  id="adminRejectedTicketTable"
                  className="align-middle table-struc"
                  style={{ width: "100%" }}
                >
                  <thead style={{
                      backgroundColor: "#fff",
                    }}>
                    <tr>
                      {[
                        "Sr No",
                        "Ticket Number",
                        "Priority",
                        "User Name",
                        "Designation",
                        "Created Date",
                        "Engineer Name",
                        "View",
                      ].map((h) => (
                        <th key={h} className="tablehead">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rejectedData.map((t, i) => {
                      const flag = t.Flag;
                      const showRow =
                        flag === null ||
                        flag === "null" ||
                        flag === 0 ||
                        flag === "0" ||
                        flag === 1 ||
                        flag === "1";
                      if (!showRow) return null;

                      const isNew =
                        flag === null ||
                        flag === "null" ||
                        flag === 0 ||
                        flag === "0";

                      return (
                        <tr key={i}  style={{
                          margin: "10px",
                          border: "0px solid #e0e0e0",
                          boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                        }}>
                          <td>{i + 1}</td>
                          <td>{t.TicketNoRandom || "N/A"}</td>
                          <td>{t.Levels || "N/A"}</td>
                          <td>{isNew ? t.UserName : t.name || "N/A"}</td>
                          <td>
                            {isNew ? t.Designation : t.designation || "N/A"}
                          </td>
                          <td>{new Date(t.Created_date).toLocaleString()}</td>
                          <td>{t.EngineerName || "N/A"}</td>
                          <td>
                            <FontAwesomeIcon
                              icon={faEye}
                              onClick={() => handleShowModal(t)}
                              style={{ cursor: "pointer", color: "#4682B4" }}
                              title="View Ticket Details"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          !loading && (
            <div className="text-center py-5">
              <p className="lead text-muted">
                You have no resolved tickets to display.
              </p>
            </div>
          )
        )}
      </div>

      {/* ─── ticket‑detail modal ─────────────────────────────────────────────── */}
      <Modal show={showModal} onHide={handleCloseModal} centered size="lg">
        {" "}
        {/* Use showModal and handleCloseModal */}
        <Modal.Header
          closeButton
          style={{ background: "#4682B4", color: "#fff" }}
        >
          <Modal.Title>Ticket Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTicket ? (
            <>
              {" "}
              {/* Use a React Fragment to group multiple elements */}
              <div className="table-responsive">
                <table className="table table-bordered">
                  <tbody>
                    <tr>
                      <th style={{color: "#4682B4"}}>Ticket Number</th>
                      <td>{selectedTicket.TicketNoRandom}</td>
                    </tr>
                    <tr>
                      <th style={{color: "#4682B4"}}>Name</th>
                      <td>
                        {selectedTicket.UserName ||
                          selectedTicket.name ||
                          "N/A"}
                      </td>
                    </tr>
                    <tr>
                      <th style={{color: "#4682B4"}}>Designation</th>
                      <td>
                        {selectedTicket.Designation ||
                          selectedTicket.designation ||
                          "N/A"}
                      </td>
                    </tr>
                    <tr>
                      <th style={{color: "#4682B4"}}>Department</th>
                      <td>
                        {selectedTicket.Department ||
                          selectedTicket.department ||
                          "N/A"}
                      </td>
                    </tr>
                    <tr>
                      <th style={{color: "#4682B4"}}> Email</th>
                      <td>{selectedTicket.Email || "N/A"}</td>
                    </tr>
                    <tr>
                      <th style={{color: "#4682B4"}}>Issue</th>
                      <td>{selectedTicket.Ticket_type || "N/A"}</td>
                    </tr>
                    <tr>
                      <th style={{color: "#4682B4"}}>Category</th>
                      <td>{selectedTicket.Category || "N/A"}</td>
                    </tr>
                    <tr>
                      <th style={{color: "#4682B4"}}>Subcategory</th>
                      <td>{selectedTicket.Sub_Category || "N/A"}</td>
                    </tr>
                    <tr>
                      <th style={{color: "#4682B4"}}>Created Date</th>
                      <td>
                        {new Date(selectedTicket.Created_date).toLocaleString()}
                      </td>
                    </tr>
                    <tr>
                      <th style={{color: "#4682B4"}}>Description</th>
                      <td>{selectedTicket.Description || "N/A"}</td>
                    </tr>
                    <tr>
                      <th style={{color: "#4682B4"}}>Engineer Name</th>
                      <td>{selectedTicket.EngineerName || "N/A"}</td>
                    </tr>
                    {/* The original 'Comment' row here probably refers to the *last* comment or initial comment,
                        but the 'Previous Comments' section below will display all */}
                    <tr>
                      <th style={{color: "#4682B4"}}>Comment</th>
                      <td>{selectedTicket.Comment}</td>
                    </tr>

                    <tr>
                      <th style={{color: "#4682B4"}}>File</th>
                      <td>
                        {selectedTicket.ImageUrl &&
                        selectedTicket.ImageUrl.length > 0
                          ? selectedTicket.ImageUrl.map((fileUrl, index) => {
                              const fileExtension = fileUrl
                                .split(".")
                                .pop()
                                .toLowerCase();

                              if (
                                [
                                  "jpg",
                                  "jpeg",
                                  "png",
                                  "gif",
                                  "bmp",
                                  "webp",
                                ].includes(fileExtension)
                              ) {
                                return (
                                  <div
                                    key={index}
                                    style={{ marginBottom: "10px" }}
                                  >
                                    <img
                                      src={fileUrl}
                                      alt={`Uploaded-${index}`}
                                      style={{
                                        maxWidth: "100%",
                                        height: "auto",
                                        border: "1px solid #ddd",
                                        borderRadius: "4px",
                                      }}
                                    />
                                  </div>
                                );
                              } else if (fileExtension === "pdf") {
                                return (
                                  <div
                                    key={index}
                                    style={{ marginBottom: "10px" }}
                                  >
                                    <a
                                      href={fileUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="btn btn-outline-info btn-sm"
                                    >
                                      <FontAwesomeIcon
                                        icon={faEye}
                                        className="me-2"
                                      />{" "}
                                      View PDF {index + 1}
                                    </a>
                                  </div>
                                );
                              } else {
                                return (
                                  <div
                                    key={index}
                                    style={{ marginBottom: "10px" }}
                                  >
                                    <a
                                      href={fileUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="btn btn-outline-secondary btn-sm"
                                    >
                                      Download Document {index + 1}
                                    </a>
                                  </div>
                                );
                              }
                            })
                          : "No document available"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              {/* Previous Comments Section - Moved outside the table */}
              <h5 className="mt-4">Previous Comments</h5>
              {comments.length > 0 ? (
                <ul className="list-group mb-3">
                  {comments.map((item, index) => (
                    <li key={index} className="list-group-item">
                      <div>
                        <strong>Comment:</strong> {item.comment || "N/A"}
                      </div>
                      <div
                        className="text-muted"
                        style={{ fontSize: "0.85rem" }}
                      >
                        From: {item.Name || "N/A"} on {item.timestamp || "N/A"}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="alert alert-light border">
                  No previous comments.
                </p>
              )}
            </>
          ) : (
            <p>No ticket selected</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default OperatorRejectedTickets;
