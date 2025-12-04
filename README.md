# Weather API

Express.js REST API for weather data management with MongoDB Atlas.

## 🚀 Features
- 7 RESTful endpoints
- MongoDB integration with Mongoose
- Interactive Swagger API documentation
- Frontend dashboard
- Deployed on Vercel

## 📚 Live URLs

- **Frontend Dashboard:** https://weather-api-kuyakim.vercel.app/
- **Swagger Documentation:** https://weather-api-kuyakim.vercel.app/api-docs
- **Swagger JSON Spec:** https://weather-api-kuyakim.vercel.app/swagger.json
- **API Base URL:** https://weather-api-kuyakim.vercel.app/api/v1/weather

## 📝 API Endpoints

### Weather Operations
1. `GET /` - Frontend Dashboard
2. `GET /status` - API health check
3. `POST /api/v1/weather` - Create weather record
4. `GET /api/v1/weather` - Get all records (with optional `?limit=10`)
5. `GET /api/v1/weather/stats` - Get weather statistics
6. `GET /api/v1/weather/{id}` - Get record by ID
7. `PUT /api/v1/weather/{id}` - Update record
8. `DELETE /api/v1/weather/{id}` - Delete record

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
- **API Docs:** Swagger UI Express
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
    "windDirection": "NW",
    "notes": "Clear sky"
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

### Get Swagger JSON
```bash
curl https://weather-api-kuyakim.vercel.app/swagger.json
```

## 📄 OpenAPI Specification

The complete API specification is available in JSON format at:
**https://weather-api-kuyakim.vercel.app/swagger.json**

You can import this into tools like:
- Postman
- Insomnia
- SwaggerHub
- API testing tools

## 📁 Project Structure

```
weather-api/
├── api/
│   └── index.js          # Vercel serverless entry
├── node_modules/
├── .env                  # Environment variables (gitignored)
├── .gitignore
├── index.html            # Frontend dashboard
├── package.json
├── package-lock.json
├── README.md
├── server.js             # Main Express app
├── swagger.json          # OpenAPI specification
└── vercel.json           # Vercel configuration
```

## 📄 License
ISC

## 👤 Author
Felix Adriel

## 🔗 Repository
https://github.com/adriel123166/weather