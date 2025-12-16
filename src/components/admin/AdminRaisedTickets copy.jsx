import React, { useState, useEffect } from "react";
import { raisedTicketFunction } from "../../api/RaisedTicket";
import { engineerListFunction } from "../../api/EngineerList";
import { changeStatusToAssignedFunction } from "../../api/ChangeStatusToAssigned";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Pagination } from "react-bootstrap";

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

  const handleClose = () => {
    setShow(false);
    setSelectedTicket(null);
  };

  const handleShow = (ticket) => {
    setSelectedTicket(ticket);
    setShow(true);
  };

  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 5;
  const totalPages = Math.ceil(raisedData.length / itemsPerPage);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = raisedData.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const goToNextPage = () =>
    currentPage < totalPages && setCurrentPage((prev) => prev + 1);
  const goToPrevPage = () =>
    currentPage > 1 && setCurrentPage((prev) => prev - 1);
  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);

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
          <div className="table-responsive mt-0" style={{ maxHeight: "400px" }}>
            <table className="align-middle" style={{ width: "100%" }}>
              <thead>
                <tr
                  style={{
                    backgroundColor: "#fff",
                    borderTop: "2px solid orange",
                  }}
                >
                  {["Sr No", "User Name", "Designation","Created Date" , "View"].map(
                    (header, idx) => (
                      <th
                        key={idx}
                        style={{
                          color: "black",
                          fontWeight: 600,
                          fontSize: "0.95rem",
                          borderBottom: "0.5px solid black",
                          backgroundColor: "#f0a150",
                          paddingTop: "15px",
                          paddingBottom: "15px",
                        }}
                      >
                        {header}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {currentItems.map((result, index) => {
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
                  const srNo = indexOfFirstItem + index + 1;
                 
                  const userName = isNew ? result.UserName : result.name;
                  const Created_date = new Date(
                    result.Created_date
                  ).toLocaleString();
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
                          style={{ cursor: "pointer", color: "#ff914d" }}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="d-flex justify-content-center mt-4">
            <Pagination>
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
            </Pagination>
          </div>
        </>
      ) : (
        !loading && (
          <div className="text-center py-5">
            <p className="lead text-muted">You have no tickets to display.</p>
            <p className="text-muted">
              Click "+ Generate Ticket" to create one.
            </p>
          </div>
        )
      )}

      {/* Fullscreen Modal for Ticket Details */}
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton style={{ background: "#f0a150" }}>
          <Modal.Title>Ticket Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTicket ? (
            <table
              className="table"
              style={{
                width: "100%",
                borderCollapse: "separate",
                borderSpacing: "0 10px",
              }}
            >
              <tbody>
                <tr style={{ borderBottom: "1px solid #ddd" }}>
                  <th style={{ color: "#f0a150" }}>User Name</th>
                  <td>{selectedTicket.UserName}</td>
                </tr>
                <tr style={{ borderBottom: "1px solid #ddd" }}>
                  <th style={{ color: "#f0a150" }}>Email</th>
                  <td>{selectedTicket.Email}</td>
                </tr>
                <tr style={{ borderBottom: "1px solid #ddd" }}>
                  <th style={{ color: "#f0a150" }}>Mobile</th>
                  <td>{selectedTicket.Mobile_No}</td>
                </tr>
                <tr style={{ borderBottom: "1px solid #ddd" }}>
                  <th style={{ color: "#f0a150" }}>Department</th>
                  <td>
                    {Array.isArray(selectedTicket.Department)
                      ? selectedTicket.Department.join(", ")
                      : selectedTicket.Department}
                  </td>
                </tr>
                <tr style={{ borderBottom: "1px solid #ddd" }}>
                  <th style={{ color: "#f0a150" }}>Generation Date</th>
                  <td>
                    {new Date(selectedTicket.Created_date).toLocaleString()}
                  </td>
                </tr>
                <tr style={{ borderBottom: "1px solid #ddd" }}>
                  <th style={{ color: "#f0a150" }}>Ticket Type</th>
                  <td>{selectedTicket.Ticket_type}</td>
                </tr>
                <tr>
                  <th style={{ color: "#f0a150" }}>Description</th>
                  <td>{selectedTicket.Description}</td>
                </tr>
                <tr style={{ borderBottom: "1px solid #ddd" }}>
                  <th style={{ color: "#f0a150" }}>ImageUrl</th>
                  <td>
                    {selectedTicket.ImageUrl ? (
                      <>
                        <a
                          href={selectedTicket.ImageUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <img
                            src={selectedTicket.ImageUrl}
                            alt="Ticket"
                            style={{
                              maxWidth: "30%",
                              height: "30%",
                              marginTop: "10px",
                            }}
                          />
                        </a>
                      </>
                    ) : (
                      "No image provided"
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
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminRaisedTicket;
