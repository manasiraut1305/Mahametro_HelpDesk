import React, { useEffect, useState } from "react";
import "../Styles.css";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPen } from "@fortawesome/free-solid-svg-icons";
import { deleteDepartmentFunction } from "../../api/AdminDepartmentDelete";
import { editDepartmentFunction } from "../../api/AdminUpdateDepartment";
import { allDepartmentListFunction } from "../../api/AdminDepartmentList";
import { addDepartmentFunction } from "../../api/AdminAddDepartment";

function AdminDepartmentTable() {
  const [departmentList, setDepartmentList] = useState([]);

  
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);
  const [departmentModalMode, setDepartmentModalMode] = useState("add"); 
  const [currentDepartmentId, setCurrentDepartmentId] = useState(null);
  const [departmentNameInput, setDepartmentNameInput] = useState("");

   
  const [showDeleteDepartmentModal, setShowDeleteDepartmentModal] =
    useState(false);
  const [departmentIdToDelete, setDepartmentIdToDelete] = useState(null);
  const [departmentNameToDelete, setDepartmentNameToDelete] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => setErrorMessage(""), 5000);
      return () => clearTimeout(timer);
    }
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage, successMessage]);

  
  const fetchData = async () => {
    try {
      const data = await allDepartmentListFunction();

      if (!data || !data.result || data.result.length === 0) {
        setErrorMessage("No department list found.");
        setDepartmentList([]);
      } else {
        setDepartmentList(data.result);
        setErrorMessage("");
      }
    } catch (err) {
      setErrorMessage("API error occurred: " + err.message);
      setDepartmentList([]);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  
  const handleShowAddDepartmentModal = () => {
    setDepartmentModalMode("add");
    setCurrentDepartmentId(null);
    setDepartmentNameInput("");
    setErrorMessage("");
    setSuccessMessage("");
    setShowDepartmentModal(true);
  };

  
  const handleShowEditDepartmentModal = (deptId, deptName) => {
    setDepartmentModalMode("edit");
    setCurrentDepartmentId(deptId);
    setDepartmentNameInput(deptName || "");
    setErrorMessage("");
    setSuccessMessage("");
    setShowDepartmentModal(true);
  };

  const handleCloseDepartmentModal = () => {
    setShowDepartmentModal(false);
    setCurrentDepartmentId(null);
    setDepartmentNameInput("");
  };

  
  const handleSaveDepartment = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    const trimmedName = departmentNameInput.trim();

    if (!trimmedName) {
      
      setErrorMessage("Please enter a department name.");
      return;
    }

    try {
      if (departmentModalMode === "add") {
        
        const data = await addDepartmentFunction({
          DepartmentName: trimmedName,
          UpdatedDate: null,
        });

        if (!data?.result) {
          setErrorMessage("Failed to create Department. Please try again.");
        } else {
          setSuccessMessage(`Department '${trimmedName}' added successfully.`);
          fetchData();
          handleCloseDepartmentModal();
        }
      } else if (departmentModalMode === "edit") {
       
        if (!currentDepartmentId) {
          setErrorMessage("No department selected for editing.");
          return;
        }

        const data = await editDepartmentFunction({
          DepartmentId: currentDepartmentId,
          DepartmentName: trimmedName,
        });

        if (!data?.result) {
          setErrorMessage("Failed to update Department. Please try again.");
        } else {
          setSuccessMessage(`Department updated to '${trimmedName}'.`);
          fetchData();
          handleCloseDepartmentModal();
        }
      }
    } catch (err) {
      setErrorMessage("API error occurred: " + err.message);
    }
  };

 
  const handleShowDeleteDepartmentModal = (deptId, deptName) => {
    setDepartmentIdToDelete(deptId);
    setDepartmentNameToDelete(deptName);
    setErrorMessage("");
    setSuccessMessage("");
    setShowDeleteDepartmentModal(true);
  };

  const handleCloseDeleteDepartmentModal = () => {
    setShowDeleteDepartmentModal(false);
    setDepartmentIdToDelete(null);
    setDepartmentNameToDelete("");
  };

  
  const handleDeleteDepartment = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!departmentIdToDelete) {
      setErrorMessage("No department selected for deletion.");
      return;
    }

    try {
      const data = await deleteDepartmentFunction({ id: departmentIdToDelete });

      if (data?.result === "Department deleted ") {
        
        setSuccessMessage(
          `Department '${departmentNameToDelete}' deleted successfully.`
        );
        fetchData();
      } else {
        setErrorMessage(
          data?.message || "Failed to delete Department. Please try again."
        );
      }
    } catch (err) {
      setErrorMessage("API error occurred: " + err.message);
    } finally {
      handleCloseDeleteDepartmentModal();
    }
  };

  return (
    <div className="dashboard-card">
      <h4>Department List</h4>

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

      <div className="table-responsive" style={{ overflowY: "scroll" }}>
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
              <th>Department</th>
              <th>Delete</th>
              <th>Edit</th>
            </tr>
          </thead>
          <tbody>
            {departmentList.map((dept) => (
              <React.Fragment key={dept.DepartmentId}>
                <tr>
                  <td>{dept.Department}</td>
                  <td>
                    <FontAwesomeIcon
                      className="text-danger ms-2"
                      icon={faTrash}
                      title="Delete Department"
                      onClick={() =>
                        handleShowDeleteDepartmentModal(
                          dept.DepartmentId,
                          dept.DepartmentName
                        )
                      }
                      style={{ cursor: "pointer" }}
                    />
                  </td>
                  <td>
                    <FontAwesomeIcon
                      className="text-primary ms-2"
                      icon={faPen}
                      title="Edit Department"
                      onClick={() =>
                        handleShowEditDepartmentModal(
                          dept.DepartmentId,
                          dept.DepartmentName
                        )
                      }
                      style={{ cursor: "pointer" }}
                    />
                  </td>
                </tr>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <Button
        style={{ color: "white", width: "20%" }}
        onClick={handleShowAddDepartmentModal}
      >
        Add More Department
      </Button>

     
      <Modal show={showDepartmentModal} onHide={handleCloseDepartmentModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {departmentModalMode === "add" ? "Add Department" : "Edit Department"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
          <Form onSubmit={handleSaveDepartment}>
            <Form.Group>
              <Form.Label>Department</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter department"
                value={departmentNameInput}
                onChange={(e) => setDepartmentNameInput(e.target.value)}
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDepartmentModal}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleSaveDepartment}>
            {departmentModalMode === "add" ? "Add" : "Update"}
          </Button>
        </Modal.Footer>
      </Modal>

      
      <Modal
        show={showDeleteDepartmentModal}
        onHide={handleCloseDeleteDepartmentModal}
      >
        <Modal.Header closeButton>
          <Modal.Title>Delete Department</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Are you sure you want to delete the department{" "}
            <strong>{departmentNameToDelete}</strong>?
          </p>
          {errorMessage && (
            <Alert variant="danger" className="mt-2">
              {errorMessage}
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteDepartmentModal}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteDepartment}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
      
    </div>
  );
}

export default AdminDepartmentTable;
