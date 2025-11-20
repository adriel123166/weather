require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Weather API',
      version: '1.0.0',
      description: 'API for weather data management'
    },
    servers: [
      { url: `http://localhost:${PORT}`, description: 'Local' },
      { url: 'https://your-app-name.onrender.com', description: 'Production' }
    ]
  },
  apis: ['./server.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(express.json());


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

// Alert schema
const alertSchema = new mongoose.Schema({
  title: String,
  message: String,
  level: { type: String, enum: ['info','warning','critical'], default: 'warning' },
  active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const Alert = mongoose.model('Alert', alertSchema);

// Root
app.get('/', (req, res) => res.send('✅ Weather API running'));

// Create
app.post('/api/v1/weather', async (req, res) => {
  try {
    const w = new Weather(req.body);
    await w.save();
    res.status(201).json(w);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Get all
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

//
// ✅ MOVE THESE SPECIAL ROUTES BEFORE /:id
//
app.get('/api/v1/weather/latest', async (req, res) => {
  try {
    const latest = await Weather.findOne().sort({ recordedAt: -1 });
    if (!latest) return res.status(404).json({ message: 'No records' });
    res.json(latest);
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

// By date (YYYY-MM-DD)
app.get('/api/v1/weather/date/:date', async (req, res) => {
  try {
    const start = new Date(req.params.date);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);
    const records = await Weather.find({ recordedAt: { $gte: start, $lt: end } }).sort({ recordedAt: 1 });
    res.json(records);
  } catch (err) {
    res.status(400).json({ message: err.message });
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

app.patch('/api/v1/weather/:id', async (req, res) => {
  try {
    const w = await Weather.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true });
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

// Alerts
app.get('/api/v1/alerts', async (req, res) => {
  try {
    const list = await Alert.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post('/api/v1/alerts', async (req, res) => {
  try {
    const a = new Alert(req.body);
    await a.save();
    res.status(201).json(a);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete('/api/v1/alerts/:id', async (req, res) => {
  try {
    const a = await Alert.findByIdAndDelete(req.params.id);
    if (!a) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Alert removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Start server with DB connect
async function startServer() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => console.log(`🚀 Server listening on http://localhost:${PORT}`));
  } catch (err) {
    console.error('❌ DB connection error:', err.message);
  }
}
startServer();
