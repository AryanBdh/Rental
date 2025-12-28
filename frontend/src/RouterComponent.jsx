import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import HomeComponent from "./components/HomeComponent.jsx";
import AdminDashboard from "./components/Admin/AdminDashboard";
import AdminGuard from "./components/Admin/AdminGuard";
import AdminHome from "./components/Admin/AdminHome";
import UsersTable from "./components/Admin/UsersTable";
import ItemsList from "./components/Admin/ItemsList";
import CategoryPage from "./components/Admin/pages/Category";
import Browse from "./pages/Browse";
import Login from "./Auth/Login.jsx";
import Register from "./Auth/Register.jsx";
import ForgotPassword from "./Auth/ForgotPassword.jsx";
import ResetPassword from "./Auth/ResetPassword.jsx";
import ItemDetail from "./pages/ItemDetail.jsx";
import UserProfile from "./pages/UserProfile.jsx";
import AddItem from "./pages/AddItem.jsx";
import EditItem from "./pages/EditItem.jsx";

function RouterComponent() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<HomeComponent />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/item/:id" element={<ItemDetail />} />
        <Route path="/add-item" element={<AddItem />} />
        <Route path="/edit-item/:id" element={<EditItem />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route
          path="/bookings"
          element={<UserProfile defaultTab="bookings" />}
        />
        <Route
          path="/admin/*"
          element={
            <AdminGuard>
              <AdminDashboard />
            </AdminGuard>
          }
        >
          <Route index element={<AdminHome />} />
          <Route path="users" element={<UsersTable />} />
          <Route path="categories" element={<CategoryPage />} />
          <Route path="items" element={<ItemsList />} />
          <Route
            path="settings"
            element={<div className="p-4">Settings (placeholder)</div>}
          />
        </Route>
      </Routes>
    </div>
  );
}

export default RouterComponent;
