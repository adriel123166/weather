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
      { url: 'https://weather-api-kuyakim.vercel.app', description: 'Production' }
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

/**
 * @swagger
 * /:
 *   get:
 *     summary: API Health Check
 *     description: Returns API status
 *     responses:
 *       200:
 *         description: API is running successfully
 */
app.get('/', (req, res) => res.send('✅ Weather API running'));

/**
 * @swagger
 * /api/v1/weather:
 *   post:
 *     summary: Create a new weather record
 *     tags: [Weather]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - recordedAt
 *             properties:
 *               station:
 *                 type: string
 *                 example: "Station A"
 *               recordedAt:
 *                 type: string
 *                 format: date-time
 *                 example: "2025-12-01T10:30:00Z"
 *               temperature:
 *                 type: number
 *                 example: 25.5
 *               humidity:
 *                 type: number
 *                 example: 60
 *               pressure:
 *                 type: number
 *                 example: 1013
 *               windSpeed:
 *                 type: number
 *                 example: 15
 *               windDirection:
 *                 type: string
 *                 example: "NW"
 *               notes:
 *                 type: string
 *                 example: "Clear sky"
 *     responses:
 *       201:
 *         description: Weather record created successfully
 *       400:
 *         description: Bad request
 */
app.post('/api/v1/weather', async (req, res) => {
  try {
    const w = new Weather(req.body);
    await w.save();
    res.status(201).json(w);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/v1/weather:
 *   get:
 *     summary: Get all weather records
 *     tags: [Weather]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Maximum number of records to return
 *         example: 10
 *     responses:
 *       200:
 *         description: List of weather records
 *       500:
 *         description: Server error
 */
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

/**
 * @swagger
 * /api/v1/weather/{id}:
 *   get:
 *     summary: Get weather record by ID
 *     tags: [Weather]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Weather record ID
 *     responses:
 *       200:
 *         description: Weather record found
 *       404:
 *         description: Weather record not found
 *       500:
 *         description: Server error
 */
app.get('/api/v1/weather/:id', async (req, res) => {
  try {
    const w = await Weather.findById(req.params.id);
    if (!w) return res.status(404).json({ message: 'Not found' });
    res.json(w);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/v1/weather/{id}:
 *   put:
 *     summary: Update weather record
 *     tags: [Weather]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Weather record ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               station:
 *                 type: string
 *               recordedAt:
 *                 type: string
 *                 format: date-time
 *               temperature:
 *                 type: number
 *               humidity:
 *                 type: number
 *               pressure:
 *                 type: number
 *               windSpeed:
 *                 type: number
 *               windDirection:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Weather record updated
 *       404:
 *         description: Weather record not found
 *       400:
 *         description: Bad request
 */
app.put('/api/v1/weather/:id', async (req, res) => {
  try {
    const w = await Weather.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!w) return res.status(404).json({ message: 'Not found' });
    res.json(w);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/v1/weather/{id}:
 *   delete:
 *     summary: Delete weather record
 *     tags: [Weather]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Weather record ID
 *     responses:
 *       200:
 *         description: Weather record deleted
 *       404:
 *         description: Weather record not found
 *       500:
 *         description: Server error
 */
app.delete('/api/v1/weather/:id', async (req, res) => {
  try {
    const w = await Weather.findByIdAndDelete(req.params.id);
    if (!w) return res.status(404).json({ message: 'Not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/v1/weather/stats:
 *   get:
 *     summary: Get weather statistics
 *     tags: [Weather]
 *     description: Returns average, min, max temperature and humidity statistics
 *     responses:
 *       200:
 *         description: Weather statistics
 *       500:
 *         description: Server error
 */
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

// Only start server if not in serverless environment
if (process.env.VERCEL !== '1') {
  startServer();
}

// Export for Vercel serverless
module.exports = app;