import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useFile } from "../context/FileContext";
import FileUpload from "../components/FileUpload";
import FilesList from "../components/FilesList";
import ShareModal from "../components/ShareModal";
import FileDetailsModal from "../components/FileDetailsModal";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("my-files");
  const [myFiles, setMyFiles] = useState([]);
  const [sharedFiles, setSharedFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { fetchMyFiles, fetchSharedWithMe, downloadFile, loading } = useFile();

  useEffect(() => {
    fetchFiles();
  }, [activeTab, refreshTrigger]);

  const fetchFiles = async () => {
    try {
      if (activeTab === "my-files") {
        const result = await fetchMyFiles();
        if (result.success) {
          setMyFiles(result.data);
        } else {
          console.error("Error fetching files:", result.error);
        }
      } else {
        const result = await fetchSharedWithMe();
        if (result.success) {
          setSharedFiles(result.data);
        } else {
          console.error("Error fetching shared files:", result.error);
        }
      }
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleDownload = async (fileId, filename) => {
    const result = await downloadFile(fileId, filename);
    if (!result.success) {
      alert(result.error || "Error downloading file");
    }
  };

  const handleShare = (file) => {
    setSelectedFile(file);
    setShareModalOpen(true);
  };

  const handleViewDetails = (file) => {
    setSelectedFile(file);
    setDetailsModalOpen(true);
  };

  const handleUploadSuccess = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleShareSuccess = () => {
    setShareModalOpen(false);
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                <span className="text-primary">📁</span> Secure File Sharing
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                Welcome, <span className="font-semibold">{user?.name}</span>!
              </span>
              <button
                onClick={handleLogout}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("my-files")}
                className={`${
                  activeTab === "my-files"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                My Files
              </button>
              <button
                onClick={() => setActiveTab("shared")}
                className={`${
                  activeTab === "shared"
                    ? "border-primary text-primary"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
              >
                Shared with Me
              </button>
            </nav>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === "my-files" && (
          <div className="space-y-8">
            <FileUpload onUploadSuccess={handleUploadSuccess} />
            <FilesList
              files={myFiles}
              loading={loading}
              onDownload={handleDownload}
              onShare={handleShare}
              onViewDetails={handleViewDetails}
              isOwner={true}
            />
          </div>
        )}

        {activeTab === "shared" && (
          <FilesList
            files={sharedFiles}
            loading={loading}
            onDownload={handleDownload}
            isOwner={false}
          />
        )}
      </div>

      {/* Modals */}
      {shareModalOpen && selectedFile && (
        <ShareModal
          file={selectedFile}
          onClose={() => setShareModalOpen(false)}
          onSuccess={handleShareSuccess}
        />
      )}

      {detailsModalOpen && selectedFile && (
        <FileDetailsModal
          file={selectedFile}
          onClose={() => setDetailsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
