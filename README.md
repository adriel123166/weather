# Weather API

Express.js REST API for weather data management with MongoDB Atlas.

## 🚀 Features
- 7 RESTful endpoints
- MongoDB integration with Mongoose
- Interactive Swagger API documentation
- Deployed on Vercel

## 📚 Live API
- **Production:** https://weather-api-kuyakim.vercel.app
- **Swagger Docs:** https://weather-api-kuyakim.vercel.app/api-docs

## 📝 API Endpoints

### Weather Operations
1. `GET /` - API health check
2. `POST /api/v1/weather` - Create weather record
3. `GET /api/v1/weather` - Get all records (with optional `?limit=10`)
4. `GET /api/v1/weather/stats` - Get statistics
5. `GET /api/v1/weather/{id}` - Get record by ID
6. `PUT /api/v1/weather/{id}` - Update record
7. `DELETE /api/v1/weather/{id}` - Delete record

## 🛠️ Local Development

### Installation
```bash
npm install
```

### Configuration
Create `.env` file:
```
MONGODB_URI=your_mongodb_connection_string
PORT=3000
```

### Run Locally
```bash
node server.js
```

Visit: http://localhost:3000/api-docs

## 📦 Tech Stack
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB Atlas
- **ODM:** Mongoose
- **API Docs:** Swagger UI
- **Deployment:** Vercel

## 🌐 Example Usage

### Create Weather Record
```bash
curl -X POST https://weather-api-kuyakim.vercel.app/api/v1/weather \
  -H "Content-Type: application/json" \
  -d '{
    "station": "Station A",
    "recordedAt": "2025-12-01T10:30:00Z",
    "temperature": 25.5,
    "humidity": 60,
    "pressure": 1013,
    "windSpeed": 15,
    "windDirection": "NW"
  }'
```

### Get All Records
```bash
curl https://weather-api-kuyakim.vercel.app/api/v1/weather?limit=10
```

### Get Statistics
```bash
curl https://weather-api-kuyakim.vercel.app/api/v1/weather/stats
```

## 📄 License
ISC