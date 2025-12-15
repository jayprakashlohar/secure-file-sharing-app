const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const File = require("../models/File");
const AuditLog = require("../models/AuditLog");

// Upload files
exports.uploadFiles = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const uploadedFiles = [];

    for (const file of req.files) {
      const newFile = new File({
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path,
        owner: req.user._id,
      });

      await newFile.save();

      // Create audit log
      await AuditLog.create({
        file: newFile._id,
        user: req.user._id,
        action: "upload",
        details: `Uploaded file: ${file.originalname}`,
        ipAddress: req.ip,
      });

      uploadedFiles.push({
        id: newFile._id,
        filename: newFile.originalName,
        type: newFile.mimetype,
        size: newFile.size,
        uploadedAt: newFile.uploadedAt,
      });
    }

    res.status(201).json({
      message: "Files uploaded successfully",
      files: uploadedFiles,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: "Error uploading files" });
  }
};

// Get user's files
exports.getMyFiles = async (req, res) => {
  try {
    const files = await File.find({ owner: req.user._id })
      .sort({ uploadedAt: -1 })
      .select("-path");

    const formattedFiles = files.map((file) => ({
      id: file._id,
      filename: file.originalName,
      type: file.mimetype,
      size: file.size,
      uploadedAt: file.uploadedAt,
      sharedWith: file.sharedWith.length,
      shareLinks: file.shareLinks.filter((link) => link.isActive).length,
    }));

    res.json(formattedFiles);
  } catch (error) {
    console.error("Error fetching files:", error);
    res.status(500).json({ message: "Error fetching files" });
  }
};

// Get files shared with user
exports.getSharedWithMe = async (req, res) => {
  try {
    const now = new Date();

    const files = await File.find({
      "sharedWith.user": req.user._id,
      "sharedWith.expiresAt": { $gt: now },
    }).populate("owner", "username email");

    const formattedFiles = files.map((file) => ({
      id: file._id,
      filename: file.originalName,
      type: file.mimetype,
      size: file.size,
      uploadedAt: file.uploadedAt,
      owner: file.owner.username,
    }));

    res.json(formattedFiles);
  } catch (error) {
    console.error("Error fetching shared files:", error);
    res.status(500).json({ message: "Error fetching shared files" });
  }
};

// Share file with specific users
exports.shareFile = async (req, res) => {
  try {
    const { userIds, expiryHours } = req.body;
    const file = await File.findById(req.params.fileId);

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    // Check if user is the owner
    if (file.owner.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You do not have permission to share this file" });
    }

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res
        .status(400)
        .json({ message: "Please provide user IDs to share with" });
    }

    // Calculate expiry date if provided
    let expiresAt = null;
    if (expiryHours && expiryHours > 0) {
      expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000);
    }

    // Add users to sharedWith array (avoid duplicates)
    for (const userId of userIds) {
      const existingShare = file.sharedWith.find(
        (share) => share.user.toString() === userId
      );

      if (!existingShare) {
        file.sharedWith.push({
          user: userId,
          sharedAt: new Date(),
          expiresAt,
        });

        // Create audit log
        await AuditLog.create({
          file: file._id,
          user: req.user._id,
          action: "share_user",
          details: `Shared with user: ${userId}`,
          ipAddress: req.ip,
        });
      }
    }

    await file.save();

    res.json({
      message: "File shared successfully",
      sharedWith: file.sharedWith.length,
    });
  } catch (error) {
    console.error("Share error:", error);
    res.status(500).json({ message: "Error sharing file" });
  }
};

// Generate share link for a file
exports.generateShareLink = async (req, res) => {
  try {
    const { expiryHours } = req.body;
    const file = await File.findById(req.params.fileId);

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    // Check if user is the owner
    if (file.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "You do not have permission to generate link for this file",
      });
    }

    // Calculate expiry date if provided
    let expiresAt = null;
    if (expiryHours && expiryHours > 0) {
      expiresAt = new Date(Date.now() + expiryHours * 60 * 60 * 1000);
    }

    // Generate unique link ID
    const linkId = uuidv4();

    file.shareLinks.push({
      linkId,
      createdAt: new Date(),
      expiresAt,
      isActive: true,
    });

    await file.save();

    // Create audit log
    await AuditLog.create({
      file: file._id,
      user: req.user._id,
      action: "share_link",
      details: `Generated share link: ${linkId}`,
      ipAddress: req.ip,
    });

    const shareUrl = `${process.env.CLIENT_URL}/shared/${linkId}`;

    res.json({
      message: "Share link generated successfully",
      shareUrl,
      linkId,
      expiresAt,
    });
  } catch (error) {
    console.error("Generate link error:", error);
    res.status(500).json({ message: "Error generating share link" });
  }
};

// Access shared file via link
exports.accessSharedFile = async (req, res) => {
  try {
    const { linkId } = req.params;
    const file = await File.findOne({ "shareLinks.linkId": linkId }).populate(
      "owner",
      "username email"
    );

    if (!file) {
      return res
        .status(404)
        .json({ message: "File not found or link is invalid" });
    }

    // Find the specific link
    const shareLink = file.shareLinks.find((link) => link.linkId === linkId);

    if (!shareLink || !shareLink.isActive) {
      return res
        .status(403)
        .json({ message: "This share link is no longer active" });
    }

    // Check if link has expired
    if (shareLink.expiresAt && shareLink.expiresAt < new Date()) {
      // Create audit log for expired link
      await AuditLog.create({
        file: file._id,
        user: req.user._id,
        action: "link_expired",
        details: `Attempted to access expired link: ${linkId}`,
        ipAddress: req.ip,
      });

      return res.status(403).json({ message: "This share link has expired" });
    }

    res.json({
      id: file._id,
      filename: file.originalName,
      type: file.mimetype,
      size: file.size,
      uploadedAt: file.uploadedAt,
      owner: file.owner.username,
    });
  } catch (error) {
    console.error("Access link error:", error);
    res.status(500).json({ message: "Error accessing shared file" });
  }
};

// Download file
exports.downloadFile = async (req, res) => {
  try {
    const file = await File.findById(req.params.fileId);

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    const now = new Date();

    // Check if user has permission to download
    const isOwner = file.owner.toString() === req.user._id.toString();
    const isSharedWith = file.sharedWith.some((share) => {
      const hasAccess = share.user.toString() === req.user._id.toString();
      const notExpired = !share.expiresAt || share.expiresAt > now;
      return hasAccess && notExpired;
    });

    if (!isOwner && !isSharedWith) {
      // Create audit log for denied access
      await AuditLog.create({
        file: file._id,
        user: req.user._id,
        action: "access_denied",
        details: "Attempted to download without permission",
        ipAddress: req.ip,
      });

      return res
        .status(403)
        .json({ message: "You do not have permission to download this file" });
    }

    // Check if file exists on disk
    if (!fs.existsSync(file.path)) {
      return res.status(404).json({ message: "File not found on server" });
    }

    // Create audit log
    await AuditLog.create({
      file: file._id,
      user: req.user._id,
      action: "download",
      details: `Downloaded file: ${file.originalName}`,
      ipAddress: req.ip,
    });

    res.download(file.path, file.originalName);
  } catch (error) {
    console.error("Download error:", error);
    res.status(500).json({ message: "Error downloading file" });
  }
};

// Download file via share link
exports.downloadSharedFile = async (req, res) => {
  try {
    const { linkId } = req.params;
    const file = await File.findOne({ "shareLinks.linkId": linkId });

    if (!file) {
      return res
        .status(404)
        .json({ message: "File not found or link is invalid" });
    }

    // Find the specific link
    const shareLink = file.shareLinks.find((link) => link.linkId === linkId);

    if (!shareLink || !shareLink.isActive) {
      return res
        .status(403)
        .json({ message: "This share link is no longer active" });
    }

    // Check if link has expired
    if (shareLink.expiresAt && shareLink.expiresAt < new Date()) {
      await AuditLog.create({
        file: file._id,
        user: req.user._id,
        action: "link_expired",
        details: `Attempted to download via expired link: ${linkId}`,
        ipAddress: req.ip,
      });

      return res.status(403).json({ message: "This share link has expired" });
    }

    // Check if file exists on disk
    if (!fs.existsSync(file.path)) {
      return res.status(404).json({ message: "File not found on server" });
    }

    // Create audit log
    await AuditLog.create({
      file: file._id,
      user: req.user._id,
      action: "download",
      details: `Downloaded via share link: ${file.originalName}`,
      ipAddress: req.ip,
    });

    res.download(file.path, file.originalName);
  } catch (error) {
    console.error("Download error:", error);
    res.status(500).json({ message: "Error downloading file" });
  }
};

// Get file details
exports.getFileDetails = async (req, res) => {
  try {
    const file = await File.findById(req.params.fileId)
      .populate("sharedWith.user", "username email")
      .populate("owner", "username email");

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    // Check if user has permission
    const isOwner = file.owner._id.toString() === req.user._id.toString();
    if (!isOwner) {
      return res
        .status(403)
        .json({ message: "You do not have permission to view file details" });
    }

    res.json({
      id: file._id,
      filename: file.originalName,
      type: file.mimetype,
      size: file.size,
      uploadedAt: file.uploadedAt,
      owner: file.owner,
      sharedWith: file.sharedWith.map((share) => ({
        user: share.user,
        sharedAt: share.sharedAt,
        expiresAt: share.expiresAt,
      })),
      shareLinks: file.shareLinks
        .filter((link) => link.isActive)
        .map((link) => ({
          linkId: link.linkId,
          url: `${process.env.CLIENT_URL}/shared/${link.linkId}`,
          createdAt: link.createdAt,
          expiresAt: link.expiresAt,
        })),
    });
  } catch (error) {
    console.error("Error fetching file details:", error);
    res.status(500).json({ message: "Error fetching file details" });
  }
};

// Get audit logs for a file
exports.getAuditLogs = async (req, res) => {
  try {
    const file = await File.findById(req.params.fileId);

    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    // Check if user is the owner
    if (file.owner.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "You do not have permission to view audit logs" });
    }

    const logs = await AuditLog.find({ file: file._id })
      .populate("user", "username email")
      .sort({ timestamp: -1 })
      .limit(100);

    res.json(logs);
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    res.status(500).json({ message: "Error fetching audit logs" });
  }
};
