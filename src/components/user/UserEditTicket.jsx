import React, { useContext, useEffect, useRef, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { categoriesListFunction } from "../../api/categoriesList";
import { userEditTicketFunction } from "../../api/UserEditTicket";
import { issuesListFunction } from "../../api/issuetypeList";
import { AuthContext } from "../AuthContext";

const EditTicket = ({ selectedTicket, handleClose, getAllData }) => {
  const currentTicket = selectedTicket || {};

  const [errorMessage, setErrorMessage] = useState("");
  const [categoryList, setCategoryList] = useState([]);
    const [issueTypes, setIssueTypes] = useState([]);
  const [sub_CategoryOptions, setsub_CategoryOptions] = useState([]);
  const [selectedPhotos, setSelectedPhotos] = useState([]); 
  const { user } = useContext(AuthContext); 

  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    Description: "",
    Ticket_type: "",
    Token: "", 
    Category: "", 
    Sub_Category: "", 
  });

  // Effect to pre-populate form data and subcategories when selectedTicket changes
  useEffect(() => {
    if (currentTicket && Object.keys(currentTicket).length > 0) {
      setFormData({
        Description: currentTicket.Description || "",
        Ticket_type: currentTicket.Ticket_type || "",
        // Use user.Token if available, otherwise fallback to currentTicket.Token
        Token: user?.Token || currentTicket.Token || "",
        Category: currentTicket.Category || "", // Pre-populate with Category ID
        Sub_Category: currentTicket.Sub_Category || "", // Pre-populate with Sub_Category ID
      });

      if (categoryList.length > 0) {
        const selectedCategory = categoryList.find(
          (cat) => Number(cat.CatId) === Number(currentTicket.Category)
        );
        setsub_CategoryOptions(selectedCategory?.SubCategories || []);
      }
    }
  }, [currentTicket, categoryList, user]); // Added user to dependency array

  // Effect to fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  
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
      toast.error("Failed to load categories.");
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  const data = new FormData();
  data.append("Token", user?.Token || formData.Token || "");
  data.append("Description", formData.Description || "");
  data.append("Ticket_type", formData.Ticket_type || "");
  data.append("Category", formData.Category || "");
  data.append("Sub_Category", formData.Sub_Category || "");

  selectedPhotos.forEach((file) => data.append("Files", file));

  try {
    const response = await userEditTicketFunction(data);
    console.log("EditTicket response:", response);

    if (response?.Status === 200 && response?.result === "Updated successfully") {
      toast.success("Ticket updated successfully!");

      // Clear state
      fileInputRef.current && (fileInputRef.current.value = "");
      setSelectedPhotos([]);

      // Refresh table
      await getAllData();

      // Close modal after a short delay
      setTimeout(() => handleClose(), 800);
    } else {
      toast.error(`❌ ${response?.result || "Something went wrong. Try again."}`, {
        position: "top-right",
        autoClose: 3000,
      });
    }
  } catch (err) {
    console.error("Error during submission:", err);
    toast.error("❌ Submission failed. Please try again.", {
      position: "top-right",
      autoClose: 3000,
    });
  }
};

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedPhotos(files); // Store actual File objects
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "Category") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        Sub_Category: "", // Reset sub-category when category changes
      }));
      const selected = categoryList.find(
        (cat) => Number(cat.CatId) === Number(value)
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
    handleClose();
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
              value={formData.Category} // Dropdown uses ID
              onChange={handleChange}
              required
            >
              <option value="">{formData.Category}</option>
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
                value={formData.Sub_Category} // Dropdown uses ID
                onChange={handleChange}
                required
              >
                <option value="">{formData.Sub_Category}</option>
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
              {/* Display existing files/photos if available from selectedTicket */}
              {/* Added 'currentTicket &&' for null safety */}
              {currentTicket && currentTicket.ImageUrl && currentTicket.ImageUrl.length > 0 && (
                currentTicket.ImageUrl.map((imageUrl, index) => (
                  <div key={index} className="text-center">
                    {imageUrl.match(/\.(jpeg|jpg|gif|png)$/) ? (
                      <img
                        src={imageUrl}
                        alt={`Existing file ${index}`}
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
                    <p className="text-center small text-truncate" style={{ maxWidth: '100px' }}>
                      {imageUrl.split('/').pop()}
                    </p>
                  </div>
                ))
              )}

              {/* Display newly selected photos */}
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
                    <p className="text-center small text-truncate" style={{ maxWidth: '100px' }}>{file.name}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="text-end">
          <button
            type="submit"
            className="btn px-4 me-2"
            style={{ background: "#4682B4", color: "white" }}
          >
            Update
          </button>
          {/* <button
            type="button"
            className="btn btn-secondary px-4"
            onClick={handleCancel}
          >
            Cancel
          </button> */}
        </div>
      </form>
    </div>
  );
};

export default EditTicket;