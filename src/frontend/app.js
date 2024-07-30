document.addEventListener("DOMContentLoaded", () => {
  let welcomeMessageDisplayed = false; // Track whether the welcome message has been displayed
  const taskList = []; // Array to hold tasks

  // Load tasks from local storage
  function loadTasks() {
    const storedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    storedTasks.forEach(task => {
      taskList.push(task);
      displayTask(task); // Display each task when loading
    });
  }

  // Save tasks to local storage
  function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(taskList));
  }

  // Function to display a task in the task list
  function displayTask(task) {
    const taskListElement = document.getElementById('taskList');
    const taskItem = document.createElement('li');
    taskItem.textContent = `${task.title} (due on ${formatDate(task.dueDate)})`; // Use the formatDate function

    // Create a delete button for the task
    const deleteButton = document.createElement('button');
    deleteButton.textContent = "Delete";
    deleteButton.addEventListener('click', () => {
      taskListElement.removeChild(taskItem); // Remove the task from the list
      taskList.splice(taskList.indexOf(task), 1); // Remove the task from the array
      saveTasks(); // Save updated tasks to local storage
    });

    taskItem.appendChild(deleteButton); // Append delete button to the task item
    taskListElement.appendChild(taskItem); // Append the task item to the task list
  }

  function navigate(viewId) {
    // Hide all views
    document.querySelectorAll(".view").forEach((view) => {
      view.style.display = "none";
    });

    // Show the requested view
    const viewToShow = document.getElementById(viewId);
    if (viewToShow) {
      viewToShow.style.display = "block";
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
      'https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/6b86bdb4-540f-4240-bed6-228912593dc2/dgq1nqd-5600b6c5-ff00-4dae-842e-051590adc4c7.gif?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7InBhdGgiOiJcL2ZcLzZiODZiZGI0LTU0MGYtNDI0MC1iZWQ2LTIyODkxMjU5M2RjMlwvZGdxMW5xZC01NjAwYjZjNS1mZjAwLTRkYWUtODQyZS0wNTE1OTBhZGM0YzcuZ2lmIn1dXSwiYXVkIjpbInVybjpzZXJ2aWNlOmZpbGUuZG93bmxvYWQiXX0.LOQ2K2fMQ_YnEaCCF7i2DmNWOSycnYWkHqf59BMiSQ8',
      'https://cdn.dribbble.com/users/41854/screenshots/2354844/media/13983429fa8901729c3596a923d56b19.gif',
      'https://i.pinimg.com/originals/05/9a/18/059a1869bc4131c98e6f2bea5c4799b4.gif',
      'https://i.pinimg.com/originals/4c/b9/f4/4cb9f4852bd0a30d722285e802660bf3.gif',
      'https://i.pinimg.com/originals/3c/d8/7c/3cd87c4e25236db16896c034667f265e.gif'
    ];

    const randomIndex = Math.floor(Math.random() * gifSources.length);
    return gifSources[randomIndex];
  }

  // Add event listeners for navigation buttons
  document.getElementById("dashboard").addEventListener("click", () => navigate("dashboardView"));
  document.getElementById("tasks").addEventListener("click", () => navigate("tasksView"));
  document.getElementById("calendar").addEventListener("click", () => navigate("calendarView"));
  document.getElementById("tunes").addEventListener("click", () => navigate("tunesView"));

  // Initialize with the dashboard view
  navigate("dashboardView");

  // Welcome message
  const welcomeMessageDiv = document.getElementById('welcome-message');
  const userNameKey = 'tuneTaskUserName';

  let userName = localStorage.getItem(userNameKey);

  if (!userName) {
    userName = prompt("Welcome! Please enter your name:");

    if (userName) {
      localStorage.setItem(userNameKey, userName);
    } else {
      userName = 'Guest';
    }
  }

  welcomeMessageDiv.textContent = `Welcome${userName === 'Guest' ? '' : ` back, ${userName}`}!`;

  
  function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', options); // Format date to "Day Month, Year"
  }

  // Load tasks when the page loads
  loadTasks();

  // Add tasks
  document.getElementById('addTaskButton').addEventListener('click', () => {
    const taskInput = document.getElementById('taskInput');
    const taskDueDate = document.getElementById('taskDate');

    const taskTitle = taskInput.value.trim();
    const dueDate = taskDueDate.value; 

    if (taskTitle && dueDate) {
      // Add task to the list
      const newTask = { title: taskTitle, dueDate: dueDate };
      taskList.push(newTask);
      displayTask(newTask); 
      saveTasks(); // Save updated tasks to local storage

      // Clear the input fields
      taskInput.value = '';
      taskDueDate.value = '';
    } else {
      alert("Please enter a task title and select a due date.");
    }
  });
});
