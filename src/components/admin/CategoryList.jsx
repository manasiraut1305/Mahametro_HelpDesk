import React, { useEffect, useState } from "react";
import "../Styles.css";
import { categoriesListFunction } from "../../api/categoriesList";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlusCircle,
  faMinusCircle,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { addCategoryFunction } from "../../api/AddCategory";
import { addSubCategoryFunction } from "../../api/AddSubCategory";
import { deleteCategoryFunction } from "../../api/CategoryDelete";
import { subCategoryDeleteFunction } from "../../api/SubCategoryDelete";

function CategoryList() {
  const [categoryList, setCategoryList] = useState([]);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showDeleteCategoryModal, setShowDeleteCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [newSubCategory, setNewSubCategory] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedCatId, setSelectedCatId] = useState(null);
  const [categoryIdToDelete, setCategoryIdToDelete] = useState(null);
  const [categoryNameToDelete, setCategoryNameToDelete] = useState("");
  const [showAddSubCategoryModal, setShowAddSubCategoryModal] = useState(false);
  const [showDeleteSubCategoryModal, setShowDeleteSubCategoryModal] = useState(false);
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState(null);
  const [selectedSubCategoryName, setSelectedSubCategoryName] = useState("");

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
      const data = await categoriesListFunction();
      if (!data) {
        setErrorMessage("No category list found.");
      } else {
        setCategoryList(data);
      }
    } catch (err) {
      setErrorMessage("API error occurred: " + err.message);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleShowAddCategoryModal = () => {
    setNewCategory("");
    setErrorMessage("");
    setSuccessMessage("");
    setShowAddCategoryModal(true);
  };

  const handleCloseAddCategoryModal = () => setShowAddCategoryModal(false);

  const handleShowAddSubCategoryModal = (catId) => {
    setSelectedCatId(catId);
    setNewSubCategory("");
    setErrorMessage("");
    setSuccessMessage("");
    setShowAddSubCategoryModal(true);
  };

  const handleCloseAddSubCategoryModal = () => {
    setShowAddSubCategoryModal(false);
  };

  const handleShowDeleteCategoryModal = (catId, categoryName) => {
    setCategoryIdToDelete(catId);
    setCategoryNameToDelete(categoryName);
    setErrorMessage("");
    setSuccessMessage("");
    setShowDeleteCategoryModal(true);
  };

  const handleCloseDeleteCategoryModal = () => {
    setShowDeleteCategoryModal(false);
    setCategoryIdToDelete(null);
    setCategoryNameToDelete("");
  };

  const handleShowDeleteSubCategoryModal = (subCatId, subCategoryName) => {
    setSelectedSubCategoryId(subCatId);
    setSelectedSubCategoryName(subCategoryName);
    setErrorMessage("");
    setSuccessMessage("");
    setShowDeleteSubCategoryModal(true);
  };

  const handleCloseDeleteSubCategoryModal = () => {
    setShowDeleteSubCategoryModal(false);
    setSelectedSubCategoryId(null);
    setSelectedSubCategoryName("");
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    try {
      const data = await addCategoryFunction({ Category: newCategory });
      if (!data?.result) {
        setErrorMessage("Failed to create Category. Please try again.");
      } else {
        setNewCategory("");
        setSuccessMessage(`Category '${newCategory}' added successfully.`);
        fetchData();
        handleCloseAddCategoryModal();
      }
    } catch (err) {
      setErrorMessage("API error occurred: " + err.message);
      setNewCategory("");
      handleCloseAddCategoryModal();
    }
  };

  const handledeleteCategory = async () => {
    setErrorMessage("");
    setSuccessMessage("");
    if (!categoryIdToDelete) {
      setErrorMessage("No category selected for deletion.");
      return;
    }
    try {
      const data = await deleteCategoryFunction({ Id: categoryIdToDelete });
      if (data?.result === "Category deleted successfully") {
        setSuccessMessage(`Category '${categoryNameToDelete}' deleted successfully.`);
        fetchData();
      } else {
        setErrorMessage(data?.message || "Failed to delete Category. Please try again.");
      }
    } catch (err) {
      setErrorMessage("API error occurred: " + err.message);
    } finally {
      handleCloseDeleteCategoryModal();
    }
  };

  const handleAddSubCategories = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    try {
      const data = await addSubCategoryFunction({
        SubCategory: newSubCategory,
        CatId: selectedCatId,
      });
      if (!data?.result) {
        setErrorMessage("Failed to create Sub Category. Please try again.");
      } else {
        setNewSubCategory("");
        setSuccessMessage(`Sub-category '${newSubCategory}' added successfully.`);
        fetchData();
      }
    } catch (err) {
      setErrorMessage("API error occurred: " + err.message);
    } finally {
      handleCloseAddSubCategoryModal();
    }
  };

  const handleDeleteSubCategories = async () => {
    setErrorMessage("");
    setSuccessMessage("");
    if (!selectedSubCategoryId) {
      setErrorMessage("No sub-category selected for deletion.");
      return;
    }
    try {
      const data = await subCategoryDeleteFunction({
        Id: selectedSubCategoryId,
      });
      if (data?.result === "Sub Category Deleted Successfully") {
        setSuccessMessage(`Sub Category '${selectedSubCategoryName}' Deleted Successfully!`);
        fetchData();
      } else {
        setErrorMessage(data?.result || "Failed to delete Sub Category. Please try again.");
      }
    } catch (err) {
      setErrorMessage("API error occurred: " + err.message);
    } finally {
      handleCloseDeleteSubCategoryModal();
    }
  };

  return (
    <div className="dashboard-card">
      <h4>Category List</h4>
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
      {/* Make the table scrollable with overflow-y-scroll */}
      <div className="table-responsive" style={{ overflowY: "scroll" }}>
        <table className="table table table-bordered table-striped mt-3">
          <thead className="thead-dark" style={{ position: "sticky", top: 0, zIndex: 1, backgroundColor: "#343a40", color: "white" }}>
            <tr>
              <th>Category</th>
              <th>Sub Categories</th>
              <th>Add Sub Categories</th>
              <th>Delete Category</th>
            </tr>
          </thead>
          <tbody>
            {categoryList.map((cat) => (
              <React.Fragment key={cat.CatId || cat.ID}>
                <tr>
                  <td>{cat.Category}</td>
                  <td>
                    {cat.SubCategories && cat.SubCategories.length > 0 ? (
                      <ul className="list-unstyled mb-0">
                        {cat.SubCategories.map((subCat) => (
                          <li
                            key={subCat.SubCateId || subCat.ID}
                            className="d-flex justify-content-between align-items-center mb-1"
                          >
                            <span>{subCat.SubCategory}</span>
                            <FontAwesomeIcon
                              className="ms-2"
                              icon={faMinusCircle}
                              title="Delete Sub-Category"
                              onClick={() =>
                                handleShowDeleteSubCategoryModal(
                                  subCat.SubCateId || subCat.ID,
                                  subCat.SubCategory
                                )
                              }
                              style={{ cursor: "pointer", color: "#ce2d05ff" }}
                            />
                          </li>
                        ))}
                      </ul>
                    ) : (
                      "No Sub Categories"
                    )}
                  </td>
                  <td>
                    <FontAwesomeIcon
                      className="text-orange ms-2"
                      icon={faPlusCircle}
                      title="Add Sub-Category"
                      onClick={() => {
                        handleShowAddSubCategoryModal(cat.CatId || cat.ID);
                      }}
                      style={{ cursor: "pointer", color: "#29236eff" }}
                    />
                  </td>
                  <td>
                    <FontAwesomeIcon
                      className="text-danger ms-2"
                      icon={faTrash}
                      title="Delete Category"
                      onClick={() =>
                        handleShowDeleteCategoryModal(
                          cat.CatId || cat.ID,
                          cat.Category
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
      <Button style={{ color: "white", width:"20%" }} onClick={handleShowAddCategoryModal}>
        Add More Category
      </Button>

      {/* Modal for Adding Main Category */}
      <Modal show={showAddCategoryModal} onHide={handleCloseAddCategoryModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add Category</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
          <Form>
            <Form.Group>
              <Form.Label>Category</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter category"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseAddCategoryModal}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleAddCategory}>
            Add
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal for Adding Sub Category */}
      <Modal show={showAddSubCategoryModal} onHide={handleCloseAddSubCategoryModal}>
        <Modal.Header closeButton>
          <Modal.Title>Add Sub Category</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
          <Form>
            <Form.Group className="mt-3">
              <Form.Label>Sub Category</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter sub category"
                value={newSubCategory}
                onChange={(e) => setNewSubCategory(e.target.value)}
                required
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseAddSubCategoryModal}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleAddSubCategories}>
            Add
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal for Deleting Main Category */}
      <Modal show={showDeleteCategoryModal} onHide={handleCloseDeleteCategoryModal}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Category</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            All the subcategories of **{categoryNameToDelete}** will also be deleted.
          </p>
          <p>
            Are you sure you want to delete the category "**{categoryNameToDelete}**"?
          </p>
          {errorMessage && (
            <Alert variant="danger" className="mt-2">
              {errorMessage}
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDeleteCategoryModal}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handledeleteCategory}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal for Deleting Sub Category */}
      <Modal show={showDeleteSubCategoryModal} onHide={handleCloseDeleteSubCategoryModal}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Sub Category</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Are you sure you want to delete the sub-category:{" "}
            <strong>{selectedSubCategoryName}</strong>?
          </p>
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
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={handleCloseDeleteSubCategoryModal}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteSubCategories}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default CategoryList;