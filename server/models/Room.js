const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Room name is required'],
    trim: true,
    maxlength: [100, 'Room name cannot exceed 100 characters']
  },
  description: { 
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: [true, 'Created by user is required']
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  roomId: { 
    type: String, 
    required: [true, 'Room ID is required'],
    unique: true,
    trim: true
  }
});


module.exports = mongoose.model("Room", RoomSchema);
