import React, { useState, useEffect } from "react";
import { useFile } from "../context/FileContext";

function FileDetailsModal({ file, onClose }) {
  const [details, setDetails] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("info");
  const { getFileDetails, getAuditLogs } = useFile();

  useEffect(() => {
    fetchDetails();
    fetchLogs();
  }, []);

  const fetchDetails = async () => {
    const result = await getFileDetails(file.id);
    if (result.success) {
      setDetails(result.data);
    } else {
      console.error("Error fetching file details:", result.error);
    }
    setLoading(false);
  };

  const fetchLogs = async () => {
    const result = await getAuditLogs(file.id);
    if (result.success) {
      setAuditLogs(result.data);
    } else {
      console.error("Error fetching audit logs:", result.error);
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
    if (!dateString) return "Never";
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  if (loading) {
    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <div
          className="bg-white rounded-2xl shadow-2xl p-8"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">File Details</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-3xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 px-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("info")}
              className={`${
                activeTab === "info"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              Information
            </button>
            <button
              onClick={() => setActiveTab("sharing")}
              className={`${
                activeTab === "sharing"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              Sharing
            </button>
            <button
              onClick={() => setActiveTab("activity")}
              className={`${
                activeTab === "activity"
                  ? "border-primary text-primary"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
            >
              Activity Log
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === "info" && details && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">Filename:</span>
                  <span className="text-gray-900">{details.filename}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">Type:</span>
                  <span className="text-gray-900">{details.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">Size:</span>
                  <span className="text-gray-900">
                    {formatFileSize(details.size)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">Uploaded:</span>
                  <span className="text-gray-900">
                    {formatDate(details.uploadedAt)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-700">Owner:</span>
                  <span className="text-gray-900">
                    {details.owner.username}
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "sharing" && details && (
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">
                  Shared with Users ({details.sharedWith.length})
                </h4>
                {details.sharedWith.length > 0 ? (
                  <div className="space-y-2">
                    {details.sharedWith.map((share, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <p className="font-semibold text-gray-900">
                          {share.user.username}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          Shared: {formatDate(share.sharedAt)}
                          {share.expiresAt &&
                            ` | Expires: ${formatDate(share.expiresAt)}`}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">
                    Not shared with any users
                  </p>
                )}
              </div>

              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">
                  Share Links ({details.shareLinks.length})
                </h4>
                {details.shareLinks.length > 0 ? (
                  <div className="space-y-3">
                    {details.shareLinks.map((link, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-600 mb-2">
                          Created: {formatDate(link.createdAt)}
                          {link.expiresAt &&
                            ` | Expires: ${formatDate(link.expiresAt)}`}
                        </p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            className="flex-1 px-3 py-2 text-sm bg-white border border-gray-300 rounded-lg"
                            value={link.url}
                            readOnly
                          />
                          <button
                            className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium px-4 py-2 rounded-lg text-sm transition-colors"
                            onClick={() => copyToClipboard(link.url)}
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">
                    No share links generated
                  </p>
                )}
              </div>
            </div>
          )}

          {activeTab === "activity" && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-3">
                Activity Log
              </h4>
              {auditLogs.length > 0 ? (
                <div className="space-y-2">
                  {auditLogs.map((log) => (
                    <div key={log._id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-semibold text-gray-900 uppercase text-sm">
                          {log.action.replace("_", " ")}
                        </span>
                        <span className="text-sm text-gray-500">
                          {formatDate(log.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        By: {log.user.username}
                        {log.details && ` | ${log.details}`}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No activity logged yet</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FileDetailsModal;
