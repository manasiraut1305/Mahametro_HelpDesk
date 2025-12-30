import React, { useState, useEffect } from "react";
import { assignedTicketFunction } from "../../api/AssignedTicket";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import { Pagination } from "react-bootstrap";

import $ from "jquery";
import "datatables.net-dt"; 
import "datatables.net-dt/css/dataTables.dataTables.min.css";


const AdminAssignedTicket = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const [assignedData, setAssignedData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState([]);
  const [show, setShow] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);

  const showLoading = () => setLoading(true);
  const hideLoading = () => setLoading(false);

  const handleClose = () => {
    setShow(false);
    setSelectedTicket(null);
  };

  const navigate = useNavigate();

  const handleShow = (ticket) => {
    setSelectedTicket(ticket);
    setShow(true);
  };


  useEffect(() => {
    const interval = setInterval(() => {
      window.location.reload(); // Refresh the page
    }, 1800000); // 30 minutes = 1800000 milliseconds

    return () => clearInterval(interval); // Clear interval on unmount
  }, []);

  useEffect(() => {
    if (assignedData.length > 0) {
      // Destroy if already exists
      if ($.fn.DataTable.isDataTable("#adminAssignedTicketTable")) {
        $("#adminAssignedTicketTable").DataTable().destroy();
      }

      // Initialize
      setTimeout(() => {
        $("#adminAssignedTicketTable").DataTable({
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
  }, [assignedData]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        showLoading();
        const data = await assignedTicketFunction();
        hideLoading();
       
        if (!data?.result) {
          setErrorMessage("No ticket data found.");
        } else {
          setAssignedData(data.result);
        }
      } catch (err) {
        hideLoading();
        setErrorMessage("API error occurred: " + err.message);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="container-fluid mt-0 px-0">
      {loading && <div className="alert alert-info">Loading...</div>}
      {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

      {!loading && assignedData.length > 0 ? (
        <>
              <h4 className="text-center">Assigned Tickets</h4>
          <div className="dashboard-card">
            <div>
            </div>
            <div
              className="table-responsive mt-0 table-bord"
              style={{ minHeight: "570px" }}
            >
              <table
                id="adminAssignedTicketTable"
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
                    const userName = isNew ? result.UserName : result.name;
                    // const EngineerName = result.EngineerName;
                    const engineerName = result.EngineerNames;
                    const TicketNoRandom = result.TicketNoRandom;
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
                        <td style={{ padding: "14px 12px" }}>
                          {TicketNoRandom}
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
                          {Created_date}
                        </td>
                        {/* <td style={{ padding: "14px 12px" }}>{EngineerName}</td>
                         */}
                         <td style={{ padding: "14px 12px" }}>
                          {engineerName.map((name, index) => (
                            <p key={index}>{name}</p>
                          ))}
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
          </div>
        </>
      ) : (
        !loading && (
          <div className="text-center py-5">
            <p className="lead text-muted">You have no tickets to display.</p>
          </div>
        )
      )}
      {/* Modal for Ticket Details */}
      <Modal show={show} onHide={handleClose} centered size="lg">
        <Modal.Header closeButton style={{ background: "#4682B4" }}>
          <Modal.Title style={{color:"white"}}>Ticket Details</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {selectedTicket ? (
            (() => {
              const flag = selectedTicket.Flag;
              const isNew =
                flag === null || flag === "null" || flag === 0 || flag === "0";

              const name = isNew
                ? selectedTicket.UserName
                : selectedTicket.name;
              const designation = isNew
                ? selectedTicket.Designation
                : selectedTicket.designation;
              const department = isNew
                ? selectedTicket.Department
                : selectedTicket.department;
              const engineerName = selectedTicket.EngineerNames;

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
                <div className="table-responsive">
                  <table className="table table-bordered">
                    <tbody>
                       <tr>
                        <th style={{ width: "30%" }}>Ticket Number</th>
                        <td>{selectedTicket.TicketNoRandom}</td>
                      </tr>
                      <tr>
                        <th style={{ width: "30%" }}>Name</th>
                        <td>{name}</td>
                      </tr>
                      <tr>
                        <th>Designation</th>
                        <td>{designation}</td>
                      </tr>
                      <tr>
                        <th>Department</th>
                        <td>{department}</td>
                      </tr>
                      <tr>
                        <th>Email</th>
                        <td>{selectedTicket.Email}</td>
                      </tr>
                      <tr>
                        <th>Issue</th>
                        <td>{selectedTicket.Ticket_type || "N/A"}</td>
                      </tr>
                      <tr>
                        <th>Category</th>
                        <td>{selectedTicket.Category || "N/A"}</td>
                      </tr>
                      <tr>
                        <th>Subcategory</th>
                        <td>{selectedTicket.Sub_Category || "N/A"}</td>
                      </tr>
                      <tr>
                        <th>Created Date</th>
                        <td>
                          {Created_date}
                         
                        </td>
                      </tr>
                      <tr>
                        <th>Description</th>
                        <td>{selectedTicket.Description}</td>
                      </tr>
                      <tr>
                        <th>Engineer Name</th>
                      <td style={{ padding: "14px 12px" }}>
                          {engineerName.map((name, index) => (
                            <p key={index}>{name}</p>
                          ))}
                        </td>
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
                            : "No document available"}
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
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminAssignedTicket;
