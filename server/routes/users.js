const express = require('express');
const mongoose = require('mongoose');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get current user profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile'
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const { name, phone, dateOfBirth, preferences } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        ...(name && { name }),
        ...(phone && { phone }),
        ...(dateOfBirth && { dateOfBirth: new Date(dateOfBirth) }),
        ...(preferences && { preferences })
      },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile'
    });
  }
});

// @route   GET /api/users/saved-destinations
// @desc    Get user's saved destinations
// @access  Private
router.get('/saved-destinations', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      success: true,
      savedDestinations: user.savedDestinations
    });
  } catch (error) {
    console.error('Get saved destinations error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching saved destinations'
    });
  }
});

// @route   POST /api/users/saved-destinations
// @desc    Add saved destination
// @access  Private
router.post('/saved-destinations', protect, async (req, res) => {
  try {
    const { name, lat, lng } = req.body;
    const parsedLat = typeof lat === "number" ? lat : (typeof lat === "string" && lat.trim() !== "" ? Number(lat) : null);
    const parsedLng = typeof lng === "number" ? lng : (typeof lng === "string" && lng.trim() !== "" ? Number(lng) : null);
    if (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 80 ||
        parsedLat === null || !Number.isFinite(parsedLat) || parsedLat < -90 || parsedLat > 90 ||
        parsedLng === null || !Number.isFinite(parsedLng) || parsedLng < -180 || parsedLng > 180 ||
        (typeof lat === "string" && !/^[+-]?((\d+(\.\d*)?)|(\.\d+))$/.test(lat.trim())) ||
        (typeof lng === "string" && !/^[+-]?((\d+(\.\d*)?)|(\.\d+))$/.test(lng.trim()))) {
      return res.status(400).json({
        success: false,
        message: 'Name and valid latitude/longitude values are required'
      });
    }

    const user = await User.findById(req.user.id);
    user.savedDestinations.push({
      name: name.trim(),
      coordinates: { lat: parsedLat, lng: parsedLng }
    });
    await user.save();

    res.json({
      success: true,
      message: 'Destination saved successfully',
      savedDestinations: user.savedDestinations
    });
  } catch (error) {
    console.error('Add saved destination error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving destination'
    });
  }
});

// @route   DELETE /api/users/saved-destinations/:id
// @desc    Remove saved destination
// @access  Private
router.delete('/saved-destinations/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.savedDestinations = user.savedDestinations.filter(
      dest => dest._id.toString() !== req.params.id
    );
    await user.save();

    res.json({
      success: true,
      message: 'Destination removed successfully',
      savedDestinations: user.savedDestinations
    });
  } catch (error) {
    console.error('Remove saved destination error:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing destination'
    });
  }
});

// Admin routes
// @route   GET /api/users
// @desc    Get all users (Admin only)
// @access  Private/Admin
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query;
    if (!/^\d+$/.test(String(page)) || !/^\d+$/.test(String(limit))) {
      return res.status(400).json({ success: false, message: 'Invalid pagination parameters' });
    }
    const pageNumber = Number(page);
    const limitNumber = Number(limit);
    if (pageNumber < 1 || limitNumber < 1 || limitNumber > 50) {
      return res.status(400).json({ success: false, message: 'Invalid pagination parameters' });
    }
    if (search !== undefined &&
        (typeof search !== 'string' || search.length > 100)) {
      return res.status(400).json({ success: false, message: 'Invalid search term' });
    }
    
    const filter = {};
    if (search) {
      const escapedSearch = String(search).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { name: { $regex: escapedSearch, $options: 'i' } },
        { email: { $regex: escapedSearch, $options: 'i' } }
      ];
    }

    const skip = (pageNumber - 1) * limitNumber;

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber);

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      count: users.length,
      total,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        hasNext: skip + users.length < total,
        hasPrev: parseInt(page) > 1
      },
      users
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users'
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID (Admin only)
// @access  Private/Admin
router.get('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user'
    });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user (Admin only)
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid user ID' });
    }
    const allowedFields = ['name', 'phone', 'dateOfBirth', 'role', 'isActive', 'preferences'];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields provided' });
    }
    if (updates.role && !['user', 'admin', 'superadmin'].includes(updates.role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }
    if (updates.isActive !== undefined && typeof updates.isActive !== 'boolean') {
      return res.status(400).json({ success: false, message: 'isActive must be a boolean' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User updated successfully',
      user
    });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user'
    });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user (Admin only)
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user'
    });
  }
});

module.exports = router;
