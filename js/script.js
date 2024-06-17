// document.addEventListener("DOMContentLoaded", () => {
//     const statusButtons = document.querySelectorAll(".status-btn");
//     const exportExcelBtn = document.getElementById("exportExcelBtn");
//     let mainTimeLeft;
//     let mainIntervalId;
//     const saveStartTimerBtn = document.getElementById('saveStartTimerBtn');
//     const mainTimerDisplay = document.getElementById('mainTimer');
//     const timeLimitHours = document.getElementById('timeLimitHours');
//     const timeLimitMinutes = document.getElementById('timeLimitMinutes');
//     const maxMarks = document.getElementById('maxMarks');
//     const minMarks = document.getElementById('minMarks');

//     let mainTimer;
//     let endTime;
//     let taskTimers = [];

//     saveStartTimerBtn.addEventListener('click', startTimer);

//     statusButtons.forEach(button => {
//         button.addEventListener('click', completeTask);
//     });

//     function startTimer() {
//         const hours = parseInt(timeLimitHours.value) || 0;
//         const minutes = parseInt(timeLimitMinutes.value) || 0;
//         const totalMilliseconds = (hours * 60 * 60 + minutes * 60) * 1000;
//         const startTime = Date.now();
//         endTime = startTime + totalMilliseconds;

//         mainTimer = setInterval(updateMainTimer, 1000);

//         document.querySelectorAll('tbody tr').forEach(row => {
//             row.querySelector('.marks').textContent = minMarks.value;
//             const timerCell = row.querySelector('.timer');
//             taskTimers.push({ timerCell, startTime });
//         });
//     }

//     function updateMainTimer() {
//         const remainingTime = endTime - Date.now();
//         if (remainingTime <= 0) {
//             clearInterval(mainTimer);
//             mainTimerDisplay.textContent = '00:00:00';
//             return;
//         }

//         mainTimerDisplay.textContent = formatTime(remainingTime);
//     }
//     function completeTask(event) {
//         const button = event.target;
//         const row = button.closest('tr');
//         const taskTimer = taskTimers.find(t => t.timerCell.closest('tr') === row);
//         const remainingTime = endTime - Date.now();
//         const totalMilliseconds = endTime - taskTimer.startTime;
//         const maxMarksValue = parseInt(maxMarks.value);
//         const minMarksValue = parseInt(minMarks.value);

//         if (remainingTime > 0) {
//             const timeTaken = totalMilliseconds - remainingTime;
//             const marks = calculateMarks(timeTaken, totalMilliseconds, maxMarksValue, minMarksValue);
//             row.querySelector('.marks').textContent = marks;
//             button.classList.remove('btn-outline-primary');
//             button.classList.add('btn-success');
//             button.textContent = 'Done';
//             button.disabled = true;
//             taskTimer.timerCell.textContent = formatTime(timeTaken);
//         }
//     }

//     function calculateMarks(timeTaken, totalMilliseconds, maxMarks, minMarks) {
//         const markRange = maxMarks - minMarks;
//         const proportion = timeTaken / totalMilliseconds;
//         return Math.round(maxMarks - (proportion * markRange));
//     }

//     function formatTime(milliseconds) {
//         const totalSeconds = Math.floor(milliseconds / 1000);
//         const hours = Math.floor(totalSeconds / 3600);
//         const minutes = Math.floor((totalSeconds % 3600) / 60);
//         const seconds = totalSeconds % 60;
//         return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
//     }

//     function pad(number) {
//         return number.toString().padStart(2, '0');
//     }
//     // Toggle task status between "Pending" and "Done"
//     statusButtons.forEach(button => {
//         button.addEventListener("click", () => {
//             if (button.textContent === "Pending") {
//                 button.textContent = "Done";
//                 button.classList.remove("btn-outline-primary");
//                 button.classList.add("btn-success");

//                 // Stop the timer for the specific task
//                 const row = button.closest('tr');
//                 const timerCell = row.querySelector('.timer');
//                 clearInterval(timerCell.intervalId);
//                 const timeTaken = timerCell.textContent;
//                 timerCell.textContent = `Submitted at ${timeTaken}`;
//             } else {
//                 button.textContent = "Pending";
//                 button.classList.remove("btn-success");
//                 button.classList.add("btn-outline-primary");

//                 // Restart the timer for the specific task (if needed)
//             }
//         });
//     });

//     // Handle Save and Start Timer button click
//     if (saveStartTimerBtn) {
//         // saveStartTimerBtn.addEventListener("click", () => {
//         //     const timeLimitHours = document.getElementById("timeLimitHours").value;
//         //     const timeLimitMinutes = document.getElementById("timeLimitMinutes").value;
//         //     mainTimeLeft = parseInt(timeLimitHours) * 60 * 60 + parseInt(timeLimitMinutes) * 60;
            
//         //     const timerCells = document.querySelectorAll('.timer');
//         //     timerCells.forEach(timerCell => {
//         //         let timeLeft = mainTimeLeft;

//         //         timerCell.intervalId = setInterval(() => {
//         //             if (timeLeft > 0) {
//         //                 timeLeft--;
//         //                 timerCell.textContent = formatTime(timeLeft);
//         //             } else {
//         //                 clearInterval(timerCell.intervalId);
//         //                 timerCell.textContent = "Time's up!";
//         //             }
//         //         }, 1000);
//         //     });

//         //     mainIntervalId = setInterval(() => {
//         //         if (mainTimeLeft > 0) {
//         //             mainTimeLeft--;
//         //             mainTimer.textContent = formatTime(mainTimeLeft);
//         //         } else {
//         //             clearInterval(mainIntervalId);
//         //             mainTimer.textContent = "Time's up!";
//         //         }
//         //     }, 1000);
//         // });
//     }

//     // Format time in HH:MM:SS
//     function formatTime(seconds) {
//         const h = Math.floor(seconds / 3600);
//         const m = Math.floor((seconds % 3600) / 60);
//         const s = seconds % 60;
//         return [h, m, s].map(v => v < 10 ? "0" + v : v).join(":");
//     }

//     // Handle Export to Excel button click
//     if (exportExcelBtn) {
//         exportExcelBtn.addEventListener("click", () => {
//             const tasks = [];
//             document.querySelectorAll("tbody tr").forEach(row => {
//                 const task = {
//                     id: row.cells[0].textContent,
//                     name: row.cells[1].textContent,
//                     task: row.cells[2].textContent,
//                     status: row.cells[3].textContent,
//                     timer: row.cells[4].textContent,
//                 };
//                 tasks.push(task);
//             });
//             const ws = XLSX.utils.json_to_sheet(tasks);
//             const wb = XLSX.utils.book_new();
//             XLSX.utils.book_append_sheet(wb, ws, "Tasks");
//             XLSX.writeFile(wb, "tasks.xlsx");
//         });
//     }
// });


document.addEventListener('DOMContentLoaded', function() {
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
    });

    exportBtn.addEventListener('click', exportToExcel);

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
            console.log(timeTaken);
            const marks = calculateCustomMarks(timeTaken, totalMilliseconds, markRules, maxMarksValue, minMarksValue);
            row.querySelector('.marks').textContent = marks;
            button.classList.remove('btn-outline-primary');
            button.classList.add('btn-success');
            button.textContent = 'Done';
            button.disabled = true;
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
        const timeTakenMinutes = timeTaken / 60000; // Convert milliseconds to minutes
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
});
