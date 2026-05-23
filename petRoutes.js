const express = require('express');
const router = express.Router();
const Pet = require('../models/Pet');

// CREATE - Add a new pet
router.post('/add', async (req, res) => {
    try {
        const pet = new Pet(req.body);
        await pet.save();
        res.status(201).json({ 
            success: true, 
            message: 'Pet added successfully!',
            data: pet 
        });
    } catch (error) {
        res.status(400).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// READ - Get all pets
router.get('/all', async (req, res) => {
    try {
        const pets = await Pet.find().sort({ createdAt: -1 });
        res.json({ 
            success: true, 
            count: pets.length,
            data: pets 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// READ - Get single pet by ID
router.get('/:id', async (req, res) => {
    try {
        const pet = await Pet.findById(req.params.id);
        if (!pet) {
            return res.status(404).json({ 
                success: false, 
                message: 'Pet not found' 
            });
        }
        res.json({ 
            success: true, 
            data: pet 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// UPDATE - Update pet
router.put('/:id', async (req, res) => {
    try {
        const pet = await Pet.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!pet) {
            return res.status(404).json({ 
                success: false, 
                message: 'Pet not found' 
            });
        }
        res.json({ 
            success: true, 
            message: 'Pet updated successfully!',
            data: pet 
        });
    } catch (error) {
        res.status(400).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// DELETE - Remove pet
router.delete('/:id', async (req, res) => {
    try {
        const pet = await Pet.findByIdAndDelete(req.params.id);
        if (!pet) {
            return res.status(404).json({ 
                success: false, 
                message: 'Pet not found' 
            });
        }
        res.json({ 
            success: true, 
            message: 'Pet deleted successfully!' 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

module.exports = router;