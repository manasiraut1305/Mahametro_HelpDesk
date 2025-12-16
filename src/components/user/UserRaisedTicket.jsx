import React, { useState, useRef, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { faEye, faPen } from "@fortawesome/free-solid-svg-icons";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import $ from "jquery";
import "datatables.net-dt";
import "datatables.net-dt/css/dataTables.dataTables.min.css";
import UserEditTicket from "./UserEditTicket";
import { useLocation } from "react-router-dom";

const UserRaisedTicket = () => {
  
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const suggestionRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTicket, setEditedTicket] = useState({ ...selectedTicket });
  const location = useLocation();
  const { tickets } = location.state || {};

  useEffect(()=>{
  },[tickets])
  // Auto-refresh
  useEffect(() => {
    const interval = setInterval(() => {
      window.location.reload(); // Refresh page every 30 mins
    }, 1800000);
    return () => clearInterval(interval);
  }, []);

  const pendingTickets = (tickets || []).filter(
    (ticket) => ticket.Status === "Pending"
  );

  const sortedData = [...pendingTickets].sort(
    (a, b) => new Date(b.Created_date) - new Date(a.Created_date)
  );

  useEffect(() => {
    if (sortedData.length > 0) {
      if ($.fn.DataTable.isDataTable("#userRaisedTicketTable")) {
        $("#userRaisedTicketTable").DataTable().destroy();
      }

      setTimeout(() => {
        $("#userRaisedTicketTable").DataTable({
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
  }, [sortedData]);

  const handleShow = (ticket) => {
    setSelectedTicket(ticket);
    setShow(true);
  };

  const handleEdit = (ticket) => {
    setSelectedTicket(ticket);
    setShowEdit(true);
  };

  const handleClose = () => {
    setShow(false);
    setSelectedTicket(null);
  };
  const handleEditClose = () => {
    setShowEdit(false);
    setSelectedTicket(null);
  };

  useEffect(() => {
  }, [sortedData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedTicket((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const urls = files.map((file) => URL.createObjectURL(file));
    setEditedTicket((prev) => ({
      ...prev,
      ImageUrl: urls,
    }));
  };

  const handleSave = () => {
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTicket({ ...selectedTicket });
    setIsEditing(false);
  };

  return (
    <div className="container-fluid mt-0 px-0">
      {loading && <div className="alert alert-info">Loading...</div>}
      {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

      {!loading && sortedData.length > 0 ? (
        <>
            <h4 className="text-center">Raised Tickets</h4>
          <div className="table-responsive mt-0 table-bord">
            <table
              id="userRaisedTicketTable"
              className="align-middle table-struc display"
              style={{ width: "100%" }}
            >
              <thead>
                <tr style={{ backgroundColor: "#fff", textAlign:"center" }}>
                  {[
                    "Sr No",
                    "Ticket Number",
                    "Description",
                    "Created Date",
                    "View",
                    "Edit",
                  ].map((header, idx) => (
                    <th key={idx} className="tablehead">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedData.map((result, index) => (
                  <tr
                    key={index}
                    style={{ boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)" }}
                  >
                    <td style={{textAlign:"center"}}>{index + 1}</td>
                    <td style={{textAlign:"center" }}>
                      {result.TicketNoRandom}
                    </td>
                    <td style={{textAlign:"center"}}>
                      {result.Description}
                    </td>
                    <td style={{ textAlign:"center"}}>
                      {new Date(result.Created_date).toLocaleString()}
                    </td>
                    <td style={{ textAlign:"center" }}>
                      <FontAwesomeIcon
                        icon={faEye}
                        onClick={() => handleShow(result)}
                        title="View"
                        style={{ cursor: "pointer", color: "#4682B4" }}
                      />
                    </td>
                    <td style={{textAlign:"center" }}>
                      <FontAwesomeIcon
                        icon={faPen}
                        onClick={() => handleEdit(result)}
                        title="Edit"
                        style={{ cursor: "pointer", color: "#4682B4" }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        !loading && (
          <div className="text-center py-5">
            <p className="lead text-muted">No tickets to display.</p>
          </div>
        )
      )}

      {/* Ticket Modal */}
      <Modal show={show} onHide={handleClose}>
        <Modal.Header
          closeButton
          style={{ background: "#4682B4", color: "#fff" }}
        >
          <Modal.Title>Ticket Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTicket ? (
            <table className="table table-bordered">
              <tbody>
                <tr>
                  <th style={{ color: "#4682B4" }}>Ticket Type</th>
                  <td>
                    {isEditing ? (
                      <input
                        type="text"
                        name="Ticket_type"
                        value={editedTicket.Ticket_type}
                        onChange={handleChange}
                        className="form-control"
                      />
                    ) : (
                      selectedTicket.Ticket_type
                    )}
                  </td>
                </tr>
                <tr>
                  <th style={{ color: "#4682B4" }}>Category</th>
                  <td>
                    {isEditing ? (
                      <input
                        type="text"
                        name="Category"
                        value={editedTicket.Category}
                        onChange={handleChange}
                        className="form-control"
                      />
                    ) : (
                      selectedTicket.Category
                    )}
                  </td>
                </tr>
                <tr>
                  <th style={{ color: "#4682B4" }}>Sub Category</th>
                  <td>
                    {isEditing ? (
                      <input
                        type="text"
                        name="Sub_Category"
                        value={editedTicket.Sub_Category}
                        onChange={handleChange}
                        className="form-control"
                      />
                    ) : (
                      selectedTicket.Sub_Category
                    )}
                  </td>
                </tr>
                <tr>
                  <th style={{ color: "#4682B4" }}>Description</th>
                  <td>
                    {isEditing ? (
                      <textarea
                        name="Description"
                        value={editedTicket.Description}
                        onChange={handleChange}
                        className="form-control"
                      />
                    ) : (
                      selectedTicket.Description
                    )}
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
              </tbody>
            </table>
          ) : (
            <div>No ticket selected</div>
          )}
        </Modal.Body>

        <Modal.Footer>
          <div className="mt-3">
            <Button variant="secondary" onClick={handleClose}>
              Close
            </Button>
          </div>
        </Modal.Footer>
      </Modal>

          {/* Ticket Modal */}
      <Modal show={showEdit} onHide={handleEditClose}>
        <Modal.Header
          closeButton
          style={{ background: "#4682B4", color: "#fff" }}
        >
          <Modal.Title>Ticket Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          
          <UserEditTicket
          selectedTicket={selectedTicket}
          handleClose={handleClose}
          />
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default UserRaisedTicket;