import React, { useState, useEffect } from "react";
import { raisedTicketFunction } from "../../api/RaisedTicket";
import { engineerListFunction } from "../../api/EngineerList";
import { changeStatusToAssignedFunction } from "../../api/ChangeStatusToAssigned";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Pagination } from "react-bootstrap";
import $ from "jquery";
import "datatables.net-dt"; 
import "datatables.net-dt/css/dataTables.dataTables.min.css";


const AdminRaisedTicket = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const [raisedData, setRaisedData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [engineer, setEngineer] = useState([]);
  const [selectedEngineers, setSelectedEngineers] = useState({});
  const [show, setShow] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [tickets, setTickets] = useState([]);
  const showLoading = () => setLoading(true);
  const hideLoading = () => setLoading(false);

  useEffect(() => {
    const interval = setInterval(() => {
      window.location.reload(); // Refresh the page
    }, 1800000); // 30 minutes = 1800000 milliseconds

    return () => clearInterval(interval); // Clear interval on unmount
  }, []);

  useEffect(() => {
    if (raisedData.length > 0) {
      // Destroy if already exists
      if ($.fn.DataTable.isDataTable("#adminRaisedTicketTable")) {
        $("#adminRaisedTicketTable").DataTable().destroy();
      }

      // Initialize
      setTimeout(() => {
        $("#adminRaisedTicketTable").DataTable({
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
  }, [raisedData]);

  const handleClose = () => {
    setShow(false);
    setSelectedTicket(null);
  };

  const handleShow = (ticket) => {
    setSelectedTicket(ticket);
    setShow(true);
  };

  const getAllData = async () => {
    try {
      showLoading();
      const data = await raisedTicketFunction();
      hideLoading();
      if (!data?.result) {
        setErrorMessage("No ticket data found.");
      } else {
        setRaisedData(data.result);
      }
    } catch (err) {
      hideLoading();
      setErrorMessage("API error occurred: " + err.message);
    }
  };

  useEffect(() => {
    getAllData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        showLoading();
        const data = await engineerListFunction();
        hideLoading();
        if (!data) {
          setErrorMessage("No Engineer data found.");
        } else {
          setEngineer(data);
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

      {!loading && raisedData.length > 0 ? (
        <>
              <h4 className="text-center">Raised Tickets</h4>
          <div className="dashboard-card">
            <div>
            </div>
            <div
              className="table-responsive mt-0 table-bord"
              style={{ minHeight: "570px" }}
            >
              <table
                id="adminRaisedTicketTable"
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
                      "User Name",
                      "Designation",
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
                  {raisedData.map((result, index) => {
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

                    const userName = isNew ? result.UserName : result.name;
                    const TicketNoRandom = result.TicketNoRandom;
                    // const Created_date = new Date(
                    //   result.Created_date
                    // ).toLocaleString();

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
                          {Array.isArray(userName)
                            ? userName.join(", ")
                            : userName}
                        </td>
                        <td style={{ padding: "14px 12px" }}>
                          {Array.isArray(designation)
                            ? designation.join(", ")
                            : designation}
                        </td>
                        <td style={{ padding: "14px 12px" }}>{Created_date}</td>
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

            <div className="d-flex justify-content-center mt-4 paginabox">
              {/* <Pagination>
              <Pagination.First
                onClick={goToFirstPage}
                disabled={currentPage === 1}
              />
              <Pagination.Prev
                onClick={goToPrevPage}
                disabled={currentPage === 1}
              />
              {[...Array(totalPages)].map((_, idx) => (
                <Pagination.Item
                  key={idx + 1}
                  active={idx + 1 === currentPage}
                  onClick={() => paginate(idx + 1)}
                >
                  {idx + 1}
                </Pagination.Item>
              ))}
              <Pagination.Next
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
              />
              <Pagination.Last
                onClick={goToLastPage}
                disabled={currentPage === totalPages}
              />
            </Pagination> */}
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

      {/* Fullscreen Modal for Ticket Details */}
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
                        <th style={{color: "#4682B4"}}>Ticket Number</th>
                        <td>{selectedTicket.TicketNoRandom}</td>
                      </tr>
                      <tr>
                        <th style={{ width: "30%" , color: "#4682B4"}}>Name</th>
                        <td>{name}</td>
                      </tr>
                      <tr>
                        <th style={{color: "#4682B4"}}>Designation</th>
                        <td>{designation}</td>
                      </tr>
                      <tr>
                        <th style={{color: "#4682B4"}}>Department</th>
                        <td>{department}</td>
                      </tr>
                      <tr>
                        <th style={{color: "#4682B4"}}>Email</th>
                        <td>{selectedTicket.Email}</td>
                      </tr>
                      <tr>
                        <th style={{color: "#4682B4"}}>Issue</th>
                        <td>{selectedTicket.Ticket_type || "N/A"}</td>
                      </tr>
                      <tr>
                        <th style={{color: "#4682B4"}}>Category</th>
                        <td>{selectedTicket.Category || "N/A"}</td>
                      </tr>
                      <tr>
                        <th style={{color: "#4682B4"}}>Subcategory</th>
                        <td>{selectedTicket.Sub_Category || "N/A"}</td>
                      </tr>
                      <tr>
                        <th style={{color: "#4682B4"}}>Created Date</th>
                        <td>
                         {Created_date}
                        </td>
                      </tr>
                      <tr>
                        <th style={{color: "#4682B4"}}>Description</th>
                        <td>{selectedTicket.Description}</td>
                      </tr>
                      <tr>
                        <th style={{color: "#4682B4"}}>File</th>
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

export default AdminRaisedTicket;
