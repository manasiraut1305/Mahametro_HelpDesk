import React, { useContext, useEffect, useState, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { generateTicketFunction } from "../../api/GenerateTicket";
import { subcategoryFunction } from "../../api/Subcategory";
import { AuthContext } from "../AuthContext";
import { useNavigate } from "react-router-dom";

import { issuesListFunction } from "../../api/issuetypeList";
import { categoriesListFunction } from "../../api/categoriesList";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const GenerateTicket = ({ setModalVisible, generateTicket }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [categoryList, setCategoryList] = useState([]);
  const [sub_CategoryOptions, setsub_CategoryOptions] = useState([]);
  const [selectedPhotos, setSelectedPhotos] = useState([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [users, setUsers] = useState([]); 
    const [filteredUsers, setFilteredUsers] = useState([]); 
    const [showDropdown, setShowDropdown] = useState(false);
    const [issueTypes, setIssueTypes] = useState([]);
    const dropdownRef = useRef(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
      const fetchIssueTypes = async () => {
        try {
          const data = await issuesListFunction();
          
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

  const fetchCategories = async () => {
    try {
      const data = await categoriesListFunction();
      if (!data) {
        console.warn("No category list found.");
        setCategoryList([]);
      } else {
        setCategoryList(data);
      }
    } catch (err) {
      console.error("API error occurred fetching categories: ", err.message);
      setErrorMessage("Failed to load categories.");
      toast.error("Failed to load categories."); // Display toast on error
    }
  };

  useEffect(() => {
    fetchCategories();
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
    Description: "",
    Files: "",
    Ticket_type: "",
    Token: "",
    Category: "",
    Sub_Category: "",
  });

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedPhotos(files);
  };
   const handleChange = async (e) => {
    const { name, value } = e.target;

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
    } else if (name === "Category") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        Sub_Category: "", 
      }));

      const selected = categoryList.find(
        (cat) => String(cat.CatId) === String(value)
      );
      setsub_CategoryOptions(selected?.SubCategories || []);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };


  const handleCancel = () => {
    setModalVisible(false);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append("Id", user?.id);
    data.append("Description", formData.Description);
    data.append("Ticket_type", formData.Ticket_type);
    data.append("Token", formData.Token);
    data.append("Category", formData.Category);
    data.append("Sub_Category", formData.Sub_Category);

   

    selectedPhotos.forEach((photo) => {
      data.append("Files[]", photo);
    });
    try {
     
      const response = await generateTicketFunction(data);
     
      if (response?.result) {
        toast.success(`Ticket Number ${response.TicketNoRandom} generated successfully!`);
        setFormData({
          Description: "",
          Files: "",
          Ticket_type: "",
          Token: "",
          Category: "",
          Sub_Category: "",
        });
        setSelectedPhotos([]);

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } else {
        setErrorMessage(response?.message || "Something went wrong.");
        toast.error(response?.message || "Something went wrong.");
      }
    } catch (err) {
      console.error("Error during submission:", err);
      // setErrorMessage("Submission failed. Please try again.");
      toast.error("Submission failed. Please try again.");
    }
  };

  return (
    <div className="container mt-5 pb-5" style={{ maxWidth: "650px" }}>
      {errorMessage && (
        <div className="alert alert-info text-center">{errorMessage}</div>
      )}
      <ToastContainer />
      <form onSubmit={handleSubmit}>
        {/* Issue Type */}
        <div className="form-group row mb-4">
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
            </select>
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
              placeholder="Description"
              value={formData.Description}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Category and Subcategory dropdowns */}
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
                {/* FIX 2: Correctly render `sub.SubCategory` */}
                {sub_CategoryOptions.map((sub) => (
                  <option key={sub.SubCateId} value={sub.SubCateId}>
                    {sub.SubCategory}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>


        {/* Upload Photos */}
        <div className="form-group row mb-4">
          <label
            htmlFor="Files"
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
              onChange={handlePhotoChange}
               ref={fileInputRef}
            />

            <div className="mt-3 d-flex flex-wrap gap-3">
             
              {selectedPhotos.map((file, index) => {
                const fileType = file.type;
                const isImage = fileType.startsWith("image/");

                return (
                  <div key={file.name + index} className="text-center">
                    {isImage ? (
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`preview-${index}`}
                        width="100"
                        height="100"
                        style={{ objectFit: "cover", borderRadius: "8px" }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100px",
                          height: "100px",
                          border: "1px solid #ccc",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "8px",
                          background: "#f8f9fa",
                        }}
                      >
                        <span className="small text-muted">File</span>
                      </div>
                    )}
                    <p className="text-center small">{file.name}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="text-end">
          <button
            type="submit"
            className="btn px-4 me-2"
            style={{ background: "#4682B4", color: "white" }}
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default GenerateTicket;