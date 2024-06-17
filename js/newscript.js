// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";
import {
getDatabase,
ref,
set,
get,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC_X80vOAxGzedQT0Qx17sTZLrYnyxq1cY",
  authDomain: "live-task-assessment.firebaseapp.com",
  databaseURL: "https://live-task-assessment-default-rtdb.firebaseio.com",
  projectId: "live-task-assessment",
  storageBucket: "live-task-assessment.appspot.com",
  messagingSenderId: "445826224445",
  appId: "1:445826224445:web:00071338f875196e06b554",
  measurementId: "G-FZ979LH8JF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getDatabase(app);


document.addEventListener('DOMContentLoaded', function() {
  const timerCells = document.querySelectorAll('.timer');
  const batchSelect = document.getElementById("batchSelect");
  const tableBody = document.querySelector("table tbody");
  const saveStartTimerBtn = document.getElementById('saveStartTimerBtn');
  const mainTimerDisplay = document.getElementById('mainTimer');
  const statusButtons = document.querySelectorAll('.status-btn');
  const timeLimitHours = document.getElementById('timeLimitHours');
  const timeLimitMinutes = document.getElementById('timeLimitMinutes');
  const maxMarks = document.getElementById('maxMarks');
  const minMarks = document.getElementById('minMarks');
  const customMarks = document.getElementById('customMarks');
  const exportBtn = document.getElementById('exportBtn');

  let mainTimer;
  let endTime;
  let taskTimers = [];
  let markRules = [];

  saveStartTimerBtn.addEventListener('click', startTimer);

  statusButtons.forEach(button => {
      button.addEventListener('click', completeTask);
      console.log('button changed');
  });

  exportBtn.addEventListener('click', exportToExcel);

  // Fetch batches and populate the dropdown
  get(ref(db, 'batches/'))
  .then(snapshot => {
      if (snapshot.exists()) {
          const batches = snapshot.val();
          for (const batch in batches) {
              const option = document.createElement("option");
              option.value = batch;
              option.textContent = batch;
              batchSelect.appendChild(option);
          }
      } else {
          console.log("No data available");
      }
  }).catch(error => {
      console.error(error);
  });

  // Fetch students when a batch is selected
  batchSelect.addEventListener("change", () => {
      const selectedBatch = batchSelect.value;
      tableBody.innerHTML = ""; // Clear previous data
      get(ref(db, `batches/${selectedBatch}`))
      .then(snapshot => {
          if (snapshot.exists()) {
              const students = snapshot.val();
              students.forEach(student => {
                  if (student) { // Check if the student data is not null
                      const row = document.createElement("tr");
                      row.innerHTML = `
                          <td>${student.id}</td>
                          <td>${student.name}</td>
                          <td>Task</td>
                          <td><button class="btn btn-outline-primary status-btn">Pending</button></td>
                          <td class="timer">00:00:00</td>
                          <td class="marks">-</td>
                      `;
                      tableBody.appendChild(row);
                  }
              });

              // Add event listeners to the new status buttons
              const statusButtons = document.querySelectorAll(".status-btn");
              statusButtons.forEach(button => {
                button.addEventListener('click', completeTask);
                console.log('button changed');
            });
          } else {
              console.log("No data available");
          }
      }).catch(error => {
          console.error(error);
      });
  });
  
  function startTimer() {
      const hours = parseInt(timeLimitHours.value) || 0;
      const minutes = parseInt(timeLimitMinutes.value) || 0;
      const totalMilliseconds = (hours * 60 * 60 + minutes * 60) * 1000;
      const startTime = Date.now();
      endTime = startTime + totalMilliseconds;

      mainTimer = setInterval(updateMainTimer, 1000);

      document.querySelectorAll('tbody tr').forEach(row => {
          row.querySelector('.marks').textContent = minMarks.value;
          const timerCell = row.querySelector('.timer');
          taskTimers.push({ timerCell, startTime });
      });

      markRules = parseMarkRules(customMarks.value);
    
  }

  function updateMainTimer() {
      const remainingTime = endTime - Date.now();
      if (remainingTime <= 0) {
          clearInterval(mainTimer);
          mainTimerDisplay.textContent = '00:00:00';
          pushDataToFirebase();
          return;
      }

      mainTimerDisplay.textContent = formatTime(remainingTime);
  }

  function completeTask(event) {
      const button = event.target;
      const row = button.closest('tr');
      const taskTimer = taskTimers.find(t => t.timerCell.closest('tr') === row);
      const remainingTime = endTime - Date.now();
      const totalMilliseconds = endTime - taskTimer.startTime;
      const maxMarksValue = parseInt(maxMarks.value);
      const minMarksValue = parseInt(minMarks.value);
      console.log(remainingTime);

      if (remainingTime > 0) {
          const timeTaken = totalMilliseconds - remainingTime;
          const marks = calculateCustomMarks(timeTaken, totalMilliseconds, markRules, maxMarksValue, minMarksValue);
          row.querySelector('.marks').textContent = marks;
          button.classList.remove('btn-outline-primary');
          button.classList.add('btn-success');
          button.textContent = 'Done';
          button.disabled = true;
          console.log(timeTaken);

          taskTimer.timerCell.textContent = formatTime(timeTaken);
      }
  }

  function parseMarkRules(rules) {
      return rules.split('\n').map(rule => {
          const [time, mark] = rule.split(',').map(val => val.trim());
          return { time: parseInt(time), mark: parseInt(mark) };
      }).sort((a, b) => a.time - b.time);
  }

  function calculateCustomMarks(timeTaken, totalMilliseconds, rules, maxMarks, minMarks) {
      const timeTakenMinutes = totalMilliseconds / 60000; // Convert milliseconds to minutes
      for (const rule of rules) {
          if (timeTakenMinutes <= rule.time) {
              return rule.mark;
          }
      }
      return minMarks; // Default to minMarks if no rules matched
  }

  function formatTime(milliseconds) {
      const totalSeconds = Math.floor(milliseconds / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }

  function pad(number) {
      return number.toString().padStart(2, '0');
  }

  function exportToExcel() {
      const table = document.querySelector('table');
      const wb = XLSX.utils.table_to_book(table, {sheet: "Sheet1"});
      XLSX.writeFile(wb, "tasks.xlsx");
  }

  function pushDataToFirebase() {
    const batch = batchSelect.value;
    const data = [];
    
    document.querySelectorAll('tbody tr').forEach(row => {
        const studentId = row.cells[0].textContent;
        const studentName = row.cells[1].textContent;
        const status = row.querySelector('.status-btn').textContent;
        const marks = row.querySelector('.marks').textContent;
        data.push({
            id: studentId,
            name: studentName,
            status: status,
            marks: marks
        });
    });

    set(ref(db, `tasks/${batch}`), data)
    .then(() => {
        console.log("Data pushed to Firebase successfully");
    })
    .catch(error => {
        console.error("Error pushing data to Firebase: ", error);
    });
}
});
