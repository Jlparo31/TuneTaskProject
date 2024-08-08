# TuneTaskProject Overview
TuneTaskProject built with Express.js that provides CRUD operations for managing counters. The API allows users to create, read, update, and delete counters, interact with Spotify playlists, and retrieve weather data from Open-Meteo API.

## Project Setup
To get started with the project, follow
these steps:
1. **Clone the Repository:**
```sh

Endpoints
Counters

Create Counter
HTTP Method: POST
Endpoint URL: /api/counters
Request Format:
json
Copy code
{
  "name": "Counter Name",
  "value": 0
}
Response Format:
json
Copy code
{
  "id": "unique-counter-id",
  "name": "Counter Name",
  "value": 0
}
Read Counter
HTTP Method: GET
Endpoint URL: /api/counters/:id
Response Format:
json
Copy code
{
  "id": "unique-counter-id",
  "name": "Counter Name",
  "value": 0
}
Update Counter
HTTP Method: PUT
Endpoint URL: /api/counters/:id
Request Format:
json
Copy code
{
  "name": "Updated Counter Name",
  "value": 10
}
Response Format:
json
Copy code
{
  "id": "unique-counter-id",
  "name": "Updated Counter Name",
  "value": 10
}
Delete Counter
HTTP Method: DELETE
Endpoint URL: /api/counters/:id
Response Format:
json
Copy code
{
  "message": "Counter deleted successfully"
}


Weather

Get Weather Data
HTTP Method: GET
Endpoint URL: /api/weather
Request Parameters:
latitude (query parameter)
longitude (query parameter)
Response Format:
json
Copy code
{
  "temperature": 25,
  "weather": "Clear"
}


Technology Stack
Backend:
Express.js
PouchDB
Axios
APIs:
Open-Meteo API


GitHub: Jlparo31
git clone https://github.com/Jlparo31/TuneTaskProject.git
cd my-web-application
```
