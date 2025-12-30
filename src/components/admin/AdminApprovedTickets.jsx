import React, { useContext, useState, useEffect } from "react";
import { approvedTicketFunction } from "../../api/ApprovedTicket";

import { uploadFileFunction } from "../../api/UploadFile";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { getCommentFunction } from "../../api/GetComments";
import { commentSectionFunction } from "../../api/CommentSection";
import { AuthContext } from "../AuthContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { reassignEngineerFunction } from "../../api/ReassignEngineer";
import $ from "jquery";
import "datatables.net-dt"; // JS part
import "datatables.net-dt/css/dataTables.dataTables.min.css";

const AdminApprovedTicket = () => {
  const { user } = useContext(AuthContext);
  const OperatorId = user?.id; // Assuming user.id is the OperatorId
  const name = user?.name;

  const [errorMessage, setErrorMessage] = useState("");
  const [approvedData, setApprovedData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [comments, setComments] = useState([]); // State to hold fetched historical comments
  const [newCommentInput, setNewCommentInput] = useState("");

  // Helper functions for loading state
  const showLoading = () => setLoading(true);
  const hideLoading = () => setLoading(false);

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedPhotos(files);
  };

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
          name: item.Name,
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
    setShowModal(true); // Changed from setShow(true)
  };

  const handleNewCommentInputChange = (e) => {
    setNewCommentInput(e.target.value);
  };

  // Handles submission of a new comment from the modal
  const handleCommentSubmit = async () => {
    // Ensure selectedTicket and OperatorId are available
    if (!selectedTicket?.Token || !OperatorId) {
      setErrorMessage("Ticket information or operator ID is missing.");
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
        Userid: OperatorId, // Assuming OperatorId is the correct ID for commenting
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
          commentResponse?.message ||
            "Failed to add comment due to an unknown error."
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

  // useEffect for auto-refreshing the page
  useEffect(() => {
    const interval = setInterval(() => {
      window.location.reload(); // Refresh the page
    }, 1800000); // 30 minutes = 1800000 milliseconds

    return () => clearInterval(interval); // Clear interval on unmount
  }, []);

  useEffect(() => {
    if ($.fn.DataTable.isDataTable("#operatorApprovedTicketTable")) {
      $("#operatorApprovedTicketTable").DataTable().destroy();
    }

    if (approvedData.length > 0) {
      setTimeout(() => {
        $("#operatorApprovedTicketTable").DataTable({
          paging: true,
          searching: true,
          ordering: true,
          responsive: true,
          pageLength: 10,
          lengthMenu: [5, 10, 25, 50, 100],
          columnDefs: [{ targets: -1, orderable: false }], // disable sorting for last column (View)
        });
      }, 0); // A small delay can help if rendering is not immediate
    }
  }, [approvedData]); // Re-run when approvedData changes

  // useEffect to fetch initial approved ticket data
  useEffect(() => {
    const fetchData = async () => {
      try {
        showLoading(); // Show loading indicator
        setErrorMessage(""); // Clear previous error messages
        const data = await approvedTicketFunction();
        hideLoading();
        if (!data?.result) {
          setApprovedData([]);
          setErrorMessage("No approved ticket data found.");
        } else {
          setApprovedData(data.result);
        }
      } catch (err) {
        hideLoading();
        setErrorMessage(
          "API error occurred while fetching approved tickets: " + err.message
        );
        console.error("Fetch approved tickets error:", err);
      }
    };

    fetchData();
  }, []);

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
    fetchData();
  };

  return (
    <div className="container-fluid mt-0 px-0">
      {/* Loading and Error Messages */}
      {loading && <div className="alert alert-info">Loading...</div>}
      {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

      {/* Approved Tickets Table */}
      {!loading && approvedData.length > 0 ? (
        <>
          <h4 className="text-center">Approved Tickets</h4>
          <div className="dashboard-card">
            <div
              className="table-responsive mt-0 table-bord"
              style={{ maxHeight: "600px" }}
            >
              <table
                id="operatorApprovedTicketTable"
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
                      "Category",
                      "Sub Category",
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
                    const flag = String(result.Flag);
                    const showRow =
                      flag === "null" || flag === "0" || flag === "1";

                    if (!showRow) return null;

                    const isNewTicketData = flag === "null" || flag === "0";

                    const srNo = index + 1;
                    const ticketNoRandom = result.TicketNoRandom;

                    const createdDate = new Date(result.Created_date)
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

                    const userName = isNewTicketData
                      ? result.UserName
                      : result.name;
                    const engineerName = result.EngineerNames;
                    const designation = isNewTicketData
                      ? result.Designation
                      : result.designation;

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
                        <td style={{ padding: "14px 12px" }}>
                          {ticketNoRandom}
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
                        <td style={{ padding: "14px 12px" }}>
                          {result.Category}
                        </td>
                        <td style={{ padding: "14px 12px" }}>
                          {result.Sub_Category}
                        </td>
                        <td style={{ padding: "14px 12px" }}>
                          {Array.isArray(createdDate)
                            ? createdDate.join(", ")
                            : createdDate}
                        </td>
                        <td style={{ padding: "14px 12px" }}>
                          {engineerName.map((name, index) => (
                            <p key={index}>{name}</p>
                          ))}
                        </td>
                        <td style={{ padding: "14px 12px" }}>
                          <FontAwesomeIcon
                            className="text-orange ms-2"
                            onClick={() => handleViewDetailsModal(result)}
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
            <p className="lead text-muted">
              You have no approved tickets to display.
            </p>
          </div>
        )
      )}

      <Modal show={showModal} onHide={handleCloseModal} centered size="lg">
        {" "}
        <Modal.Header
          closeButton
          style={{ background: "#4682B4", color: "#fff" }}
        >
          {" "}
          <Modal.Title style={{ color: "white" }}>Ticket Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTicket ? (
            (() => {
              const flag = String(selectedTicket.Flag);
              const isNewTicketData = flag === "null" || flag === "0";

              const userName = isNewTicketData
                ? selectedTicket.UserName
                : selectedTicket.name;
              const designation = isNewTicketData
                ? selectedTicket.Designation
                : selectedTicket.designation;
              const mobile = isNewTicketData
                ? selectedTicket.Mobile_No
                : selectedTicket.mobile_no;
              const department = isNewTicketData
                ? selectedTicket.Department
                : selectedTicket.department;
              const engineerName = selectedTicket.EngineerNames;
              const createdDate = new Date(selectedTicket.Created_date)
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
                <div className="table-responsive">
                  <table className="table table-bordered table-striped">
                    {" "}
                    <tbody>
                      <tr>
                        <th style={{ color: "#4682B4" }}>Ticket Number</th>
                        <td>{selectedTicket.TicketNoRandom}</td>
                      </tr>
                      <tr>
                        <th style={{ width: "30%", color: "#4682B4" }}>Name</th>
                        <td>{userName || "N/A"}</td>
                      </tr>
                      <tr>
                        <th style={{ color: "#4682B4" }}>Designation</th>
                        <td>{designation || "N/A"}</td>
                      </tr>
                      <tr>
                        <th style={{ color: "#4682B4" }}>Department</th>
                        <td>{department || "N/A"}</td>
                      </tr>
                      <tr>
                        <th style={{ color: "#4682B4" }}>Email</th>
                        <td>{selectedTicket.Email || "N/A"}</td>
                      </tr>
                      <tr>
                        <th style={{ color: "#4682B4" }}>Mobile Number</th>
                        <td>{mobile || "N/A"}</td>
                      </tr>
                      <tr>
                        <th style={{ color: "#4682B4" }}>Location</th>
                        <td>{selectedTicket.Loction}</td>
                      </tr>
                      <tr>
                        <th style={{ color: "#4682B4" }}>Issue</th>
                        <td>{selectedTicket.Ticket_type || "N/A"}</td>
                      </tr>
                      <tr>
                        <th style={{ color: "#4682B4" }}>Category</th>
                        <td>{selectedTicket.Category || "N/A"}</td>
                      </tr>
                      <tr>
                        <th style={{ color: "#4682B4" }}>Subcategory</th>
                        <td>{selectedTicket.Sub_Category || "N/A"}</td>
                      </tr>
                      <tr>
                        <th style={{ color: "#4682B4" }}>Created Date</th>
                        <td>{createdDate ? createdDate : "N/A"}</td>
                      </tr>
                      <tr>
                        <th style={{ color: "#4682B4" }}>Description</th>
                        <td>{selectedTicket.Description || "N/A"}</td>
                      </tr>
                      <tr>
                        <th style={{ color: "#4682B4" }}>Engineer Name</th>
                        <td style={{ padding: "14px 12px" }}>
                          {Array.isArray(selectedTicket?.EngineerNames) ? (
                            selectedTicket.EngineerNames.map((name, index) => (
                              <p key={index} className="mb-1">
                                {name}
                              </p>
                            ))
                          ) : selectedTicket?.EngineerNames ? (
                            <p className="mb-0">
                              {selectedTicket.EngineerNames}
                            </p>
                          ) : (
                            <span
                              style={{ fontStyle: "italic", color: "gray" }}
                            >
                              N/A
                            </span>
                          )}
                        </td>
                      </tr>

                      <tr>
                        <th style={{ color: "#4682B4" }}>Comment</th>
                        <td>{selectedTicket.Comment}</td>
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
                                      style={{
                                        maxWidth: "100%",
                                        height: "auto",
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
                                    <iframe
                                      src={fileUrl}
                                      title={`PDF-${index}`}
                                      width="100%"
                                      height="500px"
                                    ></iframe>
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
                                    >
                                      Download Document {index + 1}
                                    </a>
                                  </div>
                                );
                              }
                            })
                          ) : (
                            <span
                              style={{ fontStyle: "italic", color: "gray" }}
                            >
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
                            <strong>Comment:</strong> {item.comment}
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
                            {item.name || "N/A"}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="alert alert-light border">
                      No previous comments.
                    </p>
                  )}

                  <h5 className="mt-4">Add New Comment</h5>
                  <div className="mb-3">
                    <textarea
                      className="form-control"
                      rows="3"
                      placeholder="Type your new comment here..."
                      value={newCommentInput}
                      onChange={handleNewCommentInputChange}
                      disabled={loading}
                    ></textarea>
                  </div>
                </div>
              );
            })()
          ) : (
            <p>No ticket selected</p>
          )}
          <div className="form-group row mb-4" style={{ color: "#4682B4" }}>
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
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminApprovedTicket;
