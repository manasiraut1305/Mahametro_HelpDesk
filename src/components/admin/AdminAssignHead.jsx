import React, { useEffect, useState, useRef } from "react";

import { allHeadListFunction } from "../../api/AdminHeadGet";
import { getDepartmentWiseUserFunction } from "../../api/AdminGetDepartmentWiseUser";
import { assignHeadFunction } from "../../api/AdminAssignHead";

import { allDepartmentListFunction } from "../../api/AdminDepartmentList";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleMinus, faCirclePlus } from "@fortawesome/free-solid-svg-icons";

import { Modal, Button, Form, Alert } from "react-bootstrap";
import "../Styles.css";

const AdminAssignHead = () => {
  const [departmentList, setDepartmentList] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [showAddHeadModal, setShowAddHeadModal] = useState(false);
  const [showRemoveHeadModal, setShowRemoveHeadModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  // for REMOVE modal
  const [selectedHeadName, setSelectedHeadName] = useState("");
  const [selectedHeadId, setSelectedHeadId] = useState("");

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const fetchDepartmentHeads = async () => {
    try {
      setErrorMessage("");
      const data = await allHeadListFunction();

      if (!data || !data.result || data.result.length === 0) {
        // setErrorMessage("No department list found.");
        // setDepartmentList([]);

        const data = await allDepartmentListFunction();

        if (!data || !data.result || data.result.length === 0) {
          setErrorMessage("No department list found.");
          setDepartmentList([]);
        } else {
          setDepartmentList(data.result);
          setErrorMessage("");
        }
      } else {
        setDepartmentList(data.result);
      }
    } catch (err) {
      setErrorMessage("API error occurred: " + err.message);
      setDepartmentList([]);
    }
  };

  useEffect(() => {
    fetchDepartmentHeads();
  }, []);

  const fetchDepartmentUsers = async (departmentName) => {
    try {
      setErrorMessage("");
      setUsers([]);
      setFilteredUsers([]);
      setSelectedUser(null);
      setSearchTerm("");

      const data = await getDepartmentWiseUserFunction(departmentName);

      if (data?.result) {
        const list = Array.isArray(data.result) ? data.result : [data.result];
        setUsers(list);
        setFilteredUsers(list);
      } else {
        setErrorMessage(data?.message || "No users found for this department.");
      }
    } catch (err) {
      setErrorMessage("API error occurred: " + err.message);
    }
  };

  const handleOpenAddHeadModal = (departmentName, Id) => {
    setSelectedDepartment(departmentName);
    setShowAddHeadModal(true);
    setSuccessMessage("");
    setErrorMessage("");
    fetchDepartmentUsers(departmentName);
  };

  const handleCloseAddHeadModal = () => {
    setShowAddHeadModal(false);
    setSelectedDepartment(null);
    setUsers([]);
    setFilteredUsers([]);
    setSelectedUser(null);
    setSearchTerm("");
    setShowDropdown(false);
  };

  const handleOpenRemoveHeadModal = (departmentName, headName, Id) => {
    setSelectedDepartment(departmentName);
    setSelectedHeadName(headName || "");
    setSelectedHeadId(Id || "");
    setShowRemoveHeadModal(true);
    setSuccessMessage("");
    setErrorMessage("");
  };

  const handleCloseRemoveHeadModal = () => {
    setShowRemoveHeadModal(false);
    setSelectedDepartment(null);
    setSelectedHeadId(null);
    setSelectedHeadName("");
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowDropdown(true);

    if (!value.trim()) {
      setFilteredUsers(users);
      return;
    }

    const lower = value.toLowerCase();
    const filtered = users.filter((u) =>
      (u.UserName || "").toLowerCase().includes(lower)
    );
    setFilteredUsers(filtered);
  };

  const handleSelectUser = (userItem) => {
    setSelectedUser(userItem);
    setSearchTerm(
      userItem.Designation
        ? `${userItem.UserName} (${userItem.Designation})`
        : userItem.UserName
    );
    setShowDropdown(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSaveHead = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!selectedDepartment) {
      setErrorMessage("No department selected.");
      return;
    }

    if (!selectedUser) {
      setErrorMessage("Please select a user to assign as head.");
      return;
    }

    try {
      const res = await assignHeadFunction(selectedUser.Id, selectedDepartment);

      // adjust this check based on your backend shape
      if (res && res.success === false) {
        setErrorMessage(res.message || "Failed to assign head");
        return;
      }

      setSuccessMessage("Head assigned successfully.");
      await fetchDepartmentHeads();
      handleCloseAddHeadModal();
    } catch (err) {
      setErrorMessage("API error occurred: " + err.message);
    }
  };

  const handleRemoveHead = async () => {
    setErrorMessage("");
    setSuccessMessage("");

    if (!selectedDepartment) {
      setErrorMessage("No department selected.");
      return;
    }

    console.log("Removing head with Id:", selectedHeadId, selectedDepartment);
    try {
      const res = await assignHeadFunction(selectedHeadId, selectedDepartment);

      if (res && res.success === false) {
        setErrorMessage(res.message || "Failed to remove head");
        return;
      }

      setSuccessMessage("Head removed successfully.");
      await fetchDepartmentHeads();
      handleCloseRemoveHeadModal();
    } catch (err) {
      setErrorMessage("API error occurred: " + err.message);
    }
  };

  return (
    <div className="table-responsive ps-3" style={{ overflowY: "scroll" }}>
      {errorMessage && (
        <Alert variant="danger" className="mt-3">
          {errorMessage}
        </Alert>
      )}
      {successMessage && (
        <Alert variant="success" className="mt-3">
          {successMessage}
        </Alert>
      )}

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
            <th>Head</th>
            <th>Edit</th>
          </tr>
        </thead>

        <tbody>
          {departmentList.map((dept) => (
            <tr key={dept.Department}>
              <td>{dept.Department}</td>

              <td>
                {dept.Heads.length > 0
                  ? dept.Heads.map((h, index) => (
                      <div key={h.Id || index}>{h.UserName}</div>
                    ))
                  : "No Head Assigned"}
              </td>

              <td>
                <FontAwesomeIcon
                  className="text-black ms-2"
                  icon={faCirclePlus}
                  title="Add / Change Head"
                  onClick={() =>
                    handleOpenAddHeadModal(dept.Department, dept.Id)
                  }
                  style={{ cursor: "pointer" }}
                />

                {dept.Heads.map((h) => (
                  <FontAwesomeIcon
                    key={h.Id}
                    className="text-danger ms-2"
                    icon={faCircleMinus}
                    title="Remove Head"
                    onClick={() =>
                      handleOpenRemoveHeadModal(
                        dept.Department,
                        h.UserName,
                        h.Id
                      )
                    }
                    style={{ cursor: "pointer" }}
                  />
                ))}

                {dept.Heads.length === 0 && (
                  <FontAwesomeIcon
                    className="text-danger ms-2 opacity-50"
                    icon={faCircleMinus}
                    title="No Head to Remove"
                    style={{ cursor: "not-allowed" }}
                  />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ADD HEAD MODAL */}
      <Modal show={showAddHeadModal} onHide={handleCloseAddHeadModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add Head</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {errorMessage && (
            <Alert variant="danger" className="mb-3">
              {errorMessage}
            </Alert>
          )}

          <Form>
            <Form.Group className="mb-3">
              <Form.Label style={{ color: "#4682B4" }}>Department</Form.Label>
              <Form.Control
                type="text"
                value={selectedDepartment || ""}
                readOnly
              />
            </Form.Group>

            <div
              className="form-group row mb-4 position-relative"
              ref={dropdownRef}
            >
              <label
                className="col-sm-3 col-form-label"
                style={{ color: "#4682B4" }}
              >
                Username
              </label>
              <div className="col-sm-9">
                <div className="dropdown w-100">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search username"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onFocus={() => setShowDropdown(true)}
                    autoComplete="off"
                  />

                  {showDropdown && (
                    <div
                      className="dropdown-menu show w-100 p-2"
                      style={{
                        maxHeight: "200px",
                        overflowY: "auto",
                        zIndex: 1000,
                      }}
                    >
                      {filteredUsers.length > 0 ? (
                        filteredUsers.map((userItem) => (
                          <button
                            key={userItem.Id}
                            className="dropdown-item"
                            type="button"
                            onClick={() => handleSelectUser(userItem)}
                          >
                            {userItem.UserName}
                            {userItem.Designation
                              ? ` (${userItem.Designation})`
                              : ""}
                          </button>
                        ))
                      ) : (
                        <div className="dropdown-item text-muted">
                          No matching user found
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseAddHeadModal}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleSaveHead}>
            Add
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showRemoveHeadModal} onHide={handleCloseRemoveHeadModal}>
        <Modal.Header closeButton>
          <Modal.Title>Remove Head</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {errorMessage && (
            <Alert variant="danger" className="mb-3">
              {errorMessage}
            </Alert>
          )}

          <Form>
            <Form.Group className="mb-3">
              <Form.Label style={{ color: "#4682B4" }}>
                {selectedHeadName
                  ? `Are you sure you want to remove "${selectedHeadName}" as head of ${selectedDepartment}?`
                  : `Are you sure you want to remove the head of ${selectedDepartment}?`}
              </Form.Label>
              <Form.Control
                type="text"
                value={selectedDepartment || ""}
                readOnly
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseRemoveHeadModal}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleRemoveHead}>
            Remove
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminAssignHead;
