document.addEventListener("DOMContentLoaded", () => {
  let welcomeMessageDisplayed = false; // Track whether the welcome message has been displayed
  const taskList = []; // Array to hold tasks

  // Initialize calendar variables
  let currYear = new Date().getFullYear();
  let currMonth = new Date().getMonth();
  const daysTag = document.querySelector(".days");
  const currentDate = document.getElementById("currentDate");
  const date = new Date(); // For 'today'

  // Load tasks from local storage
  function loadTasks() {
    const storedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    storedTasks.forEach(task => {
      taskList.push(task);
    });
    displayTasks(); // Display tasks after loading
  }

  // Save tasks to local storage
  function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(taskList));
  }

  // Function to display all tasks in the task list
  function displayTasks() {
    const taskListElement = document.getElementById('taskList');
    taskListElement.innerHTML = ''; // Clear the task list

    // Sort tasks by due date
    taskList.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    // Display each task
    taskList.forEach(task => {
      displayTask(task);
    });
  }

  // Function to display a single task in the task list
  function displayTask(task) {
    const taskListElement = document.getElementById('taskList');
    const taskItem = document.createElement('li');
    taskItem.textContent = `${task.title} (due on ${formatDate(task.dueDate)})`; // Use the formatDate function

    // Create a delete button for the task
    const deleteButton = document.createElement('button');
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener('click', () => {
      if (confirm("Are you sure you want to delete this task?")) {
        taskListElement.removeChild(taskItem);
        taskList.splice(taskList.indexOf(task), 1);
        saveTasks();
        displayTasks(); // Refresh the task list
      }
    });

    taskItem.appendChild(deleteButton); // Append delete button to the task item
    taskListElement.appendChild(taskItem); // Append the task item to the task list
  }

  // Function to initialize the Spotify Web Playback SDK
  function initializeSpotifyPlayer(accessToken) {
    // Initialize the Spotify player
    const player = new Spotify.Player({
      name: 'Web Playback SDK Quick Start Player',
      getOAuthToken: cb => { cb(accessToken); } // Use the provided access token
    });

    // Error handling
    player.addListener('initialization_error', e => console.error(e));
    player.addListener('authentication_error', e => console.error(e));
    player.addListener('account_error', e => console.error(e));
    player.addListener('playback_error', e => console.error(e));

    // Webplayer button handling
    document.getElementById("playButton").addEventListener("click", () => {
      player.resume().then(() => {
        console.log("Resumed playback!");
      });
    });

    document.getElementById("pauseButton").addEventListener("click", () => {
      player.pause().then(() => {
        console.log("Paused playback!");
      });
    });

    document.getElementById("nextButton").addEventListener("click", () => {
      player.nextTrack().then(() => {
        console.log("Skipped to next track!");
      });
    });

    document.getElementById("previousButton").addEventListener("click", () => {
      player.previousTrack().then(() => {
        console.log("Skipped to previous track!");
      });
    });

    // Playback status updates
    player.addListener('player_state_changed', state => console.log(state));

    // Ready
    player.addListener('ready', ({ device_id }) => {
      console.log('Ready with Device ID', device_id);
    });

    // Not Ready
    player.addListener('not_ready', ({ device_id }) => {
      console.log('Device ID has gone offline', device_id);
    });

    // Connect to the player
    player.connect();
  }

  // Login handling
  window.onload = function() {
    const accessToken = localStorage.getItem('spotifyAccessToken'); // Retrieve token from local storage
  
    if (accessToken) {
      // If token exists, initialize Spotify Player and fetch songs
      initializeSpotifyPlayer(accessToken);
      fetchRandomRecommendedSongs(accessToken);
    } else {
      // No access token, redirect to Spotify login
      const urlParams = new URLSearchParams(window.location.search);
      const newAccessToken = urlParams.get('access_token');
  
      if (newAccessToken) {
        // Store the new access token for further API calls
        localStorage.setItem('spotifyAccessToken', newAccessToken);
        initializeSpotifyPlayer(newAccessToken);
        fetchRandomRecommendedSongs(newAccessToken);
      } else {
        // Redirect to Spotify login
        window.location.href = 'http://localhost:4000/auth/spotify'; // Update to your server's URL
      }
    }
  };

  async function fetchRandomRecommendedSongs(accessToken) {
    // Fetch user's playlists
    const playlistsResponse = await fetch('/api/user/playlists', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`, // Include "Bearer" prefix
      },
    });

    if (!playlistsResponse.ok) {
      console.error('Failed to fetch playlists');
      return;
    }

    const playlistsData = await playlistsResponse.json();

    // Select a random playlist
    const randomPlaylist = playlistsData.items[Math.floor(Math.random() * playlistsData.items.length)];

    // Fetch tracks from the selected playlist
    const tracksResponse = await fetch(`/api/playlist/${randomPlaylist.id}/tracks`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`, // Include "Bearer" prefix
      },
    });

    if (!tracksResponse.ok) {
      console.error('Failed to fetch tracks');
      return;
    }

    const tracksData = await tracksResponse.json();

    // Randomly select a few tracks
    const randomTracks = [];
    for (let i = 0; i < 5; i++) { // Change the number to how many random tracks you want
      const randomTrack = tracksData.items[Math.floor(Math.random() * tracksData.items.length)];
      randomTracks.push(randomTrack);
    }

    // Display random tracks
    displayRecommendedSongs(randomTracks);
  }

  function displayRecommendedSongs(tracks) {
    const recommendedContainer = document.getElementById('recommended-songs');
    recommendedContainer.innerHTML = ''; // Clear previous songs

    tracks.forEach(track => {
      const trackElement = document.createElement('div');
      trackElement.textContent = `${track.track.name} by ${track.track.artists.map(artist => artist.name).join(', ')}`;
      recommendedContainer.appendChild(trackElement);
    });
  }

  function navigate(viewId) {
    // Hide all views
    document.querySelectorAll(".view").forEach(view => {
      view.style.display = "none";
    });

    // Show the requested view
    const viewToShow = document.getElementById(viewId);
    if (viewToShow) {
      viewToShow.style.display = "block";

      // Initialize Spotify Player when Tunes view is shown
      if (viewId === "tunesView") {
        initializeSpotifyPlayer(localStorage.getItem('spotifyAccessToken')); // Use stored access token
      }
    } else {
      console.error(`View with ID ${viewId} not found`);
    }

    // Show or hide the welcome message based on the view
    const welcomeMessageDiv = document.getElementById('welcome-message');
    if (viewId === "dashboardView") {
      welcomeMessageDiv.style.display = "block"; // Show welcome message on dashboard
      welcomeMessageDiv.style.opacity = '1'; // Ensure it's visible

      // Only display the welcome message the first time
      if (!welcomeMessageDisplayed) {
        setTimeout(() => {
          welcomeMessageDiv.style.transition = "opacity 1s ease"; // Smooth transition
          welcomeMessageDiv.style.opacity = '0'; // Fade out
          // Hide after fade-out to prevent interaction
          setTimeout(() => {
            welcomeMessageDiv.style.display = "none"; // Hide after fading out
          }, 1000); // Match the duration with the CSS transition
        }, 3000);

        welcomeMessageDisplayed = true; // Mark as displayed
      }

      // Display a random GIF on the dashboard
      const randomGifElement = document.getElementById('random-gif');
      const randomGifSource = getRandomGif();
      randomGifElement.src = randomGifSource; // Set the random GIF source
    } else {
      welcomeMessageDiv.style.opacity = '0'; // Fade out when navigating away
      setTimeout(() => {
        welcomeMessageDiv.style.display = "none"; // Hide after fade-out
      }, 1000); // Match the duration with the CSS transition
    }
  }

  // Function to get a random GIF
  function getRandomGif() {
    const gifSources = [
      'https://64.media.tumblr.com/bd330487a48d41d9e7dd2f6a513bde30/tumblr_o29jstql101tcjz0ko1_1280.gif',
      'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/6b86bdb4-540f-4240-bed6-228912593dc2/dgq1nqd-5600b6c5-ff00-4dae-81d8-c832f826c030.gif',
      'https://64.media.tumblr.com/a92b7b2cd1a6efccf380f021f6fc8a5b/tumblr_ohtceyXL291w4haapo1_500.gif',
      'https://media0.giphy.com/media/BlgKia9ncFQi5G0l06/giphy.gif'
    ];
    const randomIndex = Math.floor(Math.random() * gifSources.length);
    return gifSources[randomIndex];
  }

  // Function to add a new task
  function addTask() {
    const taskTitleInput = document.getElementById('taskTitle');
    const taskDueDateInput = document.getElementById('taskDueDate');
    const taskTitle = taskTitleInput.value.trim();
    const taskDueDate = taskDueDateInput.value.trim();

    if (!taskTitle || !taskDueDate) {
      alert('Please enter both task title and due date');
      return;
    }

    const task = {
      title: taskTitle,
      dueDate: taskDueDate
    };

    taskList.push(task); // Add task to the task list
    saveTasks(); // Save tasks to local storage
    displayTasks(); // Refresh the task list

    // Clear input fields
    taskTitleInput.value = '';
    taskDueDateInput.value = '';
  }

  // Function to format the date as "Month day, Year"
  function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
  }

  document.getElementById("dashboardButton").addEventListener("click", () => navigate("dashboardView"));
  document.getElementById("calendarButton").addEventListener("click", () => navigate("calendarView"));
  document.getElementById("tasksButton").addEventListener("click", () => navigate("tasksView"));
  document.getElementById("tunesButton").addEventListener("click", () => navigate("tunesView"));
  document.getElementById("addTaskButton").addEventListener("click", addTask); // Add event listener for adding task

  function renderCalendar() {
    const firstDayOfMonth = new Date(currYear, currMonth, 1).getDay(); // Get first day of the month
    const lastDateOfMonth = new Date(currYear, currMonth + 1, 0).getDate(); // Get last date of the month
    const lastDayOfMonth = new Date(currYear, currMonth, lastDateOfMonth).getDay(); // Get last day of the month
    const lastDateOfLastMonth = new Date(currYear, currMonth, 0).getDate(); // Get last date of the previous month

    let liTag = "";

    for (let i = firstDayOfMonth; i > 0; i--) { // Previous month's last days
      liTag += `<li class="inactive">${lastDateOfLastMonth - i + 1}</li>`;
    }

    for (let i = 1; i <= lastDateOfMonth; i++) { // Current month's days
      const isToday = i === date.getDate() && currMonth === date.getMonth() && currYear === date.getFullYear();
      liTag += `<li class="${isToday ? "active" : ""}">${i}</li>`;
    }

    for (let i = lastDayOfMonth; i < 6; i++) { // Next month's first days
      liTag += `<li class="inactive">${i - lastDayOfMonth + 1}</li>`;
    }

    currentDate.innerText = `${date.toLocaleString('default', { month: 'long' })} ${currYear}`;
    daysTag.innerHTML = liTag;
  }

  // Navigation and task addition listeners
  document.getElementById("prev").addEventListener("click", () => {
    currMonth = currMonth - 1 < 0 ? 11 : currMonth - 1;
    currYear = currMonth === 11 ? currYear - 1 : currYear;
    renderCalendar();
  });

  document.getElementById("next").addEventListener("click", () => {
    currMonth = currMonth + 1 > 11 ? 0 : currMonth + 1;
    currYear = currMonth === 0 ? currYear + 1 : currYear;
    renderCalendar();
  });

  // Initial load
  renderCalendar(); // Render calendar on initial load
  loadTasks(); // Load tasks from local storage
  navigate("dashboardView"); // Navigate to the dashboard view on initial load
});
