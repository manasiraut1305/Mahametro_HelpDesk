import React, { useState, useEffect, useRef } from "react";
import { adminEditUserFunction } from "../../api/AdminEditUser";
import { allUserListFunction } from "../../api/AllUsers";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// The component now accepts a 'userToEdit' prop with the existing user data
const AdminEditUser = ({ setModalVisible, userToEdit , user}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const [users, setUsers] = useState([]);

  const [filteredUsers, setFilteredUsers] = useState([]);

  // 1. Define a default state object for easy resetting
  const defaultFormData = {
    Id: "",
    UserName: "",
    Email: "",
    Mobile_No: "",
    Department: "",
    Location: "",
    Designation: "",
  };
  
  // 2. Initialize formData with the default state
  const [formData, setFormData] = useState(defaultFormData);

  const handleSelectEngineer = (selectedUser) => {
    setFormData((prev) => ({
      ...prev,
      Id: selectedUser.Id,
      UserName: selectedUser.UserName,
      Email: selectedUser.Email || "",
      Mobile_No: selectedUser.Mobile_No || "",
      Department: selectedUser.Department || "",
      Designation: selectedUser.Designation || "",
      Location: selectedUser.Location || "", // Corrected 'Location' spelling to match formData
    }));
    setShowDropdown(false); // Close dropdown after selection
  };

  const fetchUsers = async () => {
    try {
      const data = await allUserListFunction();
    
      if (Array.isArray(data)) {
        setUsers(data);
        setFilteredUsers(data);
      } else {
        console.error("User list is not an array:", data);
        setUsers([]);
        setFilteredUsers([]);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
      setFilteredUsers([]);
    }
  };

  // Now, call this function in the useEffect hook
  useEffect(() => {
    fetchUsers();
  }, []);

  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Use useEffect to populate the form with the user's current data when the component loads
  useEffect(() => {
    if (userToEdit) {
      setFormData({
        Id: userToEdit.Id || "",
        UserName: userToEdit.UserName || "",
        Email: userToEdit.Email || "",
        Mobile_No: userToEdit.Mobile_No || "",
        Department: userToEdit.Department || "",
        Location: userToEdit.Location || "",
        Designation: userToEdit.Designation || "",
      });
    } else {
      setFormData(defaultFormData); 
    }
  }, [userToEdit]);

  const handleCancel = () => {
    setModalVisible(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "Mobile_No" && !/^\d{0,10}$/.test(value)) return;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "UserName") {
      setFormData((prev) => ({ ...prev, [name]: value }));
      if (value.trim() !== "") {
        const filtered = users.filter(
          (user) =>
            user.UserName?.toLowerCase().includes(value.toLowerCase()) ||
            user.Email?.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredUsers(filtered);
        setShowDropdown(true);
      } else {
        setFilteredUsers(users); 
        setShowDropdown(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        Id: formData.Id,
        UserName: formData.UserName,
        Email: formData.Email,
        Mobile_No: formData.Mobile_No,
        Department: formData.Department,
        Location: formData.Location,
        Designation: formData.Designation,
      };

      const data = await adminEditUserFunction(payload);
      

      if (data?.result === "Updated successfully") {
        toast.success("User updated successfully!");
        setFormData(defaultFormData);
        fetchUsers(); 

        setTimeout(() => {
          setModalVisible(false);
        }, 2000);
      } else {
        toast.error("Failed to update user. Please try again.");
      }
    } catch (err) {
      toast.error("An error occurred: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <ToastContainer />
      {/* <h2 style={{ color: "#f1f3f6ff" }}>Edit User</h2> */}
      <form onSubmit={handleSubmit}>
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
                id="UserName"
                name="UserName"
                placeholder="Search or select username"
                value={formData.UserName}
                onChange={handleChange}
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
                        onClick={() => handleSelectEngineer(userItem)}
                      >
                        {userItem.UserName}
                        {userItem.designation
                          ? `(${userItem.designation})`
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

        <div className="form-group row mb-4">
          <label
            htmlFor="Mobile_No"
            className="col-sm-3 col-form-label"
            style={{ color: "#4682B4" }}
          >
            Phone No.
          </label>
          <div className="col-sm-9">
            <input
              className="form-control"
              type="tel"
              name="Mobile_No"
              id="Mobile_No"
              value={formData.Mobile_No}
              onChange={handleChange}
              pattern="\d{10}"
              maxLength="10"
              placeholder="10-digit phone number"
              title="Phone number must be 10 digits"
            />
          </div>
        </div>

        <div className="form-group row mb-4">
          <label
            htmlFor="Email"
            className="col-sm-3 col-form-label"
            style={{ color: "#4682B4" }}
          >
            Email
          </label>
          <div className="col-sm-9">
            <input
              className="form-control"
              type="email"
              name="Email"
              id="Email"
              value={formData.Email}
              onChange={handleChange}
              placeholder="user@example.com"
              pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
              title="Enter a valid email address"
            />
          </div>
        </div>

        <div className="form-group row mb-4">
          <label
            htmlFor="Designation"
            className="col-sm-3 col-form-label"
            style={{ color: "#4682B4" }}
          >
            Designation
          </label>
          <div className="col-sm-9">
            <input
              className="form-control"
              type="text"
              name="Designation"
              id="Designation"
              value={formData.Designation}
              onChange={handleChange}
              placeholder="Enter Designation"
            />
          </div>
        </div>

        <div className="form-group row mb-4">
          <label
            htmlFor="Department"
            className="col-sm-3 col-form-label"
            style={{ color: "#4682B4" }}
          >
            Department
          </label>
          <div className="col-sm-9">
            <input
              className="form-control"
              type="text"
              name="Department"
              id="Department"
              value={formData.Department}
              onChange={handleChange}
              placeholder="Enter Department"
            />
          </div>
        </div>

        <div className="form-group row mb-4">
          <label
            htmlFor="Location"
            className="col-sm-3 col-form-label"
            style={{ color: "#4682B4" }}
          >
            Location
          </label>
          <div className="col-sm-9">
            <select
              className="form-control"
              name="Location"
              id="Location"
              value={formData.Location}
              onChange={handleChange}
            >
              <option value="">{formData.Location}</option>
              <option value="Nagpur">Nagpur</option>
              <option value="Navi Mumbai">Navi Mumbai</option>
              <option value="Pune">Pune</option>
              <option value="Thane">Thane</option>
            </select>
          </div>
        </div>

        <div className="text-end">
          <button
            type="submit"
            className="btn px-4 me-2"
            style={{ background: "#4682B4", color: "white" }}
            disabled={loading}
          >
            {loading ? "Updating..." : "Update User"}
          </button>
          <button
            type="button"
            className="btn btn-secondary px-4"
            onClick={handleCancel}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminEditUser;