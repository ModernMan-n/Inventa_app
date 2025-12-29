import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import Home from "./pages/Home";
import AppPage from "./pages/BarCodePage";
import Admin from "./pages/Admin";
import Dashboard from "./pages/Dashboard";
import Documents from "./pages/Documents";
import DocumentsTable from "./pages/DocumentsTable";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/app" element={<AppPage />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/docs" element={<Documents />} />
        <Route path="/dashboard/docs/:table" element={<DocumentsTable />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
