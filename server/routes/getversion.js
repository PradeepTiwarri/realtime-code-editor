const express = require("express");
const DocumentVersion = require("../models/DocumentVersion");
const Document = require("../models/Document"); // ✅ import Document
const router = express.Router();

// Get all versions for a room
router.get("/:roomId", async (req, res) => {
  try {
    const versions = await DocumentVersion.find({ roomId: req.params.roomId })
      .sort({ createdAt: -1 });
    res.json({ versions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch versions" });
  }
});

// Restore a version
router.post("/restore", async (req, res) => {
  try {
    const { roomId, versionId } = req.body;
    const version = await DocumentVersion.findById(versionId);
    if (!version) return res.status(404).json({ error: "Version not found" });

    await Document.findOneAndUpdate(
      { roomId },
      { $set: { code: version.code, updatedAt: new Date() } },
      { upsert: true }
    );

    // ✅ Update memory cache via app.locals
    if (!req.app.locals.roomCodeMap) req.app.locals.roomCodeMap = {};
    req.app.locals.roomCodeMap[roomId] = version.code;

    // ✅ Notify all users in the room (if Socket.IO instance is stored in app.locals)
    if (req.app.locals.io) {
      req.app.locals.io.to(roomId).emit("CODE_CHANGE", { code: version.code });
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to restore version" });
  }
});

module.exports = router;
