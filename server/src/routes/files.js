const express = require("express");
const router = express.Router();
const fileController = require("../controllers/fileController");
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");

router.post(
  "/upload",
  auth,
  upload.array("files", 10),
  fileController.uploadFiles
);

router.get("/my-files", auth, fileController.getMyFiles);
router.get("/shared-with-me", auth, fileController.getSharedWithMe);
router.post("/:fileId/share", auth, fileController.shareFile);
router.post("/:fileId/generate-link", auth, fileController.generateShareLink);
router.get("/shared/:linkId", auth, fileController.accessSharedFile);
router.get("/:fileId/download", auth, fileController.downloadFile);
router.get("/shared/:linkId/download", auth, fileController.downloadSharedFile);
router.get("/:fileId/details", auth, fileController.getFileDetails);
router.get("/:fileId/audit-logs", auth, fileController.getAuditLogs);

module.exports = router;
