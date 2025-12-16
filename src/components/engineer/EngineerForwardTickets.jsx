import React, { useContext, useEffect, useState, useRef } from "react";
import { AuthContext } from "../AuthContext";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

import { uploadFileFunction } from "../../api/UploadFile";
import { engineerListFunction } from "../../api/EngineerList";
import { reassignEngineerFunction } from "../../api/ReassignEngineer"; // Assuming this is the corrected function from your previous request

// import { changeStatusToApprovedFunction } from "../../api/ChangeStatusToApproved";
import { engineerTicketForwardListFunction } from "../../api/EngineerForwardTicketList";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { Pagination } from "react-bootstrap";

import $ from "jquery";
import "datatables.net-dt";
import "datatables.net-dt/css/dataTables.dataTables.min.css";

const EngineerForwardTickets = () => {
  const { user } = useContext(AuthContext);
  const engineerId = user?.id; // Renamed from engineerId to currentEngineerId for clarity if needed, but keeping original for consistency with AuthContext
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedEngineer, setSelectedEngineer] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [show, setShow] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [engineer, setEngineer] = useState([]);

  const [successMessage, setSuccessMessage] = useState("");
  // const [newEngineerId, setNewEngineerId] = useState([]); // This state was declared but not used for its intended purpose (selected ID)
  const [filteredEngineers, setFilteredEngineers] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1); // currentPage and related pagination states are commented out in JSX, so they are not currently active
  const [selectedNewEngineerId, setSelectedNewEngineerId] = useState(null);

  const [selectedPhotos, setSelectedPhotos] = useState([]);

  // New: tabs state
  const [activeTab, setActiveTab] = useState("all"); // tabs: all, assigned, approved, resolved

  // Auto-refresh every 30 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      window.location.reload(); // Refresh the page
    }, 1800000); // 30 minutes = 1800000 milliseconds

    return () => clearInterval(interval); // Clear interval on unmount
  }, []);

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedPhotos(files);
  };

  // Helper: determine whether a ticket matches a tab
  const ticketMatchesTab = (ticket, tab) => {
    if (!ticket) return false;
    const status = (ticket.Status || ticket.status || "")
      .toString()
      .toLowerCase();
    const approval = (
      ticket.ApprovalStatus ||
      ticket.Approved ||
      ticket.IsApproved ||
      ""
    )
      .toString()
      .toLowerCase();
    const resolved = (
      ticket.Resolved ||
      ticket.IsResolved ||
      ticket.StatusResolved ||
      ""
    )
      .toString()
      .toLowerCase();

    // Some APIs use Flag; keep conservative checks but don't rely only on Flag.
    const flag =
      ticket.Flag != null ? ticket.Flag.toString().toLowerCase() : "";

    switch (tab) {
      case "All":
        return true;
      case "assigned":
        return (
          status === "assigned" ||
          approval === "assigned" ||
          flag === "assigned" ||
          flag === "1" // treat flag 1 as possibly 'assigned'
        );
      case "approved":
        return (
          status === "approved" ||
          approval === "approved" ||
          flag === "approved" ||
          approval === "true" ||
          ticket.IsApproved === true
        );
      case "resolved":
        return (
          status === "resolved" ||
          resolved === "true" ||
          resolved === "resolved" ||
          ticket.IsResolved === true ||
          ticket.Resolved === true
        );
      default:
        return true;
    }
  };

  // Derive filtered tickets for display based on activeTab
  const filteredTickets = tickets.filter((t) => ticketMatchesTab(t, activeTab));

  // Initialize DataTables
  useEffect(() => {
    if (filteredTickets.length > 0) {
      // Destroy if already exists
      if ($.fn.DataTable.isDataTable("#engineerAssignedTicketTable")) {
        $("#engineerAssignedTicketTable").DataTable().destroy();
      }

      // Initialize
      setTimeout(() => {
        $("#engineerAssignedTicketTable").DataTable({
          paging: true,
          searching: true,
          ordering: true,
          responsive: true,
          pageLength: 10, // default items per page
          lengthMenu: [5, 10, 25, 50, 100], // dropdown for user to select items per page
          columnDefs: [
            { targets: -1, orderable: false }, // disable sorting for last column (View)
          ],
        });
      }, 0);
    }
  }, [filteredTickets]);

  const showLoading = () => setLoading(true);
  const hideLoading = () => setLoading(false);

  const handleClose = () => {
    setShow(false);
    setSelectedTicket(null);
    setSelectedEngineer(null); // Clear selected engineer when modal closes
    setSearchText(""); // Clear search text
    setFilteredEngineers(engineer); // Reset filtered engineers
    setSelectedNewEngineerId(null); // Clear selected new engineer ID
  };

  // Fetch engineers list on component mount
  useEffect(() => {
    const fetchEngineers = async () => {
      try {
        showLoading();
        const data = await engineerListFunction();
        hideLoading();
        setEngineer(data || []);
        setFilteredEngineers(data || []); // Initialize filtered engineers with all engineers
      } catch (err) {
        hideLoading();
        setErrorMessage("Engineer API error: " + err.message);
      }
    };
    fetchEngineers();
  }, []);

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
  };

  // Handle click outside suggestions to close them
  const suggestionRef = useRef(null);
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

  const handleShow = (ticket) => {
    setSelectedTicket(ticket);
    setShow(true);
    setSelectedEngineer(null);
    setSearchText("");
    setFilteredEngineers(engineer); // Ensure filtered list is reset when opening modal
    setSelectedNewEngineerId(null); // Reset new engineer ID for new modal opening
  };

  const handleAssignEngineer = async () => {
    try {
      showLoading();
      const token = selectedTicket?.token;
      const currentEngineerId = engineerId;
      const newEngineerToAssignId = selectedNewEngineerId;

      if (!token || !currentEngineerId || !newEngineerToAssignId) {
        hideLoading();
        setErrorMessage("Missing required data to reassign engineer.");
        return;
      }

      const response = await reassignEngineerFunction({
        token: token, // Corrected to 'token'
        currentEngineerId: currentEngineerId, // Corrected to 'currentEngineerId'
        newEngineerId: newEngineerToAssignId, // Corrected to 'newEngineerId'
      });

      hideLoading();

      if (!response || !response.message) {
        setErrorMessage("Engineer reassignment failed.");
      } else {
        alert(response.message);
        getData(); // Refresh ticket list
        handleClose(); // Close the modal
      }
    } catch (err) {
      hideLoading();
      setErrorMessage("API error occurred: " + err.message);
    }
  };

  // Map active tab to API status value
  const getStatusForTab = (tab) => {
    switch (tab) {
      case "assigned":
        return "Asigned"; // exact value requested
      case "approved":
        return "Approved";
      case "resolved":
        return "Resolved";
      case "all":
        return "All";
      default:
        return null; // send no status for "all"
    }
  };

  const getData = async (status = null) => {
    try {
      showLoading();

      // Build payload: include status only when provided (not null)
      const payload = { id: engineerId };
      if (status != null && status !== "") {
        payload.status = status;
      }

      const data = await engineerTicketForwardListFunction(payload); // pass payload with/without status

      hideLoading();

      if (Array.isArray(data.result)) {
        setTickets(data.result);
      } else {
        setErrorMessage("");
        setTickets([]); // Ensure tickets is an empty array if data.result is not an array
      }
    } catch (err) {
      hideLoading();
      setErrorMessage("API error occurred: " + err.message);
    }
  };

  // const handleApproveTicket = async (token) => {
  //   try {
  //     showLoading();
  //     // The API call expects an array of tokens and the engineerId
  //     const response = await changeStatusToApprovedFunction(
  //       [token], // Pass token as an array
  //       engineerId
  //     );
  //     hideLoading();

  //     if (!response?.result) {
  //       setErrorMessage("Ticket approval failed.");
  //     } else {
  //       alert("Ticket approved successfully.");
  //       getData(); // Refresh ticket list
  //       handleClose(); // Close the modal
  //     }
  //   } catch (err) {
  //     hideLoading();
  //     setErrorMessage("API error occurred: " + err.message);
  //   }
  // };

  const handleSelectEngineer = (eng) => {
    setSelectedEngineer(eng);
    setSearchText(`${eng.Designation} | ${eng.UserName}`);
    setSelectedNewEngineerId(eng.Id); // Store the actual ID for the API call
    setShowSuggestions(false);
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

  // Fetch initial ticket data when engineerId or activeTab changes
  useEffect(() => {
    if (engineerId) {
      const status = getStatusForTab(activeTab);
      getData(status);
    }
  }, [engineerId, activeTab]); // Now refetch when tab changes

  return (
    <div className="container-fluid mt-0 px-0">
      {loading && <div className="alert alert-info">Loading...</div>}
      {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

      {/* Tabs */}
      <ul className="nav nav-tabs mb-3">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "all" ? "active" : ""}`}
            onClick={() => setActiveTab("all")}
          >
            All
            {/* ({tickets.length}) */}
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "assigned" ? "active" : ""}`}
            onClick={() => setActiveTab("assigned")}
          >
            Assigned
            {/* ({tickets.filter((t) => ticketMatchesTab(t, "assigned")).length}) */}
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "approved" ? "active" : ""}`}
            onClick={() => setActiveTab("approved")}
          >
            Approved
            {/* ({tickets.filter((t) => ticketMatchesTab(t, "approved")).length}) */}
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "resolved" ? "active" : ""}`}
            onClick={() => setActiveTab("resolved")}
          >
            Resolved
            {/* ({tickets.filter((t) => ticketMatchesTab(t, "resolved")).length}) */}
          </button>
        </li>
      </ul>

      {!loading && filteredTickets.length > 0 ? (
        <>
          <h4 className="text-center">Forwarded Tickets</h4>
          <div
            className="table-responsive mt-0 table-bord"
            style={{ minHeight: "570px" }}
          >
            <table
              id="engineerAssignedTicketTable"
              className="align-middle table-struc"
              style={{ width: "100%" }}
            >
              <thead>
                <tr
                  style={{
                    backgroundColor: "#CFE2FF",
                  }}
                >
                  {[
                    "Sr No",
                    "Ticket number",
                    "Priority",
                    "Status",
                    "User Name",
                    "Designation",
                    "Created Date",
                    "Category",
                    "Sub Category",
                    "View",
                  ].map((header, idx) => (
                    <th key={idx} className="tablehead">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredTickets.map((result, index) => {
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
                  const userName = isNew ? result.UserName : result.name;
                  const designation = isNew
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
                      <td style={{ padding: "14px 12px" }}>{TicketNoRandom}</td>
                      <td style={{ padding: "14px 12px" }}>{result.Levels}</td>
                      <td style={{ padding: "14px 12px" }}>{result.Status}</td>
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
                        {result.Created_date
                          ? new Date(result.Created_date).toLocaleString()
                          : "—"}
                      </td>

                      <td style={{ padding: "14px 12px" }}>
                        {/* Ensure createddate is not an array before calling toLocaleString directly on it */}
                        {result.CategoryName}
                      </td>
                      <td style={{ padding: "14px 12px" }}>
                        {/* Ensure createddate is not an array before calling toLocaleString directly on it */}
                        {result.SubCategoryName}
                      </td>
                      <td style={{ padding: "14px 12px" }}>
                        <FontAwesomeIcon
                          className="text-orange ms-2"
                          onClick={() => handleShow(result)}
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
        </>
      ) : (
        !loading && (
          <div className="text-center py-5">
            <p className="lead text-muted">You have no tickets to display.</p>
          </div>
        )
      )}

      {/* Ticket Modal */}
      <Modal show={show} onHide={handleClose} size="lg">
        <Modal.Header closeButton style={{ background: "#4682B4" }}>
          <Modal.Title style={{ color: "white" }}>Ticket Details</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {selectedTicket ? (
            (() => {
              const flag = selectedTicket.Flag;
              const showFlag =
                flag === null ||
                flag === "null" ||
                flag === 0 ||
                flag === "0" ||
                flag === 1 ||
                flag === "1";

              if (!showFlag)
                return <div>Ticket not visible due to flag status.</div>;

              const isNew =
                flag === null || flag === "null" || flag === 0 || flag === "0";

              const userName = isNew
                ? selectedTicket.UserName
                : selectedTicket.name;
              const designation = isNew
                ? selectedTicket.Designation
                : selectedTicket.designation;
              const department = isNew
                ? selectedTicket.Department
                : selectedTicket.department;
              const Mobile = isNew
                ? selectedTicket.Mobile_no
                : selectedTicket.mobile_no;

              return (
                <table className="table table-bordered">
                  <tbody>
                    <tr>
                      <th style={{ color: "#4682B4" }}>Ticket Number</th>
                      <td>{selectedTicket.TicketNoRandom}</td>
                    </tr>
                    {userName && (
                      <tr style={{ borderBottom: "1px solid #ddd" }}>
                        <th style={{ color: "#4682B4" }}>User Name</th>
                        <td>{userName}</td>
                      </tr>
                    )}

                    {selectedTicket.Email && (
                      <tr style={{ borderBottom: "1px solid #ddd" }}>
                        <th style={{ color: "#4682B4" }}>Email</th>
                        <td>{selectedTicket.Email}</td>
                      </tr>
                    )}

                    {Mobile && (
                      <tr style={{ borderBottom: "1px solid #ddd" }}>
                        <th style={{ color: "#4682B4" }}>Mobile Number</th>
                        <td>{Mobile}</td>
                      </tr>
                    )}

                    {designation && (
                      <tr style={{ borderBottom: "1px solid #ddd" }}>
                        <th style={{ color: "#4682B4" }}>Designation</th>
                        <td>{designation}</td>
                      </tr>
                    )}

                    {department && (
                      <tr style={{ borderBottom: "1px solid #ddd" }}>
                        <th style={{ color: "#4682B4" }}>Department</th>
                        <td>
                          {Array.isArray(department)
                            ? department.join(", ")
                            : department}
                        </td>
                      </tr>
                    )}
                    {selectedTicket.Location && (
                      <tr style={{ borderBottom: "1px solid #ddd" }}>
                        <th style={{ color: "#4682B4" }}>Location</th>
                        <td>{selectedTicket.Location}</td>
                      </tr>
                    )}

                    {selectedTicket.createddate && (
                      <tr style={{ borderBottom: "1px solid #ddd" }}>
                        <th style={{ color: "#4682B4" }}>Generation Date</th>
                        <td>
                          {new Date(
                            selectedTicket.createddate
                          ).toLocaleString()}
                        </td>
                      </tr>
                    )}

                    {selectedTicket.Ticket_type && (
                      <tr style={{ borderBottom: "1px solid #ddd" }}>
                        <th style={{ color: "#4682B4" }}>Ticket Type</th>
                        <td>{selectedTicket.Ticket_type}</td>
                      </tr>
                    )}

                    {selectedTicket.Description && (
                      <tr style={{ borderBottom: "1px solid #ddd" }}>
                        <th style={{ color: "#4682B4" }}>Description</th>
                        <td>{selectedTicket.Description}</td>
                      </tr>
                    )}
                    <tr style={{ borderBottom: "1px solid #ddd" }}>
                      <th style={{ color: "#4682B4" }}>Comment</th>
                      <td>{selectedTicket.Comments}</td>
                    </tr>
                    {selectedTicket.Category && (
                      <tr style={{ borderBottom: "1px solid #ddd" }}>
                        <th style={{ color: "#4682B4" }}>Category</th>
                        <td>{selectedTicket.CategoryName}</td>
                      </tr>
                    )}
                    {selectedTicket.Sub_Category && (
                      <tr style={{ borderBottom: "1px solid #ddd" }}>
                        <th style={{ color: "#4682B4" }}>Sub Category</th>
                        <td>{selectedTicket.SubCategoryName}</td>
                      </tr>
                    )}
                    <tr>
                      <th style={{ color: "#4682B4" }}>Engineer Name</th>
                      <td>
                        {selectedTicket.EngineerDetails &&
                          selectedTicket.EngineerDetails.map((eng, index) => (
                            <div key={index}>{eng.UserName}</div>
                          ))}
                      </td>
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
                                  <p className="text-center small">
                                    {file.name}
                                  </p>
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
                                      top: "100%", // Position below the input
                                      left: 0,
                                    }}
                                  >
                                    {filteredEngineers.map((item, i) => (
                                      <li
                                        key={i}
                                        onMouseDown={(e) => e.preventDefault()} // Prevent blur when clicking a suggestion
                                        onClick={() =>
                                          handleSelectEngineer(item)
                                        }
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
                          </div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              );
            })()
          ) : (
            <div>No ticket selected</div>
          )}
        </Modal.Body>

        <Modal.Footer>
          {/* <Button
            // className="btn"
            // style={{
              // background: "#4682B4",
              // color: "white",
            // }}
          > */}
          {/* onClick={() => handleApproveTicket(selectedTicket?.token)}
          >
             Approve Ticket
          </Button> */}
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default EngineerForwardTickets;
