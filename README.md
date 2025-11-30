# Weather API

Express.js REST API for weather data management with MongoDB.

## 🚀 Features
- 13 RESTful endpoints
- MongoDB integration with Mongoose
- Swagger API documentation
- Alert system

## 📚 API Documentation
- **Local:** http://localhost:3000/api-docs
- **Production:** https://weather-api-kuyakim.vercel.app/api-docs

## 🛠️ Installation
```bash
npm install
```

## ⚙️ Configuration
Create `.env` file:
```
MONGODB_URI=your_mongodb_connection_string
PORT=3000
```

## ▶️ Run
```bash
node server.js
```

## 📝 Endpoints

### Weather Endpoints (10)
- `POST /api/v1/weather` - Create weather record
- `GET /api/v1/weather` - Get all records
- `GET /api/v1/weather?limit=10` - Get limited records
- `GET /api/v1/weather/latest` - Get latest record
- `GET /api/v1/weather/stats` - Get statistics
- `GET /api/v1/weather/date/:date` - Get records by date
- `GET /api/v1/weather/:id` - Get record by ID
- `PUT /api/v1/weather/:id` - Full update
- `PATCH /api/v1/weather/:id` - Partial update
- `DELETE /api/v1/weather/:id` - Delete record

### Alert Endpoints (3)
- `GET /api/v1/alerts` - Get all alerts
- `POST /api/v1/alerts` - Create alert
- `DELETE /api/v1/alerts/:id` - Delete alert

## 🌐 Live API
- **Production:** https://weather-api-kuyakim.vercel.app
- **Swagger Docs:** https://weather-api-kuyakim.vercel.app/api-docs

## 📦 Dependencies
- Express.js
- Mongoose
- MongoDB Atlas
- Swagger UI Express
- CORS
- dotenv