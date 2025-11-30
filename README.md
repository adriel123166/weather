# Weather API

Express.js REST API for weather data management with MongoDB.

## 🚀 Features
- 13 RESTful endpoints
- MongoDB integration with Mongoose
- Swagger API documentation
- Alert system

## 📚 API Documentation
- **Local:** http://localhost:3000/api-docs
- **Production:** https://weather-api-kuyakim.onrender.com/

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
- `POST /api/v1/weather` - Create weather record
- `GET /api/v1/weather` - Get all records
- `GET /api/v1/weather/latest` - Get latest record
- `GET /api/v1/weather/stats` - Get statistics
- And 9 more...
