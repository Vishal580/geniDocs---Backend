const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const podcastController = require('../controllers/podcastController');

// Podcast routes
router.post('/', protect, podcastController.createPodcast);
router.get('/my-podcasts', protect, podcastController.getUserPodcasts);

module.exports = router;