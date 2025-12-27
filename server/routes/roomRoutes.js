const express = require("express");
const Room = require("../models/Room");
const UserRoom = require("../models/UserRoom");

const router = express.Router();

// Create a new room
router.post('/create', async (req, res) => {
  try {
    console.log('📦 Received request body:', req.body);

    // Extract data from request body (NOT from req.user)
    const { name, description, roomId, createdBy } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({ error: 'Room name is required' });
    }

    if (!roomId) {
      return res.status(400).json({ error: 'Room ID is required' });
    }

    if (!createdBy) {
      return res.status(400).json({ error: 'Created by user ID is required' });
    }

    // Create new room
    const newRoom = new Room({
      name: name,
      description: description || '',
      roomId: roomId,
      createdBy: createdBy // Use createdBy from request body
    });

    // Save to database
    const savedRoom = await newRoom.save();
    
    console.log('✅ Room created successfully:', savedRoom);

    res.status(201).json({
      success: true,
      message: 'Room created successfully',
      room: savedRoom
    });

  } catch (error) {
    console.error('❌ Error creating room:', error);
    
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation error',
        details: error.message
      });
    }

    // Handle duplicate key error (if roomId should be unique)
    if (error.code === 11000) {
      return res.status(400).json({
        error: 'Room ID already exists'
      });
    }

    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Join a room
// router.post("/join", async (req, res) => {
//   try {
//     const { userId, roomId } = req.body;

//     // prevent duplicate joins
//     const exists = await UserRoom.findOne({  roomId });
//     if (exists) return res.status(400).json({ message: "Already joined" });

//     const userRoom = new UserRoom({ userId, roomId });
//     await userRoom.save();

//     res.status(201).json(userRoom);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// ✅ OPTIONAL: Add duplicate join prevention back
router.post("/join", async (req, res) => {
  try {
   // console.log("📦 Join request data:", req.body);
    const { userId, roomId } = req.body;

    // Validate required fields
    if (!userId || !roomId) {
      return res.status(400).json({ error: 'userId and roomId are required' });
    }

    // Check if user already joined this room
    const existingJoin = await UserRoom.findOne({ userId, roomId });
    if (existingJoin) {
      return res.status(200).json({ message: "Already joined this room" });
    }

    const userRoom = new UserRoom({ userId, roomId });
    await userRoom.save();
    
   // console.log("✅ UserRoom entry created successfully");
    res.status(201).json({ message: "Room joined successfully" });
  } catch (err) {
    console.error("❌ Error joining room:", err);
    res.status(500).json({ error: err.message });
  }
});


// Get recent rooms for a user

router.get("/recent/:userId", async (req, res) => {
  try {
    const { userId } = req.params; // Get from URL params, not body

   // console.log('📦 Getting recent rooms for userId:', userId);

    const userRooms = await UserRoom.find({ userId })
      .sort({ joinedAt: -1 })
      .limit(10);

   // console.log('📋 Found userRooms:', userRooms);

    const roomPromises = userRooms.map(async (ur) => {
      const room = await Room.findOne({ roomId: ur.roomId });
      if (!room) return null;
      return {
        _id: room._id,
        name: room.name,
        description: room.description,
        roomId: room.roomId,
        joinedAt: ur.joinedAt
      };
    });

    const rooms = await Promise.all(roomPromises);
    const validRooms = rooms.filter(room => room !== null);
    
    res.json(validRooms);
  } catch (err) {
  //  console.error('❌ Error getting recent rooms:', err);
    res.status(500).json({ error: err.message });
  }
});



module.exports = router;
