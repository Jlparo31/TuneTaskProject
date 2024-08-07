/*import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// Spotify API credentials
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const REDIRECT_URI = process.env.REDIRECT_URI;
let ACCESS_TOKEN = process.env.SPOTIFY_ACCESS_TOKEN;

const app = express();

app.use(cors());
app.use(express.json());

// Route to handle root requests
app.get('/', (req, res) => {
  res.send('Welcome to the TuneTask API!');
});

// Route to initiate Spotify login
app.get('/auth/spotify', (req, res) => {
  const scopes = 'user-read-private user-read-email user-library-read playlist-read-private';
  const authorizeURL = `https://accounts.spotify.com/authorize?response_type=code&client_id=${CLIENT_ID}&scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`;
  
  res.redirect(authorizeURL);
});

// Route to handle the callback from Spotify
app.get('/callback', async (req, res) => {
  const { code } = req.query;

  // Exchange code for access token
  const tokenUrl = 'https://accounts.spotify.com/api/token';
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: REDIRECT_URI,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  });

  try {
    const response = await axios.post(tokenUrl, body.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    ACCESS_TOKEN = response.data.access_token;

    // Store the access token in the environment variable
    process.env.SPOTIFY_ACCESS_TOKEN = ACCESS_TOKEN;

    res.redirect('/?access_token=' + ACCESS_TOKEN);
  } catch (error) {
    console.error('Error fetching access token:', error.response.data);
    res.status(500).send('Error fetching access token');
  }
});

// Endpoint to get user's playlists
app.get('/api/user/playlists', async (req, res) => {
  const accessToken = ACCESS_TOKEN || req.headers['authorization'];

  try {
    const response = await axios.get('https://api.spotify.com/v1/me/playlists', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching user playlists:', error);
    res.status(500).send('Error fetching user playlists');
  }
});

/** 
 * @async
 * @param {object} response - The HTTP response object used to send back data to
 * the client. It must have `writeHead`, `write`, and `end` methods available.
 * @param {string} [name] - The name of the counter to be created. If not
 * provided, the function will respond with an error message.
 

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
