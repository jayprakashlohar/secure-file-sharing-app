import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useFile } from "../context/FileContext";

function ShareModal({ file, onClose, onSuccess }) {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [expiryHours, setExpiryHours] = useState("");
  const [shareLink, setShareLink] = useState("");
  const [linkExpiryHours, setLinkExpiryHours] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { user: currentUser } = useAuth();
  const { fetchUsers: getUsers, shareFile, generateShareLink } = useFile();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const result = await getUsers();
    if (result.success) {
      // Filter out current user
      const otherUsers = result.data.filter((u) => u._id !== currentUser.id);
      setUsers(otherUsers);
    } else {
      console.error("Error fetching users:", result.error);
    }
  };

  const handleUserSelect = (e) => {
    const userId = e.target.value;
    if (userId && !selectedUsers.includes(userId)) {
      setSelectedUsers([...selectedUsers, userId]);
    }
    e.target.value = "";
  };

  const removeUser = (userId) => {
    setSelectedUsers(selectedUsers?.filter((id) => id !== userId));
  };

  const handleShareWithUsers = async () => {
    if (selectedUsers.length === 0) {
      setError("Please select at least one user");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    const result = await shareFile(file.id, {
      userIds: selectedUsers,
      expiryHours: expiryHours ? parseInt(expiryHours) : null,
    });

    setLoading(false);

    if (result.success) {
      setSuccess("File shared successfully!");
      setSelectedUsers([]);
      setExpiryHours("");
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } else {
      setError(result.error || "Error sharing file");
    }
  };

  const handleGenerateLink = async () => {
    setLoading(true);
    setError("");

    const result = await generateShareLink(file.id, {
      expiryHours: linkExpiryHours ? parseInt(linkExpiryHours) : null,
    });

    setLoading(false);

    if (result.success) {
      setShareLink(result.data.shareUrl);
      setSuccess("Share link generated successfully!");
    } else {
      setError(result.error || "Error generating link");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    setSuccess("Link copied to clipboard!");
    setTimeout(() => setSuccess(""), 2000);
  };

  const getUserName = (userId) => {
    const user = users.find((u) => u._id === userId);
    return user ? user.username : userId;
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">
            Share: {file.filename}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-3xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
              {success}
            </div>
          )}

          {/* Share with Specific Users */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900">
              Share with Specific Users
            </h4>

            <select className="input-field" onChange={handleUserSelect}>
              <option value="">Select a user...</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.username} ({user.email})
                </option>
              ))}
            </select>

            {selectedUsers.length > 0 && (
              <div>
                <p className="font-medium text-gray-700 mb-2">
                  Selected Users:
                </p>
                <div className="space-y-2">
                  {selectedUsers?.map((userId) => (
                    <div
                      key={userId}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="text-gray-900">
                        {getUserName(userId)}
                      </span>
                      <button
                        className="text-red-600 hover:text-red-800 font-medium text-sm"
                        onClick={() => removeUser(userId)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Access Duration (Optional)
              </label>
              <div className="relative">
                <input
                  type="number"
                  className="input-field pr-16"
                  placeholder="Enter hours (e.g., 24, 72, 168)"
                  value={expiryHours}
                  onChange={(e) => setExpiryHours(e.target.value)}
                  min="1"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                  hours
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                💡 Leave empty for permanent access. Examples: 24 = 1 day, 168 =
                1 week
              </p>
            </div>

            <button
              className="w-full btn-primary"
              onClick={handleShareWithUsers}
              disabled={loading || selectedUsers.length === 0}
            >
              {loading ? "Sharing..." : "Share with Selected Users"}
            </button>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200"></div>

          {/* Generate Share Link */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-gray-900">
              Generate Share Link
            </h4>
            <p className="text-sm text-gray-600">
              Anyone with an account and this link can access the file
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Link Expiration (Optional)
              </label>
              <div className="relative">
                <input
                  type="number"
                  className="input-field pr-16"
                  placeholder="Enter hours (e.g., 24, 72, 168)"
                  value={linkExpiryHours}
                  onChange={(e) => setLinkExpiryHours(e.target.value)}
                  min="1"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                  hours
                </span>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                💡 Leave empty for permanent link. Examples: 24 = 1 day, 168 = 1
                week
              </p>
            </div>

            <button
              className="w-full btn-primary"
              onClick={handleGenerateLink}
              disabled={loading}
            >
              {loading ? "Generating..." : "Generate Link"}
            </button>

            {shareLink && (
              <div className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 input-field bg-gray-50"
                  value={shareLink}
                  readOnly
                />
                <button
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium px-4 py-2 rounded-lg transition-colors"
                  onClick={copyToClipboard}
                >
                  Copy
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShareModal;
