import React, { useContext, useState, useEffect, useRef } from "react";
import { assignedTicketFunction } from "../../api/AssignedTicket";

import { uploadFileFunction } from "../../api/UploadFile";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";

import { changeStatusToAssignedFunction } from "../../api/ChangeStatusToAssigned";
import { AuthContext } from "../AuthContext";
import { engineerListFunction } from "../../api/EngineerList";
import $ from "jquery";
import "datatables.net-dt";
import "datatables.net-dt/css/dataTables.dataTables.min.css";

const showLoading = () => {
};

const hideLoading = () => {
};

const OperatorAssignedTicket = () => {
  const { user } = useContext(AuthContext);

  const [selectedPriority, setSelectedPriority] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [assignedData, setAssignedData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");

  const [selectedPhotos, setSelectedPhotos] = useState([]);

  // State for engineer reassignment
  const [engineerList, setEngineerList] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredEngineers, setFilteredEngineers] = useState([]);
  // Stores the full selected engineer object from suggestions
  const [selectedEngineerToAssign, setSelectedEngineerToAssign] =
    useState(null);

  const suggestionRef = useRef(null);
  const dataTableRef = useRef(null); // Ref to store the DataTable instance

  const navigate = useNavigate();

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedPhotos(files);
  };

  // Automatic page refresh every 30 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      window.location.reload();
    }, 1800000); // 30 minutes

    return () => clearInterval(interval); // Clean up on unmount
  }, []);

  // Fetch assigned tickets
  const fetchAssignedTickets = async () => {
    setLoading(true);
    setErrorMessage(""); // Clear previous errors
    try {
      const data = await assignedTicketFunction();

      if (!data?.result) {
        setErrorMessage("No ticket data found.");
        setAssignedData([]); 
      } else {
        setAssignedData(data.result);
      }
    } catch (err) {
      setErrorMessage("API error occurred: " + err.message);
      setAssignedData([]); // Ensure assignedData is empty on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedTickets();
  }, []);

  // Fetch engineer list
  useEffect(() => {
    const fetchEngineers = async () => {
      showLoading();
      try {
        const data = await engineerListFunction();
        setEngineerList(data || []);
      } catch (err) {
        setErrorMessage("Engineer API error: " + err.message);
        setEngineerList([]); // Ensure engineerList is empty on error
      } finally {
        hideLoading();
      }
    };
    fetchEngineers();
  }, []);

  // Initialize DataTables when assignedData changes
  useEffect(() => {
    if (assignedData.length > 0) {
      // Destroy existing DataTable instance if it exists
      if (dataTableRef.current) {
        dataTableRef.current.destroy();
        dataTableRef.current = null;
      }

      setTimeout(() => {
        dataTableRef.current = $("#operatorAssignedTicketTable").DataTable({
          paging: true,
          searching: true,
          ordering: true,
          responsive: true,
          pageLength: 10, // default items per page
          lengthMenu: [5, 10, 25, 50, 100], // dropdown for user to select items per page
          columnDefs: [{ targets: -1, orderable: false }], // disable sorting for last column (View)
        });
      }, 0);
    } else {
      // If data becomes empty, destroy DataTable to prevent errors
      if (dataTableRef.current) {
        dataTableRef.current.destroy();
        dataTableRef.current = null;
      }
    }

    // Cleanup function for DataTables: ensures it's destroyed when the component unmounts
    return () => {
      if (dataTableRef.current) {
        dataTableRef.current.destroy();
        dataTableRef.current = null;
      }
    };
  }, [assignedData]);

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
      setErrorMessage(error.message || "Failed to upload photo.");
    } finally {
      hideLoading();
    }

    fetchAssignedTickets();
  };

  // Handle click outside for engineer suggestions
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

  // Function to assign an engineer to a ticket
  const assignEngineer = async () => {
    // Basic validation
    if (
      !selectedEngineerToAssign?.Id ||
      !selectedTicket?.Token ||
      !selectedPriority
    ) {
      alert(
        "Please select an engineer, set a priority, and ensure a valid ticket is selected."
      );
      return;
    }

    const payload = {
      Token: [selectedTicket.Token], // Pass the token as a string
      EngineerId: Number(selectedEngineerToAssign.Id), // Ensure EngineerId is a number
      priority: selectedPriority,
    };
    

    showLoading();
    try {
      const response = await changeStatusToAssignedFunction(payload);
      hideLoading();

      if (!response?.result) {
        // If the API indicates failure but no error was thrown, create one
        throw new Error(
          "Assignment failed. " +
            (response?.message || "Please check server response.")
        );
      }

      alert("Engineer assigned successfully!");
      handleCloseModal(); // Close the modal and reset states
      fetchAssignedTickets(); // Refresh ticket data to show updated assignment
    } catch (err) {
      hideLoading();
     
      alert("Assignment error: " + err.message); // Display error to user
    }
  };

  // Closes the modal and resets modal-related states
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTicket(null);
    setSearchText(""); // Clear search when modal closes
    setSelectedEngineerToAssign(null); // Clear selected engineer when modal closes
    setSelectedPriority(""); // Clear selected priority
  };

  // Opens the modal and sets the selected ticket details
  const handleShowModal = (ticket) => {
    setSelectedTicket(ticket);
    // Set current ticket's priority if available, otherwise default to empty
    setSelectedPriority(ticket.Levels || "");
    // If an engineer is already assigned to this ticket, pre-fill the search field and select the engineer
    if (ticket.EngineerName && ticket.EngineerId) {
      const currentEngineer = engineerList.find(
        (eng) => eng.Id === ticket.EngineerId
      );
      if (currentEngineer) {
        setSearchText(
          `${currentEngineer.Designation} | ${currentEngineer.UserName}`
        );
        setSelectedEngineerToAssign(currentEngineer);
      } else {
        // If EngineerName exists but ID doesn't match a known engineer, clear
        setSearchText(ticket.EngineerName); // Display name, but no engineer selected
        setSelectedEngineerToAssign(null);
      }
    } else {
      setSearchText(""); // Clear search if no engineer assigned
      setSelectedEngineerToAssign(null);
    }
    setShowModal(true);
  };

  // Handles selection of an engineer from the suggestions list
  const handleSelectEngineer = (eng) => {
    setSearchText(`${eng.Designation} | ${eng.UserName}`);
    setSelectedEngineerToAssign(eng); // Store the full engineer object
    setShowSuggestions(false); // Hide suggestions after selection
  };

  // Handles changes in the engineer search input field
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchText(value);
    setShowSuggestions(true); // Always show suggestions when typing

    // Clear selected engineer if text changes, implying a new search
    setSelectedEngineerToAssign(null);

    // Filter engineers based on search text
    const filtered = engineerList.filter((eng) =>
      `${eng.Designation} ${eng.UserName}`
        .toLowerCase()
        .includes(value.toLowerCase())
    );
    setFilteredEngineers(filtered);
  };

  return (
    <div className="container-fluid mt-0 px-0">
      {/* Loading and Error Messages */}
      {loading && (
        <div className="alert alert-info text-center">Loading tickets...</div>
      )}
      {errorMessage && (
        <div className="alert alert-danger text-center">{errorMessage}</div>
      )}

      {/* Assigned Tickets Table */}
      {!loading && assignedData.length > 0 ? (
        <>
          <h4 className="text-center">Assigned Tickets</h4>
          <div className="dashboard-card">
            <div
              className="table-responsive mt-0 table-bord"
              style={{ maxHeight: "600px" }}
            >
              <table
                id="operatorAssignedTicketTable"
                className="align-middle table-struc"
                style={{ width: "100%" }}
              >
                <thead>
                  <tr>
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
                  {assignedData.map((result, index) => {
                    // Filter logic: Only display tickets with specific Flag values
                    const showFlag =
                      result.Flag === null ||
                      result.Flag === "null" ||
                      result.Flag === 0 ||
                      result.Flag === "0" ||
                      result.Flag === 1 ||
                      result.Flag === "1";

                    if (!showFlag) return null; // Skip rendering if flag doesn't match

                    // Determine if it's a "new" ticket based on Flag for data consistency
                    const isNew =
                      result.Flag === null ||
                      result.Flag === "null" ||
                      result.Flag === 0 ||
                      result.Flag === "0";

                    const srNo = index + 1;
                    // Format date for display
                    const Created_date = new Date(
                      result.Created_date
                    ).toLocaleString();
                    const userName = isNew ? result.UserName : result.name;
                    const designation = isNew
                      ? result.Designation
                      : result.designation;
                    const engineerName = result.EngineerNames; // This is the assigned engineer's name

                    return (
                      <tr
                        key={index} // Use a unique key for each row
                        style={{
                          margin: "10px",
                          border: "0px solid #e0e0e0",
                          boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                        }}
                      >
                        <td style={{ padding: "14px 12px" }}>{srNo}</td>
                        <td style={{ padding: "14px 12px" }}>
                          {result.TicketNoRandom}
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
                          {Array.isArray(Created_date) // This array check might not be necessary for single date string
                            ? Created_date.join(", ")
                            : Created_date}
                        </td>
                        <td style={{ padding: "14px 12px" }}>
                          {engineerName.map((name, index) => (
                            <p key={index}>{name}</p>
                          ))}
                        </td>

                        <td style={{ padding: "14px 12px" }}>
                          <FontAwesomeIcon
                            className="text-orange ms-2"
                            onClick={() => handleShowModal(result)} // Open modal on click
                            icon={faEye}
                            title="View Ticket Details"
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
        // Message when no tickets are assigned or loading
        !loading && (
          <div className="text-center py-5">
            <p className="lead text-muted">You have no tickets to display.</p>
          </div>
        )
      )}

      {/* Modal for Ticket Details and Engineer Assignment */}
      <Modal show={showModal} onHide={handleCloseModal} centered size="lg">
        <Modal.Header closeButton style={{ background: "#4682B4" }}>
          <Modal.Title className="text-white">Ticket Details</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {selectedTicket ? (
            (() => {
              // Extract details from selectedTicket, considering 'new' vs 'existing' ticket structure
              const flag = selectedTicket.Flag;
              const isNew =
                flag === null || flag === "null" || flag === 0 || flag === "0";

              const name = isNew
                ? selectedTicket.UserName
                : selectedTicket.name;
              const mobile = isNew
                ? selectedTicket.Mobile_No
                : selectedTicket.mobile_no;
              const designation = isNew
                ? selectedTicket.Designation
                : selectedTicket.designation;
              const department = isNew
                ? selectedTicket.Department
                : selectedTicket.department;

              return (
                <div className="table-responsive">
                  <table className="table table-bordered">
                    <tbody>
                      <tr>
                        <th style={{ color: "#4682B4" }}>Ticket Number</th>
                        <td>{selectedTicket.TicketNoRandom}</td>
                      </tr>
                      <tr>
                        <th style={{ width: "30%", color: "#4682B4" }}>Name</th>
                        <td>{name}</td>
                      </tr>
                      <tr>
                        <th style={{ color: "#4682B4" }}>Designation</th>
                        <td>{designation}</td>
                      </tr>
                      <tr>
                        <th style={{ color: "#4682B4" }}>Department</th>
                        <td>{department}</td>
                      </tr>
                      <tr>
                        <th style={{ color: "#4682B4" }}>Email</th>
                        <td>{selectedTicket.Email}</td>
                      </tr>
                      <tr>
                        <th style={{ color: "#4682B4" }}>Mobile Number</th>
                        <td>{mobile}</td>
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
                        <td>
                          {new Date(
                            selectedTicket.Created_date
                          ).toLocaleString()}
                        </td>
                      </tr>
                      <tr>
                        <th style={{ color: "#4682B4" }}>Description</th>
                        <td>{selectedTicket.Description}</td>
                      </tr>
                      <tr>
                        <th style={{ color: "#4682B4" }}>Engineer Name</th>
                        <td>{selectedTicket.EngineerName || "Not Assigned"}</td>
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
                            <span
                              style={{ fontStyle: "italic", color: "gray" }}
                            >
                              No documents attached
                            </span>
                          )}
                        </td>
                      </tr>
                      <tr>
                        <th style={{ color: "#4682B4" }}>Priority</th>
                        <td>
                          <select
                            className="form-control" // Added Bootstrap class for better styling
                            value={selectedPriority}
                            onChange={(e) =>
                              setSelectedPriority(e.target.value)
                            }
                          >
                            <option value="">Select Priority</option>
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Low">Low</option>
                          </select>
                        </td>
                      </tr>

                      <tr>
                        <th style={{ color: "#4682B4" }}>Assign Engineer</th>
                        <td>
                          <div
                            ref={suggestionRef}
                            style={{ position: "relative" }}
                          >
                            <input
                              type="text"
                              className="form-control" // Added Bootstrap class for better styling
                              placeholder="Search Engineer..."
                              value={searchText}
                              onChange={handleSearchChange}
                              onFocus={() => setShowSuggestions(true)} // Show suggestions when input is focused
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
                                    top: "100%", // Position below the input field
                                    left: 0,
                                    right: 0,
                                  }}
                                >
                                  {filteredEngineers.map((item, i) => (
                                    <li
                                      key={i}
                                      // Use onMouseDown to prevent input blur before onClick fires
                                      onMouseDown={(e) => e.preventDefault()}
                                      onClick={() => handleSelectEngineer(item)}
                                      style={{
                                        padding: "8px 12px",
                                        cursor: "pointer",
                                        borderBottom: "1px solid #eee",
                                        "&:last-child": {
                                          borderBottom: "none",
                                        }, // No border on last item
                                      }}
                                    >
                                      {`${item.Designation} | ${item.UserName}`}
                                    </li>
                                  ))}
                                </ul>
                              )}
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
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
            className="btn"
            onClick={assignEngineer}
            style={{ color: "white", background: "#4682B4" }}
          >
            Forward
          </Button>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default OperatorAssignedTicket;
