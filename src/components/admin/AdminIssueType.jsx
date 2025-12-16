import React, { useState, useEffect } from "react";
import { Button, Modal, Form, Alert } from "react-bootstrap";
import { AddIssueType } from "../../api/AddIssueType";
import { issuesListFunction } from "../../api/IssuetypeList";
import { DeleteIssueType } from "../../api/DeleteIssueType";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMinusCircle } from "@fortawesome/free-solid-svg-icons";

const AdminIssueType = () => {
  const [issueList, setIssueList] = useState([]);
  const [newIssue, setNewIssue] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showAddIssueModal, setShowAddIssueModal] = useState(false);

  
  const [showDeleteIssueModal, setShowDeleteIssueModal] = useState(false);
  const [issueTypeIdToDelete, setIssueTypeIdToDelete] = useState(null);
  const [issueTypeNameToDelete, setIssueTypeNameToDelete] = useState("");

  const handleShowDeleteIssueModal = (Id, name) => {
    setIssueTypeIdToDelete(Id);
    setIssueTypeNameToDelete(name);
    setErrorMessage("");
    setSuccessMessage("");
    setShowDeleteIssueModal(true);
  };

  const handleCloseDeleteIssueModal = () => {
    setShowDeleteIssueModal(false);
    setIssueTypeIdToDelete(null);
    setIssueTypeNameToDelete("");
  };

  const getData = async () => {
    try {
      const data = await issuesListFunction();
      if (data?.result && Array.isArray(data.TotalIssue)) {
        setIssueList(data.TotalIssue);
        setErrorMessage("");
      } else {
        setIssueList([]);
        setErrorMessage("No issue list found.");
      }
    } catch (err) {
      setIssueList([]);
      setErrorMessage("API error occurred: " + err.message);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const handleAddIssue = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const data = await AddIssueType({ Issue_Type: newIssue });
      if (!data?.result) {
        setErrorMessage("Failed to create Issue. Please try again.");
      } else {
        setSuccessMessage(`Issue '${newIssue}' added successfully.`);
        setNewIssue("");
        setShowAddIssueModal(false);
        getData();
      }
    } catch (err) {
      setErrorMessage("API error occurred: " + err.message);
      setShowAddIssueModal(false);
    }
  };

 
const handleDeleteIssue = async () => {
  setErrorMessage("");
  setSuccessMessage("");

  try {
    const data = await DeleteIssueType(issueTypeIdToDelete); // <-- pass only id
    if (!data?.result) {
      setErrorMessage("Failed to delete Issue. Please try again.");
    } else {
      setSuccessMessage(`Issue '${issueTypeNameToDelete}' deleted successfully.`);
      handleCloseDeleteIssueModal();
      getData();
    }
  } catch (err) {
    setErrorMessage("API error occurred: " + err.message);
    handleCloseDeleteIssueModal();
  }
};


  return (
    <div className="dashboard-card">
      <h4>Issue List</h4>

      {errorMessage && (
        <Alert variant="danger" className="mt-2">
          {errorMessage}
        </Alert>
      )}
      {successMessage && (
        <Alert variant="success" className="mt-2">
          {successMessage}
        </Alert>
      )}

      <div
        className="table-responsive"
        style={{ maxHeight: "400px", overflowY: "scroll" }}
      >
        <table className="table table-bordered table-striped mt-3">
          <thead
            className="thead-dark"
            style={{
              position: "sticky",
              top: 0,
              zIndex: 1,
              backgroundColor: "#343a40",
              color: "white",
            }}
          >
            <tr>
              <th>Sr</th>
              <th>Issue</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {issueList.length > 0 ? (
              issueList.map((issue, index) => (
                <tr key={issue.Id || index}>
                  <td>{index + 1}</td>
                  <td>{issue.Issue_Type}</td>
                  <td>
                    <FontAwesomeIcon
                      className="ms-2"
                      icon={faMinusCircle}
                      title="Delete Issue Type"
                      onClick={() =>
                        handleShowDeleteIssueModal(issue.Id, issue.Issue_Type)
                      }
                      style={{ cursor: "pointer", color: "#ce2d05ff" }}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center">
                  No issues found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Button
        style={{ color: "white" }}
        onClick={() => setShowAddIssueModal(true)}
      >
        Add More Issue
      </Button>

      {/* Modal for Adding Issue */}
      <Modal
        show={showAddIssueModal}
        onHide={() => setShowAddIssueModal(false)}
      >
        <Modal.Header closeButton>
          <Modal.Title>Add Issue</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
          <Form>
            <Form.Group>
              <Form.Label>Issue</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter Issue"
                value={newIssue}
                onChange={(e) => setNewIssue(e.target.value)}
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowAddIssueModal(false)}
          >
            Cancel
          </Button>
          <Button variant="success" onClick={handleAddIssue}>
            Add
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal for Deleting Issue */}
      <Modal show={showDeleteIssueModal} onHide={handleCloseDeleteIssueModal}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Issue Type</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Are you sure you want to delete the IssueType{" "}
            <b>{issueTypeNameToDelete}</b>?
          </p>
          {errorMessage && (
            <Alert variant="danger" className="mt-2">
              {errorMessage}
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteIssueModal}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteIssue}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminIssueType;
