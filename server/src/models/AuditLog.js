const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    file: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "File",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      enum: [
        "upload",
        "download",
        "share_user",
        "share_link",
        "access_denied",
        "link_expired",
      ],
      required: true,
    },
    details: {
      type: String,
    },
    ipAddress: {
      type: String,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index
auditLogSchema.index({ file: 1, timestamp: -1 });
auditLogSchema.index({ user: 1, timestamp: -1 });

module.exports = mongoose.model("AuditLog", auditLogSchema);
