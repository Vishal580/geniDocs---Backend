const Podcast = require('../models/Podcast');
const { generatePodcast } = require('../utils/podcastGenerator');

// Create podcast from document
exports.createPodcast = async (req, res) => {
  try {
    const { title, description, document } = req.body;
    
    if (!document) {
      return res.status(400).json({ error: 'Document is required' });
    }

    // Generate podcast from document
    const { script, audioUrl, duration } = await generatePodcast(document);
    
    // Create podcast record
    const podcast = new Podcast({
      user: req.user.id,
      title,
      description,
      audioUrl,
      duration,
      sourceDocument: document
    });

    await podcast.save();

    res.status(201).json({
      _id: podcast.id,
      title: podcast.title,
      audioUrl: podcast.audioUrl,
      duration: podcast.duration,
      script // Return generated script to client
    });
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get user's podcasts
exports.getUserPodcasts = async (req, res) => {
  try {
    const podcasts = await Podcast.find({ user: req.user.id })
      .sort('-createdAt')
      .select('-sourceDocument');
      
    res.json(podcasts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};