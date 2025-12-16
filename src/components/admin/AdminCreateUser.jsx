import React, { useState, useEffect } from "react";
import { adminAddUserFunction } from "../../api/AdminAddUser";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminCreateUser = ({ setModalVisible }) => {
  const [formData, setFormData] = useState({
    Username: "",
    email: "",
    Mobile_no: "",
    designation: "",
    department: "",
    location: "",
    role: "",
    password: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleCancel = () => {
    setModalVisible(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Validations
    if (name === "phone_no" && !/^\d{0,10}$/.test(value)) return;
    if (name === "email" && /\s/.test(value)) return;
    if (name === "password" && value.length > 50) return;

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    // Check for empty fields
    for (const key in formData) {
      if (!formData[key]) {
        setErrorMessage("Please fill all the fields.");
       
        return;
      }
    }

    try {
      const data = await adminAddUserFunction(formData);
      

      if (!data?.result) {
        setErrorMessage("Failed to create user. Please try again.");
      } else {
        toast.success("User created successfully.")
        
        setFormData({
          Username: "",
          email: "",
          Mobile_no: "",
          designation: "",
          department: "",
          location: "",
          role: "",
          password: "",
        });
        
        setTimeout(() => {
          setModalVisible(false);
        }, 2000);
      }
    } catch (err) {
      // setErrorMessage("API error occurred: " + err.message);
       toast.error("Error occurred.");
    }
  };

  return (
    <div style={{ padding: "20px"}} >
       <ToastContainer />
      <h2>Create New User</h2>
      <form onSubmit={handleSubmit}>
        {/* Name */}
        <div className="form-group row mb-4">
          <label
            htmlFor="Username"
            className="col-sm-3 col-form-label"
            style={{ color: "#4682B4" }}
          >
            Name
          </label>
          <div className="col-sm-9">
            <input
              className="form-control"
              type="text"
              name="Username"
              id="Username"
              value={formData.Username}
              onChange={handleChange}
              required
              placeholder="Enter full name"
            />
          </div>
        </div>

        {/* Phone Number */}
        <div className="form-group row mb-4">
          <label
            htmlFor="Mobile_no"
            className="col-sm-3 col-form-label"
            style={{ color: "#4682B4" }}
          >
            Phone No.
          </label>
          <div className="col-sm-9">
            <input
              className="form-control"
              type="tel"
              name="Mobile_no"
              id="Mobile_no"
              value={formData.Mobile_no}
              onChange={handleChange}
              pattern="\d{10}"
              maxLength="10"
              placeholder="10-digit phone number"
              title="Phone number must be 10 digits"
            />
          </div>
        </div>

        {/* Email */}
        <div className="form-group row mb-4">
          <label
            htmlFor="email"
            className="col-sm-3 col-form-label"
            style={{ color: "#4682B4" }}
          >
            Email
          </label>
          <div className="col-sm-9">
            <input
              className="form-control"
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="user@example.com"
              pattern="^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
              title="Enter a valid email address"
            />
          </div>
        </div>

        {/* Designation */}
        <div className="form-group row mb-4">
          <label
            htmlFor="designation"
            className="col-sm-3 col-form-label"
            style={{ color: "#4682B4" }}
          >
            Designation
          </label>
          <div className="col-sm-9">
            <input
              className="form-control"
              type="text"
              name="designation"
              id="designation"
              value={formData.designation}
              onChange={handleChange}
              placeholder="Enter designation"
            />
          </div>
        </div>

        {/* Department */}
        <div className="form-group row mb-4">
          <label
            htmlFor="department"
            className="col-sm-3 col-form-label"
            style={{ color: "#4682B4" }}
          >
            Department
          </label>
          <div className="col-sm-9">
            <input
              className="form-control"
              type="text"
              name="department"
              id="department"
              value={formData.department}
              onChange={handleChange}
              placeholder="Enter department"
            />
          </div>
        </div>

        {/* Location */}
        <div className="form-group row mb-4">
          <label
            htmlFor="location"
            className="col-sm-3 col-form-label"
            style={{ color: "#4682B4" }}
          >
            Location
          </label>
          <div className="col-sm-9">
            <select
              className="form-control"
              name="location"
              id="location"
              value={formData.location}
              onChange={handleChange}
            >
              <option value="">Select location</option>
              <option value="Nagpur">Nagpur</option>
              <option value="Pune">Pune</option>
              <option value="Thane">Thane</option>
            </select>
          </div>
        </div>

        {/* Role */}
        <div className="form-group row mb-4">
          <label
            htmlFor="role"
            className="col-sm-3 col-form-label"
            style={{ color: "#4682B4" }}
          >
            Role
          </label>
          <div className="col-sm-9">
            <select
              className="form-control"
              name="role"
              id="role"
              value={formData.role}
              onChange={handleChange}
            >
              <option value="">Select role</option>
              <option value="Helpdesk Eng">Helpdesk Eng</option>
              <option value="Engineer">Engineer</option>
              <option value="User">User</option>
            </select>
          </div>
        </div>

        {/* Password */}
        <div className="form-group row mb-4">
          <label
            htmlFor="password"
            className="col-sm-3 col-form-label"
            style={{ color: "#4682B4" }}
          >
            Password
          </label>
          <div className="col-sm-9">
            <input
              className="form-control"
              type={showPassword ? "text" : "password"}
              name="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter secure password"
              pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
              title="At least 8 characters, with uppercase, lowercase, number, and special character"
            />
            <small
              style={{
                cursor: "pointer",
                color: "blue",
                marginTop: "5px",
                display: "inline-block",
              }}
              onClick={togglePasswordVisibility}
            >
              {showPassword ? "Hide" : "Show"} Password
            </small>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="text-end">
          <button
            type="submit"
            className="btn px-4 me-2"
            style={{ background: "#4682B4", color: "white" }}
          >
            Create User
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

      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}
    </div>
  );
};

export default AdminCreateUser;
