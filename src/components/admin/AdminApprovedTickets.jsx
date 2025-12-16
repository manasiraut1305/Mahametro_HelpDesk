import React, { useState, useEffect, useRef } from "react";
import { approvedTicketFunction } from "../../api/ApprovedTicket";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { getCommentFunction } from "../../api/GetComments";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import $ from "jquery"; // Ensure jQuery is imported if DataTables relies on it

// Import DataTables directly here if not already globally available
import "datatables.net-dt";
import "datatables.net-dt/css/dataTables.dataTables.min.css";

const AdminApprovedTicket = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const [approvedData, setApprovedData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showTicketModal, setShowTicketModal] = useState(false); // Consistent modal state
  const [comments, setComments] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const dataTableInstance = useRef(null); // Ref to store DataTable instance

  // Auto-refresh the page every 30 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      window.location.reload();
    }, 1_800_000); // 30 minutes in milliseconds

    return () => clearInterval(interval); // Clear interval on component unmount
  }, []);

  // Fetch approved tickets on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await approvedTicketFunction();
        if (!data?.result) {
          setErrorMessage("No ticket data found.");
          setApprovedData([]); // Ensure state is empty on no results
        } else {
          setApprovedData(data.result);
        }
      } catch (err) {
        setErrorMessage("API error occurred: " + err.message);
        setApprovedData([]); // Ensure state is empty on error
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array means this runs once on mount

  // --- DataTables Initialization Logic ---
  // This effect runs whenever approvedData changes
  useEffect(() => {
    const tableId = "#adminApprovedTicketTable";

    // Destroy any existing DataTable instance
    if (dataTableInstance.current) {
      dataTableInstance.current.destroy();
      dataTableInstance.current = null;
    }

    // Only initialize if there's data to display
    if (approvedData.length > 0) {
      // Use a timeout to ensure the table DOM is ready for DataTables
      setTimeout(() => {
        dataTableInstance.current = $(tableId).DataTable({
          paging: true,
          searching: true,
          ordering: true,
          responsive: true,
          pageLength: 10,
          lengthMenu: [5, 10, 25, 50, 100],
          columnDefs: [{ targets: -1, orderable: false }], // Disable sorting for the 'View' column
        });
      }, 0);
    }

    // Cleanup function: destroy DataTable when component unmounts or approvedData changes
    return () => {
      if (dataTableInstance.current) {
        dataTableInstance.current.destroy();
        dataTableInstance.current = null;
      }
    };
  }, [approvedData]); // Re-run effect when approvedData changes

  // Handler to show the ticket details modal
  const handleShowTicketModal = (ticket) => {
    setSelectedTicket(ticket);
    setShowTicketModal(true); // Set consistent modal state
  };

  // Handler to close the ticket details modal
  const handleCloseTicketModal = () => {
    setShowTicketModal(false); // Set consistent modal state
    setSelectedTicket(null);
    setComments([]); // Clear comments when modal closes
    setErrorMessage(""); // Clear any comment fetching errors
  };

  // Function to fetch comments for a selected ticket
  const fetchComments = async (token) => {
    if (!token) {
      setComments([]);
      return;
    }
    try {
      setErrorMessage(""); // Clear previous errors before fetching
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

  // Effect to call fetchComments when selectedTicket or showTicketModal changes
  useEffect(() => {
    if (selectedTicket && showTicketModal) {
      fetchComments(selectedTicket.Token); // Assuming selectedTicket has a 'Token' property
    }
  }, [selectedTicket, showTicketModal]);

  return (
    <div className="container-fluid mt-0 px-0">
      {loading && <div className="alert alert-info">Loading...</div>}
      {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

      {!loading && approvedData.length > 0 ? (
        <>
              <h4 className="text-center">Approved Tickets</h4>
          <div className="dashboard-card">
            <div>
            </div>
            <div className="table-responsive mt-0 table-bord">
              <table
                id="adminApprovedTicketTable"
                className="align-middle table-struc"
                style={{ width: "100%" }}
              >
                <thead>
                  <tr style={{ backgroundColor: "#fff" }}>
                    {[
                      "Sr No",
                      "Ticket Number",
                      "Priority",
                      "User Name",
                      "Designation",
                      "Created Date",
                      "Engineer Name",
                      "View",
                    ].map((header, idx) => (
                      <th key={idx} className="tablehead">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {approvedData.map((result, index) => {
                    const flag = result.Flag;
                    const isShown =
                      flag === null ||
                      flag === "null" ||
                      flag === 0 ||
                      flag === "0" ||
                      flag === 1 ||
                      flag === "1";

                    if (!isShown) return null;

                    const isNew =
                      flag === null ||
                      flag === "null" ||
                      flag === 0 ||
                      flag === "0";

                    return (
                      <tr
                        key={index}
                        style={{
                          margin: "10px",
                          border: "0px solid #e0e0e0",
                          boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                        }}
                      >
                        <td style={{ padding: "14px 12px" }}>{index + 1}</td>
                        <td style={{ padding: "14px 12px" }}>
                          {result.TicketNoRandom || "N/A"}
                        </td>
                        <td style={{ padding: "14px 12px" }}>
                          {result.Levels || "N/A"}
                        </td>
                        <td style={{ padding: "14px 12px" }}>
                          {isNew ? result.UserName : result.name || "N/A"}
                        </td>
                        <td style={{ padding: "14px 12px" }}>
                          {isNew ? result.Designation : result.designation || "N/A"}
                        </td>
                        <td style={{ padding: "14px 12px" }}>
                          {new Date(result.Created_date).toLocaleString()}
                        </td>
                        <td style={{ padding: "14px 12px" }}>{result.EngineerName || "N/A"}</td>
                        <td style={{ padding: "14px 12px" }}>
                          <FontAwesomeIcon
                            icon={faEye}
                            title="View"
                            onClick={() => handleShowTicketModal(result)}
                            style={{ cursor: "pointer", color: "#4682B4" }}
                            className="text-orange ms-2"
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
            <p className="lead text-muted">You have no approved tickets to display.</p>
          </div>
        )
      )}

      {/* Modal for Ticket Details */}
      <Modal show={showTicketModal} onHide={handleCloseTicketModal} centered size="lg"> {/* Use consistent state and handler */}
        <Modal.Header closeButton style={{ background: "#4682B4", color: "#fff" }}>
          <Modal.Title>Ticket Details</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {selectedTicket ? (
            <>
              <div className="table-responsive">
                <table className="table table-bordered table-striped">
                  <tbody>
                     <tr>
                        <th style={{ width: "30%" }}>Ticket Number</th>
                        <td>{selectedTicket.TicketNoRandom}</td>
                      </tr>
                    <tr>
                      <th style={{ width: "30%" }}>Name</th>
                      <td>{selectedTicket.UserName || selectedTicket.name || "N/A"}</td>
                    </tr>
                    <tr>
                      <th>Designation</th>
                      <td>
                        {selectedTicket.Designation || selectedTicket.designation || "N/A"}
                      </td>
                    </tr>
                    <tr>
                      <th>Department</th>
                      <td>
                        {selectedTicket.Department || selectedTicket.department || "N/A"}
                      </td>
                    </tr>
                    <tr>
                      <th>Email</th>
                      <td>{selectedTicket.Email || "N/A"}</td>
                    </tr>
                    <tr>
                      <th>Issue</th>
                      <td>{selectedTicket.Ticket_type || "N/A"}</td>
                    </tr>
                    <tr>
                      <th>Category</th>
                      <td>{selectedTicket.Category || "N/A"}</td>
                    </tr>
                    <tr>
                      <th>Subcategory</th>
                      <td>{selectedTicket.Sub_Category || "N/A"}</td>
                    </tr>
                    <tr>
                      <th>Created Date</th>
                      <td>
                        {new Date(selectedTicket.Created_date).toLocaleString()}
                      </td>
                    </tr>
                    <tr>
                      <th>Description</th>
                      <td>{selectedTicket.Description || "N/A"}</td>
                    </tr>
                    <tr>
                      <th>Engineer Name</th>
                      <td>{selectedTicket.EngineerName || "N/A"}</td>
                    </tr>
                    <tr>
                      <th>comment</th>
                      <td>{selectedTicket.Comment }</td>
                    </tr>
                    <tr>
                      <th>File</th>
                      <td>
                        {selectedTicket.ImageUrl && selectedTicket.ImageUrl.length > 0 ? (
                          selectedTicket.ImageUrl.map((fileUrl, index) => {
                            const fileExtension = fileUrl
                              .split(".")
                              .pop()
                              .toLowerCase();

                            if (
                              ["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(
                                fileExtension
                              )
                            ) {
                              return (
                                <div key={index} style={{ marginBottom: "10px" }}>
                                  <img
                                    src={fileUrl}
                                    alt={`Uploaded-${index}`}
                                    style={{ maxWidth: "100%", height: "auto", border: "1px solid #ddd", borderRadius: "4px" }}
                                  />
                                </div>
                              );
                            } else if (fileExtension === "pdf") {
                              return (
                                <div key={index} style={{ marginBottom: "10px" }}>
                                  <a
                                    href={fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-outline-info btn-sm"
                                  >
                                    <FontAwesomeIcon icon={faEye} className="me-2" /> View PDF {index + 1}
                                  </a>
                                </div>
                              );
                            } else {
                              return (
                                <div key={index} style={{ marginBottom: "10px" }}>
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
                        ) : (
                          "No document available"
                        )}
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
                      <div className="text-muted" style={{ fontSize: "0.85rem" }}>
                        From: {item.Name || "N/A"} on {item.timestamp || "N/A"}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="alert alert-light border">No previous comments for this ticket.</p>
              )}
            </>
          ) : (
            <p>No ticket selected</p>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseTicketModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminApprovedTicket;