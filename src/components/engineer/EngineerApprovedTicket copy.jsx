import React, { useContext, useEffect, useState, useRef } from "react";
import { AuthContext } from "../AuthContext";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { changeStatusToResolvedFunction } from "../../api/ChangeStatusToResolved";
import { engineerTicketApproveListFunction } from "../../api/EngineerApproveTicketList";
import { getCommentFunction } from "../../api/GetComments";
import { commentSectionFunction } from "../../api/CommentSection"; // Make sure this path is correct
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCommentAlt, faEye } from "@fortawesome/free-solid-svg-icons";

import $ from "jquery";
import "datatables.net-dt";
import "datatables.net-dt/css/dataTables.dataTables.min.css";

const EngineerApprovedTicket = () => {
  const { user } = useContext(AuthContext);
  const engineerId = user?.id;
  const name = user?.name;

  const [showModal, setShowModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]); // State to hold fetched comments

  const dataTableRef = useRef(null); // Ref for DataTables instance

  const showLoading = () => setLoading(true);
  const hideLoading = () => setLoading(false);

  const getData = async () => {
    setErrorMessage("");
    try {
      showLoading();
      const data = await engineerTicketApproveListFunction({ id: engineerId });
      console.log("Approved ticket data:", data);

      if (Array.isArray(data.result)) {
        setTickets(data.result);
      } else {
        setErrorMessage("No ticket data found or unexpected data format.");
        setTickets([]);
      }
    } catch (err) {
      setErrorMessage("API error occurred: " + err.message);
      setTickets([]);
    } finally {
      hideLoading();
    }
  };

  // Fetch comments for the selected ticket
  const fetchComments = async (token) => {
    if (!token) {
      setComments([]);
      return;
    }
    try {
      const response = await getCommentFunction({ Token: token });
      if (response?.comments) {
        setComments(response.comments);
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
    const interval = setInterval(() => {
      console.log("Refreshing approved ticket data...");
      getData();
    }, 1800000); // 30 minutes

    return () => clearInterval(interval);
  }, [engineerId]);

  useEffect(() => {
    if (engineerId) {
      getData();
    }
  }, [engineerId]);

  useEffect(() => {
    // DataTables initialization and destruction
    if (dataTableRef.current) {
      dataTableRef.current.destroy();
      dataTableRef.current = null;
    }

    if (tickets.length > 0) {
      setTimeout(() => {
        dataTableRef.current = $("#engineerApprovedTicketTable").DataTable({
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
      if (dataTableRef.current) {
        dataTableRef.current.destroy();
        dataTableRef.current = null;
      }
    };
  }, [tickets]);

  // When a ticket is selected, set its current comment (if any) and fetch all comments
  useEffect(() => {
    if (selectedTicket) {
      setComment(selectedTicket.Comment || "");
      fetchComments(selectedTicket.token); // Fetch all comments when modal opens
    }
  }, [selectedTicket]);

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTicket(null);
    setComment(""); // Clear comment when closing the modal
    setComments([]); // Clear fetched comments
    setErrorMessage(""); // Clear error message
  };

  const handleViewDetailsModal = (ticket) => {
    setSelectedTicket(ticket);
    setShowModal(true);
  };

  const handleCommentChange = (e) => {
    setComment(e.target.value);
  };

  const handleCommentSectionSubmit = async () => {
    if (!selectedTicket?.token || !engineerId || !name) {
      setErrorMessage("Ticket information, engineer ID, or name is missing.");
      return;
    }
    if (!comment.trim()) {
      setErrorMessage("Comment cannot be empty.");
      return;
    }

    showLoading();
    try {
      const commentResponse = await commentSectionFunction({
        Userid: engineerId,
        Name: name,
        Token: [selectedTicket.token], // API expects an array for Token
        Comment: comment,
      });

      if (
        !commentResponse ||
        commentResponse.message !== "Comments saved successfully."
      ) {
        throw new Error("Failed to add comment.");
      }

      alert("Comment submitted successfully."); // Consider toast notification for better UX
      // Refresh comments in the modal after successful submission
      await fetchComments(selectedTicket.token);
      setComment(""); // Clear the comment input field after submission
      // Optionally, update the local tickets state to reflect the new comment
      setTickets((prevTickets) =>
        prevTickets.map((ticket) =>
          ticket.token === selectedTicket.token
            ? { ...ticket, Comment: comment } // Update the main comment field in the table
            : ticket
        )
      );
    } catch (err) {
      setErrorMessage("Failed to submit comment: " + err.message);
    } finally {
      hideLoading();
    }
  };

  const handleResolveTicket = async () => {
    if (!selectedTicket?.token || !engineerId) {
      setErrorMessage("Ticket information or engineer ID is missing.");
      return;
    }

    showLoading();
    try {
      // First, attempt to submit any pending comment if the modal is open with an unsaved comment
      if (comment.trim() !== (selectedTicket.Comment || "").trim()) {
        const commentResponse = await commentSectionFunction({
          Userid: engineerId,
          Name: name,
          Token: [selectedTicket.token],
          Comment: comment,
        });

        if (
          !commentResponse ||
          commentResponse.message !== "Comments saved successfully."
        ) {
          console.warn(
            "Could not save comment before resolving, proceeding with resolution."
          );
        }
      }

      const resolveResponse = await changeStatusToResolvedFunction(
        [selectedTicket.token],
        engineerId
      );

      if (!resolveResponse?.result) {
        throw new Error("Ticket resolution failed.");
      }

      alert("Ticket resolved successfully.");
      setComment("");
      getData(); // Refresh the main ticket list to remove the resolved ticket
      handleCloseModal();
    } catch (err) {
      setErrorMessage("Operation failed: " + err.message);
    } finally {
      hideLoading();
    }
  };

  return (
    <div className="container-fluid mt-0 px-0">
      <h4>Approved Tickets</h4>
      {loading && <div className="alert alert-info">Loading...</div>}
      {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

      {!loading && tickets.length > 0 ? (
        <>
          <div
            className="table-responsive mt-0 table-bord"
            style={{ minHeight: "570px" }}
          >
            <table
              id="engineerApprovedTicketTable"
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
                    "Created Date",
                    "Comment",
                    "View Details",
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

                  const srNo = index + 1;
                  const TicketNoRandom = result.TicketNoRandom;
                  const createddate = new Date(
                    result.createddate
                  ).toLocaleString();
                  const userName = result.name || result.UserName;
                  const designation = result.designation || result.Designation;
                  // const commentText = result.Comment || "No comments yet."; // This will show the last comment, not all

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
                        {Array.isArray(createddate)
                          ? createddate.join(", ")
                          : createddate}
                      </td>
                      {/* Clicking on the comment cell will open the modal */}
                      <td
                        style={{ padding: "14px 12px", cursor: "pointer" }}
                        onClick={() => handleViewDetailsModal(result)} // Opens the modal for details and comment
                      >
                        <FontAwesomeIcon
                          className="text-orange me-2"
                          icon={faCommentAlt}
                          title="View/Add Comment"
                          style={{ color: "#4682B4" }}
                        />
                      </td>
                      <td style={{ padding: "14px 12px" }}>
                        <FontAwesomeIcon
                          icon={faEye}
                          style={{ color: "#4682B4" }}
                          onClick={() => handleViewDetailsModal(result)} // Opens the modal for details
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

      {/* Single Consolidated Ticket Details and Comment Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton style={{ background: "#4682B4" }}>
          <Modal.Title style={{ color: "white" }}>
            Ticket Details & Comments
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {errorMessage && (
            <div className="alert alert-danger">{errorMessage}</div>
          )}

          {selectedTicket && (
            <>
              <h5>Ticket Information</h5>
              <table className="table table-bordered mb-4">
                <tbody>
                  <tr>
                    <th style={{ color: "#4682B4" }}>Ticket Number</th>
                    <td>{selectedTicket.TicketNoRandom}</td>
                  </tr>
                  <tr>
                    <th style={{ color: "#4682B4" }}>User Name</th>
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
                    <th style={{ color: "#4682B4" }}>Email</th>
                    <td>{selectedTicket.Email}</td>
                  </tr>
                  <tr>
                    <th style={{ color: "#4682B4" }}>Mobile Number</th>
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
                    <th style={{ color: "#4682B4" }}>Designation</th>
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
                    <th style={{ color: "#4682B4" }}>Department</th>
                    <td>
                      {Array.isArray(selectedTicket.Department)
                        ? selectedTicket.Department.join(", ")
                        : selectedTicket.Department ||
                          selectedTicket.department}
                    </td>
                  </tr>
                  <tr>
                    <th style={{ color: "#4682B4" }}>Generation Date</th>
                    <td>
                      {selectedTicket.createddate
                        ? new Date(selectedTicket.createddate).toLocaleString()
                        : "N/A"}
                    </td>
                  </tr>
                  <tr>
                    <th style={{ color: "#4682B4" }}>Ticket Type</th>
                    <td>{selectedTicket.Ticket_type}</td>
                  </tr>
                  <tr>
                    <th style={{ color: "#4682B4" }}>Description</th>
                    <td>{selectedTicket.Description}</td>
                  </tr>
                  {selectedTicket.Category && (
                    <tr>
                      <th style={{ color: "#4682B4" }}>Category</th>
                      <td>{selectedTicket.Category}</td>
                    </tr>
                  )}
                  {selectedTicket.Sub_Category && (
                    <tr>
                      <th style={{ color: "#4682B4" }}>Sub Category</th>
                      <td>{selectedTicket.Sub_Category}</td>
                    </tr>
                  )}
                  <tr>
                    <th style={{ color: "#4682B4" }}>Attached File(s)</th>
                    <td>
                      {selectedTicket.ImageUrl?.length > 0
                        ? selectedTicket.ImageUrl.map((fileUrl, index) => {
                            const ext = fileUrl.split(".").pop().toLowerCase();
                            if (
                              [
                                "jpg",
                                "jpeg",
                                "png",
                                "gif",
                                "bmp",
                                "webp",
                              ].includes(ext)
                            ) {
                              return (
                                <img
                                  key={index}
                                  src={fileUrl}
                                  alt={`img-${index}`}
                                  style={{
                                    maxWidth: "100%",
                                    height: "auto",
                                    marginBottom: 10,
                                  }}
                                />
                              );
                            } else if (ext === "pdf") {
                              return (
                                <iframe
                                  key={index}
                                  src={fileUrl}
                                  width="100%"
                                  height="500px"
                                  title={`pdf-${index}`}
                                  style={{ marginBottom: 10 }}
                                ></iframe>
                              );
                            } else {
                              return (
                                <div key={index}>
                                  <a
                                    href={fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    Download File {index + 1}
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

              {/* Comment Input Section */}
              <h5 className="mt-4">Add/Edit Comment</h5>
              <div className="mb-3">
                <textarea
                  className="form-control"
                  rows="3"
                  value={comment}
                  onChange={handleCommentChange}
                  placeholder="Enter your comment here..."
                ></textarea>
              </div>
              <Button
                variant="primary"
                onClick={handleCommentSectionSubmit}
                disabled={loading}
                style={{ backgroundColor: "#4682B4", color: "white" }}
              >
                {loading ? "Submitting..." : "Submit Comment"}
              </Button>

              {/* Display Existing Comments */}
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
                        {item.timestamp
                          ? new Date(item.timestamp).toLocaleString()
                          : "N/A"}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="alert alert-light border">No previous comments.</p>
              )}
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button
            onClick={handleResolveTicket}
            disabled={loading}
            style={{ backgroundColor: "#4682B4", color: "white" }}
          >
            {loading ? "Resolving..." : "Resolve Ticket"}
          </Button>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default EngineerApprovedTicket;