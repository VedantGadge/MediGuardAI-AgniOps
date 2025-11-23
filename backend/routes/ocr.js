const express = require('express');
const router = express.Router();
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

// Configure multer for memory storage
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// OCR Extract Route
router.post('/extract', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file uploaded' });
        }

        // Create form data for the external API
        const formData = new FormData();
        formData.append('image', req.file.buffer, {
            filename: req.file.originalname,
            contentType: req.file.mimetype,
        });

        // Call the external OCR API
        // Using the endpoint provided by the user
        const response = await axios.post(
            'https://yashganatra-mediguardai-api.hf.space/api/ocr/extract', 
            formData,
            {
                headers: {
                    ...formData.getHeaders(),
                },
                maxContentLength: Infinity,
                maxBodyLength: Infinity,
            }
        );

        // Return the extracted data
        res.json(response.data);

    } catch (error) {
        console.error('OCR Error:', error.message);
        if (error.response) {
            console.error('External API Error:', error.response.data);
            return res.status(error.response.status).json({ 
                message: 'Error from OCR service', 
                details: error.response.data 
            });
        }
        res.status(500).json({ message: 'Internal server error during OCR processing' });
    }
});

module.exports = router;
