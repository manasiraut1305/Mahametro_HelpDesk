import React, { useState, useRef, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { faEdit } from "@fortawesome/free-solid-svg-icons";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import $ from "jquery";
import "datatables.net-dt";
import "datatables.net-dt/css/dataTables.dataTables.min.css";

const UserRaisedTicket = ({ getAllData }) => {
  
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const suggestionRef = useRef(null);

  // Auto-refresh
  useEffect(() => {
    const interval = setInterval(() => {
      window.location.reload(); // Refresh page every 30 mins
    }, 1800000);
    return () => clearInterval(interval);
  }, []);

  const pendingTickets = getAllData.filter(
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

  const handleClose = () => {
    setShow(false);
    setSelectedTicket(null);
  };

  useEffect(() => {
  }, [sortedData]);

  return (
    <div className="container-fluid mt-0 px-0">
      {loading && <div className="alert alert-info">Loading...</div>}
      {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

      {!loading && sortedData.length > 0 ? (
        <>
          <div className="table-responsive mt-0 table-bord">
            <h4>Raised Tickets</h4>
            <table
              id="userRaisedTicketTable"
              className="align-middle table-struc display"
              style={{ width: "100%" }}
            >
              <thead>
                <tr style={{ backgroundColor: "#fff" }}>
                  {[
                    "Sr No",
                    "Ticket Number",
                    "Description",
                    "Created Date",
                    "View",
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
                    <td style={{ padding: "14px 12px" }}>{index + 1}</td>
                    <td style={{ padding: "14px 12px" }}>
                      {result.TicketNoRandom}
                    </td>
                    <td style={{ padding: "14px 12px" }}>
                      {result.Description}
                    </td>
                    <td style={{ padding: "14px 12px" }}>
                      {new Date(result.Created_date).toLocaleString()}
                    </td>
                    <td style={{ padding: "14px 12px" }}>
                      <FontAwesomeIcon
                        icon={faEye}
                        onClick={() => handleShow(result)}
                        title="View"
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
                  <th>Ticket Number</th>
                  <td>{selectedTicket.TicketNoRandom}</td>
                </tr>
                <tr>
                  <th>Ticket Type</th>
                  <td>{selectedTicket.Ticket_type}</td>
                </tr>
                <tr>
                  <th>Category</th>
                  <td>{selectedTicket.Category}</td>
                </tr>
                <tr>
                  <th>Sub Category</th>
                  <td>{selectedTicket.Sub_Category}</td>
                </tr>
                <tr>
                  <th>Description</th>
                  <td>{selectedTicket.Description}</td>
                </tr>
                <tr>
                  <th>File</th>
                  <td>
                    {selectedTicket.ImageUrl &&
                    selectedTicket.ImageUrl.length > 0
                      ? selectedTicket.ImageUrl.map((fileUrl, index) => {
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
                      : "No document available"}
                  </td>
                </tr>
              </tbody>
            </table>
          ) : (
            <div>No ticket selected</div>
          )}
        </Modal.Body>

        <Modal.Footer>
          {/* <Button variant="secondary" onClick={handleSubmit}>
            Submit
          </Button> */}
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default UserRaisedTicket;
