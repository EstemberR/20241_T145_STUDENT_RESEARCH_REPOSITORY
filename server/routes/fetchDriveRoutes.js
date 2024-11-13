// Example Express.js route to fetch all research entries
const express = require('express');
const Research = require('./models/Research'); // Your Research model
const router = express.Router();

router.get('/student/research-entries', async (req, res) => {
  try {
    const researchEntries = await Research.find(); // Fetch all research entries
    res.json(researchEntries);
  } catch (error) {
    console.error('Error fetching research entries:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;