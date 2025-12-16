import React, { useState, useRef, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { getCommentFunction } from "../../api/GetComments";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { uploadFileFunction } from "../../api/UploadFile";
import { useLocation } from "react-router-dom";
import $ from "jquery";
import "datatables.net-dt";
import "datatables.net-dt/css/dataTables.dataTables.min.css";

const UserResolvedTicket = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const tableRef = useRef(null);
  const dataTableInstance = useRef(null);
  const [comments, setComments] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const location = useLocation();
  const { tickets } = location.state || {};
  const showLoading = () => setLoading(true);
  const hideLoading = () => setLoading(false);

  const resolvedTickets = (tickets || []).filter(
    (ticket) => ticket.Status === "Resolved"
  );

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedPhotos(files);
  };

  const sortedItems = [...resolvedTickets].sort(
    (a, b) => new Date(b.Created_date) - new Date(a.Created_date)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      window.location.reload();
    }, 1800000);
    return () => clearInterval(interval);
  }, []);

  // --- DataTables Initialization Logic ---
  useEffect(() => {
    if (tableRef.current && sortedItems.length > 0) {
      // Destroy any existing DataTable instance on this ref BEFORE (re)initializing
      if (dataTableInstance.current) {
        dataTableInstance.current.destroy();
        dataTableInstance.current = null; // Clear the ref after destroying
      }

      dataTableInstance.current = $(tableRef.current).DataTable({
        paging: true,
        searching: true,
        ordering: true,
        responsive: true,
        pageLength: 10,
        lengthMenu: [5, 10, 25, 50, 100],
        columnDefs: [
          { targets: -1, orderable: false }, // Disable sorting for View column
        ],
      });
    } else if (tableRef.current && sortedItems.length === 0) {
      // If there's no data, ensure the DataTable is destroyed if it exists
      if (dataTableInstance.current) {
        dataTableInstance.current.destroy();
        dataTableInstance.current = null;
      }
    }

    // Cleanup function: destroy DataTable when component unmounts or sortedItems changes
    return () => {
      if (dataTableInstance.current) {
        dataTableInstance.current.destroy();
        dataTableInstance.current = null;
      }
    };
  }, [sortedItems]); // Dependency array: re-run effect when sortedItems changes

  const fetchComments = async (Token) => {
    // Renamed 'Token' to 'Token' for consistency with usage
    if (!Token) {
      setComments([]);
      return;
    }
    try {
      setErrorMessage(""); // Clear previous errors before fetching
      const response = await getCommentFunction({ Token: Token });
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

  useEffect(() => {
    if (selectedTicket && showModal) {
      // Using showModal here
      fetchComments(selectedTicket.Token); // Assuming selectedTicket has a 'Token' property
    }
  }, [selectedTicket, showModal]);

  const handleShowModal = (ticket) => {
    // Renamed handleShow to handleShowModal
    setSelectedTicket(ticket);
    setShowModal(true); // Using showModal here
  };

  const handleCloseModal = () => {
    // Renamed handleClose to handleCloseModal
    setShowModal(false); // Using showModal here
    setSelectedTicket(null);
    setComments([]); // Clear comments when modal closes
    setErrorMessage("");
  };

  const handleUploadPhoto = async () => {
    if (!selectedTicket?.Token) {
      setErrorMessage("Ticket information is missing.");
      return;
    }

    if (selectedPhotos.length === 0) {
      setErrorMessage("Please select at least one photo to upload.");
      return;
    }

    showLoading();
    try {
      const formData = new FormData();
      formData.append("Token", selectedTicket.Token);
      selectedPhotos.forEach((file) => {
        formData.append("files", file);
      });

      const uploadResponse = await uploadFileFunction(formData);

      if (uploadResponse?.result) {
        setSuccessMessage("Photos uploaded successfully!");
        setSelectedPhotos([]);
      } else {
        setErrorMessage(
          uploadResponse?.message || "An unexpected error occurred."
        );
      }
    } catch (error) {
      console.error("Upload error:", error);
      setErrorMessage(error.message || "Failed to upload photo.");
    } finally {
      hideLoading();
    }
  };

  return (
    <div className="container-fluid mt-0 px-0">
      {loading && <div className="alert alert-info">Loading...</div>}
      {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

      {!loading && sortedItems.length > 0 ? (
        <>
              <h4 className="text-center">Resolved Tickets</h4>
        <div className="dashboard-card">
            <div>
            </div>
        <div
          className="table-responsive mt-0 table-bord"
          style={{ maxHeight: "600px" }}
        >
          <table
            ref={tableRef}
            id="userResolvedTicketTable"
            className="align-middle table-struc"
            style={{ width: "100%" }}
          >
            <thead>
              <tr style={{ backgroundColor: "#F3F3F3" }}>
                <th>Sr No</th>
                <th>Ticket Number</th>
                <th>Priority</th>
                <th>Description</th>
                <th>Created Date</th>
                <th>Resolved Date</th>
                <th>View</th>
              </tr>
            </thead>
            <tbody>
              {sortedItems.map((ticket, index) => (
                <tr
                  key={index}
                  style={{ boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)" }}
                >
                  <td style={{ padding: "14px 12px" }}>{index + 1}</td>
                  <td style={{ padding: "14px 12px" }}>
                    {ticket.TicketNoRandom || "N/A"}
                  </td>
                  <td style={{ padding: "14px 12px" }}>
                    {ticket.Levels || "N/A"}
                  </td>
                  <td style={{ padding: "14px 12px" }}>
                    {ticket.Description || "N/A"}
                  </td>
                  <td style={{ padding: "14px 12px" }}>
                    {new Date(ticket.Created_date).toLocaleString()}
                  </td>
                  <td style={{ padding: "14px 12px" }}>
                    {ticket.ResolvedDate
                      ? new Date(ticket.ResolvedDate).toLocaleDateString()
                      : ""}
                  </td>
                  <td style={{ padding: "14px 12px" }}>
                    <FontAwesomeIcon
                      icon={faEye}
                      onClick={() => handleShowModal(ticket)} // Use handleShowModal
                      title="View"
                      style={{ cursor: "pointer", color: "#4682B4" }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </div>
        </>
      ) : (
        !loading && (
          <div className="text-center py-5">
            <p className="lead text-muted">No resolved tickets to display.</p>
          </div>
        )
      )}

      {/* Ticket Details Modal */}
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
              {/* Use a fragment to wrap multiple top-level elements */}
              <div className="table-responsive">
                <table className="table table-bordered table-striped">
                  <tbody>
                    <tr>
                      <th style={{ color: "#4682B4" }}>Ticket Number</th>
                      <td>{selectedTicket.TicketNoRandom || "N/A"}</td>
                    </tr>
                    <tr>
                      <th style={{ color: "#4682B4" }}>Ticket Type</th>
                      <td>{selectedTicket.Ticket_type || "N/A"}</td>
                    </tr>
                    <tr>
                      <th style={{ color: "#4682B4" }}>Engineer Name</th>
                      <td>{selectedTicket.EngineerName || "N/A"}</td>
                    </tr>
                    <tr>
                      <th style={{ color: "#4682B4" }}>Category</th>
                      <td>{selectedTicket.Category || "N/A"}</td>
                    </tr>
                    <tr>
                      <th style={{ color: "#4682B4" }}>Sub Category</th>
                      <td>{selectedTicket.Sub_Category || "N/A"}</td>
                    </tr>
                    <tr>
                      <th style={{ color: "#4682B4" }}>Description</th>
                      <td>{selectedTicket.Description || "N/A"}</td>
                    </tr>
                    <tr>
                      <th style={{ color: "#4682B4" }}>Documents</th>
                      <td>
                        {Array.isArray(selectedTicket?.ImageUrl) &&
                        selectedTicket.ImageUrl.length > 0 ? (
                          selectedTicket.ImageUrl.map((fileUrl, index) => {
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
                                    style={{ maxWidth: "100%", height: "auto" }}
                                  />
                                </div>
                              );
                            } else if (fileExtension === "pdf") {
                              return (
                                <div
                                  key={index}
                                  style={{ marginBottom: "10px" }}
                                >
                                  <iframe
                                    src={fileUrl}
                                    title={`PDF-${index}`}
                                    width="100%"
                                    height="500px"
                                  ></iframe>
                                </div>
                              );
                            } else {
                              // For doc, docx, txt, xls, etc.
                              return (
                                <div
                                  key={index}
                                  style={{ marginBottom: "10px" }}
                                >
                                  <a
                                    href={fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    Download Document {index + 1}
                                  </a>
                                </div>
                              );
                            }
                          })
                        ) : (
                          <span style={{ fontStyle: "italic", color: "gray" }}>
                            No documents attached
                          </span>
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
            <div>No ticket selected</div>
          )}
          <div className="form-group row mb-4">
            <label
              htmlFor="photoUpload"
              className="col-sm-3 col-form-label"
              style={{ color: "#4682B4" }}
            >
              Upload Photos
            </label>
            <div className="col-sm-9">
              <input
                type="file"
                className="form-control"
                id="Files"
                multiple
                accept="image/*"
                onChange={handlePhotoChange}
              />
              <div className="mt-3 d-flex flex-wrap gap-3">
                {selectedPhotos.map((file, index) => (
                  <div key={index}>
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`preview-${index}`}
                      width="100"
                      height="100"
                      style={{ objectFit: "cover", borderRadius: "8px" }}
                    />
                    <p className="text-center small">{file.name}</p>
                  </div>
                ))}
              </div>
              <Button
                onClick={handleUploadPhoto}
                disabled={loading || selectedPhotos.length === 0}
                style={{
                  backgroundColor: "#4682B4",
                  color: "white",
                  marginTop: "1rem",
                }}
              >
                {loading ? "Uploading..." : "Upload Photos"}
              </Button>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UserResolvedTicket;
