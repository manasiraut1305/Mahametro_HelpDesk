import React from "react";
import { useState, useEffect, useRef } from "react";
import { Chart } from "react-google-charts";
import { engineerListFunction } from "../../api/EngineerList";
import { totalCountFunction } from "../../api/TotalCount";
import { TicketReport } from "../../api/Report";

import { categoriesListFunction } from "../../api/categoriesList";
import { issuesListFunction } from "../../api/issuetypeList";
import "../Styles.css";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

function ProjectCard({ projectName }) {
  const [engineerList, setEngineerList] = useState([]);
  const [ticketCounts, setTicketCounts] = useState([]);
  const [detailedTicketReport, setDetailedTicketReport] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingDetailed, setLoadingDetailed] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [errorMessageDetailed, setErrorMessageDetailed] = useState("");
  const [filteredEngineers, setFilteredEngineers] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedEngineer, setSelectedEngineer] = useState(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [detailedFromDate, setDetailedFromDate] = useState("");
  const [detailedToDate, setDetailedToDate] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const [categoryList, setCategoryList] = useState([]);
  const [sub_CategoryOptions, setsub_CategoryOptions] = useState([]);
  const [categoryDeatiledList, setCategoryDetailedList] = useState([]);
  const [sub_CategoryDetailedOptions, setsub_CategoryDetailedOptions] =
    useState([]);

  const [issueTypes, setIssueTypes] = useState([]);
  const [issueDetailedTypes, setIssueDetailedTypes] = useState([]);

  const [totalCounts, setTotalCounts] = useState({
 
    TotalResolvedCount: 0,
    TotalPendingCount: 0,
    TotalTicketCount: 0,
  });

  const [engineerTotalCounts, setEngineerTotalCounts] = useState({
   
    TotalResolvedCount: 0,
    TotalPendingCount: 0,
    TotalTicketCount: 0,
  });

  const [activeTab, setActiveTab] = useState("engineerAnalysis");
  const suggestionRef = useRef(null);
  const [formData, setFormData] = useState({
    Ticket_type: "",
    Category: "",
    Sub_Category: "",
    CatId: "",
    SubCateId: "",
  });
  // --- Export to Excel function ---
  const handleExport = () => {
    if (ticketCounts.length === 0 && detailedTicketReport.length === 0) {
      alert("No data to export.");
      return;
    }

    const workbook = XLSX.utils.book_new();

    // --- Engineerwise Analysis ---
    if (ticketCounts.length > 0) {
      const engineerwiseData = [
        [
          "Engineer Name",
          "Designation",
           "Total Assigned Tickets",
          "Pending Tickets",
          "Resolved Tickets",
         
        ],
        ...ticketCounts.map((data) => [
          data.UserName,
          data.Designation,
          data.TotalTicketCountEngineer,
          data.AssignedAndApprovedCount,
          data.ResolvedCount,
          
        ]),
        
        [
          "TOTAL",
          "",
          engineerTotalCounts.TotalTicketCount,
          engineerTotalCounts.TotalPendingCount,
          engineerTotalCounts.TotalResolvedCount,
          
        ],
      ];
      const engineerwiseSheet = XLSX.utils.aoa_to_sheet(engineerwiseData);
      XLSX.utils.book_append_sheet(
        workbook,
        engineerwiseSheet,
        "Engineerwise Analysis"
      );
    }

    // --- Detailed Ticket Report ---
    if (detailedTicketReport.length > 0) {
      const detailedReportData = [
        [
          "Ticket Number",
          "Name",
          "Designation",
          "Created Date",
          "Resolved Date",
          "Mobile No",
          "Department",
          "Location",
          "Status",
          "Engineer Name",
          "Priority",
          "Category",
          "Sub Category",
          "Description",
          "Comment",
        ],
        ...detailedTicketReport.map((data) => [
          data.TicketNoRandom,
          data.name || data.UserName,
          data.designation || data.Designation,
          new Date(data.Created_date).toLocaleString(),
          data.ResolvedDate
            ? new Date(data.ResolvedDate).toLocaleDateString()
            : "",
          data.mobile_no || data.Mobile_No,
          data.department || data.Department,
          data.Location,
          data.Status,
          data.Engineer_id,
          data.Levels,
          data.Category,
          data.Sub_Category,
          data.Description,
          [data.Comments],
        ]),
        // Add total row
        [
          "TOTAL",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
          ` Total : ${totalCounts.TotalTicketCount} ,Pending: ${totalCounts.TotalPendingCount}, Resolved: ${totalCounts.TotalResolvedCount}
         `,
          "",
        ],
      ];
      const detailedReportSheet = XLSX.utils.aoa_to_sheet(detailedReportData);
      XLSX.utils.book_append_sheet(
        workbook,
        detailedReportSheet,
        "Detailed Ticket Report"
      );
    }

    // --- Save Excel file ---
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
    });

    saveAs(blob, "Ticket_Report.xlsx");
  };

 
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
useEffect(()=>{
  console.log("Category List Updated:", categoryList);
},[categoryList])
  useEffect(() => {
    const fetchIssueTypes = async () => {
      try {
        const data = await issuesListFunction();
        console.log(data);
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

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "Category") {
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

  const handleReportChange = (e) => {
    const { name, value } = e.target;

    if (name === "Category") {
      setFormData((prev) => ({
        ...prev,
        Category: value,
        Sub_Category: "", // reset sub category
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

  // --- Date Handling for Engineerwise Analysis ---
  const handleFromDateChange = (e) => setFromDate(e.target.value);
  const handleToDateChange = (e) => {
    const dateValue = e.target.value;
    setToDate(dateValue ? `${dateValue}T23:59:59` : "");
  };

  // --- Date Handling for Detailed Ticket Report ---
  const handleFromDateReportChange = (e) => setDetailedFromDate(e.target.value);
  const handleToDateReportChange = (e) => {
    const dateValue = e.target.value;
    setDetailedToDate(dateValue ? `${dateValue}T23:59:59` : "");
  };

  // --- Engineer Search and Selection ---
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchText(value);
    setShowSuggestions(true);
    setSelectedEngineer(null);
    const filtered = engineerList.filter((eng) =>
      `${eng.Designation || ""} ${eng.UserName || ""}`
        .toLowerCase()
        .includes(value.toLowerCase())
    );
    setFilteredEngineers(filtered);
  };

  const handleSelectEngineer = (eng) => {
    setSearchText(`${eng.Designation || ""} | ${eng.UserName || ""}`);
    setSelectedEngineer(eng);
    setShowSuggestions(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionRef.current &&
        !suggestionRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Data Fetching Logic ---
  useEffect(() => {
    const fetchEngineers = async () => {
      try {
        const data = await engineerListFunction();
        setEngineerList(data || []);
        setFilteredEngineers(data || []);
      } catch (err) {
        setErrorMessage("Engineer list API error: " + err.message);
      }
    };
    fetchEngineers();
  }, []);

  useEffect(() => {
    const fetchTicketCounts = async () => {
      if (!fromDate || !toDate) {
        setTicketCounts([]);
        setEngineerTotalCounts({
          TotalAsignedCount: 0,
          TotalApprovedCount: 0,
          TotalResolvedCount: 0,
          TotalPendingCount: 0,
        });
        return;
      }

      setLoading(true);
      setErrorMessage("");

      try {
        const payload = {
          FromDate: fromDate,
          ToDate: toDate,
          engineer_id: selectedEngineer ? selectedEngineer.Id : null,
          Category: formData?.Category || null,
          Sub_Category: formData.Sub_Category || "",
          Ticket_type: formData.Ticket_type || "",
        };
console.log("Payload for totalCountFunction:", payload);
        const data = await totalCountFunction(payload);

        const engineers = data?.result?.Engineers || [];

        if (Array.isArray(engineers) && engineers.length > 0) {
          // 👉 This drives your table rows
          setTicketCounts(engineers);

          // 👉 These are the overall totals from the API
          setEngineerTotalCounts({
            TotalAsignedCount: data.TotalAsignedCount || 0,
            TotalApprovedCount: data.TotalApprovedCount || 0,
            TotalPendingCount: data.TotalPendingCount || 0,
            TotalResolvedCount: data.TotalResolvedCount || 0,
            TotalTicketCount: data.TotalTicketCount || 0,
          });
        } else {
          setTicketCounts([]);
          setEngineerTotalCounts({
            TotalAsignedCount: 0,
            TotalApprovedCount: 0,
            TotalPendingCount: 0,
            TotalResolvedCount: 0,
            TotalTicketCount: 0,
          });
        }
      } catch (err) {
        setErrorMessage("Failed to fetch engineer counts: " + err.message);
        setTicketCounts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTicketCounts();
  }, [
    fromDate,
    toDate,
    selectedEngineer,
    formData.Category,
    formData.Sub_Category,
    formData.Ticket_type,
  ]);

  useEffect(() => {
    const fetchDetailedReport = async () => {
      if (!detailedFromDate || !detailedToDate) {
        setDetailedTicketReport([]);
        setTotalCounts({
          TotalPendingCount: 0,
          TotalResolvedCount: 0,
        });
        return;
      }

      setLoadingDetailed(true);
      setErrorMessageDetailed("");

      try {
        const payload = {
          FromDate: detailedFromDate,
          ToDate: detailedToDate,
          status: selectedStatus || "",
          engineer_id: selectedEngineer ? selectedEngineer.Id : null,
          Category: formData.Category || "",
          Sub_Category: formData.Sub_Category || "",
          Ticket_type: formData.Ticket_type || "",
        };

        const response = await TicketReport(payload);

        if (response && Array.isArray(response.ticketsInRange)) {
          setDetailedTicketReport(response.ticketsInRange);
          setTotalCounts({
            // make key names match how you read them elsewhere
            TotalPendingCount: response.TotalPendingCount || 0,
            TotalResolvedCount: response.TotalResolvedCount || 0,
            TotalTicketCount: response.TotalTicketCount || 0,
          });
        } else {
          setDetailedTicketReport([]);
          setTotalCounts({
            TotalPendingCount: 0,
            TotalResolvedCount: 0,
            TotalTicketCount: 0,
          });
        }
      } catch (err) {
        setErrorMessageDetailed(
          "Failed to fetch detailed report: " + err.message
        );
        setDetailedTicketReport([]);
      } finally {
        setLoadingDetailed(false);
      }
    };

    fetchDetailedReport();
  }, [
    detailedFromDate,
    detailedToDate,
    selectedStatus,
    selectedEngineer,
    formData.Category,
    formData.Sub_Category,
    formData.Ticket_type,
  ]);

  return (
    <>
      <div className="d-flex justify-content-left mb-4">
        <div className="btn m-10">
          <button
            className="btn"
            style={{
              backgroundColor:
                activeTab === "engineerAnalysis" ? "#344767" : "grey",
              color: "white",
            }}
            onClick={() => setActiveTab("engineerAnalysis")}
          >
            Engineer Analysis
          </button>
        </div>
        <div className="btn m-10">
          <button
            className="btn"
            style={{
              backgroundColor:
                activeTab === "detailedReport" ? "#344767" : "grey",
              color: "white",
            }}
            onClick={() => setActiveTab("detailedReport")}
          >
            Detailed Report
          </button>
        </div>
      </div>
      <hr />

      {activeTab === "engineerAnalysis" && (
        <div className="project-card text-center overflow-y-scroll overflow-x-visible">
          <div className="d-flex flex-column gap-sp">
            <div className="row card-body mb-4 justify-content-between ea-filters-row">
              {/* From Date */}
              <div className="form-group d-flex col-md-3 col-sm-6 align-items-center ea-field">
                <label htmlFor="fromDate" className="mb-0">
                  From Date:
                </label>
                <input
                  type="date"
                  id="fromDate"
                  className="form-control"
                  value={fromDate}
                  onChange={handleFromDateChange}
                />
              </div>

              {/* To Date */}
              <div className="form-group d-flex col-md-3 col-sm-6 align-items-center ea-field">
                <label htmlFor="toDate" className="mb-0">
                  To Date:
                </label>
                <input
                  type="date"
                  id="toDate"
                  className="form-control"
                  value={toDate.split("T")[0]}
                  onChange={handleToDateChange}
                />
              </div>

              {/* Engineer */}
              <div className="form-group d-flex col-md-3 col-sm-6 align-items-center ea-field">
                <label htmlFor="engineer_id" className="mb-0">
                  Engineer:
                </label>
                <div ref={suggestionRef} className="ea-engineer-wrapper">
                  <input
                    type="text"
                    placeholder="Search Engineer..."
                    value={searchText}
                    onChange={handleSearchChange}
                    onFocus={() => setShowSuggestions(true)}
                    className="form-control"
                  />
                  {showSuggestions && filteredEngineers.length > 0 && (
                    <ul className="ea-suggestions">
                      {filteredEngineers.map((item, i) => (
                        <li
                          key={i}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleSelectEngineer(item)}
                        >
                          {`${item.Designation} | ${item.UserName}`}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              {/* Issue Type */}
              <div className="form-group d-flex col-md-3 col-sm-6 align-items-center ea-field">
                <label htmlFor="Ticket_type" className="mb-0 ea-label-primary">
                  Issue Type :
                </label>
                <div className="ea-select-wrapper">
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
                </div>
              </div>

              {/* Category & Subcategory */}
              <div className="form-group d-flex col-md-6 col-sm-6 ea-field ea-category-field">
                <label htmlFor="Category" className="mb-1 ea-label-primary">
                  Category :
                </label>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "10px",
                  }}
                >
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
                      <option key={cat.Category} value={cat.CatId}>
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
                        <option key={sub.Sub_Category} value={sub.SubCateId}>
                          {sub.SubCategory}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              {/* Export Button */}
              <div className="form-group d-flex col-md-2 col-sm-6 align-items-center justify-content-end ea-field">
                <button
                  onClick={handleExport}
                  className="btn btn-success ea-export-btn"
                >
                  Export to Excel
                </button>
              </div>
            </div>

            {loading && (
              <div className="alert alert-info text-center mt-3">
                Loading ticket counts...
              </div>
            )}
            {errorMessage && (
              <div className="alert alert-danger text-center mt-3">
                {errorMessage}
              </div>
            )}
            {!loading && !errorMessage && ticketCounts.length > 0 ? (
              <div className="table-responsive mt-3">
                <table className="table table-bordered table-striped">
                  <thead>
                    <tr>
                      <th>Engineer Name</th>
                      <th>Designation</th>
                     <th>Total Assigned Tickets</th>
                      <th>Pending Tickets</th>
                      <th>Resolved Tickets</th>
                      
                    </tr>
                  </thead>
                  <tbody>
                    {ticketCounts.map((data, index) => (
                      <tr key={data.EngineerId || index}>
                        <td>{data.UserName}</td>
                        <td>{data.Designation}</td>
                        
                        <td>{data.TotalTicketCountEngineer}</td>
                        <td>{data.AssignedAndApprovedCount}</td>
                        <td>{data.ResolvedCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <h4 className="text-center mt-5 mb-3">Total Ticket Counts</h4>
                <table className="table table-bordered table-striped">
                  <thead>
                    <tr>
                      <th>Total Assigned Tickets</th>
                      <th>Total Pending Tickets</th>
                      <th>Total Resolved Tickets</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{engineerTotalCounts.TotalTicketCount}</td>
                      <td>{engineerTotalCounts.TotalPendingCount}</td>
                      <td>{engineerTotalCounts.TotalResolvedCount}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              !loading &&
              !errorMessage &&
              fromDate &&
              toDate && (
                <div className="alert alert-warning text-center mt-3">
                  No ticket data available for the selected dates/engineer.
                </div>
              )
            )}
          </div>
        </div>
      )}

      {activeTab === "detailedReport" && (
        <div className="dashboard-card">
          <div className="d-flex flex-column gap-sp">
            <div className="row card-body gap-5 mb-5 justify-content-center">
              <div className="d-flex flex-row">
                <div className="row card-body">
                  <div className="form-group d-flex col-md-3 col-sm-6 align-items-center ea-field">
                    <label htmlFor="fromDateReport" className="mb-0">
                      From Date:
                    </label>
                    <input
                      type="date"
                      id="fromDateReport"
                      className="form-control"
                      value={detailedFromDate}
                      onChange={handleFromDateReportChange}
                    />
                  </div>
                  <div className="form-group d-flex col-md-3 col-sm-6 align-items-center ea-field">
                    <label htmlFor="toDateReport" className="mb-0">
                      To Date:
                    </label>
                    <input
                      type="date"
                      id="toDateReport"
                      className="form-control"
                      value={detailedToDate.split("T")[0]}
                      onChange={handleToDateReportChange}
                    />
                  </div>
                  <div className="form-group d-flex col-md-3 col-sm-6 align-items-center ea-field">
                    <label htmlFor="engineer_id" className="mb-0">
                      Engineer:
                    </label>
                    <div ref={suggestionRef} style={{ position: "relative" }}>
                      <input
                        type="text"
                        placeholder="Search Engineer..."
                        value={searchText}
                        onChange={handleSearchChange}
                        onFocus={() => setShowSuggestions(true)}
                        style={{
                          width: "100%",
                          padding: "6px",
                          borderRadius: "4px",
                          border: "1px solid #ccc",
                        }}
                      />
                      {showSuggestions && filteredEngineers.length > 0 && (
                        <ul
                          style={{
                            position: "absolute",
                            background: "#fff",
                            width: "100%",
                            zIndex: 1000,
                            border: "1px solid #ccc",
                            maxHeight: "150px",
                            overflowY: "auto",
                            padding: 0,
                            margin: 0,
                            listStyle: "none",
                          }}
                        >
                          {filteredEngineers.map((item, i) => (
                            <li
                              key={i}
                              // Use onMouseDown to prevent input blur before click
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => handleSelectEngineer(item)}
                              style={{
                                padding: "8px 12px",
                                cursor: "pointer",
                                borderBottom: "1px solid #eee",
                              }}
                            >
                              {`${item.Designation} | ${item.UserName}`}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                  <div className="form-group d-flex col-md-2 col-sm-6 align-items-center ea-field">
                    <label htmlFor="status" className="mb-1">
                      Status:
                    </label>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                      <option value="">Select Status</option>
                      <option value="Pending">Raised</option>
                      <option value="Asigned">Assigned</option>
                      <option value="Approved">Approved</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="d-flex flex-column gap-sp">
            <div className="row card-body gap-5 mb-5 justify-content-center">
              <div className="d-flex flex-row">
                <div className="row card-body justify-content-start">
                  <div className="form-group d-flex col-md-3 col-sm-6 align-items-center ea-field">
                    <label
                      htmlFor="Ticket_type"
                      className="mb-0 ea-label-primary"
                    >
                      Issue Type
                    </label>
                    <div className="ea-select-wrapper">
                      <select
                        className="form-select"
                        id="Ticket_type"
                        name="Ticket_type"
                        value={formData.Ticket_type}
                        onChange={handleReportChange}
                        required
                      >
                        <option value="">-- Select Issue Type --</option>
                        {issueTypes.map((issue) => (
                          <option
                            style={{ color: "black" }}
                            key={issue.IssueId}
                            value={issue.Issue_Type}
                          >
                            {issue.Issue_Type}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="form-group d-flex col-md-6 col-sm-6 align-items-center ea-field">
                    <label
                      htmlFor="Ticket_type"
                      className="mb-0 ea-label-primary"
                    >
                      Category : 
                    </label>
                    {/* Category and Subcategory */}
                    <select
                      className="form-select mb-0"
                      id="Category"
                      name="Category"
                      value={formData.Category}
                      onChange={handleReportChange}
                      required
                    >
                      <option value="">-- Select Category --</option>
                      {categoryList.map((cat) => (
                        <option key={cat.Category} value={cat.CatId}>
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
                        onChange={handleReportChange}
                        required
                      >
                        <option value="">-- Select Sub-Category --</option>
                        {sub_CategoryOptions.map((sub) => (
                          <option key={sub.SubCategory} value={sub.SubCateId}>
                            {sub.SubCategory}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  <div className="form-group d-flex col-md-2 col-sm-6 align-items-center justify-content-end ea-field">
                    <button
                      onClick={handleExport}
                      className="btn btn-success ea-export-btn"
                      style={{ width: "200px" }}
                    >
                      Export to Excel
                    </button>
                  </div>
                </div>
              </div>
            </div>
            {loadingDetailed && (
              <div className="alert alert-info text-center mt-3">
                Loading detailed reports...
              </div>
            )}
            {errorMessageDetailed && (
              <div className="alert alert-danger text-center mt-3">
                {errorMessageDetailed}
              </div>
            )}
            {!loadingDetailed &&
            !errorMessageDetailed &&
            detailedTicketReport.length > 0 ? (
              <div className="table-responsive mt-3">
                <table className="table table-bordered table-striped">
                  <thead>
                    <tr>
                      <th>Ticket Number</th>
                      <th>Name</th>
                      <th>Created Date</th>
                      <th>Resolved Date</th>
                      <th>Designation</th>
                      <th>Mobile No</th>
                      <th>Department</th>
                      <th>Engineer Name</th>
                      <th>Priority</th>
                      <th>Category</th>
                      <th>Sub Category</th>
                      <th>Status</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailedTicketReport.map((data, index) => (
                      <tr key={data.TicketNoRandom || index}>
                        <td>{data.TicketNoRandom}</td>
                        <td>{data.name || data.UserName}</td>
                        <td>{new Date(data.Created_date).toLocaleString()}</td>
                        <td>
                          {data.ResolvedDate
                            ? new Date(data.ResolvedDate).toLocaleString()
                            : ""}
                        </td>
                        <td>{data.designation || data.Designation}</td>
                        <td>{data.mobile_no || data.Mobile_No}</td>
                        <td>{data.department || data.Department}</td>
                        <td>{data.Engineer_id}</td>
                        <td>{data.Levels}</td>
                        <td>{data.Category}</td>
                        <td>{data.Sub_Category}</td>
                        <td>{data.Status}</td>
                        <td>{data.Description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              !loadingDetailed &&
              !errorMessageDetailed &&
              detailedFromDate &&
              detailedToDate && (
                <div className="alert alert-warning text-center mt-3">
                  No ticket data available
                </div>
              )
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default ProjectCard;
