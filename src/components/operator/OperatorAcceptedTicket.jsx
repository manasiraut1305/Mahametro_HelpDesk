import React, { useState, useEffect } from "react";
import { assignedTicketFunction } from "../../api/AssignedTicket";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";



const OperatorAcceptedTicket = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const [assignedData, setAssignedData] = useState([]);
  const [loading, setLoading] = useState(false);
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
  navigate("/components/operator/ViewTicketDetails", { state: { ticket } });
};


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
    <div className="container-fluid mt-4">
      <h4 className="mb-3">Assigned Tickets</h4>

      {loading && <div className="alert alert-info">Loading...</div>}
      {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

      {!loading && assignedData.length > 0 && (
        <div
          className="table-responsive"
          style={{ maxHeight: "450px", overflowY: "auto" }}
        >
          <table className="table table-bordered table-hover">
            <thead className="table-light">
              <tr>
                <th
                  style={{
                    backgroundColor: "rgb(242, 140, 40)",
                    color: "white",
                  }}
                >
                  Sr No
                </th>
                <th
                  style={{
                    backgroundColor: "rgb(242, 140, 40)",
                    color: "white",
                  }}
                >
                  User Name
                </th>
                <th
                  style={{
                    backgroundColor: "rgb(242, 140, 40)",
                    color: "white",
                  }}
                >
                  Designation
                </th>
                <th
                  style={{
                    backgroundColor: "rgb(242, 140, 40)",
                    color: "white",
                  }}
                >
                  View
                </th>
              </tr>
            </thead>
            <tbody>
              {assignedData.map((result, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{result.UserName}</td>
                  <td>{result.Designation}</td>
                  <td>
                    <FontAwesomeIcon
                      className="text-black ms-2"
                      onClick={() => {
                        handleShow(result);
                      }}
                      icon={faEye}
                      title="Edit"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Modal for Ticket Details */}
          <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
              <Modal.Title>Ticket Details</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {selectedTicket ? (
                <table className="table table-bordered">
                  <tbody>
                    <tr>
                      <th>User Name</th>
                      <td>{selectedTicket.UserName}</td>
                    </tr>
                    <tr>
                      <th>Email</th>
                      <td>{selectedTicket.Email}</td>
                    </tr>
                    <tr>
                      <th>Moblie</th>
                      <td>{selectedTicket.Mobile_No}</td>
                    </tr>
                    <tr>
                      <th>Department</th>
                      <td>
                        {Array.isArray(selectedTicket.Department)
                          ? selectedTicket.Department.join(", ")
                          : selectedTicket.Department}
                      </td>
                    </tr>
                    <tr>
                      <th>Generation Date</th>
                      <td>
                        {new Date(selectedTicket.Created_date).toLocaleString()}
                      </td>
                    </tr>
                    <tr>
                      <th>Ticket Type</th>
                      <td>{selectedTicket.Ticket_type}</td>
                    </tr>
                    <tr>
                      <th>Description</th>
                      <td>{selectedTicket.Description}</td>
                    </tr>
                    <tr>
                      <th>Files</th>
                      <td>{selectedTicket.Files}</td>
                    </tr>
                    <tr>
                      <th>Engineer Name</th>
                      <td>{selectedTicket.EngineerName}</td>
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
      )}
    </div>
  );
};

export default OperatorAcceptedTicket;
