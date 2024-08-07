import express from 'express';
import cors from 'cors';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// Spotify API credentials
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const REDIRECT_URI = process.env.REDIRECT_URI;
let ACCESS_TOKEN = process.env.SPOTIFY_ACCESS_TOKEN;
let REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN; // Store refresh token

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
    REFRESH_TOKEN = response.data.refresh_token; // Store refresh token

    // Store tokens in the environment variable
    process.env.SPOTIFY_ACCESS_TOKEN = ACCESS_TOKEN;
    process.env.SPOTIFY_REFRESH_TOKEN = REFRESH_TOKEN;

    res.redirect('/?access_token=' + ACCESS_TOKEN);
  } catch (error) {
    console.error('Error fetching access token:', error.response.data);
    res.status(500).send('Error fetching access token');
  }
});

// Function to refresh the access token
async function refreshAccessToken() {
  const tokenUrl = 'https://accounts.spotify.com/api/token';
  const body = new URLSearchParams({
    grant_type: 'refresh_token',
    refresh_token: REFRESH_TOKEN,
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

    // Store the new access token in the environment variable
    process.env.SPOTIFY_ACCESS_TOKEN = ACCESS_TOKEN;

    console.log('Access token refreshed:', ACCESS_TOKEN);
  } catch (error) {
    console.error('Error refreshing access token:', error.response.data);
  }
}

// Refresh the access token every 20 minutes (1200000 milliseconds)
setInterval(refreshAccessToken, 1200000);

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
