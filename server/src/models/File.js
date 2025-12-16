const mongoose = require("mongoose");

const fileSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    mimetype: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    path: {
      type: String,
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sharedWith: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        sharedAt: {
          type: Date,
          default: Date.now,
        },
        expiresAt: {
          type: Date,
          default: null,
        },
      },
    ],
    shareLinks: [
      {
        linkId: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        expiresAt: {
          type: Date,
          default: null,
        },
        isActive: {
          type: Boolean,
          default: true,
        },
      },
    ],
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Index for queries
fileSchema.index({ owner: 1, uploadedAt: -1 });
fileSchema.index({ "sharedWith.user": 1 });
fileSchema.index({ "shareLinks.linkId": 1 }, { sparse: true });

module.exports = mongoose.model("File", fileSchema);
