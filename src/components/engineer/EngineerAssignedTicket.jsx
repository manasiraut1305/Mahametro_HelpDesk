import React, { useContext, useEffect, useState, useRef } from "react";
import { AuthContext } from "../AuthContext";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

import { uploadFileFunction } from "../../api/UploadFile";
import { engineerListFunction } from "../../api/EngineerList";
import { reassignEngineerFunction } from "../../api/ReassignEngineer"; 
import { updateEngineerFunction } from "../../api/UpdateEngineer"; 

import { changeStatusToApprovedFunction } from "../../api/ChangeStatusToApproved";
import { engineerTicketListFunction } from "../../api/EngineerAssignTicketList";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { Pagination } from "react-bootstrap";

import $ from "jquery";
import "datatables.net-dt";
import "datatables.net-dt/css/dataTables.dataTables.min.css";

const EngineerAssignedTicket = () => {
  const { user } = useContext(AuthContext);
  const engineerId = user?.id; 
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedEngineer, setSelectedEngineer] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [show, setShow] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [engineer, setEngineer] = useState([]);

  const [successMessage, setSuccessMessage] = useState("");
  const [filteredEngineers, setFilteredEngineers] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1); 
  const [selectedNewEngineerId, setSelectedNewEngineerId] = useState(null);

  const [selectedPhotos, setSelectedPhotos] = useState([]);

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

  // Initialize DataTables
  useEffect(() => {
    if (tickets.length > 0) {
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
  }, [tickets]);

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
      const token = selectedTicket?.Token;
      const currentEngineerId = engineerId;
      const newEngineerToAssignId = selectedNewEngineerId; // This is the ID of the engineer selected from the dropdown

      // Validate required data
      if (!token || !currentEngineerId || !newEngineerToAssignId) {
        hideLoading();
        setErrorMessage("Missing required data to reassign engineer.");
        return;
      }

      const response = await reassignEngineerFunction({
        token: token, // Corrected to 'Token'
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

      hideLoading();

      if (!response || !response.message) {
        setErrorMessage("Engineer reassignment failed.");
      } else {
        
        getData(); 
        handleClose(); // Close the modal
      }
    } catch (err) {
      hideLoading();
      setErrorMessage("API error occurred: " + err.message);
    }
  };

  const getData = async () => {
    try {
      showLoading();
      const data = await engineerTicketListFunction({ id: engineerId }); // engineerId is correct here, refers to the logged-in engineer

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

  const handleApproveTicket = async (Token) => {
    try {
      showLoading();
      // The API call expects an array of Tokens and the engineerId
      const response = await changeStatusToApprovedFunction(
        [Token], // Pass Token as an array
        engineerId
      );
      console.log("Approval response:", response);
      hideLoading();

      if (!response?.result) {
        setErrorMessage("Ticket approval failed.");
      } else {
        alert("Ticket approved successfully.");
        getData(); // Refresh ticket list
        handleClose(); // Close the modal
      }
    } catch (err) {
      hideLoading();
      setErrorMessage("API error occurred: " + err.message);
    }
  };

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

 
  useEffect(() => {
    if (engineerId) {
      getData();
    }
  }, [engineerId]); 

  return (
    <div className="container-fluid mt-0 px-0">
      {loading && <div className="alert alert-info">Loading...</div>}
      {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

      {!loading && tickets.length > 0 ? (
        <>
          <h4 className="text-center">Assigned Tickets</h4>
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
                    result.Created_date
                  ).toLocaleString();
                  const userName = isNew ? result.UserName : result.name;
                  const designation = isNew
                    ? result.Designation
                    : result.designation;


                    const Created_date = new Date(result.Created_date)
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
                        {Created_date}
                      </td>
                      <td style={{ padding: "14px 12px" }}>
                        {result.CategoryName}
                      </td>
                      <td style={{ padding: "14px 12px" }}>
                        {result.SubCategoryName}
                      </td>
                   <td style={{ padding: "14px 12px" }}>
  {(() => {
    const hasDeptApproval = "DeptHeadApproved" in result;
    const hasPavanApproval = "PavanApproved" in result;

    const isEnabled =
      !hasDeptApproval ||
      !hasPavanApproval ||
      (result?.DeptHeadApproved === true &&
        result?.PavanApproved === true);

    return (
      <FontAwesomeIcon
        icon={faEye}
        title={isEnabled ? "View" : "Approval pending"}
        style={{
          cursor: isEnabled ? "pointer" : "not-allowed",
          color: isEnabled ? "#4682B4" : "#ccc",
          pointerEvents: isEnabled ? "auto" : "none",
        }}
        onClick={() => {
          if (isEnabled) {
            handleShow(result);
          }
        }}
      />
    );
  })()}
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

                const Created_date = new Date(selectedTicket.Created_date)
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
                    {/* <tr>
                      <th style={{ color: "#4682B4" }}>Engineer Name</th>
                      <td>
                        {selectedTicket.EngineerDetails &&
                          selectedTicket.EngineerDetails.map((eng, index) => (
                            <div key={index}>{eng.UserName}</div>
                          ))}
                      </td>
                    </tr> */}

                    {selectedTicket.Created_date && (
                      <tr style={{ borderBottom: "1px solid #ddd" }}>
                        <th style={{ color: "#4682B4" }}>Created Date</th>
                        <td>
                          {Created_date}
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
                      <td>{selectedTicket.Comment}</td>
                    </tr>
                    {selectedTicket.Category && (
                      <tr style={{ borderBottom: "1px solid #ddd" }}>
                        <th style={{ color: "#4682B4" }}>Category</th>
                        <td>{selectedTicket.Category}</td>
                      </tr>
                    )}
                    {selectedTicket.Sub_Category && (
                      <tr style={{ borderBottom: "1px solid #ddd" }}>
                        <th style={{ color: "#4682B4" }}>Sub Category</th>
                        <td>{selectedTicket.Sub_Category}</td>
                      </tr>
                    )}

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
                                className="btn w-100 mx-3"
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
                                className="btn w-100 mx-4"
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
              );
            })()
          ) : (
            <div>No ticket selected</div>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button
            className="btn"
            style={{
              background: "#4682B4",
              color: "white",
            }}
            onClick={() => handleApproveTicket(selectedTicket?.Token)}
          >
            Approve Ticket
          </Button>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default EngineerAssignedTicket;
