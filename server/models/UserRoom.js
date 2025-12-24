// UserRoom.js - Make sure it looks like this
const mongoose = require("mongoose");

const UserRoomSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  roomId: { 
    type: String, 
      // ✅ This should reference the Room model
    required: true 
  },
  joinedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Add index to prevent duplicate joins
UserRoomSchema.index({ userId: 1, roomId: 1 }, { unique: true });

module.exports = mongoose.model("UserRoom", UserRoomSchema);
