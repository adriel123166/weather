## 📝 API Endpoints

### Weather Operations
1. `GET /` - Frontend Dashboard
2. `GET /status` - API health check
3. `POST /api/v1/weather` - Create weather record
4. `GET /api/v1/weather` - Get all records (with optional `?limit=10`)
5. `GET /api/v1/weather/stats` - Get weather statistics
6. `GET /api/v1/weather/date/{date}` - Get records by specific date (YYYY-MM-DD)
7. `GET /api/v1/weather/station/{station}` - Get records by city/station name
8. `GET /api/v1/weather/{id}` - Get record by ID
9. `PUT /api/v1/weather/{id}` - Update record
10. `DELETE /api/v1/weather/{id}` - Delete record

## 🌐 Example Usage

### Get Records by Date
```bash
curl https://weather-api-kuyakim.vercel.app/api/v1/weather/date/2025-12-04
```

### Get Records by Station/City
```bash
curl https://weather-api-kuyakim.vercel.app/api/v1/weather/station/Manila
```