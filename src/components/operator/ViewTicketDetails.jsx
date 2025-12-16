import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Button from "react-bootstrap/Button";

const ViewTicketDetails = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const ticket = state?.ticket;

  if (!ticket) return <div className="p-4 text-danger">No ticket selected</div>;

  return (
    <div className="container mt-4">
      <h4 className="mb-4">Ticket Details</h4>
      <table className="table table-bordered">
        <tbody>
          <tr>
            <th>User Name</th>
            <td>{ticket.UserName}</td>
          </tr>
          <tr>
            <th>Email</th>
            <td>{ticket.Email}</td>
          </tr>
          <tr>
            <th>Mobile</th>
            <td>{ticket.Mobile_No}</td>
          </tr>
          <tr>
            <th>Department</th>
            <td>
              {Array.isArray(ticket.Department)
                ? ticket.Department.join(", ")
                : ticket.Department}
            </td>
          </tr>
          <tr>
            <th>Generation Date</th>
            <td>{new Date(ticket.Created_date).toLocaleString()}</td>
          </tr>
          <tr>
            <th>Status</th>
            <td>{ticket.Status}</td>
          </tr>

          <tr>
            <th>Ticket Type</th>
            <td>{ticket.Ticket_type}</td>
          </tr>
          <tr>
            <th>Description</th>
            <td>{ticket.Description}</td>
          </tr>
          <tr>
            <th>Image</th>
            <td>
              {ticket.ImageUrl ? (
                <>
                  <a
                    href={ticket.ImageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Full Image
                  </a>
                  <br />
                  <img
                    src={ticket.ImageUrl}
                    alt="Ticket"
                    style={{
                      maxWidth: "50%",
                      height: "50%",
                      marginTop: "10px",
                    }}
                  />
                </>
              ) : (
                "No image provided"
              )}
            </td>
          </tr>
        </tbody>
      </table>
      <Button variant="secondary" onClick={() => navigate(-1)}>
        Go Back
      </Button>
    </div>
  );
};

export default ViewTicketDetails;
