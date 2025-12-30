import React, { useContext, useEffect, useState, useRef } from "react";
import { AuthContext } from "../AuthContext";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { changeStatusToResolvedFunction } from "../../api/ChangeStatusToResolved";
import { engineerTicketApproveListFunction } from "../../api/EngineerApproveTicketList";
import { engineerListFunction } from "../../api/EngineerList";
import { getCommentFunction } from "../../api/GetComments";
import { uploadFileFunction } from "../../api/UploadFile";
import { commentSectionFunction } from "../../api/CommentSection";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { reassignEngineerFunction } from "../../api/ReassignEngineer";

import { updateEngineerFunction } from "../../api/UpdateEngineer"; 
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
  const [successMessage, setSuccessMessage] = useState("");
  const [comments, setComments] = useState([]);
  const [newCommentInput, setNewCommentInput] = useState("");
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [selectedEngineer, setSelectedEngineer] = useState(null);
  const [engineer, setEngineer] = useState([]);
  const [selectedNewEngineerId, setSelectedNewEngineerId] = useState(null);
  const [filteredEngineers, setFilteredEngineers] = useState([]);
  const dataTableRef = useRef(null);
  const [reassignedTickets, setReassignedTickets] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionRef = useRef(null);

  const showLoading = () => setLoading(true);
  const hideLoading = () => setLoading(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionRef.current &&
        !suggestionRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchEngineers = async () => {
      try {
        showLoading();
        const data = await engineerListFunction();
        hideLoading();
        setEngineer(data || []);
        setFilteredEngineers(data || []);
      } catch (err) {
        hideLoading();
        setErrorMessage("Engineer API error: " + err.message);
      }
    };
    fetchEngineers();
  }, []);

  const getData = async () => {
    setErrorMessage("");
    try {
      showLoading();
      const data = await engineerTicketApproveListFunction({ id: engineerId });

      if (Array.isArray(data?.result)) {
        setTickets(data.result);
      } else {
        // setErrorMessage("No tickets found.");
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

  const fetchComments = async (Token) => {
    if (!Token) {
      setComments([]);
      return;
    }
    try {
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

  useEffect(() => {
    const interval = setInterval(() => {
      getData();
    }, 1800000);
    return () => clearInterval(interval);
  }, [engineerId]);

  useEffect(() => {
    if (engineerId) {
      getData();
    }
  }, [engineerId]);

  useEffect(() => {
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

  useEffect(() => {
    if (selectedTicket && showModal) {
      fetchComments(selectedTicket.Token);
      setNewCommentInput("");
    }
  }, [selectedTicket, showModal]);

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTicket(null);
    setComments([]);
    setNewCommentInput("");
    setErrorMessage("");
    setSuccessMessage("");
    setSelectedPhotos([]);
    setSelectedEngineer(null);
    setSearchText("");
    setFilteredEngineers(engineer);
    setSelectedNewEngineerId(null);
  };

  const handleViewDetailsModal = (ticket) => {
    setSelectedTicket(ticket);
    setShowModal(true);
    setSelectedEngineer(null);
    setSearchText("");
    setFilteredEngineers(engineer);
    setSelectedNewEngineerId(null);
  };

  const handleAssignEngineer = async () => {
    try {
      showLoading();
      // const Token = selectedTicket?.Token;
      const Token = selectedTicket?.Token;
      const currentEngineerId = engineerId;
      const newEngineerToAssignId = selectedNewEngineerId;

      if (!Token || !currentEngineerId || !newEngineerToAssignId) {
        hideLoading();
        setErrorMessage("Missing required data to reassign engineer.");
        return;
      }

      const response = await reassignEngineerFunction({
        token: Token,
        currentEngineerId,
        newEngineerId: newEngineerToAssignId,
      });
      console.log("Reassign Engineer Response:", response);
      hideLoading();

      if (!response || !response.message) {
        setErrorMessage("Engineer reassignment failed.");
      } else {
        alert(response.message);

        // ✅ Mark this ticket as reassigned
        setReassignedTickets((prev) => [...prev, Token]);

        getData();
        handleCloseModal();
      }
    } catch (err) {
      hideLoading();
      setErrorMessage("API error occurred: " + err.message);
    }
  };

   const handleUpdateEngineer = async () => {
      try {
        showLoading();
        const token = selectedTicket?.Token;
        const currentEngineerId = engineerId;
        const newEngineerToAssignId = selectedNewEngineerId; 
  
        // Validate required data
        if (!token || !currentEngineerId || !newEngineerToAssignId) {
          hideLoading();
          setErrorMessage("Missing required data to reassign engineer.");
          return;
        }
  
        const response = await updateEngineerFunction({
          token: token, 
          currentEngineerId: currentEngineerId, 
          newEngineerId: newEngineerToAssignId, 
        });
  // console.log("Update Engineer Response:", response);
        hideLoading();
  
        if (!response || !response.message) {
          setErrorMessage("Engineer reassignment failed.");
        } else {
          getData(); 
          handleCloseModal(); 
        }
      } catch (err) {
        hideLoading();
        setErrorMessage("API error occurred: " + err.message);
      }
    };
  const handleNewCommentInputChange = (e) => {
    setNewCommentInput(e.target.value);
  };

  const handleCommentSubmit = async () => {
    if (!selectedTicket?.Token || !engineerId) {
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
        Name: name,
        Token: [selectedTicket.Token],
        Comment: newCommentInput,
      });

      if (
        !commentResponse ||
        commentResponse.message !== "Comments saved successfully."
      ) {
        throw new Error("Failed to add comment.");
      }

      setSuccessMessage("Comment submitted successfully.");
      setNewCommentInput("");
      fetchComments(selectedTicket.Token);
    } catch (err) {
      setErrorMessage("Failed to submit comment: " + err.message);
    } finally {
      hideLoading();
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
    getData();
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchText(value);
    setShowSuggestions(true);

    const filtered = engineer.filter((eng) =>
      `${eng.Designation} ${eng.UserName}`
        .toLowerCase()
        .includes(value.toLowerCase())
    );
    setFilteredEngineers(filtered);
  };

  const handleResolveTicket = async () => {
    if (!selectedTicket?.Token || !engineerId) {
      setErrorMessage("Ticket information or engineer ID is missing.");
      return;
    }

    showLoading();
    try {
      const resolveResponse = await changeStatusToResolvedFunction(
        [selectedTicket.Token],
        engineerId
      );

      if (!resolveResponse?.result) {
        throw new Error("Ticket resolution failed.");
      }

      setSuccessMessage("Ticket resolved successfully.");
      getData();
      handleCloseModal();
    } catch (err) {
      setErrorMessage("Operation failed: " + err.message);
    } finally {
      hideLoading();
    }
  };

  const handleSelectEngineer = (eng) => {
    setSelectedEngineer(eng);
    setSearchText(`${eng.Designation} | ${eng.UserName}`);
    setSelectedNewEngineerId(eng.Id);
    setShowSuggestions(false);
  };

  return (
    <div className="container-fluid mt-0 px-0">
      {loading && <div className="alert alert-info">Loading...</div>}
      {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

      {!loading && tickets.length > 0 ? (
        <>
          <h4 className="text-center">Approved Tickets</h4>
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
                    "Category",
                    "Sub Category",
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
                    result.Created_date
                  ).toLocaleString();
                  const userName = result.name || result.UserName;
                  const designation = result.designation || result.Designation;
                

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
                      <td
                        style={{
                          padding: "14px 12px",
                          color: reassignedTickets.includes(result.Token)
                            ? "red"
                            : "inherit",
                          fontWeight: reassignedTickets.includes(result.Token)
                            ? "bold"
                            : "normal",
                        }}
                      >
                        {TicketNoRandom}
                      </td>

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
                      <td>
                        {result.Created_date
                          ? new Date(result.Created_date).toLocaleString(
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

                      <td style={{ padding: "14px 12px" }}>
                        {result.CategoryName}
                      </td>
                      <td style={{ padding: "14px 12px" }}>
                        {result.SubCategoryName}
                      </td>
                      <td style={{ padding: "14px 12px" }}>
                        <FontAwesomeIcon
                          icon={faEye}
                          style={{ color: "#4682B4", cursor: "pointer" }}
                          onClick={() => handleViewDetailsModal(result)}
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

      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton style={{ background: "#4682B4" }}>
          <Modal.Title style={{ color: "white" }}>Ticket Details</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {errorMessage && (
            <div className="alert alert-danger">{errorMessage}</div>
          )}
          {successMessage && (
            <div className="alert alert-success">{successMessage}</div>
          )}

          {selectedTicket ? (
            <>
              <table className="table table-bordered mb-4">
                <tbody>
                  <tr>
                    <th style={{ color: "#4682B4" }}>Ticket Number</th>
                    <td
                      style={{
                        padding: "14px 12px",
                        color: reassignedTickets.includes(selectedTicket.Token)
                          ? "red"
                          : "inherit",
                        fontWeight: reassignedTickets.includes(
                          selectedTicket.Token
                        )
                          ? "bold"
                          : "normal",
                      }}
                    >
                      {selectedTicket.TicketNoRandom}
                    </td>
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
                    <th style={{ color: "#4682B4" }}>Location</th>
                    <td>{selectedTicket.User_Location}</td>
                  </tr>
                  <tr>
                    <th style={{ color: "#4682B4" }}>Created Date</th>
                    <td>
                      {selectedTicket?.Created_date
                        ? new Date(selectedTicket.Created_date).toLocaleString(
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
                    <th style={{ color: "#4682B4" }}>Description</th>
                    <td>{selectedTicket.Description}</td>
                  </tr>
                  <tr>
                    <th style={{ color: "#4682B4" }}>Comment</th>
                    <td>{selectedTicket.Comment}</td>
                  </tr>
                  {selectedTicket.Category && (
                    <tr>
                      <th style={{ color: "#4682B4" }}>Category</th>
                      <td>{selectedTicket.CategoryName}</td>
                    </tr>
                  )}
                  {selectedTicket.Sub_Category && (
                    <tr>
                      <th style={{ color: "#4682B4" }}>Sub Category</th>
                      <td>{selectedTicket.SubCategoryName}</td>
                    </tr>
                  )}

                  {/* <tr>
                    <th style={{ color: "#4682B4" }}>Engineer Name</th>
                    <td>
                      {selectedTicket.EngineerDetails &&
                        selectedTicket.EngineerDetails.map((eng, index) => (
                          <div key={index}>{eng.UserName}</div>
                        ))}
                    </td>
                  </tr> */}

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
                    <th style={{ color: "#4682B4" }}>Assign Engineer</th>
                    <td>
                      <div className="d-flex flex-row ">
                        <div
                          className="d-flex flex-row justify-content-between"
                          ref={suggestionRef}
                          style={{ position: "relative" }}
                        >
                          <div>
                            <input
                              type="text"
                              placeholder="Search Engineer..."
                              value={searchText}
                              onChange={handleSearchChange}
                              onFocus={() => setShowSuggestions(true)}
                              style={{
                                width: "100%",
                                padding: "6px",
                                borderRadius: "4px",
                                border: "1px solid #ccc",
                              }}
                            />
                            {showSuggestions &&
                              filteredEngineers.length > 0 && (
                                <ul
                                  style={{
                                    position: "absolute",
                                    background: "#fff",
                                    width: "100%",
                                    zIndex: 1000,
                                    border: "1px solid #ccc",
                                    maxHeight: "150px",
                                    overflowY: "auto",
                                    padding: 0,
                                    margin: 0,
                                    listStyle: "none",
                                    top: "100%",
                                    left: 0,
                                  }}
                                >
                                  {filteredEngineers.map((item, i) => (
                                    <li
                                      key={i}
                                      onMouseDown={(e) => e.preventDefault()}
                                      onClick={() => handleSelectEngineer(item)}
                                      style={{
                                        padding: "8px 12px",
                                        cursor: "pointer",
                                      }}
                                    >
                                      {`${item.Designation} | ${item.UserName}`}
                                    </li>
                                  ))}
                                </ul>
                              )}
                          </div>
                          <div>
                            <Button
                              className="btn w-100 mx-2"
                              onClick={handleAssignEngineer}
                              style={{
                                background: "#4682B4",
                                color: "white",
                                flex: "",
                              }}
                            >
                              Forward
                            </Button>
                          </div>
                          <div>
                            <Button
                              className="btn w-100 mx-3"
                              onClick={handleUpdateEngineer}
                              style={{
                                background: "#4682B4",
                                color: "white",
                                flex: "",
                              }}
                            >
                              Update
                            </Button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>

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
            disabled={loading || !newCommentInput.trim()}
            style={{ backgroundColor: "#4682B4", color: "white" }}
          >
            {loading ? "Submitting..." : "Submit Comment"}
          </Button>
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
