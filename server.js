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
      { url: 'https://weather-api-kuyakim.onrender.com', description: 'Production' }
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
 *                 example: "2025-11-21T10:30:00Z"
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
 * /api/v1/weather/latest:
 *   get:
 *     summary: Get the latest weather record
 *     tags: [Weather]
 *     responses:
 *       200:
 *         description: Latest weather record
 *       404:
 *         description: No records found
 *       500:
 *         description: Server error
 */
app.get('/api/v1/weather/latest', async (req, res) => {
  try {
    const latest = await Weather.findOne().sort({ recordedAt: -1 });
    if (!latest) return res.status(404).json({ message: 'No records' });
    res.json(latest);
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

/**
 * @swagger
 * /api/v1/weather/date/{date}:
 *   get:
 *     summary: Get weather records by date
 *     tags: [Weather]
 *     parameters:
 *       - in: path
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Date in YYYY-MM-DD format
 *         example: "2025-11-21"
 *     responses:
 *       200:
 *         description: Weather records for the specified date
 *       400:
 *         description: Invalid date format
 */
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
 *     summary: Update entire weather record
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
 *   patch:
 *     summary: Partially update weather record
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
 *         description: Weather record partially updated
 *       404:
 *         description: Weather record not found
 *       400:
 *         description: Bad request
 */
app.patch('/api/v1/weather/:id', async (req, res) => {
  try {
    const w = await Weather.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true });
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
 * /api/v1/alerts:
 *   get:
 *     summary: Get all alerts
 *     tags: [Alerts]
 *     responses:
 *       200:
 *         description: List of all alerts
 *       500:
 *         description: Server error
 */
app.get('/api/v1/alerts', async (req, res) => {
  try {
    const list = await Alert.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/v1/alerts:
 *   post:
 *     summary: Create a new alert
 *     tags: [Alerts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Storm Warning"
 *               message:
 *                 type: string
 *                 example: "Heavy rain expected"
 *               level:
 *                 type: string
 *                 enum: [info, warning, critical]
 *                 example: "warning"
 *               active:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Alert created successfully
 *       400:
 *         description: Bad request
 */
app.post('/api/v1/alerts', async (req, res) => {
  try {
    const a = new Alert(req.body);
    await a.save();
    res.status(201).json(a);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

/**
 * @swagger
 * /api/v1/alerts/{id}:
 *   delete:
 *     summary: Delete an alert
 *     tags: [Alerts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Alert ID
 *     responses:
 *       200:
 *         description: Alert deleted successfully
 *       404:
 *         description: Alert not found
 *       500:
 *         description: Server error
 */
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