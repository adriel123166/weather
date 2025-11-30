require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
const swaggerDocument = require('./swagger.json');

// Serve static files from public directory
app.use(express.static('public'));

// Serve swagger.json directly
app.get('/api-docs/swagger.json', (req, res) => {
  res.json(swaggerDocument);
});

// Redirect /api-docs to /swagger.html
app.get('/api-docs', (req, res) => {
  res.redirect('/swagger.html');
});

app.use(express.json());

// MongoDB connection for serverless
let isConnected = false;

async function connectDB() {
  if (isConnected) {
    return;
  }
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ DB connection error:', err.message);
    throw err;
  }
}

// Weather schema
const weatherSchema = new mongoose.Schema({
  station: String,
  recordedAt: { type: Date, required: true },
  temperature: Number,
  humidity: Number,
  pressure: Number,
  windSpeed: Number,
  windDirection: String,
  notes: String
}, { timestamps: true });

const Weather = mongoose.model('Weather', weatherSchema);

app.get('/', (req, res) => res.send('✅ Weather API running'));

// DB Connection middleware ONLY for API routes
app.use('/api', async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(500).json({ message: 'Database connection failed' });
  }
});

app.post('/api/v1/weather', async (req, res) => {
  try {
    const w = new Weather(req.body);
    await w.save();
    res.status(201).json(w);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get('/api/v1/weather', async (req, res) => {
  try {
    const q = Weather.find().sort({ recordedAt: -1 });
    if (req.query.limit) q.limit(parseInt(req.query.limit));
    const list = await q.exec();
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/v1/weather/stats', async (req, res) => {
  try {
    const pipeline = [
      {
        $group: {
          _id: null,
          avgTemp: { $avg: '$temperature' },
          avgHumidity: { $avg: '$humidity' },
          minTemp: { $min: '$temperature' },
          maxTemp: { $max: '$temperature' },
          count: { $sum: 1 }
        }
      },
      { $project: { _id: 0 } }
    ];
    const [stats] = await Weather.aggregate(pipeline);
    res.json(stats || { avgTemp: null, avgHumidity: null, minTemp: null, maxTemp: null, count: 0 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.get('/api/v1/weather/:id', async (req, res) => {
  try {
    const w = await Weather.findById(req.params.id);
    if (!w) return res.status(404).json({ message: 'Not found' });
    res.json(w);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.put('/api/v1/weather/:id', async (req, res) => {
  try {
    const w = await Weather.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!w) return res.status(404).json({ message: 'Not found' });
    res.json(w);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/v1/weather/:id', async (req, res) => {
  try {
    const w = await Weather.findByIdAndDelete(req.params.id);
    if (!w) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Start server (local development only)
if (require.main === module) {
  async function startServer() {
    try {
      await connectDB();
      app.listen(PORT, () => console.log(`🚀 Server listening on http://localhost:${PORT}`));
    } catch (err) {
      console.error('❌ Server start error:', err.message);
    }
  }
  startServer();
}

// Export for Vercel
module.exports = app;