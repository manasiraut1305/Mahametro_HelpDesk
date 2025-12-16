import React, { useState, useEffect, useCallback } from "react";
import { resolvedTicketFunction } from "../../api/ResolvedTicket";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { uploadFileFunction } from "../../api/UploadFile";

import { getCommentFunction } from "../../api/GetComments";
import $ from "jquery";
import "datatables.net-dt"; // JS part
import "datatables.net-dt/css/dataTables.dataTables.min.css";

const OperatorResolvedTicket = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const [resolvedData, setResolvedData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false); // Renamed from 'show'
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");

  const [selectedPhotos, setSelectedPhotos] = useState([]);

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedPhotos(files);
  };

  const showLoading = () => {
};

const hideLoading = () => {
};

  // Function to fetch resolved ticket data
  const fetchResolvedTickets = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage(""); // Clear previous errors
      const data = await resolvedTicketFunction();
      if (!data?.result) {
        setErrorMessage("No ticket data found.");
        setResolvedData([]);
      } else {
        setResolvedData(data.result);
      }
    } catch (err) {
      setErrorMessage("API error occurred: " + err.message);
      console.error("Error fetching resolved tickets:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Effect to fetch data on component mount and set up auto-refresh
  useEffect(() => {
    fetchResolvedTickets(); // Initial fetch

    // Auto-refresh data every 30 minutes
    const interval = setInterval(() => {
      fetchResolvedTickets();
    }, 1800000);

    return () => clearInterval(interval);
  }, [fetchResolvedTickets]);


  useEffect(() => {
    if (resolvedData.length > 0) {
      if ($.fn.DataTable.isDataTable("#operatorResolvedTicketTable")) {
        $("#operatorResolvedTicketTable").DataTable().destroy();
      }

      setTimeout(() => {
        $("#operatorResolvedTicketTable").DataTable({
          paging: true,
          searching: true,
          ordering: true,
          responsive: true,
          pageLength: 10, 
          lengthMenu: [5, 10, 25, 50, 100],
          columnDefs: [
            { targets: -1, orderable: false }, 
          ],
        });
      }, 0);
    } else if ($.fn.DataTable.isDataTable("#operatorResolvedTicketTable")) {
      // If no data, destroy the DataTable instance to clean up
      $("#operatorResolvedTicketTable").DataTable().destroy();
    }
  }, [resolvedData]);

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
    fetchResolvedTickets();
  };

  const fetchComments = useCallback(async (token) => {
    if (!token) {
      setComments([]);
      return;
    }
    try {
      setErrorMessage(""); // Clear any previous error before fetching comments
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
  }, []);

  // Effect to fetch comments when a ticket is selected and modal is shown
  useEffect(() => {
    if (selectedTicket && showModal) {
      fetchComments(selectedTicket.Token);
    }
  }, [selectedTicket, showModal, fetchComments]);

  // Handle opening the modal
  const handleShowModal = (ticket) => {
    setSelectedTicket(ticket);
    setShowModal(true);
  };

  // Handle closing the modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTicket(null);
    setComments([]); // Clear comments when modal closes
    setErrorMessage(""); // Clear error message specific to modal/comments
  };

  return (
    <div className="container-container mt-0 px-0">
      {loading && <div className="alert alert-info">Loading...</div>}
      {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

      {!loading && resolvedData.length > 0 ? (
        <>
        <h4 className="text-center">Resolved Tickets</h4>
          <div className="dashboard-card">
            
            <div
              className="table-responsive mt-0 table-bord"
              style={{ maxHeight: "600px" }}
             >
              <table
                id="operatorResolvedTicketTable"
                className="align-middle table-struc"
                style={{ width: "100%" }}
              >
                <thead>
                  <tr
                    style={{
                      backgroundColor: "#fff",
                    }}
                  >
                    {[
                      "Sr No",
                      "Ticket Number",
                      "Priority",
                      "User Name",
                      "Designation",
                      "Category",
                      "Sub Category",
                      "Created Date",
                      "Resolved Date",
                      "EngineerName",
                      "View",
                    ].map((header, idx) => (
                      <th key={idx} className="tablehead">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {resolvedData.map((result, index) => {
                    
                    const showFlag =
                      result.Flag === null ||
                      result.Flag === "null" ||
                      result.Flag === 0 ||
                      result.Flag === "0" ||
                      result.Flag === 1 ||
                      result.Flag === "1";

                    if (!showFlag) return null; // Only show if flag matches criteria

                    const isNew =
                      result.Flag === null ||
                      result.Flag === "null" ||
                      result.Flag === 0 ||
                      result.Flag === "0";

                    const srNo = index + 1;
                    const TicketNoRandom = result.TicketNoRandom;
                    const Created_date = new Date(
                      result.Created_date
                    ).toLocaleString();
                    const ResolvedDate = result.ResolvedDate
            ? new Date(result.ResolvedDate).toLocaleString()
            : "";
                    const userName = isNew ? result.UserName : result.name;
                    const engineerName = result.EngineerNames;
                    const designation = isNew
                      ? result.Designation
                      : result.designation;

                    return (
                      <tr
                        key={result.Token || index} // Use a unique ID if available, otherwise index
                        style={{
                          margin: "10px",
                          border: "0px solid #e0e0e0",
                          boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                        }}
                      >
                        <td style={{ padding: "14px 12px" }}>{srNo}</td>
                        <td style={{ padding: "14px 12px" }}>
                          {TicketNoRandom}
                        </td>
                        <td style={{ padding: "14px 12px" }}>
                          {result.Levels}
                        </td>
                        <td style={{ padding: "14px 12px" }}>
                          {Array.isArray(userName)
                            ? userName.join(", ")
                            : userName}
                        </td>
                        <td style={{ padding: "14px 12px" }}>
                          {Array.isArray(designation)
                            ? designation.join(", ")
                            : designation}
                        </td>
                        <td style={{ padding: "14px 12px" }}>{result.Category}</td>
                        <td style={{ padding: "14px 12px" }}>{result.Sub_Category}</td>
                        <td style={{ padding: "14px 12px" }}>
                          {/* Created_date is already a string from .toLocaleString(), no need for Array.isArray here unless API sends array */}
                          {Created_date}
                        </td>
                        <td style={{ padding: "14px 12px" }}>
                          
                          {ResolvedDate}
                        </td>
                        <td style={{ padding: "14px 12px" }}>{engineerName.map((name, index) => (
  <p key={index}>{name}</p>
))}</td>
                        <td style={{ padding: "14px 12px" }}>
                          <FontAwesomeIcon
                            className="text-orange ms-2"
                            onClick={() => handleShowModal(result)}
                            icon={faEye}
                            title="View"
                            style={{ cursor: "pointer", color: "#4682B4" }}
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
            <p className="lead text-muted">You have no tickets to display.</p>
          </div>
        )
      )}

      {/* Modal for Ticket Details */}
      <Modal show={showModal} onHide={handleCloseModal} centered size="lg">
        <Modal.Header
          closeButton
          style={{ background: "#4682B4", color: "#fff" }}
        >
          <Modal.Title>Ticket Details</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {selectedTicket ? (
            <div>
              <div className="table-responsive">
                <table className="table table-bordered">
                  <tbody>
                    <tr>
                      <th style={{color: "#4682B4"}}> Ticket Number</th>
                      <td>{selectedTicket.TicketNoRandom}</td>
                    </tr>
                    <tr>
                      <th style={{ width: "30%",color: "#4682B4" }}>Name</th>
                      <td>
                        {selectedTicket.Flag === null ||
                        selectedTicket.Flag === "null" ||
                        selectedTicket.Flag === 0 ||
                        selectedTicket.Flag === "0"
                          ? selectedTicket.UserName
                          : selectedTicket.name}
                      </td>
                    </tr>
                    <tr>
                      <th style={{color: "#4682B4"}}>Designation</th>
                      <td>
                        {selectedTicket.Flag === null ||
                        selectedTicket.Flag === "null" ||
                        selectedTicket.Flag === 0 ||
                        selectedTicket.Flag === "0"
                          ? selectedTicket.Designation
                          : selectedTicket.designation}
                      </td>
                    </tr>
                    <tr>
                      <th style={{color: "#4682B4"}}>Department</th>
                      <td>
                        {selectedTicket.Flag === null ||
                        selectedTicket.Flag === "null" ||
                        selectedTicket.Flag === 0 ||
                        selectedTicket.Flag === "0"
                          ? selectedTicket.Department
                          : selectedTicket.department}
                      </td>
                    </tr>
                    <tr>
                      <th style={{color: "#4682B4"}}>Email</th>
                      <td>{selectedTicket.Email}</td>
                    </tr>
                    <tr>
                      <th style={{color: "#4682B4"}}>Mobile Number</th>
                      <td>
                        {selectedTicket.Flag === null ||
                        selectedTicket.Flag === "null" ||
                        selectedTicket.Flag === 0 ||
                        selectedTicket.Flag === "0"
                          ? selectedTicket.Mobile_No
                          : selectedTicket.mobile_no}
                      </td>
                    </tr>
                    <tr>
                      <th style={{color: "#4682B4"}}>Location</th>
                      <td>{selectedTicket.Loction || "N/A"}</td>
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
                      <th style={{color: "#4682B4"}}>Comment</th>
                      <td>{selectedTicket.Comment}</td>
                    </tr>
                    <tr>
                      <th style={{color: "#4682B4"}}>Created Date</th>
                      <td>
                        {new Date(selectedTicket.Created_date).toLocaleString()}
                      </td>
                    </tr>
                    <tr>
                      <th style={{color: "#4682B4"}}>Resolved Date</th>
                      <td>
                        {new Date(selectedTicket.ResolvedDate).toLocaleString()}
                      </td>
                    </tr>
                    <tr>
                      <th style={{color: "#4682B4"}}>Description</th>
                      <td>{selectedTicket.Description}</td>
                    </tr>
                    <tr>
                      <th style={{color: "#4682B4"}}>Engineer Name</th>
                      <td>{selectedTicket.EngineerName}</td>
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
            </div>
          ) : (
            <p>No ticket selected</p>
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

export default OperatorResolvedTicket;
