import React from "react";

function FilesList({
  files,
  loading,
  onDownload,
  onShare,
  onViewDetails,
  isOwner,
}) {
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  const getFileIcon = (mimetype) => {
    if (mimetype.startsWith("image/")) return "🖼️";
    if (mimetype === "application/pdf") return "📄";
    if (mimetype.includes("spreadsheet") || mimetype.includes("csv"))
      return "📊";
    if (mimetype.includes("document")) return "📝";
    return "📁";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-primary"></div>
          <p className="mt-4 text-gray-600">Loading files...</p>
        </div>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md p-12">
        <div className="text-center">
          <div className="text-6xl mb-4">📂</div>
          <h4 className="text-xl font-semibold text-gray-900 mb-2">
            No files yet
          </h4>
          <p className="text-gray-600">
            {isOwner
              ? "Upload your first file to get started"
              : "No files have been shared with you"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          {isOwner ? "Your Files" : "Files Shared with You"}
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Size
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              {!isOwner && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Owner
                </th>
              )}
              {isOwner && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Shared
                </th>
              )}
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {files.map((file) => (
              <tr key={file.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">
                      {getFileIcon(file.type)}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {file.filename}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-600">
                    {file.type.split("/")[1]?.toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {formatFileSize(file.size)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {formatDate(file.uploadedAt)}
                </td>
                {!isOwner && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {file.owner}
                  </td>
                )}
                {isOwner && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {file.sharedWith > 0 && `${file.sharedWith} user(s)`}
                    {file.shareLinks > 0 && ` ${file.shareLinks} link(s)`}
                    {file.sharedWith === 0 &&
                      file.shareLinks === 0 &&
                      "Not shared"}
                  </td>
                )}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => onDownload(file.id, file.filename)}
                      className="bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1 rounded-lg transition-colors"
                    >
                      Download
                    </button>
                    {isOwner && onShare && (
                      <button
                        onClick={() => onShare(file)}
                        className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1 rounded-lg transition-colors"
                      >
                        Share
                      </button>
                    )}
                    {isOwner && onViewDetails && (
                      <button
                        onClick={() => onViewDetails(file)}
                        className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-3 py-1 rounded-lg transition-colors"
                      >
                        Details
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default FilesList;
