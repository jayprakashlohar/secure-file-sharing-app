import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useFile } from "../context/FileContext";

const SharedFile = () => {
  const { linkId } = useParams();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { getSharedFile, downloadSharedFile } = useFile();

  useEffect(() => {
    fetchFileDetails();
  }, [linkId]);

  const fetchFileDetails = async () => {
    const result = await getSharedFile(linkId);
    if (result.success) {
      setFile(result.data);
    } else {
      setError(result.error || "Error loading file");
    }
    setLoading(false);
  };

  const handleDownload = async () => {
    const result = await downloadSharedFile(linkId, file.filename);
    if (!result.success) {
      alert(result.error || "Error downloading file");
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-gray-100">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
          <p className="mt-4 text-gray-600 font-medium">Loading file...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-gray-100 px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Access Error
          </h2>
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
          <button
            className="w-full btn-primary"
            onClick={() => navigate("/dashboard")}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-gray-100 px-4 py-12">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">📄</div>
          <h2 className="text-3xl font-bold text-gray-900">Shared File</h2>
        </div>

        <div className="bg-gray-50 rounded-xl p-6 space-y-4 mb-8">
          <div className="flex justify-between border-b border-gray-200 pb-3">
            <span className="font-semibold text-gray-700">Filename:</span>
            <span className="text-gray-900 text-right">{file.filename}</span>
          </div>
          <div className="flex justify-between border-b border-gray-200 pb-3">
            <span className="font-semibold text-gray-700">Type:</span>
            <span className="text-gray-900">{file.type}</span>
          </div>
          <div className="flex justify-between border-b border-gray-200 pb-3">
            <span className="font-semibold text-gray-700">Size:</span>
            <span className="text-gray-900">{formatFileSize(file.size)}</span>
          </div>
          <div className="flex justify-between border-b border-gray-200 pb-3">
            <span className="font-semibold text-gray-700">Uploaded:</span>
            <span className="text-gray-900">{formatDate(file.uploadedAt)}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-semibold text-gray-700">Owner:</span>
            <span className="text-gray-900">{file.owner}</span>
          </div>
        </div>

        <div className="flex gap-4">
          <button className="flex-1 btn-primary" onClick={handleDownload}>
            Download File
          </button>
          <button
            className="flex-1 btn-secondary"
            onClick={() => navigate("/dashboard")}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default SharedFile;
