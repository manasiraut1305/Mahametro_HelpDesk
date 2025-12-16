import React, { useState, useEffect, useRef } from "react";
import { raisedTicketFunction } from "../../api/RaisedTicket";
import { engineerListFunction } from "../../api/EngineerList";
import { changeStatusToAssignedFunction } from "../../api/ChangeStatusToAssigned";
import UserEditTicket from "../../components/user/UserEditTicket";
import { uploadFileFunction } from "../../api/UploadFile";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { faEye, faPen } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import $, { get } from "jquery";
import "datatables.net-dt"; // JS part
import "datatables.net-dt/css/dataTables.dataTables.min.css";

const OperatorRaisedTicket = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [raisedData, setRaisedData] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [filteredEngineers, setFilteredEngineers] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [show, setShow] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [selectedPriority, setSelectedPriority] = useState("");
  const [selectedEngineer, setSelectedEngineer] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [showEdit, setShowEdit] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [engineers, setEngineers] = useState([]); 

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedPhotos(files);
  };
  const suggestionRef = useRef(null); 

  const showLoading = () => setLoading(true);
  const hideLoading = () => setLoading(false);

  const handleEdit = (result) => {
    setSelectedTicket(result);
    setShowEdit(true);
  };

  const getAllData = async () => {
    try {
      showLoading();
      const data = await raisedTicketFunction();
      hideLoading();

      if (!data?.result) {
        setErrorMessage("No ticket data found.");
        setRaisedData([]);
      } else {
        setRaisedData(data.result);
      }
    } catch (err) {
      hideLoading();
      setErrorMessage("API error occurred: " + err.message);
      setRaisedData([]);
    }
  };

  useEffect(() => {
    getAllData();
  }, []);

  const handleEditClose = () => {
    setShowEdit(false);
    setSelectedTicket(null);
  };
  useEffect(() => {
    if ($.fn.DataTable.isDataTable("#operatorRaisedTicketTable")) {
      $("#operatorRaisedTicketTable").DataTable().destroy();
    }

    if (raisedData.length > 0) {
      setTimeout(() => {
        $("#operatorRaisedTicketTable").DataTable({
          paging: true,
          searching: true,
          ordering: true,
          responsive: true,
          pageLength: 10, 
          lengthMenu: [5, 10, 25, 50, 100], 
          columnDefs: [
            { targets: -1, orderable: false }, // disable sorting for last column (View)
          ],
        });
      }, 0);
    }
  }, [raisedData]);

  useEffect(() => {
    const fetchEngineers = async () => {
      try {
        showLoading();
        const data = await engineerListFunction();
        hideLoading();

        if (data) {
          setEngineers(data);
          setFilteredEngineers(data);
        }
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

    getAllData();
  };

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

  // Handler for showing the ticket detail modal
  const handleShow = (ticket) => {
    setSelectedTicket(ticket);
    setShow(true);
    setSelectedEngineer(null);
    setSearchText("");
    setFilteredEngineers(engineers); // Use full engineer list
  };

  // Handler for closing the ticket detail modal
  const handleClose = () => {
    setShow(false);
    setSelectedTicket(null);
    setSearchText("");
    setFilteredEngineers([]);
    getAllData();
  };

 
  const handleSelectEngineer = (eng) => {
    setSelectedEngineer(eng);
    setSearchText(`${eng.Designation} | ${eng.UserName}`);
    setShowSuggestions(false);
  };

  
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchText(value);
    setShowSuggestions(true);

    const filtered = engineers.filter((eng) =>
      `${eng.Designation} ${eng.UserName}`
        .toLowerCase()
        .includes(value.toLowerCase())
    );
    setFilteredEngineers(filtered);
  };

  const assignEngineer = async () => {
    if (!selectedEngineer?.Id || !selectedTicket?.Token || !selectedPriority) {
      alert(
        "Please select an engineer, priority, and ensure the ticket is valid."
      );
      return;
    }

    const payload = {
      Token: [selectedTicket.Token],
      EngineerId: Number(selectedEngineer.EngineerId || selectedEngineer.Id),
      priority: selectedPriority,
    };

    try {
      showLoading();
      const response = await changeStatusToAssignedFunction(payload);
      hideLoading();

      if (!response?.result) {
        throw new Error("Assignment failed. " + (response?.message || ""));
      }

      alert("Engineer assigned successfully!");
      setShow(false);
      getAllData(); 
    } catch (err) {
      hideLoading();
      alert("Assignment error: " + err.message);
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
          <h4 className="text-center">Raised Tickets</h4>
          <div className="dashboard-card pt">
            <div className="table-container">
              <table
                id="operatorRaisedTicketTable"
                className="align-middle table-struc"
                style={{ width: "100%" }}
              >
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
                      "View",
                      "Edit",
                    ].map((header, idx) => (
                      <th key={idx} className="table-head">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {raisedData.map((result, index) => {
                    const flag = result.Flag;
                    if (
                      !(
                        flag === null ||
                        flag === "null" ||
                        flag === 0 ||
                        flag === "0" ||
                        flag === 1 ||
                        flag === "1"
                      )
                    ) {
                      return null;
                    }

                    const isNew =
                      flag === null ||
                      flag === "null" ||
                      flag === 0 ||
                      flag === "0";
                    const srNo = index + 1;
                    const TicketNoRandom = result.TicketNoRandom;
                    const userName = isNew ? result.UserName : result.name;
                    const designation = isNew
                      ? result.Designation
                      : result.designation;

                    return (
                      <tr key={index} className="table-row-hover">
                        <td>{srNo}</td>
                        <td>{TicketNoRandom}</td>
                        <td>{userName}</td>
                        <td>{designation}</td>
                        <td>
                          {new Date(result.Created_date).toLocaleString()}
                        </td>
                        <td>{result.Category}</td>
                        <td>{result.Sub_Category}</td>
                        <td className="table-action">
                          <FontAwesomeIcon
                            icon={faEye}
                            onClick={() => handleShow(result)}
                            title="View"
                            className="action-icon"
                          />
                        </td>
                        <td className="table-action">
                          <FontAwesomeIcon
                            icon={faPen}
                            onClick={() => handleEdit(result)}
                            title="Edit"
                            className="action-icon"
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
            <p className="lead text-muted">No tickets to display.</p>
          </div>
        )
      )}

      {/* Modal for Ticket Details and Engineer Assignment */}
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

              if (!showFlag) {
                return <div>Ticket not visible due to flag status.</div>;
              }

              const isNew =
                flag === null || flag === "null" || flag === 0 || flag === "0";

              const userName = isNew
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
                <table className="table table-bordered">
                  <tbody>
                    <tr>
                      <th style={{ color: "#4682B4" }}>Ticket Number</th>
                      <td>{selectedTicket.TicketNoRandom}</td>
                    </tr>
                    <tr>
                      <th style={{ color: "#4682B4" }}>User Name</th>
                      <td>{userName}</td>
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
                      <th style={{ color: "#4682B4" }}>Designation</th>
                      <td>{designation}</td>
                    </tr>
                    <tr>
                      <th style={{ color: "#4682B4" }}>Department</th>
                      <td>
                        {Array.isArray(department)
                          ? department.join(", ")
                          : department}
                      </td>
                    </tr>
                    <tr>
                      <th style={{ color: "#4682B4" }}>Location</th>
                      <td>{selectedTicket?.Location || "-"}</td>
                    </tr>
                    <tr>
                      <th style={{ color: "#4682B4" }}>Ticket Type</th>
                      <td>{selectedTicket.Ticket_type}</td>
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
                      <th style={{ color: "#4682B4" }}>Description</th>
                      <td>{selectedTicket.Description}</td>
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
                      <th style={{ color: "#4682B4" }}>Priority</th>
                      <td>
                        <select
                          value={selectedPriority}
                          onChange={(e) => setSelectedPriority(e.target.value)}
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
                          {showSuggestions && filteredEngineers.length > 0 && (
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
                                    borderBottom: "1px solid #eee",
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
              );
            })()
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
          <Button className="btn btn-success" onClick={assignEngineer}>
            Assign Ticket
          </Button>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showEdit} onHide={handleEditClose}>
        <Modal.Header
          closeButton
          style={{ background: "#4682B4", color: "#fff" }}
        >
          <Modal.Title>Ticket Details</Modal.Title>
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

              if (!showFlag) {
                return <div>Ticket not visible due to flag status.</div>;
              }

              const isNew =
                flag === null || flag === "null" || flag === 0 || flag === "0";

              const userName = isNew
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
                <table className="table table-bordered">
                  <tbody>
                    <tr>
                      <th style={{ color: "#4682B4" }}>Ticket Number</th>
                      <td>{selectedTicket.TicketNoRandom}</td>
                    </tr>
                    <tr>
                      <th style={{ color: "#4682B4" }}>User Name</th>
                      <td>{userName}</td>
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
                      <th style={{ color: "#4682B4" }}>Designation</th>
                      <td>{designation}</td>
                    </tr>
                    <tr>
                      <th style={{ color: "#4682B4" }}>Department</th>
                      <td>
                        {Array.isArray(department)
                          ? department.join(", ")
                          : department}
                      </td>
                    </tr>
                  </tbody>
                </table>
              );
            })()
          ) : (
            <div>No ticket selected</div>
          )}
          {selectedTicket ? (
            <UserEditTicket
              selectedTicket={selectedTicket}
              handleClose={handleEditClose} 
              getAllData={getAllData} 
            />
          ) : (
            <div>No ticket selected</div>
          )}
        </Modal.Body>
      </Modal>
    </div>
    </>
  );
};

export default OperatorRaisedTicket;
