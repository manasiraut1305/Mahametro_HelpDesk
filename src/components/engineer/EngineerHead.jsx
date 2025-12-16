import React, { useState, useEffect, useRef, useContext } from "react";
import { faCheck, faTimes, faQuestion, faEye } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { getTicketsForApproval } from "../../api/TicketForApproval";
import { approveTicketFunction } from "../../api/HeadApproveTicket";
import { getCommentFunction } from "../../api/GetComments";
import { commentSectionFunction } from "../../api/CommentSection";

import { AuthContext } from "../AuthContext";

import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import $ from "jquery";
import "datatables.net-dt";
import "datatables.net-dt/css/dataTables.dataTables.min.css";

const EngineerHead = () => {
  const { user } = useContext(AuthContext);

  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [raisedData, setRaisedData] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [show, setShow] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const [comments, setComments] = useState([]);
  const [newCommentInput, setNewCommentInput] = useState("");

  const [deptHeadCount, setDeptHeadCount] = useState(0);
  const [allDeptCount, setAllDeptCount] = useState(0);

  const suggestionRef = useRef(null);

  const showLoading = () => setLoading(true);
  const hideLoading = () => setLoading(false);

  const getAllData = async () => {
    try {
      showLoading();
      const data = await getTicketsForApproval(user?.id);
      hideLoading();

      if (!data) {
        setErrorMessage("No ticket data found.");
        setRaisedData([]);
        return;
      }

      const deptHeadList = data.DeptHeadApprovedNewRequirements || [];
      const allDeptList = data.AllDepartmentTickets || [];

      if (!deptHeadList.length && !allDeptList.length) {
        setErrorMessage("No tickets available.");
        setRaisedData([]);
      } else {
        setRaisedData(deptHeadList.length ? deptHeadList : allDeptList);
        setErrorMessage("");
      }

      setDeptHeadCount(data.DeptHeadApprovedNewRequirementsCount || 0);
      setAllDeptCount(data.AllDepartmentTicketsCount || 0);
    } catch (err) {
      hideLoading();
      setErrorMessage("API error occurred: " + (err?.message || "Unknown error"));
      setRaisedData([]);
    }
  };

  useEffect(() => {
    getAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if ($.fn.DataTable.isDataTable("#UserHeadTable")) {
      $("#UserHeadTable").DataTable().destroy();
    }

    if (raisedData.length > 0) {
      setTimeout(() => {
        $("#UserHeadTable").DataTable({
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
  }, [raisedData]);

  const getApprovalIcon = (value) => {
    if (value === true)
      return <FontAwesomeIcon icon={faCheck} className="text-success" title="Approved" />;
    if (value === false)
      return <FontAwesomeIcon icon={faTimes} className="text-danger" title="Rejected" />;
    return <FontAwesomeIcon icon={faQuestion} className="text-warning" title="Pending" />;
  };

  const getUserName = (ticket) => ticket?.UserName || ticket?.name || "-";
  const getDesignation = (ticket) => ticket?.User_Designation || ticket?.Designation || "-";
  const getDepartment = (ticket) => {
    const dept = ticket?.Department || ticket?.department;
    return Array.isArray(dept) ? dept.join(", ") : dept || "-";
  };
  const getMobile = (ticket) => ticket?.Mobile_No || ticket?.mobile_no || "-";

  const fetchComments = async (Token) => {
    if (!Token) {
      setComments([]);
      return;
    }
    try {
      const response = await getCommentFunction({ Token });
      if (response?.result && Array.isArray(response.result)) {
        const formatted = response.result.map((item) => ({
          comment: item.Comments,
          timestamp: item.CreatedDate ? new Date(item.CreatedDate).toLocaleString() : "-",
          name: item.Name || "-",
        }));
        setComments(formatted);
      } else {
        setComments([]);
      }
    } catch (err) {
      console.error("Error fetching comments:", err);
      setComments([]);
      setErrorMessage("Failed to load comments.");
    }
  };

  const handleShow = (ticket) => {
    setSelectedTicket(ticket);
    setShow(true);
    setSearchText("");

    // ✅ Load comments when modal opens
    fetchComments(ticket?.Token);
  };

  const handleClose = () => {
    setShow(false);
    setSelectedTicket(null);
    setSearchText("");
    setComments([]);
    setNewCommentInput("");
    getAllData();
  };

  const handleApprove = async () => {
    try {
      showLoading();
      const payload = {
        Token: selectedTicket?.Token || "",
        ApproverId: user?.id || 0,
        Approve: true,
        PAVAN_USER_ID: 0,
      };
      const data = await approveTicketFunction(payload);
      hideLoading();

      if (!data) setErrorMessage("Ticket approval failed.");
      else 
        handleClose();
      getAllData();
    } catch (err) {
      hideLoading();
      setErrorMessage("API error occurred: " + (err?.message || "Unknown error"));
    }
  };

  const handleReject = async () => {
    try {
      showLoading();
      const payload = {
        Token: selectedTicket?.Token || "",
        ApproverId: user?.id || 0,
        Approve: false,
        PAVAN_USER_ID: null,
      };
      const data = await approveTicketFunction(payload);
      hideLoading();

      if (!data) setErrorMessage("Ticket rejection failed.");
      else 
        handleClose();
      getAllData();
    } catch (err) {
      hideLoading();
      setErrorMessage("API error occurred: " + (err?.message || "Unknown error"));
    }
  };

  const handleNewCommentInputChange = (e) => {
    setNewCommentInput(e.target.value);
    setErrorMessage("");
  };

  const handleCommentSubmit = async () => {
    const engineerId = user?.id; // ✅ fixed
    const name = user?.Name || user?.name || "User"; // ✅ fixed

    if (!selectedTicket?.Token || !engineerId) {
      setErrorMessage("Ticket information or user ID is missing.");
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
        Name: name,
        Token: [selectedTicket.Token],
        Comment: newCommentInput.trim(),
      });

      if (!commentResponse || commentResponse.message !== "Comments saved successfully.") {
        throw new Error("Failed to add comment.");
      }

      setNewCommentInput("");
      fetchComments(selectedTicket.Token);
    } catch (err) {
      setErrorMessage("Failed to submit comment: " + (err?.message || "Unknown error"));
    } finally {
      hideLoading();
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="container-fluid mt-0 px-0">
        {loading && <div className="alert alert-info">Loading...</div>}
        {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

        {!loading && raisedData.length > 0 ? (
          <>
            <h4 className="text-center">New Development Approval Request</h4>

            <div className="dashboard-card pt">
              <div className="table-container">
                <table id="UserHeadTable" className="align-middle table-struc" style={{ width: "100%" }}>
                  <thead className="table-header-sticky">
                    <tr>
                      {[
                        "Sr No",
                        "Ticket Number",
                        "User Name",
                        "Designation",
                        "Created Date",
                        "Category",
                        "Sub Category",
                        "Head Approval",
                        "Pawan Sir Approval",
                        "View",
                      ].map((header, idx) => (
                        <th key={idx} className="table-head">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {raisedData.map((ticket, index) => (
                      <tr key={ticket?.Id || index} className="table-row-hover">
                        <td>{index + 1}</td>
                        <td>{ticket?.TicketNoRandom || "-"}</td>
                        <td>{getUserName(ticket)}</td>
                        <td>{getDesignation(ticket)}</td>
                        <td>
                          {ticket?.Created_date ? new Date(ticket.Created_date).toLocaleString() : "-"}
                        </td>
                        <td>{ticket?.Category || "-"}</td>
                        <td>{ticket?.Sub_Category || "-"}</td>
                        <td>{getApprovalIcon(ticket?.DeptHeadApproved)}</td>
                        <td>{getApprovalIcon(ticket?.PavanApproved)}</td>

                        <td className="table-action">
                          <FontAwesomeIcon
                            icon={faEye}
                            onClick={() => handleShow(ticket)}
                            title="View"
                            className="action-icon"
                            style={{ cursor: "pointer" }}
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
              <p className="lead text-muted">No tickets to display.</p>
            </div>
          )
        )}

        {/* View Modal */}
        <Modal show={show} onHide={handleClose} size="lg">
          <Modal.Header closeButton style={{ background: "#4682B4" }}>
            <Modal.Title style={{ color: "white" }}>Ticket Details</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            {selectedTicket ? (
              <>
                <table className="table table-bordered">
                  <tbody>
                    <tr>
                      <th style={{ color: "#4682B4" }}>Ticket Number</th>
                      <td>{selectedTicket?.TicketNoRandom || "-"}</td>
                    </tr>
                    <tr>
                      <th style={{ color: "#4682B4" }}>User Name</th>
                      <td>{getUserName(selectedTicket)}</td>
                    </tr>
                    <tr>
                      <th style={{ color: "#4682B4" }}>Email</th>
                      <td>{selectedTicket?.Email || "-"}</td>
                    </tr>
                    <tr>
                      <th style={{ color: "#4682B4" }}>Mobile Number</th>
                      <td>{getMobile(selectedTicket)}</td>
                    </tr>
                    <tr>
                      <th style={{ color: "#4682B4" }}>Designation</th>
                      <td>{getDesignation(selectedTicket)}</td>
                    </tr>
                    <tr>
                      <th style={{ color: "#4682B4" }}>Department</th>
                      <td>{getDepartment(selectedTicket)}</td>
                    </tr>
                    <tr>
                      <th style={{ color: "#4682B4" }}>Location</th>
                      <td>{selectedTicket?.User_Location || "-"}</td>
                    </tr>
                    <tr>
                      <th style={{ color: "#4682B4" }}>Ticket Type</th>
                      <td>{selectedTicket?.IssueType || "-"}</td>
                    </tr>
                    <tr>
                      <th style={{ color: "#4682B4" }}>Category</th>
                      <td>{selectedTicket?.Category || "-"}</td>
                    </tr>
                    <tr>
                      <th style={{ color: "#4682B4" }}>Sub Category</th>
                      <td>{selectedTicket?.Sub_Category || "-"}</td>
                    </tr>
                    <tr>
                      <th style={{ color: "#4682B4" }}>Description</th>
                      <td>{selectedTicket?.Description || "-"}</td>
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
                        <div className="text-muted" style={{ fontSize: "0.85rem" }}>
                          {item.timestamp}
                        </div>
                        <div className="text-muted" style={{ fontSize: "0.85rem" }}>
                          {item.name}
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="alert alert-light border">No previous comments.</p>
                )}

                <h5 className="mt-4">Add New Comment</h5>
                <div className="mb-3">
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Type your new comment here..."
                    value={newCommentInput}
                    onChange={handleNewCommentInputChange}
                  />
                </div>

                <Button variant="primary" onClick={handleCommentSubmit}>
                  Submit Comment
                </Button>
              </>
            ) : (
              <div>No ticket selected</div>
            )}
          </Modal.Body>

          <Modal.Footer>
            <Button className="btn btn-success" onClick={handleApprove}>
              Approve
            </Button>
            <Button variant="danger" onClick={handleReject}>
              Reject
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </>
  );
};

export default EngineerHead;
