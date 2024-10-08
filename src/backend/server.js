import express from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();
const port = 4000;

app.use(cors({
  origin: 'http://127.0.0.1:3001', 
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

app.use(express.json());

app.get('/', (req, res) => {
  res.send('Welcome to the TuneTask API!'); 
});

// Weather API route
app.get('/api/weather', async (req, res) => {
  const params = {
      latitude: 42.3958, 
      longitude: -72.52826, 
      current: ["temperature_2m", "is_day", "rain"],
      daily: ["temperature_2m_max", "temperature_2m_min", "precipitation_hours", "precipitation_probability_max"],
      temperature_unit: "fahrenheit",
      wind_speed_unit: "mph",
      precipitation_unit: "inch",
      timezone: "auto"
  };

  const url = "https://api.open-meteo.com/v1/forecast?latitude=42.3873&longitude=72.5314&hourly=&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=America%2FNew_York";

  try {
    const response = await axios.get('https://api.open-meteo.com/v1/forecast?latitude=42.3873&longitude=72.5314&hourly=&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=America%2FNew_York');
    const weatherData = response.data;

    const currentWeather = {
        temperature: weatherData.current.temperature_2m,
        isDay: weatherData.current.is_day,
        rain: weatherData.current.rain,
        dailyMaxTemp: weatherData.daily.temperature_2m_max,
        dailyMinTemp: weatherData.daily.temperature_2m_min,
        dailyPrecipitationProbability: weatherData.daily.precipitation_probability_max
    };

    console.log('Weather Data:', currentWeather);
    res.status(200).json(currentWeather); // Send modified data
  } catch (error) {
    console.error('Error fetching weather data:', error.message); // Log the error message
    res.status(500).send('Error fetching weather data');
  }
});

/** 
 * @async
 * @param {object} response - The HTTP response object used to send back data to
 * the client. It must have `writeHead`, `write`, and `end` methods available.
 * @param {string} [name] - The name of the counter to be created. If not
 * provided, the function will respond with an error message.
 */

// CRUD Operations

async function createCounter(req, res) {
  const { name } = req.body;
  if (!name) {
    res.status(400).send('Counter Name Required');
    return;
  }
  try {
    await db.saveCounter(name, 0);
    res.status(200).send(`Counter ${name} Created`);
  } catch (err) {
    res.status(500).send('Internal Server Error');
  }
}

async function readCounter(req, res) {
  const { name } = req.params;
  try {
    const counter = await db.loadCounter(name);
    res.status(200).send(`Counter ${counter._id} = ${counter.count}`);
  } catch (err) {
    res.status(404).send(`Counter ${name} Not Found`);
  }
}

async function updateCounter(req, res) {
  const { name } = req.params;
  try {
    const counter = await db.loadCounter(name);
    counter.count++;
    await db.modifyCounter(counter);
    res.status(200).send(`Counter ${counter._id} Updated`);
  } catch (err) {
    res.status(404).send(`Counter ${name} Not Found`);
  }
}

async function deleteCounter(req, res) {
  const { name } = req.params;
  try {
    const counter = await db.loadCounter(name);
    await db.removeCounter(counter);
    res.status(200).send(`Counter ${counter._id} Deleted`);
  } catch (err) {
    res.status(404).send(`Counter ${name} Not Found`);
  }
}

async function dumpCounters(response) {
  let responseText = "<h1>Counters</h1><ul>";
  for (const [name, value] of Object.entries(counters)) {
    responseText += `<li>${name} = ${value}</li>`;
  }
  responseText += "</ul>";

  response.status(200).send(responseText);
}

// Routes for CRUD operations
app.post('/api/counter', createCounter);
app.get('/api/counter/:name', readCounter);
app.put('/api/counter/:name', updateCounter);
app.delete('/api/counter/:name', deleteCounter);
app.get('/api/counters', dumpCounters);

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
