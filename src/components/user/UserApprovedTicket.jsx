import React, { useContext, useState, useRef, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getCommentFunction } from "../../api/GetComments";
import { commentSectionFunction } from "../../api/CommentSection";
import { uploadFileFunction } from "../../api/UploadFile";
import { AuthContext } from "../AuthContext";
import { useLocation } from "react-router-dom";
import $ from "jquery";
import "datatables.net-dt";
import "datatables.net-dt/css/dataTables.dataTables.min.css";

const Userapproved = () => {
  const { user } = useContext(AuthContext);
  // Assuming 'user.id' is the correct ID to use for commenting by the user
  const UserId = user?.id;
  const name = user?.name;
 const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  // Renamed 'show' to 'showModal' for clarity and consistency
  const [showModal, setShowModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [comments, setComments] = useState([]); // State to hold fetched historical comments
  const [newCommentInput, setNewCommentInput] = useState("");

  const suggestionRef = useRef(null); // This ref doesn't seem to be used in the current code
  const location = useLocation();
  const { tickets } = location.state || {};

   const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedPhotos(files);
  };

  // Filter and sort tickets outside of render for better performance if tickets changes frequently
  const pendingTickets = (tickets || []).filter(
    (ticket) => ticket.Status === "Approved"
  );

  const sortedItems = [...pendingTickets].sort(
    (a, b) => new Date(b.Created_date) - new Date(a.Created_date)
  );

  // Helper functions for loading state
  const showLoading = () => setLoading(true);
  const hideLoading = () => setLoading(false);

  /**
   * Fetches historical comments for a given ticket Token.
   * @param {string} Token 
   */
  const fetchComments = async (Token) => {
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
          Name: item.Name
        }));
        setComments(formattedComments);
      } else {
        setComments([]);
        // Optionally set an error message if no comments are found but the API call was successful
        // setErrorMessage("No comments found for this ticket.");
      }
    } catch (err) {
      console.error("Error fetching comments:", err);
      setComments([]);
      setErrorMessage("Failed to load comments.");
    }
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
  

  
  // useEffect to fetch comments when the modal opens or selectedTicket changes
  useEffect(() => {
    if (selectedTicket && showModal) {
      fetchComments(selectedTicket.Token);
      setNewCommentInput(""); // Clear the new comment input when modal opens
    }
  }, [selectedTicket, showModal]); // Dependencies: selectedTicket and showModal state

  // Close handler for the main ticket details modal
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTicket(null);
    setComments([]); // Clear comments when modal closes
    setNewCommentInput(""); // Clear new comment input on close
    setErrorMessage(""); // Clear any error messages
  };

  // Handles displaying the modal and setting the selected ticket
  const handleViewDetailsModal = (ticket) => {
    setSelectedTicket(ticket);
    setShowModal(true); // Now using showModal state
  };

  // Handles comment input change in the modal textarea
  const handleNewCommentInputChange = (e) => {
    setNewCommentInput(e.target.value);
  };

  // Handles submission of a new comment from the modal
  const handleCommentSubmit = async () => {
    // Ensure selectedTicket and UserId are available
    if (!selectedTicket?.Token || !UserId) {
      setErrorMessage("Ticket information or User ID is missing.");
      return;
    }
    // Ensure comment input is not empty
    if (!newCommentInput.trim()) {
      setErrorMessage("Comment cannot be empty.");
      return;
    }

    showLoading(); // Show loading indicator
    setErrorMessage(""); // Clear any previous error messages

    try {
      const commentResponse = await commentSectionFunction({
        Userid: UserId, // Corrected to use UserId
        Name: name,
        Token: [selectedTicket.Token], // API expects an array of Tokens
        Comment: newCommentInput,
      });

      if (
        !commentResponse ||
        commentResponse.message !== "Comments saved successfully."
      ) {
        // More robust error checking
        throw new Error(
          commentResponse?.message || "Failed to add comment due to an unknown error."
        );
      }

      alert("Comment submitted successfully.");
      setNewCommentInput(""); // Clear the textarea after submission
      // Re-fetch comments to update the displayed list in the modal
      fetchComments(selectedTicket.Token);
    } catch (err) {
      setErrorMessage("Failed to submit comment: " + err.message);
      console.error("Comment submission error:", err);
    } finally {
      hideLoading(); // Hide loading indicator
    }
  };

  // Auto-refresh every 30 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      window.location.reload();
    }, 1800000);

    return () => clearInterval(interval);
  }, []);

  // DataTable init
  useEffect(() => {
    // Destroy if already exists
    if ($.fn.DataTable.isDataTable("#userApprovedTicketTable")) {
      $("#userApprovedTicketTable").DataTable().destroy();
    }

    // Initialize only if there's data to display
    if (sortedItems.length > 0) {
      setTimeout(() => {
        $("#userApprovedTicketTable").DataTable({
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
      }, 0);
    }
  }, [sortedItems]); // Re-run when sortedItems changes

  return (
    <div className="container-fluid mt-0 px-0">
      {/* Loading and Error Messages */}
      {loading && <div className="alert alert-info">Loading...</div>}
      {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

      {/* Approved Tickets Table */}
      {!loading && sortedItems.length > 0 ? (
        <>
              <h4 className="text-center">Approved Tickets</h4>
          <div className="dashboard-card"> {/* Added dashboard-card for consistent styling */}
            <div>
            </div>
            <div
              className="table-responsive mt-0 table-bord"
              style={{ maxHeight: "600px" }} // Added max height for scrollable table if needed
            >
              <table
                id="userApprovedTicketTable"
                className="align-middle table-struc"
                style={{ width: "100%" }}
              ><thead>
                  <tr style={{ backgroundColor: "#fff" }}>
                    {[
                      "Sr No",
                      "Ticket Number",
                      "Priority",
                      "Description",
                      "Created Date",
                      "View",
                    ].map((header, idx) => (
                      <th key={idx} className="tablehead">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedItems.map((result, index) => (
                    <tr
                      key={index}
                      style={{ boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)" }}
                    >
                      <td style={{ padding: "14px 12px" }}>{index + 1}</td>
                      <td style={{ padding: "14px 12px" }}>
                        {result.TicketNoRandom || "N/A"}
                      </td>
                      <td style={{ padding: "14px 12px" }}>{result.Levels || "N/A"}</td>
                      <td style={{ padding: "14px 12px" }}>
                        {result.Description || "N/A"}
                      </td>
                      <td style={{ padding: "14px 12px" }}>
                        {result.Created_date
                          ? new Date(result.Created_date).toLocaleString()
                          : "N/A"}
                      </td>
                      <td style={{ padding: "14px 12px" }}>
                        <FontAwesomeIcon
                          icon={faEye}
                          onClick={() => handleViewDetailsModal(result)} // Corrected handler name
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
        // Display message if no approved data and not loading
        !loading && (
          <div className="text-center py-5">
            <p className="lead text-muted">No approved tickets to display.</p>
          </div>
        )
      )}

      {/* Ticket Details Modal */}
      <Modal show={showModal} onHide={handleCloseModal} centered size="lg"> {/* Using showModal state and handleCloseModal */}
        <Modal.Header
          closeButton
          style={{ background: "#4682B4", color: "#fff" }}
        >
          <Modal.Title>Ticket Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTicket ? (
            <div className="table-responsive">
              <table className="table table-bordered table-striped">
                <tbody>
                  <tr>
                    <th style={{ color: "#4682B4" }}>Ticket Number</th>
                    <td>{selectedTicket.TicketNoRandom || "N/A"}</td>
                  </tr>
                  <tr>
                    <th style={{ width: "30%", color: "#4682B4" }}>Ticket Type</th>
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
                        {item.timestamp || "N/A"}
                      </div>
                      <div
                        className="text-muted"
                        style={{ fontSize: "0.85rem" }}
                      >
                        {item.Name || "N/A"}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="alert alert-light border">No previous comments.</p>
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
                  disabled={loading} // Disable textarea when submitting
                ></textarea>
              </div>
            </div>
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
          <Button
            onClick={handleCommentSubmit}
            disabled={loading}
            style={{ backgroundColor: "#4682B4", color: "white" }}
          >
            {loading ? "Submitting..." : "Submit Comment"}
          </Button>
          <Button variant="secondary" onClick={handleCloseModal}> {/* Corrected handler name */}
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Userapproved;