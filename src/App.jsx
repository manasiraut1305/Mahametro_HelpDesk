import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminDashboard from "./components/admin/AdminDashboard";
import Login from "./components/Login";
import UserCheckStatus from "./components/user/UserCheckStatus";
import UserRaisedTicket from "./components/user/UserRaisedTicket";
import UserAssignedTicket from "./components/user/UserAssignedTicket";
import UserApprovedTicket from "./components/user/UserApprovedTicket";
import UserResolvedTicket from "./components/user/UserResolvedTicket";
import GenerateTicket from "./components/user/GenerateTicket";
import EngineerAssignedTicket from "./components/engineer/EngineerAssignedTicket";
import EngineerApprovedTicket from "./components/engineer/EngineerApprovedTicket";
import EngineerResolvedTicket from "./components/engineer/EngineerResolvedTicket";
import EngineerDashboardLayout from "./components/engineer/EngineerDashboardLayout";
import OperatorAddTicket from "./components/operator/OperatorAddTicket";
import ViewTicketDetails from "./components/operator/ViewTicketDetails";
import AdminRaisedTicket from "./components/admin/AdminRaisedTickets";
import AdminAssignedTicket from "./components/admin/AdminAssignedTickets";
import AdminApprovedTicket from "./components/admin/AdminApprovedTickets";
import AdminResolvedTicket from "./components/admin/AdminResolvedTickets";
import AdminCreateUser from "./components/admin/AdminCreateUser";
import AdminEditUser from "./components/admin/AdminEditUser";
import AdminIssueType from "./components/admin/AdminIssueType";
import AdminDashboardLayout from "./components/admin/AdminDashboardLayout";
import CategoryList from "./components/admin/CategoryList";
import AdminDepartmentTable from "./components/admin/AdminDepartmentTable";
import ForgotPassword from "./components/ForgotPassword";
import Sidebar from "./components/admin/Sidebar";
import UserDashboardLayout from "./components/user/UserDashboardLayout";
import ProjectCard from "./components/operator/ProjectCard";
import OperatorRaisedTicket from "./components/operator/OperatorRaisedTicket";
import OperatorAssignedTicket from "./components/operator/OperatorAssignedTicket";
import OperatorApprovedTicket from "./components/operator/OperatorApprovedTickets";
import OperatorResolvedTicket from "./components/operator/OperatorResolvedTicket";
import OperatorStat from "./components/operator/OperatorStat";
import OperatorDashboardLayout from "./components/operator/OperatorDashboardLayout";
import AdminUserStatus from "./components/admin/AdminUserStatus";
import EngineerStat from "./components/engineer/EngineerStat"
import UserStat from "./components/user/UserStat"
import EngineerForwardTickets from "./components/engineer/EngineerForwardTickets";
import AdminAssignHead from "./components/admin/AdminAssignHead";
import UserHead from "./components/user/UserHead";
import EngineerHead from "./components/engineer/EngineerHead";
import UserRejectedTicket from "./components/user/UserRejectedTicket";
import OperatorRejectedTickets from "./components/operator/OperatorRejectedTickets";
import EngineerGenerateTicket from "./components/engineer/EngineerGenerateTicket";
import EngineerAddTicket from "./components/engineer/EngineerAddTicket";
import WorkloadReport from "./components/operator/OperatorWorkloadReport";

function App() {
 

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/Login" element={<Login />} />
        <Route
          path="/components/admin/AdminDashboard"
          element={<AdminDashboard />}
        />
        <Route
          path="/components/user/GenerateTicket"
          element={<GenerateTicket />}
        />
        <Route
          path="/EngineerDashboardLayout"
          element={<EngineerDashboardLayout />}
        >
        <Route index element={<EngineerStat />} />
        </Route>
        <Route
          path="/components/operator/ViewTicketDetails"
          element={<ViewTicketDetails />}
        />

        <Route path="/ForgotPassword" element={<ForgotPassword />} />
        <Route path="/Sidebar" element={<Sidebar />} />

        <Route
          path="/EngineerDashboardLayout"
          element={<EngineerDashboardLayout />}
        >
          <Route
            path="EngineerAssignedTicket"
            element={<EngineerAssignedTicket />}
          />
          <Route
            path="EngineerApprovedTicket"
            element={<EngineerApprovedTicket />}
          />
          <Route
            path="EngineerResolvedTicket"
            element={<EngineerResolvedTicket />}
          />
          <Route
            path="EngineerHead"
            element={<EngineerHead />}
          />
          <Route
            path="EngineerForwardTickets"
            element={<EngineerForwardTickets />}
          />
          <Route
            path="EngineerAddTicket"
            element={<EngineerAddTicket />}
          />
        {/* </Route> */}
          <Route
            path="EngineerGenerateTicket"
            element={<EngineerGenerateTicket />}
          />
        </Route>

        <Route path="/UserDashboardLayout" element={<UserDashboardLayout />}>
         <Route index element={<UserStat />} />
          <Route path="UserRaisedTicket" element={<UserRaisedTicket />} />
          <Route path="UserAssignedTicket" element={<UserAssignedTicket />} />
          <Route path="UserApprovedTicket" element={<UserApprovedTicket />} />
          <Route path="UserResolvedTicket" element={<UserResolvedTicket />} />
          <Route path="UserRejectedTicket" element={<UserRejectedTicket />} />
          <Route path="UserCheckStatus" element={<UserCheckStatus />} />
          <Route path="UserHead" element={<UserHead />} />
          <Route path="GenerateTicket" element={<GenerateTicket />} />
        </Route>

        <Route
          path="/OperatorDashboardLayout"
          element={<OperatorDashboardLayout />}
        >
          <Route index element={<OperatorStat />} />
          <Route path="OperatorAddTicket" element={<OperatorAddTicket />} />
          <Route
            path="OperatorRaisedTicket"
            element={<OperatorRaisedTicket />}
          />
          <Route
            path="OperatorAssignedTicket"
            element={<OperatorAssignedTicket />}
          />
          <Route
            path="OperatorApprovedTicket"
            element={<OperatorApprovedTicket />}
          />
          <Route
            path="OperatorResolvedTicket"
            element={<OperatorResolvedTicket />}
          />
          <Route
            path="OperatorRejectedTicket"
            element={<OperatorRejectedTickets />}
          />
          <Route
            path="OperatorWorkloadReport"
            element={<WorkloadReport />}
          />
          <Route path="ProjectCard" element={<ProjectCard />} />
        </Route>

        <Route path="/AdminDashboardLayout" element={<AdminDashboardLayout />}>
          <Route path="AdminCreateUser" element={<AdminCreateUser />} />
          <Route path="AdminEditUser" element={<AdminEditUser />} />
          <Route path="AdminRaisedTicket" element={<AdminRaisedTicket />} />
          <Route path="AdminAssignedTicket" element={<AdminAssignedTicket />} />
          <Route path="AdminApprovedTicket" element={<AdminApprovedTicket />} />
          <Route path="AdminResolvedTicket" element={<AdminResolvedTicket />} />
          <Route path="CategoryList" element={<CategoryList />} />                             
          <Route path="AdminDepartmentTable" element={<AdminDepartmentTable />} />                             
          <Route path="AdminIssueType" element={<AdminIssueType />} />
          <Route path="AdminUserStatus" element={<AdminUserStatus />} />
          <Route path="AdminAssignHead" element={<AdminAssignHead />} />
          <Route path="ProjectCard" element={<ProjectCard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
