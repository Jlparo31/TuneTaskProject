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
    updateTopTasks(); // Update top tasks after loading
  }

  let weatherData; // Declare weatherData variable

  async function fetchWeather() {
    try {
      const response = await fetch('https://api.open-meteo.com/v1/forecast?latitude=42.3873&longitude=72.5314&hourly=&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=America%2FNew_York');
      if (!response.ok) throw new Error('Failed to fetch weather data');
      weatherData = await response.json(); // Store the fetched data
      displayWeather(); // Call displayWeather after fetching data
    } catch (error) {
      console.error(error);
      document.getElementById('weatherContainer').innerHTML = 'Failed to load weather data';
    }
  }

  function displayWeather() {
    if (weatherData && weatherData.daily) {
      const weatherContainer = document.getElementById('weatherContainer');
      const daily = weatherData.daily;

      const dailyForecastHTML = `
      <p></p>
      <h2>Daily Forecast</h2>
      <div class="forecast-grid">
        ${daily.temperature_2m_max.map((maxTemp, index) => {
          const minTemp = daily.temperature_2m_min[index];
          const precipitationProb = daily.precipitation_probability_max[index];

          return `
            <div class="forecast-item">
              <p>${getDayOfWeek(index)}</p> <!-- Display day of the week -->
              <div class="temp-bar">
              <i class="fas fa-arrow-down temp-arrow" style="font-size: 18px;"></i>
              <span class="min-temp">${minTemp}°F</span>
              <span class="max-temp">${maxTemp}°F</span>
              <i class="fas fa-arrow-up temp-arrow" style="font-size: 18px;"></i>
              </div>
              <p>Precipitation Probability: ${precipitationProb}%</p>
            </div>
          `;
        }).join('')}
      </div>
    `;

    weatherContainer.innerHTML = dailyForecastHTML;
  } else {
    console.error('Daily weather data is not available or malformed.');
  }
}
  // Function to calculate the day of the week for each forecast day
  function getDayOfWeek(dayIndex) {
    const today = new Date();
    const currentDayOfWeek = today.getDay();
    const weekdayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayOfWeek = (currentDayOfWeek + dayIndex) % 7;
    return weekdayNames[dayOfWeek];
}

  // Fetch weather data on page load
  window.onload = fetchWeather; // Call the function to fetch weather data
  console.log('Weather Data:', weatherData);

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

    updateTopTasks(); // Call to update top tasks after displaying all tasks
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
        updateTopTasks(); // Refresh the top tasks display after deletion
      }
    });

    taskItem.appendChild(deleteButton); // Append delete button to the task item
    taskListElement.appendChild(taskItem); // Append the task item to the task list
  }

  // Function to add a task
  function addTask(title, dueDate) {
    const newTask = { title, dueDate }; // Create a new task object
    taskList.push(newTask); // Add the new task to the task list
    saveTasks(); // Save the updated task list
    displayTask(newTask); // Display the new task
    updateTopTasks(); // Refresh the top tasks display after adding a new task
  }

  // Function to update the top tasks display
  function updateTopTasks() {
    const topTasksContainer = document.getElementById('topTasksContainer');
    topTasksContainer.innerHTML = ''; // Clear current tasks

    // Sort tasks by due date and get the top three
    const topThreeTasks = taskList.slice().sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)).slice(0, 3);

    // Display the top three tasks
    topThreeTasks.forEach(task => {
      const taskItem = document.createElement('li'); // Create a new paragraph for each task
      taskItem.textContent = `${task.title} (due ${formatDate(task.dueDate)})`; // Format the task

      // Auto-size text to fit in the container
      taskItem.style.overflow = 'hidden';
      taskItem.style.textOverflow = 'ellipsis';
      taskItem.style.whiteSpace = 'nowrap';
      taskItem.style.fontSize = '16px'; // Set initial font size
      taskItem.style.lineHeight = '1.2'; // Adjust line height

      topTasksContainer.appendChild(taskItem); // Append to the container
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
  }

  // Function to get a random GIF
  function getRandomGif() {
    const gifSources = [
      'https://blog.jitter.video/content/images/size/w960/2021/12/Jitter-Pink-perfect-loop-cubes.gif',
      'https://www.icegif.com/wp-content/uploads/2023/07/icegif-1204.gif',
      'https://i.pinimg.com/originals/c2/33/f2/c233f2c62083b41ac1119c719bc8d186.gif',
      'https://i.gifer.com/TMPs.gif'
    ];
    const randomIndex = Math.floor(Math.random() * gifSources.length);
    return gifSources[randomIndex];
  }


  // Pomodoro Timer Variables
  let timer;
  let isRunning = false;
  let timeLeft = 25 * 60; // Default to 25 minutes in seconds
  const minutesElement = document.getElementById('minutes');
  const secondsElement = document.getElementById('seconds');
  const startButton = document.getElementById('start');
  const pauseButton = document.getElementById('pause');
  const resetButton = document.getElementById('reset');
  const timerSelect = document.getElementById('timerSelect');

  // Event Listeners for Timer Controls
  startButton.addEventListener('click', startTimer);
  pauseButton.addEventListener('click', pauseTimer);
  resetButton.addEventListener('click', resetTimer);
  timerSelect.addEventListener('change', updateTimerLength);

  function startTimer() {
    if (!isRunning) {
      isRunning = true;
      timer = setInterval(updateTimer, 1000);
    }
  }

  function pauseTimer() {
    if (isRunning) {
      clearInterval(timer);
      isRunning = false;
    }
  }

  function resetTimer() {
    clearInterval(timer);
    isRunning = false;
    timeLeft = parseInt(timerSelect.value) * 60; // Reset to selected length
    updateTimerDisplay();
  }

  function updateTimer() {
    if (timeLeft <= 0) {
      clearInterval(timer);
      alert("Time's up!");
      isRunning = false;
      timeLeft = parseInt(timerSelect.value) * 60; // Reset to selected length
      updateTimerDisplay();
    } else {
      timeLeft--;
      updateTimerDisplay();
    }
  }

  function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    minutesElement.textContent = minutes.toString().padStart(2, '0');
    secondsElement.textContent = seconds.toString().padStart(2, '0');
  }

  function updateTimerLength() {
    resetTimer(); // Reset the timer whenever the length is changed
    timeLeft = parseInt(timerSelect.value) * 60; // Set the new timer length
    updateTimerDisplay();
  }

  // Initial timer display update
  updateTimerDisplay();

  loadTasks(); // Load tasks from local storage
  navigate("dashboardView"); // Navigate to the dashboard view on initial load

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
  document.getElementById("addTaskButton").addEventListener("click", addTask); 
});
