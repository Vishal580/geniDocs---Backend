const OpenAI = require('openai');
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});
const ffmpeg = require('fluent-ffmpeg');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');
const path = require('path');

const generatePodcast = async (documentText) => {
  try {
    // Step 1: Generate script from document
    const scriptResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { 
          role: "system", 
          content: "You're a podcast creator. Convert this document into engaging podcast script with host dialogue." 
        },
        { role: "user", content: documentText }
      ],
      max_tokens: 2000
    });

    const script = scriptResponse.choices[0].message.content;

    // Step 2: Generate audio from script
    const audioResponse = await openai.audio.transcriptions.create({
      model: "whisper-1",
      file: Buffer.from(script),
      response_format: "url"
    });

    // Step 3: Process audio
    const audioUrl = audioResponse.url;
    const tempFilePath = path.join(__dirname, 'temp', `podcast-${Date.now()}.mp3`);
    
    const response = await fetch(audioUrl);
    const buffer = await response.buffer();
    fs.writeFileSync(tempFilePath, buffer);
    
    // Get duration and enhance audio
    const duration = await getAudioDuration(tempFilePath);
    const processedFilePath = await enhanceAudio(tempFilePath);
    
    // Step 4: Upload to Cloudinary
    const uploadedAudioUrl = await uploadAudio(processedFilePath);
    
    // Cleanup
    fs.unlinkSync(tempFilePath);
    fs.unlinkSync(processedFilePath);
    
    return { script, audioUrl: uploadedAudioUrl, duration };
  } catch (err) {
    throw new Error(`Podcast generation failed: ${err.message}`);
  }
};

// Helper functions
const getAudioDuration = (filePath) => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) reject(err);
      resolve(metadata.format.duration);
    });
  });
};

const enhanceAudio = (inputPath) => {
  const outputPath = inputPath.replace('.mp3', '_enhanced.mp3');
  
  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .audioFilters([
        'compand=attacks=0:decays=0.3:points=-80/-80|-30/-12|0/-3',
        'equalizer=f=1000:width_type=h:width=200:g=-3',
        'loudnorm=I=-16:TP=-1.5:LRA=11'
      ])
      .on('end', () => resolve(outputPath))
      .on('error', reject)
      .save(outputPath);
  });
};

const uploadAudio = async (filePath) => {
  const result = await cloudinary.uploader.upload(filePath, {
    resource_type: 'video' // Treat audio as video for Cloudinary
  });
  return result.secure_url;
};

module.exports = { generatePodcast };