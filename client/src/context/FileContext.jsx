import React, { createContext, useContext, useState } from "react";
import axiosInstance from "../api/axios";

const FileContext = createContext();

export const useFile = () => {
  const context = useContext(FileContext);
  if (!context) {
    throw new Error("useFile must be used within a FileProvider");
  }
  return context;
};

export const FileProvider = ({ children }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch user's own files
  const fetchMyFiles = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/files/my-files");
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to fetch files",
      };
    } finally {
      setLoading(false);
    }
  };

  // Fetch files shared with the user
  const fetchSharedWithMe = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/files/shared-with-me");
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to fetch shared files",
      };
    } finally {
      setLoading(false);
    }
  };

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get("/files");
      setFiles(response.data);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to fetch files",
      };
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (formData, onProgress) => {
    try {
      const response = await axiosInstance.post("/files/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          if (onProgress) {
            onProgress(percentCompleted);
          }
        },
      });

      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Upload failed",
      };
    }
  };

  const downloadFile = async (fileId, filename) => {
    try {
      const response = await axiosInstance.get(`/files/${fileId}/download`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        filename || response.headers["x-filename"] || "download"
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Download failed",
      };
    }
  };

  const shareFile = async (fileId, shareData) => {
    try {
      const response = await axiosInstance.post(
        `/files/${fileId}/share`,
        shareData
      );
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Share failed",
      };
    }
  };

  const generateShareLink = async (fileId, linkData) => {
    try {
      const response = await axiosInstance.post(
        `/files/${fileId}/generate-link`,
        linkData
      );
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to generate link",
      };
    }
  };

  const getSharedFile = async (linkId) => {
    try {
      const response = await axiosInstance.get(`/files/shared/${linkId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to fetch shared file",
      };
    }
  };

  const downloadSharedFile = async (linkId, filename) => {
    try {
      const response = await axiosInstance.get(
        `/files/shared/${linkId}/download`,
        {
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        filename || response.headers["x-filename"] || "download"
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Download failed",
      };
    }
  };

  const getFileDetails = async (fileId) => {
    try {
      const response = await axiosInstance.get(`/files/${fileId}/details`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to fetch file details",
      };
    }
  };

  const getAuditLogs = async (fileId) => {
    try {
      const response = await axiosInstance.get(`/files/${fileId}/audit-logs`);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to fetch audit logs",
      };
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get("/auth/users");
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Failed to fetch users",
      };
    }
  };

  const value = {
    files,
    loading,
    fetchFiles,
    fetchMyFiles,
    fetchSharedWithMe,
    uploadFile,
    downloadFile,
    downloadSharedFile,
    shareFile,
    generateShareLink,
    getSharedFile,
    getFileDetails,
    getAuditLogs,
    fetchUsers,
  };

  return <FileContext.Provider value={value}>{children}</FileContext.Provider>;
};
