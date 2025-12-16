import React, { useEffect, useMemo, useState } from "react";
import { allUserListFunction } from "../../api/AllUsers";
import { updateStatusFunction } from "../../api/UserStatus";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faPen } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { Modal } from "react-bootstrap";
import AdminEditUser from "./AdminEditUser"; // adjust path if different

const PAGE_SIZE_OPTIONS = [5, 10, 25, 50, 100];

// Assume you have an API function for updating user status
const updateUserStatusAPI = async (userId, newStatus) => {
  // Simulate an API call
  return new Promise((resolve) =>
    setTimeout(() => resolve({ success: true }), 500)
  );
};

const statusChange = async (user) => {
  const payload = {
    Id: user.userId, // ✅ use userId consistently
    Status: user.Status === "1" ? "0" : "1", // toggle
  };

  try {
    const res = await updateStatusFunction(payload);

    if (res.success) {
      setUserData((prev) =>
        prev.map((u) =>
          u.userId === user.userId ? { ...u, Status: payload.Status } : u
        )
      );
    } else {
      setErrorMessage(res.message || "Failed to update status");
    }
  } catch (err) {
    console.error("Error updating status:", err);
    setErrorMessage("Error updating status");
  }
};

const AdminUserStatus = () => {
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [toggleLoading, setToggleLoading] = useState({});

  // table UI state
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1); // 1-based
  const [sortKey, setSortKey] = useState("UserName");
  const [sortDir, setSortDir] = useState("asc");
  const [selecteduser, setSelectedUser] = useState("null");
  const [showEditModal, setShowEditModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);

  const handleEditClick = (user) => {
    setUserToEdit(user);
    setShowEditModal(true);
  };

  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await allUserListFunction();
        if (cancelled) return;

        if (Array.isArray(data)) {
          setUserData(data);
          setErrorMessage("");
        } else {
          setUserData([]);
          setErrorMessage("Invalid user data received.");
        }
      } catch (e) {
        if (!cancelled) {
          console.error(e);
          setUserData([]);
          setErrorMessage("Failed to fetch users.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return userData;
    const q = search.toLowerCase();
    return userData.filter((r) => {
      const fields = [
        r.UserName,
        r.Designation,
        r.Department,
        r.Mobile_No,
        r.Email,
        r.Location,
        r.Status ?? "Active",
      ];
      return fields.some((v) => (v ?? "").toString().toLowerCase().includes(q));
    });
  }, [userData, search]);

  // sort
  const sorted = useMemo(() => {
    const copy = [...filtered];
    const key = sortKey;
    const dir = sortDir === "asc" ? 1 : -1;

    copy.sort((a, b) => {
      if (key === "SrNo") return 0;
      const av = (a?.[key] ?? "").toString().toLowerCase();
      const bv = (b?.[key] ?? "").toString().toLowerCase();

      const an = Number(av),
        bn = Number(bv);
      if (!Number.isNaN(an) && !Number.isNaN(bn)) {
        if (an < bn) return -1 * dir;
        if (an > bn) return 1 * dir;
        return 0;
      }

      return av.localeCompare(bv) * dir;
    });

    return copy;
  }, [filtered, sortKey, sortDir]);

  // pagination
  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  useEffect(() => {
    setPage(1);
  }, [search, sortKey, sortDir, pageSize]);

  const startIdx = (page - 1) * pageSize;
  const pageRows = sorted.slice(startIdx, startIdx + pageSize);

  const handleSort = (key) => {
    if (key === "SrNo" || key === "Status") return;
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const header = (label, key) => {
    const isSortable = key !== "SrNo" && key !== "Status";
    const isActive = sortKey === key;
    const arrow = isActive ? (sortDir === "asc" ? " ▲" : " ▼") : "";
    return (
      <th
        key={key}
        className="tablehead"
        onClick={isSortable ? () => handleSort(key) : undefined}
        style={{
          cursor: isSortable ? "pointer" : "default",
          whiteSpace: "nowrap",
        }}
      >
        {label}
        {arrow}
      </th>
    );
  };

  // const handleShow = (user) => {
  //   navigate("/AdminDashboard/AdminEditUser", {state: {user} });
  // };

  const statusChange = async (user) => {
    const payload = {
      Id: user.Id,
      Status: user.Status === "1" ? "0" : "1",
    };

    const res = await updateStatusFunction(payload);

    if (res.success) {
      setUserData((prev) =>
        prev.map((u) =>
          u.Id === user.Id ? { ...u, Status: payload.Status } : u
        )
      );
    } else {
      setErrorMessage(res.message || "Failed to update status");
    }
  };

  return (
    <div className="container-fluid mt-0 px-0 ">
      {/* CSS for the toggle button colors */}
      <style>
        {`
          .form-switch .form-check-input:checked {
            background-color: #28a745; /* Green for Active */
            border-color: #28a745;
          }
          .form-switch .form-check-input:not(:checked) {
            background-color: #dc3545; /* Red for Inactive */
            border-color: #dc3545;
          }
        `}
      </style>

      {loading && <div className="alert alert-info">Loading...</div>}
      {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

      <div className="dashboard-card">
        <div className="d-flex align-items-center justify-content-between px-2 pt-2">
          <h4 className="m-0">User Status</h4>

          <div className="d-flex gap-2 align-items-center">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
              className="form-control"
              style={{ maxWidth: 240 }}
            />
            <select
              className="form-select"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              style={{ maxWidth: 120 }}
            >
              {PAGE_SIZE_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  Show {n}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div
          className="table-responsive mt-2 table-bord"
          style={{ overflowY: "auto" }}
        >
          <table className="align-middle table-struc" style={{ width: "100%" }}>
            <thead>
              <tr style={{ backgroundColor: "#fff" }}>
                {header("Sr No", "SrNo")}
                {header("User Name", "UserName")}
                {header("Designation", "Designation")}
                {header("Department", "Department")}
                {header("Mobile Number", "Mobile_No")}
                {header("Email", "Email")}
                {header("Location", "Location")}
                {header("Status", "Status")}
                {header("Edit", "Edit")}
              </tr>
            </thead>
            <tbody>
              {pageRows.map((r, idx) => {
                const switchId = `statusSwitch-${r.userId}`;
                return (
                  <tr
                    key={r.userId}
                    style={{
                      margin: "10px",
                      border: "0px solid #e0e0e0",
                      boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                    }}
                  >
                    <td style={{ padding: "14px 12px" }}>
                      {startIdx + idx + 1}
                    </td>
                    <td style={{ padding: "14px 12px" }}>{r.UserName}</td>
                    <td style={{ padding: "14px 12px" }}>{r.Designation}</td>
                    <td style={{ padding: "14px 12px" }}>{r.Department}</td>
                    <td style={{ padding: "14px 12px" }}>{r.Mobile_No}</td>
                    <td style={{ padding: "14px 12px" }}>{r.Email}</td>
                    <td style={{ padding: "14px 12px" }}>{r.Location}</td>
                    <td style={{ padding: "14px 12px" }}>
                      <div className="form-check form-switch">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          Id={`statusSwitch-${r.userId}`} // ✅ match key
                          checked={r.Status === "1"} // ✅ checked if active
                          onChange={() => statusChange(r)} // ✅ toggle user
                        />
                        <label
                          className="form-check-label"
                          htmlFor={`statusSwitch-${r.userId}`}
                          style={{
                            color: r.Status === "1" ? "green" : "red",
                            fontWeight: "bold",
                            marginLeft: "8px",
                          }}
                        >
                          {r.Status === "1" ? "Active" : "Inactive"}
                        </label>
                      </div>
                    </td>

                    <td style={{ padding: "14px 12px" }}>
                      <FontAwesomeIcon
                        className="text ms-2"
                        icon={faPen}
                        title="Edit User"
                        onClick={() => handleEditClick(r)}
                        style={{ cursor: "pointer", color: "#4f6c96ff" }}
                      />
                    </td>
                  </tr>
                );
              })}
              {!loading && pageRows.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-4">
                    No users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* pagination controls */}
        <div className="d-flex justify-content-between align-items-center p-2">
          <div>
            {total > 0 && (
              <small>
                Showing <strong>{startIdx + 1}</strong> to{" "}
                <strong>{Math.min(startIdx + pageSize, total)}</strong> of{" "}
                <strong>{total}</strong> entries
              </small>
            )}
          </div>
          <div className="btn-group">
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Prev
            </button>
            <span className="btn btn-outline-secondary btn-sm disabled">
              {page} / {totalPages}
            </span>
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </button>

            <button
              onClick={() => navigate("/AdminDashboardLayout/AdminCreateUser")}
              className="btn btn-success"
            >
              ➕ Add User
            </button>
          </div>
        </div>
      </div>
      <Modal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title style={{ color: "#f1f3f6ff" }}>Edit User Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <AdminEditUser
            setModalVisible={setShowEditModal}
            userToEdit={userToEdit}
          />
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default AdminUserStatus;
