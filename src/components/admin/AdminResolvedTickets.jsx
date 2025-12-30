import React, { useState, useEffect, useCallback } from "react";
import { resolvedTicketFunction } from "../../api/ResolvedTicket";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { uploadFileFunction } from "../../api/UploadFile";
import { getCommentFunction } from "../../api/GetComments";

import $ from "jquery";
import "datatables.net-dt";
import "datatables.net-dt/css/dataTables.dataTables.min.css";

const AdminResolvedTickets = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [resolvedData, setResolvedData] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const [comments, setComments] = useState([]);
  const [selectedPhotos, setSelectedPhotos] = useState([]);

  const showLoading = () => setLoading(true);
  const hideLoading = () => setLoading(false);

  const safeArray = (v) => (Array.isArray(v) ? v : v ? [v] : []);

  const formatDateTime = (value) => {
    if (!value) return "N/A";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "N/A";

    return d
      .toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      .replaceAll("/", "/")
      .replace(",", "");
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files || []);
    setSelectedPhotos(files);
  };

  const fetchResolvedTickets = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage("");
      setSuccessMessage("");

      const data = await resolvedTicketFunction();
      if (!data?.result || !Array.isArray(data.result)) {
        setErrorMessage("No ticket data found.");
        setResolvedData([]);
      } else {
        setResolvedData(data.result);
      }
    } catch (err) {
      setErrorMessage("API error occurred: " + (err?.message || "Unknown error"));
      console.error("Error fetching resolved tickets:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // initial fetch + auto refresh every 30 min
  useEffect(() => {
    fetchResolvedTickets();
    const interval = setInterval(fetchResolvedTickets, 1800000);
    return () => clearInterval(interval);
  }, [fetchResolvedTickets]);

  // DataTables init + cleanup
  useEffect(() => {
    const tableId = "#operatorResolvedTicketTable";

    if ($.fn.DataTable.isDataTable(tableId)) {
      $(tableId).DataTable().destroy();
    }

    if (resolvedData.length > 0) {
      setTimeout(() => {
        $(tableId).DataTable({
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
      if ($.fn.DataTable.isDataTable(tableId)) {
        $(tableId).DataTable().destroy();
      }
    };
  }, [resolvedData]);

  const fetchComments = useCallback(async (token) => {
    if (!token) {
      setComments([]);
      return;
    }

    try {
      setErrorMessage("");
      const response = await getCommentFunction({ Token: token });

      if (response?.result && Array.isArray(response.result)) {
        const formatted = response.result.map((item) => ({
          comment: item?.Comments ?? "",
          timestamp: new Date(item?.CreatedDate).toLocaleString(),
          name: item?.Name ?? "N/A",
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
  }, []);

  useEffect(() => {
    if (selectedTicket && showModal) {
      fetchComments(selectedTicket.Token);
    }
  }, [selectedTicket, showModal, fetchComments]);

  const handleShowModal = (ticket) => {
    setSelectedTicket(ticket);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTicket(null);
    setComments([]);
    setSelectedPhotos([]);
    setErrorMessage("");
    setSuccessMessage("");
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
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const formData = new FormData();
      formData.append("Token", selectedTicket.Token);
      selectedPhotos.forEach((file) => formData.append("files", file));

      const uploadResponse = await uploadFileFunction(formData);

      if (uploadResponse?.result) {
        setSuccessMessage("Photos uploaded successfully!");
        setSelectedPhotos([]);
        await fetchResolvedTickets();
      } else {
        setErrorMessage(uploadResponse?.message || "An unexpected error occurred.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setErrorMessage(error?.message || "Failed to upload photo.");
    } finally {
      hideLoading();
    }
  };

  return (
    <div className="container-container mt-0 px-0">
      {loading && <div className="alert alert-info">Loading...</div>}
      {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
      {successMessage && <div className="alert alert-success">{successMessage}</div>}

      {!loading && resolvedData.length > 0 ? (
        <>
          <h4 className="text-center">Resolved Tickets</h4>

          <div className="dashboard-card">
            <div className="table-responsive mt-0 table-bord" style={{ maxHeight: "600px" }}>
              <table
                id="operatorResolvedTicketTable"
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
                      "Resolved Date",
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
                  {resolvedData.map((result, index) => {
                    const flag = String(result?.Flag);
                    const showFlag = flag === "null" || flag === "0" || flag === "1";
                    if (!showFlag) return null;

                    const isNew = flag === "null" || flag === "0";

                    const srNo = index + 1;
                    const ticketNoRandom = result?.TicketNoRandom ?? "N/A";

                    const createdDate = formatDateTime(result?.Created_date);
                    const resolvedDate = formatDateTime(result?.ResolvedDate);

                    const userName = isNew ? result?.UserName : result?.name;
                    const designation = isNew ? result?.Designation : result?.designation;

                    const engineerNames = safeArray(result?.EngineerNames ?? result?.EngineerName);

                    return (
                      <tr
                        key={result?.Token ?? index}
                        style={{
                          margin: "10px",
                          border: "0px solid #e0e0e0",
                          boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                        }}
                      >
                        <td style={{ padding: "14px 12px" }}>{srNo}</td>
                        <td style={{ padding: "14px 12px" }}>{ticketNoRandom}</td>
                        <td style={{ padding: "14px 12px" }}>{result?.Levels ?? "N/A"}</td>
                        <td style={{ padding: "14px 12px" }}>
                          {Array.isArray(userName) ? userName.join(", ") : userName ?? "N/A"}
                        </td>
                        <td style={{ padding: "14px 12px" }}>
                          {Array.isArray(designation)
                            ? designation.join(", ")
                            : designation ?? "N/A"}
                        </td>
                        <td style={{ padding: "14px 12px" }}>{result?.Category ?? "N/A"}</td>
                        <td style={{ padding: "14px 12px" }}>{result?.Sub_Category ?? "N/A"}</td>
                        <td style={{ padding: "14px 12px" }}>{createdDate}</td>
                        <td style={{ padding: "14px 12px" }}>{resolvedDate}</td>
                        <td style={{ padding: "14px 12px" }}>
                          {engineerNames.length > 0 ? (
                            engineerNames.map((n, i) => <p key={i}>{n}</p>)
                          ) : (
                            <span className="text-muted">N/A</span>
                          )}
                        </td>
                        <td style={{ padding: "14px 12px" }}>
                          <FontAwesomeIcon
                            className="text-orange ms-2"
                            onClick={() => handleShowModal(result)}
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
            <p className="lead text-muted">You have no tickets to display.</p>
          </div>
        )
      )}

      <Modal show={showModal} onHide={handleCloseModal} centered size="lg">
        <Modal.Header closeButton style={{ background: "#4682B4", color: "#fff" }}>
          <Modal.Title>Ticket Details</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {selectedTicket ? (
            (() => {
              const flag = String(selectedTicket?.Flag);
              const isNew = flag === "null" || flag === "0";

              const userName = isNew ? selectedTicket?.UserName : selectedTicket?.name;
              const designation = isNew ? selectedTicket?.Designation : selectedTicket?.designation;
              const department = isNew ? selectedTicket?.Department : selectedTicket?.department;
              const mobile = isNew ? selectedTicket?.Mobile_No : selectedTicket?.mobile_no;

              const engineerNames = safeArray(
                selectedTicket?.EngineerNames ?? selectedTicket?.EngineerName
              );

              const createdDate = formatDateTime(selectedTicket?.Created_date);
              const resolvedDate = formatDateTime(selectedTicket?.ResolvedDate);

              return (
                <div>
                  <div className="table-responsive">
                    <table className="table table-bordered">
                      <tbody>
                        <tr>
                          <th style={{ color: "#4682B4" }}>Ticket Number</th>
                          <td>{selectedTicket?.TicketNoRandom ?? "N/A"}</td>
                        </tr>
                        <tr>
                          <th style={{ width: "30%", color: "#4682B4" }}>Name</th>
                          <td>{userName ?? "N/A"}</td>
                        </tr>
                        <tr>
                          <th style={{ color: "#4682B4" }}>Designation</th>
                          <td>{designation ?? "N/A"}</td>
                        </tr>
                        <tr>
                          <th style={{ color: "#4682B4" }}>Department</th>
                          <td>{department ?? "N/A"}</td>
                        </tr>
                        <tr>
                          <th style={{ color: "#4682B4" }}>Email</th>
                          <td>{selectedTicket?.Email ?? "N/A"}</td>
                        </tr>
                        <tr>
                          <th style={{ color: "#4682B4" }}>Mobile Number</th>
                          <td>{mobile ?? "N/A"}</td>
                        </tr>
                        <tr>
                          <th style={{ color: "#4682B4" }}>Location</th>
                          <td>{selectedTicket?.Loction ?? "N/A"}</td>
                        </tr>
                        <tr>
                          <th style={{ color: "#4682B4" }}>Issue</th>
                          <td>{selectedTicket?.Ticket_type ?? "N/A"}</td>
                        </tr>
                        <tr>
                          <th style={{ color: "#4682B4" }}>Category</th>
                          <td>{selectedTicket?.Category ?? "N/A"}</td>
                        </tr>
                        <tr>
                          <th style={{ color: "#4682B4" }}>Subcategory</th>
                          <td>{selectedTicket?.Sub_Category ?? "N/A"}</td>
                        </tr>
                        <tr>
                          <th style={{ color: "#4682B4" }}>Comment</th>
                          <td>{selectedTicket?.Comment ?? "N/A"}</td>
                        </tr>
                        <tr>
                          <th style={{ color: "#4682B4" }}>Created Date</th>
                          <td>{createdDate}</td>
                        </tr>
                        <tr>
                          <th style={{ color: "#4682B4" }}>Resolved Date</th>
                          <td>{resolvedDate}</td>
                        </tr>
                        <tr>
                          <th style={{ color: "#4682B4" }}>Description</th>
                          <td>{selectedTicket?.Description ?? "N/A"}</td>
                        </tr>
                        <tr>
                          <th style={{ color: "#4682B4" }}>Engineer Name</th>
                          <td style={{ padding: "14px 12px" }}>
                            {engineerNames.length > 0 ? (
                              engineerNames.map((n, i) => <p key={i}>{n}</p>)
                            ) : (
                              <span className="text-muted">N/A</span>
                            )}
                          </td>
                        </tr>

                        <tr>
                          <th style={{ color: "#4682B4" }}>Documents</th>
                          <td>
                            {Array.isArray(selectedTicket?.ImageUrl) &&
                            selectedTicket.ImageUrl.length > 0 ? (
                              selectedTicket.ImageUrl.map((fileUrl, index) => {
                                const ext = String(fileUrl).split(".").pop().toLowerCase();

                                if (["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext)) {
                                  return (
                                    <div key={index} style={{ marginBottom: "10px" }}>
                                      <img
                                        src={fileUrl}
                                        alt={`Uploaded-${index}`}
                                        style={{ maxWidth: "100%", height: "auto" }}
                                      />
                                    </div>
                                  );
                                }

                                if (ext === "pdf") {
                                  return (
                                    <div key={index} style={{ marginBottom: "10px" }}>
                                      <iframe
                                        src={fileUrl}
                                        title={`PDF-${index}`}
                                        width="100%"
                                        height="500px"
                                      />
                                    </div>
                                  );
                                }

                                return (
                                  <div key={index} style={{ marginBottom: "10px" }}>
                                    <a href={fileUrl} target="_blank" rel="noopener noreferrer">
                                      Download Document {index + 1}
                                    </a>
                                  </div>
                                );
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
                  </div>

                  <h5 className="mt-4">Previous Comments</h5>
                  {comments.length > 0 ? (
                    <ul className="list-group mb-3">
                      {comments.map((item, index) => (
                        <li key={index} className="list-group-item">
                          <div>
                            <strong>Comment:</strong> {item.comment || "N/A"}
                          </div>
                          <div className="text-muted" style={{ fontSize: "0.85rem" }}>
                            From: {item.name || "N/A"} on {item.timestamp || "N/A"}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="alert alert-light border">No previous comments.</p>
                  )}
                </div>
              );
            })()
          ) : (
            <p>No ticket selected</p>
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
                disabled={loading}
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
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminResolvedTickets;
