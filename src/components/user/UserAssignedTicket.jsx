import React, { useState, useEffect, useRef } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { useLocation } from "react-router-dom";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { uploadFileFunction } from "../../api/UploadFile";
import $ from "jquery";
import "datatables.net-dt";
import "datatables.net-dt/css/dataTables.dataTables.min.css";

const UserAssignedTicket = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const showLoading = () => setLoading(true);
  const hideLoading = () => setLoading(false);
  const location = useLocation();
    const { tickets } = location.state || {};


  const tableRef = useRef(null);

  // Filter assigned tickets
  const assignedTickets = (tickets || []).filter(
    (ticket) => ticket.Status === "Asigned"
  );

   const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedPhotos(files);
  };

  useEffect(() => {
  
}, [tickets]);

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
  

  // Reload every 30 mins
  useEffect(() => {
    const interval = setInterval(() => {
      window.location.reload();
    }, 1800000); // 30 minutes
    return () => clearInterval(interval);
  }, []);

  // Initialize DataTables
  useEffect(() => {
    if (assignedTickets.length > 0) {
      if ($.fn.DataTable.isDataTable("#userAssignedTicketTable")) {
        $("#userAssignedTicketTable").DataTable().destroy();
      }

      setTimeout(() => {
        $("#userAssignedTicketTable").DataTable({
          paging: true,
          searching: true,
          ordering: true,
          responsive: true,
          pageLength: 10,
          lengthMenu: [5, 10, 25, 50, 100],
          columnDefs: [{ targets: -1, orderable: false }], // Disable sorting for "View" column
        });
      }, 0);
    }
  }, [assignedTickets]);

  const handleShow = (ticket) => {
    setSelectedTicket(ticket);
    setShow(true);
  };

  const handleClose = () => {
    setShow(false);
    setSelectedTicket(null);
  };

  return (
    <div className="container-fluid mt-0 px-0">
      <h4 className="text-center">Assigned Tickets</h4>
      {loading && <div className="alert alert-info">Loading...</div>}
      {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

      {!loading && assignedTickets.length > 0 ? (
        <div
          className="table-responsive mt-0 table-bord"
          style={{ maxHeight: "600px" }}
        >
          <table
            id="userAssignedTicketTable"
            className="align-middle table-struc display"
            style={{ width: "100%" }}
            ref={tableRef}
          >
            <thead>
              <tr style={{ backgroundColor: "#F3F3F3" }}>
                <th>Sr No</th>
                <th>Ticket Number</th>
                <th>Priority</th>
                <th>Description</th>
                <th>Created Date</th>
                <th>View</th>
              </tr>
            </thead>
            <tbody>
              {assignedTickets.map((ticket, index) => (
                <tr key={ticket.TicketNoRandom}>
                  <td>{index + 1}</td>
                  <td>{ticket.TicketNoRandom}</td>
                  <td>{ticket.Levels}</td>
                  <td>{ticket.Description}</td>
                  <td>{new Date(ticket.Created_date).toLocaleString()}</td>
                  <td>
                    <FontAwesomeIcon
                      icon={faEye}
                      onClick={() => handleShow(ticket)}
                      title="View"
                      style={{ cursor: "pointer", color: "#4682B4" }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        !loading && (
          <div className="text-center py-5">
            <p className="lead text-muted">No tickets to display.</p>
          </div>
        )
      )}

      {/* Modal */}
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton style={{ background: "#4682B4" }}>
          <Modal.Title>Ticket Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTicket ? (
            <table className="table table-bordered">
              <tbody>
                <tr>
                  <th style={{ color: "#4682B4" }}>Ticket Type</th>
                  <td>{selectedTicket.Ticket_type}</td>
                </tr>
                <tr>
                  <th style={{ color: "#4682B4" }}>Engineer Name</th>
                  <td>{selectedTicket.EngineerName}</td>
                </tr>
                <tr>
                  <th style={{ color: "#4682B4" }}>Category</th>
                  <td>{selectedTicket.Category}</td>
                </tr>
                <tr>
                  <th style={{ color: "#4682B4" }}>Sub Category</th>
                  <td>{selectedTicket.Sub_Category}</td>
                </tr>
                <tr>
                  <th style={{ color: "#4682B4" }}>Description</th>
                  <td>{selectedTicket.Description}</td>
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
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UserAssignedTicket;
