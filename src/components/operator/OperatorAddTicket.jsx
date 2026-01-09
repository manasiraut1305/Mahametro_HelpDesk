import React, { useContext, useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { AuthContext } from "../AuthContext";
import { operatorAddTicketFunction } from "../../api/OperatorAddTicket";
import { activeUserListFunction } from "../../api/ActiveUsersList";
import { categoriesListFunction } from "../../api/categoriesList";
import { issuesListFunction } from "../../api/issuetypeList";
import { allDepartmentListFunction } from "../../api/AdminDepartmentList";
import { getDepartmentHead } from "../../api/GetDepartmentHead";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const OperatorAddTicket = ({ setModalVisible, getAllData }) => {
  const { user } = useContext(AuthContext);

  const [categoryList, setCategoryList] = useState([]); 
  const [sub_CategoryOptions, setsub_CategoryOptions] = useState([]);
  const [department, setDepartment] = useState([]);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [issueTypes, setIssueTypes] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const dropdownRef = useRef(null);

  const [departmentList, setDepartmentList] = useState([]);
  const [departmentHeadList, setDepartmentHeadList] = useState();

  
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoriesListFunction();
        if (Array.isArray(data)) {
          setCategoryList(data);
        } else {
          setErrorMessage("No category list found.");
        }
      } catch (err) {
        setErrorMessage("API error occurred: " + err.message);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchIssueTypes = async () => {
      try {
        const data = await issuesListFunction();
        // console.log(data);
        if (data?.TotalIssue && Array.isArray(data.TotalIssue)) {
          setIssueTypes(data.TotalIssue);
        } else {
          setErrorMessage("No issue list found.");
        }
      } catch (err) {
        setErrorMessage("API error occurred: " + err.message);
      }
    };
    fetchIssueTypes();
  }, []);

  // Users List
  useEffect(() => {
    async function fetchUsers() {
      try {
        const data = await activeUserListFunction();
        if (Array.isArray(data.result)) {
          setUsers(data.result);
          setFilteredUsers(data.result);
        } else {
          setUsers([]);
          setFilteredUsers([]);
        }
      } catch (error) {
        setUsers([]);
        setFilteredUsers([]);
      }
    }
    fetchUsers();
  }, []);

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

  const [formData, setFormData] = useState({
    Id: "",
    Description: "",
    Files: "",
    Ticket_type: "",
    Token: "",
    name: "",
    designation: "",
    department: "",
    departmentHead: "",
    email: "",
    mobile_no: "",
    Category: "",
    Sub_Category: "",
    Engineer_id: "",
    DepartmentId: "",
    DeptHeadApprovedBy: "",
  });

  const [selectedPhotos, setSelectedPhotos] = useState([]);

  // const handleChange = (e) => {
  //   const { name, value } = e.target;

  //   if (name === "name") {
  //     setFormData((prev) => ({ ...prev, [name]: value }));
  //     if (value.trim() !== "") {
  //       const filtered = users.filter(
  //         (user) =>
  //           user.UserName?.toLowerCase().includes(value.toLowerCase()) ||
  //           user.Email?.toLowerCase().includes(value.toLowerCase())
  //       );
  //       setFilteredUsers(filtered);
  //       setShowDropdown(true);
  //     } else {
  //       setFilteredUsers(users);
  //       setShowDropdown(false);
  //     }
  //   } else if (name === "Category") {
  //     setFormData((prev) => ({
  //       ...prev,
  //       [name]: value,
  //       Sub_Category: "",
  //     }));

  //     const selected = categoryList.find(
  //       (cat) => String(cat.CatId) === String(value)
  //     );

  //     setsub_CategoryOptions(selected?.SubCategories || []);
  //   } else {
  //     setFormData((prev) => ({
  //       ...prev,
  //       [name]: value,
  //     }));
  //   }
  // };

  const handleChange = async (e) => {
    const { name, value } = e.target;

    // 1) Name field (for user search + dropdown)
    if (name === "name") {
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
      return;
    }

    // 2) Category field (sets sub-categories)
    if (name === "Category") {
      setFormData((prev) => ({
        ...prev,
        Category: value,
        Sub_Category: "",
      }));

      const selected = categoryList.find(
        (cat) => String(cat.CatId) === String(value)
      );

      setsub_CategoryOptions(selected?.SubCategories || []);
      return;
    }

    // 3) Ticket_type (Issue Type)
    if (name === "Ticket_type") {
      setFormData((prev) => ({
        ...prev,
        Ticket_type: value,
        DepartmentId: "",
        departmentHead: "",
      }));

      if (value === "New Requirement") {
        try {
          setErrorMessage("");
          const data = await allDepartmentListFunction();

          if (!data || !data.result || data.result.length === 0) {
            setErrorMessage("No department list found.");
            setDepartmentList([]);
          } else {
            setDepartmentList(data.result);
          }
        } catch (err) {
          setErrorMessage("API error occurred: " + err.message);
          setDepartmentList([]);
        }
      } else {
        // if some other ticket type, clear department-related fields
        setDepartmentList([]);
        setDepartmentHeadList();
      }

      return;
    }
    //4
    if (name === "DepartmentId") {
  const selectedDeptId = value;

  setFormData((prev) => ({
    ...prev,
    DepartmentId: selectedDeptId,
    departmentHead: "",
  }));

  // console.log("Fetching department:", selectedDeptId);

  try {
    const data = await getDepartmentHead(selectedDeptId);

    if (!data?.result) {
      setErrorMessage("No User Found");
      setDepartmentHeadList();
    } else {
      setDepartmentHeadList(data.result);
    }
  } catch (err) {
    setErrorMessage("API error: " + err.message);
    setDepartmentHeadList();
  }

  return;
}


    // 5) Default for all other fields
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectEngineer = (selectedUser) => {
    setFormData((prev) => ({
      ...prev,
      Id: selectedUser.Id,
      name: selectedUser.UserName,
      Engineer_id: selectedUser.Id,
      designation: selectedUser.Designation || "",
      department: selectedUser.Department || "",
      email: selectedUser.Email || "",
      mobile_no: selectedUser.Mobile_No || "",
      Location: selectedUser.Location || "",
    }));
    setShowDropdown(false);
  };

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedPhotos(files);
  };

  const handleCancel = () => {
    setModalVisible(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("opratorID", user?.id || "");
    data.append("Id", formData.Id);
    data.append("name", formData.name);
    data.append("Description", formData.Description);
    // data.append("department", formData.department);
    data.append("designation", formData.designation);
    data.append("Ticket_type", formData.Ticket_type);
    data.append("Token", formData.Token);
    data.append("email", formData.email);
    data.append("mobile_no", formData.mobile_no);
    data.append("Category", formData.Category);
    data.append("Sub_Category", formData.Sub_Category);
    data.append("department", formData?.DepartmentId || "" );
    // data.append("departmentHead", formData.departmentHead);
    data.append("Sub_Category", formData.Sub_Category);
    data.append("DeptHeadApprovedBy", formData?.departmentHead || "");
    data.append("Engineer_id", formData.Engineer_id);

    selectedPhotos.forEach((photo) => {
      data.append("Files[]", photo);
    });

    try {
      const response = await operatorAddTicketFunction(data);

      if (response?.result === "Ticket generated successfully") {
        const ticketNumber = response.ticket?.TicketNoRandom;
        toast.success(`Ticket Number ${ticketNumber} generated successfully!`);

        setFormData({
          Id: "",
          name: "",
          Description: "",
          department: "",
          designation: "",
          Ticket_type: "",
          Token: "",
          email: "",
          mobile_no: "",
          Category: "",
          Sub_Category: "",
          Engineer_id: "",
        });
        setSelectedPhotos([]);
      } else {
        setErrorMessage(response?.message || "Something went wrong.");
        toast.error(response?.message || "Something went wrong.");
      }
    } catch (err) {
      setErrorMessage("Submission failed. Please try again.");
    }
  };

  return (
    <div className="container mt-5 pb-5" style={{ maxWidth: "650px" }}>
      {errorMessage && (
        <div className="alert alert-info text-center">{errorMessage}</div>
      )}
      <ToastContainer />
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
                id="name"
                name="name"
                placeholder="Search username"
                value={formData.name}
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

        {/* Description */}
        <div className="form-group row mb-4">
          <label
            htmlFor="Description"
            className="col-sm-3 col-form-label"
            style={{ color: "#4682B4" }}
          >
            Description
          </label>
          <div className="col-sm-9">
            <textarea
              className="form-control"
              id="Description"
              name="Description"
              placeholder="Describe the issue"
              value={formData.Description}
              onChange={handleChange}
              required
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
              type="text"
              className="form-control"
              id="department"
              name="department"
              placeholder="Enter department"
              value={formData.department}
              onChange={handleChange}
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
              type="text"
              className="form-control"
              id="designation"
              name="designation"
              placeholder="Enter designation"
              value={formData.designation}
              onChange={handleChange}
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
            <input
              type="text"
              className="form-control"
              id="Location"
              name="Location"
              placeholder="Enter Location"
              value={formData.Location}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-group row mb-4">
          <label
            htmlFor="mobile_no"
            className="col-sm-3 col-form-label"
            style={{ color: "#4682B4" }}
          >
            Mobile No
          </label>
          <div className="col-sm-9">
            <input
              type="tel"
              className="form-control"
              id="mobile_no"
              name="mobile_no"
              placeholder="Enter 10-digit mobile number"
              value={formData.mobile_no}
              onChange={handleChange}
              pattern="[0-9]{10}"
              maxLength={10}
              title="Enter a valid 10-digit phone number"
            />
          </div>
        </div>

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
              type="email"
              className="form-control"
              id="email"
              name="email"
              placeholder="Enter Email Id"
              value={formData.email}
              onChange={handleChange}
              title="Enter a valid email-id"
            />
          </div>
        </div>

        {/* Ticket Type */}
        {/* <div className="form-group row mb-4">
          <label
            htmlFor="Ticket_type"
            className="col-sm-3 col-form-label"
            style={{ color: "#4682B4" }}
          >
            Issue Type
          </label>
          <div className="col-sm-9">
            <select
              className="form-select"
              id="Ticket_type"
              name="Ticket_type"
              value={formData.Ticket_type}
              onChange={handleChange}
              
              required
            >
              <option value="">-- Select Issue Type --</option>
              {issueTypes.map((issue) => (
                <option 
                style={{color:"black"}}
                 key={issue.IssueId} value={issue.Issue_Type}>
                  {issue.Issue_Type}
                </option>
                
              ))}
              {formData.Ticket_type === "New Requirement" && (
              <select
                className="form-select"
                id="Sub_Category"
                name="Sub_Category"
                value={formData.DepartmentId}
                onChange={handleChange}
                required
              >
                <option value="">-- Department --</option>
                {departmentList.map((dept) => (
                  <option key={dept.DepartmentId} value={dept.DepartmentId}>
                    {dept.Department}
                  </option>
                ))}
              </select>
            )}

            {formData.department &&(
              <select
                className="form-select mt-2"
                id="department_head"
                name="department_head"
                value={formData.department_head}
                onChange={handleChange}
                required
                >
                  </select>
            )}
            </select>
          </div>
        </div> */}

        <div className="form-group row mb-4">
          <label
            htmlFor="Ticket_type"
            className="col-sm-3 col-form-label"
            style={{ color: "#4682B4" }}
          >
            Issue Type
          </label>

          <div className="col-sm-9">
            {/* Issue Type Dropdown */}
            <select
              className="form-select"
              id="Ticket_type"
              name="Ticket_type"
              value={formData.Ticket_type}
              onChange={handleChange}
              required
            >
              <option value="">-- Select Issue Type --</option>
              {issueTypes.map((issue) => (
                <option key={issue.IssueId} value={issue.Issue_Type}>
                  {issue.Issue_Type}
                </option>
              ))}
            </select>

            {/* Show department dropdown ONLY when New Requirement is selected */}
            {formData.Ticket_type === "New Requirement" && (
              <select
                className="form-select mt-2"
                id="DepartmentId"
                name="DepartmentId"
                value={formData.DepartmentId}
                onChange={handleChange}
                required
              >
                <option value="">-- Select Department --</option>
                {departmentList.map((dept) => (
                  // <option key={dept.DepartmentId} value={dept.Department}>
                  //   {dept.Department}
                  // </option>
                  <option key={dept.DepartmentId} value={dept.Department}>
                    {dept.Department}
                  </option>
                ))}
              </select>
            )}
            {formData.Ticket_type === "New Requirement" &&
              formData.DepartmentId &&
              departmentHeadList  && (
                <select
                  className="form-select mt-2"
                  id="departmentHead"
                  name="departmentHead"
                  value={formData.departmentHead}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Approval --</option>
                  {departmentHeadList.map((user) => (
                    <option key={user.Id} value={user.Id}>
                      {user.UserName} ({user.Designation || "No Designation"})
                    </option>
                  ))}
                </select>
              )}
          </div>
        </div>

        <div className="form-group row mb-4">
          <label
            htmlFor="Category"
            className="col-sm-3 col-form-label"
            style={{ color: "#4682B4" }}
          >
            Category
          </label>
          <div className="col-sm-9">
            <select
              className="form-select mb-2"
              id="Category"
              name="Category"
              value={formData.Category}
              onChange={handleChange}
              required
            >
              <option value="">-- Select Category --</option>
              {categoryList.map((cat) => (
                <option key={cat.CatId} value={cat.CatId}>
                  {cat.Category}
                </option>
              ))}
            </select>

            {formData.Category && (
              <select
                className="form-select"
                id="Sub_Category"
                name="Sub_Category"
                value={formData.Sub_Category}
                onChange={handleChange}
                required
              >
                <option value="">-- Select Sub-Category --</option>
                {sub_CategoryOptions.map((sub) => (
                  <option key={sub.SubCateId} value={sub.SubCateId}>
                    {sub.SubCategory}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        <div className="form-group row mb-4">
          <label
            htmlFor="photoUpload"
            className="col-sm-3 col-form-label"
            style={{ color: "#4682B4" }}
          >
            Upload Photos
          </label>
          <div className="col-sm-9">
            <input
              type="file"
              className="form-control"
              id="Files"
              multiple
              accept="image/*"
              onChange={handlePhotoChange}
            />

            <div className="mt-3 d-flex flex-wrap gap-3">
              {selectedPhotos.map((file, index) => (
                <div key={index}>
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`preview-${index}`}
                    width="100"
                    height="100"
                    style={{ objectFit: "cover", borderRadius: "8px" }}
                  />
                  <p className="text-center small">{file.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Submit / Cancel */}
        <div className="text-end">
          <button
            type="submit"
            className="btn px-4 me-2"
            style={{ background: "#4682B4", color: "white" }}
          >
            Submit
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

export default OperatorAddTicket;
