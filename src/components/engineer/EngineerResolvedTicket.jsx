import React, { useContext, useEffect, useState, useRef } from "react";
import { AuthContext } from "../AuthContext";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

import { uploadFileFunction } from "../../api/UploadFile";
import { engineerTicketResolveListFunction } from "../../api/EngineerResolveTicketList";
import { getCommentFunction } from "../../api/GetComments"; // Import the API function for fetching comments
import { commentSectionFunction } from "../../api/CommentSection"; // Import the API function for submitting comments
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";

import $ from "jquery";
import "datatables.net-dt";
import "datatables.net-dt/css/dataTables.dataTables.min.css";

const EngineerResolvedTicket = () => {
  const { user } = useContext(AuthContext);
  const engineerId = user?.id;
  const name = user?.name; // Get engineer's name for comments

  const [showModal, setShowModal] = useState(false); // Renamed from 'show' for clarity
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [comments, setComments] = useState([]); // State for historical comments
  const [newCommentInput, setNewCommentInput] = useState(""); // State for new comment input

  const [successMessage, setSuccessMessage] = useState("");
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const dataTableRef = useRef(null);

  const showLoading = () => setLoading(true);
  const hideLoading = () => setLoading(false);

  const getData = async () => {
    setErrorMessage("");
    try {
      showLoading();
      const data = await engineerTicketResolveListFunction({
        engineerId: engineerId,
      });

      if (Array.isArray(data.result)) {
        setTickets(data.result);
      } else {
        // setErrorMessage("No ticket data found or unexpected data format.");
        setTickets([]);
      }
    } catch (err) {
      setErrorMessage("API error occurred: " + err.message);
      setTickets([]);
    } finally {
      hideLoading();
    }
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedPhotos(files);
  };

  const handleUploadPhoto = async () => {
    if (!selectedTicket?.token) {
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
      formData.append("Token", selectedTicket.token);
      selectedPhotos.forEach((file) => {
        formData.append("files", file); // Use 'files' or a similar key that your backend expects
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
    getData();
  };

  // Close modal function
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTicket(null);
    setComments([]); // Clear comments when modal closes
    setNewCommentInput(""); // Clear new comment input
    setErrorMessage(""); // Clear any error messages
  };

  // Open modal function
  const handleViewDetailsModal = (ticket) => {
    setSelectedTicket(ticket);
    setShowModal(true);
  };

  // Fetch comments for a specific ticket Token
  const fetchComments = async (token) => {
    if (!token) {
      setComments([]);
      return;
    }
    try {
      setLoading(true); // Indicate loading for comments
      const response = await getCommentFunction({ Token: token });
      console.log(token);
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
    } finally {
      setLoading(false); // End loading for comments
    }
  };

  useEffect(() => {
    if (engineerId) {
      getData();
    }
  }, [engineerId]);

  // Handle new comment input change
  const handleNewCommentInputChange = (e) => {
    setNewCommentInput(e.target.value);
  };

  // Handle new comment submission
  const handleCommentSubmit = async () => {
    if (!selectedTicket?.token || !engineerId) {
      setErrorMessage("Ticket information or engineer ID is missing.");
      return;
    }
    if (!newCommentInput.trim()) {
      setErrorMessage("Comment cannot be empty.");
      return;
    }

    showLoading();
    try {
      const commentResponse = await commentSectionFunction({
        Userid: engineerId,
        Name: name, // Use the engineer's name
        Token: [selectedTicket.token],
        Comment: newCommentInput,
      });

      if (
        !commentResponse ||
        commentResponse.message !== "Comments saved successfully."
      ) {
        throw new Error("Failed to add comment.");
      }

      alert("Comment submitted successfully.");
      setNewCommentInput(""); // Clear the textarea after submission
      fetchComments(selectedTicket.token); // Re-fetch comments to update the displayed list
    } catch (err) {
      setErrorMessage("Failed to submit comment: " + err.message);
    } finally {
      hideLoading();
    }
  };

  // Periodically refresh ticket data (every 30 minutes)
  useEffect(() => {
    const interval = setInterval(() => {
      getData();
    }, 1800000); // 30 minutes

    return () => clearInterval(interval);
  }, [engineerId]);

  useEffect(() => {
    if (engineerId) {
      getData();
    }
  }, [engineerId]);

  // DataTables initialization and destruction
  useEffect(() => {
    if (dataTableRef.current) {
      dataTableRef.current.destroy();
      dataTableRef.current = null;
    }

    if (tickets.length > 0) {
      setTimeout(() => {
        dataTableRef.current = $("#engineerResolvedTicketTable").DataTable({
          paging: true,
          searching: true,
          ordering: true,
          responsive: true,
          pageLength: 10,
          lengthMenu: [5, 10, 25, 50, 100],
          columnDefs: [{ targets: -1, orderable: false }], // Disable sorting for 'View' column
        });
      }, 0);
    }

    return () => {
      if (dataTableRef.current) {
        dataTableRef.current.destroy();
        dataTableRef.current = null;
      }
    };
  }, [tickets]);

  // When a ticket is selected for viewing details (modal opens), fetch its comments
  useEffect(() => {
    if (selectedTicket && showModal) {
      fetchComments(selectedTicket.token);
      setNewCommentInput(""); // Clear the new comment input when modal opens
    }
  }, [selectedTicket, showModal]);

  return (
    <div className="container-fluid mt-0 px-0">
      {loading && <div className="alert alert-info">Loading...</div>}
      {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

      {!loading && tickets.length > 0 ? (
        <>
          <h4 className="text-center">Resolved Tickets</h4>
          <div
            className="table-responsive mt-0 table-bord"
            style={{ minHeight: "570px" }}
          >
            <table
              id="engineerResolvedTicketTable"
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
                    "View Details", // Changed "View" to "View Details"
                  ].map((header, idx) => (
                    <th key={idx} className="tablehead">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tickets.map((result, index) => {
                  const flag = result.Flag;
                  const showFlag =
                    flag === null ||
                    flag === "null" ||
                    flag === 0 ||
                    flag === "0" ||
                    flag === 1 ||
                    flag === "1";

                  if (!showFlag) return null;

                  const isNew =
                    flag === null ||
                    flag === "null" ||
                    flag === 0 ||
                    flag === "0";
                  const srNo = index + 1;
                  const TicketNoRandom = result.TicketNoRandom;
                  const createddate = new Date(
                    result.createddate
                  ).toLocaleString();
                  // const ResolvedDate = result.ResolvedDate
                  //   ? new Date(result.ResolvedDate).toLocaleDateString()
                  //   : "";
                  const userName = isNew ? result.UserName : result.name;
                  const designation = isNew
                    ? result.Designation
                    : result.designation;

                  const Created_Date = new Date(result.createddate)
                    .toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })
                    .replace(/\//g, "/")
                    .replace(",", "");

                  const ResolvedDate = new Date(result.ResolvedDate)
                    .toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })
                    .replace(/\//g, "/")
                    .replace(",", "");

                  return (
                    <tr
                      key={index}
                      style={{
                        margin: "10px",
                        border: "0px solid #e0e0e0",
                        boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                      }}
                    >
                      <td style={{ padding: "14px 12px" }}>{srNo}</td>
                      <td style={{ padding: "14px 12px" }}>{TicketNoRandom}</td>
                      <td style={{ padding: "14px 12px" }}>{result.Levels}</td>
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
                      <td style={{ padding: "14px 12px" }}>
                        {result.Category}
                      </td>
                      <td style={{ padding: "14px 12px" }}>
                        {result.Sub_Category}
                      </td>
                      <td style={{ padding: "14px 12px" }}>{Created_Date}</td>

                      <td style={{ padding: "14px 12px" }}>{ResolvedDate}</td>

                      <td style={{ padding: "14px 12px" }}>
                        <FontAwesomeIcon
                          className="text-orange ms-2"
                          onClick={() => handleViewDetailsModal(result)} // Use the new handler
                          icon={faEye}
                          title="View Details"
                          style={{ cursor: "pointer", color: "#4682B4" }}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        !loading && (
          <div className="text-center py-5">
            <p className="lead text-muted">You have no tickets to display.</p>
          </div>
        )
      )}

      {/* Consolidated Ticket Details and Comments Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton style={{ background: "#4682B4" }}>
          <Modal.Title style={{ color: "white" }}>Ticket Details</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {errorMessage && (
            <div className="alert alert-danger">{errorMessage}</div>
          )}

          {selectedTicket ? (
            <>
              <table className="table table-bordered mb-4">
                <tbody>
                  {/* Ticket info rows */}
                  <tr>
                    <th style={{ color: "#4682B4" }}>Ticket Number</th>
                    <td>{selectedTicket.TicketNoRandom}</td>
                  </tr>

                  <tr>
                    <th style={{ color: "#4682B4" }}>User Name</th>
                    <td>{selectedTicket.UserName}</td>
                  </tr>

                  <tr>
                    <th style={{ color: "#4682B4" }}>Email</th>
                    <td>{selectedTicket.Email}</td>
                  </tr>

                  <tr>
                    <th style={{ color: "#4682B4" }}>Mobile Number</th>
                    <td>{selectedTicket.Mobile_No}</td>
                  </tr>

                  <tr>
                    <th style={{ color: "#4682B4" }}>Designation</th>
                    <td>{selectedTicket.Designation}</td>
                  </tr>

                  <tr>
                    <th style={{ color: "#4682B4" }}>Department</th>
                    <td>{selectedTicket.Department}</td>
                  </tr>

                  <tr>
                    <th style={{ color: "#4682B4" }}>Location</th>
                    <td>{selectedTicket.Location}</td>
                  </tr>

                  <tr>
                    <th style={{ color: "#4682B4" }}>Engineer Name</th>
                    <td>
                      {selectedTicket.EngineerDetailsList?.map((eng, i) => (
                        <div key={i}>{eng.UserName}</div>
                      ))}
                    </td>
                  </tr>

                  <tr>
                    <th style={{ color: "#4682B4" }}>Created Date</th>
                    <td>
                      {selectedTicket?.createddate
                        ? new Date(selectedTicket.createddate).toLocaleString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            }
                          )
                        : "N/A"}
                    </td>
                  </tr>

                  <tr>
                    <th style={{ color: "#4682B4" }}>Resolved Date</th>
                    <td>
                     {selectedTicket?.ResolvedDate
                        ? new Date(selectedTicket.ResolvedDate).toLocaleString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            }
                          )
                        : "N/A"}
                    </td>
                  </tr>

                  <tr>
                    <th style={{ color: "#4682B4" }}>Ticket Type</th>
                    <td>{selectedTicket.Ticket_type}</td>
                  </tr>

                  <tr>
                    <th style={{ color: "#4682B4" }}>Priority</th>
                    <td>{selectedTicket.Levels}</td>
                  </tr>

                  <tr>
                    <th style={{ color: "#4682B4" }}>Description</th>
                    <td>{selectedTicket.Description}</td>
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
                              <div key={index} style={{ marginBottom: "10px" }}>
                                <img
                                  src={fileUrl}
                                  alt={`Uploaded-${index}`}
                                  style={{ maxWidth: "100%", height: "auto" }}
                                />
                              </div>
                            );
                          } else if (fileExtension === "pdf") {
                            return (
                              <div key={index} style={{ marginBottom: "10px" }}>
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
                              <div key={index} style={{ marginBottom: "10px" }}>
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
                  <tr>
                    <th style={{ color: "#4682B4", verticalAlign: "top" }}>
                      <div className="form-group row mb-4">
                        <label
                          htmlFor="photoUpload"
                          className="col-sm-12 col-form-label"
                        >
                          Upload Photos
                        </label>
                      </div>
                    </th>
                    <td>
                      <div className="form-group row mb-4">
                        <div className="col-sm-12">
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
                                  style={{
                                    objectFit: "cover",
                                    borderRadius: "8px",
                                  }}
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
                    </td>
                  </tr>
                </tbody>
              </table>

              
              <h5 className="mt-4">Previous Comments</h5>
              
               {comments.length > 0 ? (

                <ul className="list-group mb-3">
                  {comments.map((item, index) => (
                    <li key={index} className="list-group-item">
                      <div>
                        <strong>Comment:</strong> {item.comment}
                      </div>
                      <div
                        className="text-muted"
                        style={{ fontSize: "0.85rem" }}
                      >
                        {item.timestamp}
                      </div>
                      <div
                        className="text-muted"
                        style={{ fontSize: "0.85rem" }}
                      >
                        {item.name}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="alert alert-light border">
                  No previous comments.
                </p>
              )}

              {/* Textarea for Adding New Comments */}
              <h5 className="mt-4">Add New Comment</h5>
              <div className="mb-3">
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Type your new comment here..."
                  value={newCommentInput}
                  onChange={handleNewCommentInputChange}
                ></textarea>
              </div>
            </>
          ) : (
            <div>No ticket selected</div>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button
            onClick={handleCommentSubmit}
            disabled={loading}
            style={{ backgroundColor: "#4682B4", color: "white" }}
          >
            {loading ? "Submitting..." : "Submit Comment"}
          </Button>
          {/* The resolve button is not needed here as this is a "Resolved Tickets" component */}
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default EngineerResolvedTicket;
