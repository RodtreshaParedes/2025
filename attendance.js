document.addEventListener("DOMContentLoaded", () => {
  const timeInBtn = document.getElementById("time-in-btn");
  const timeOutBtn = document.getElementById("time-out-btn");
  const currentDateElement = document.getElementById("current-date");
  const currentClockElement = document.getElementById("current-clock");
  const attendanceTableBody = document.getElementById(
    "attendance-records-body"
  );

  let loggedStudents = {};
  let attendanceRecords = {};

  // Load attendance records from local storage on page load
  function loadAttendanceFromLocalStorage() {
    const storedRecords = localStorage.getItem("attendanceRecords");
    const storedLoggedStudents = localStorage.getItem("loggedStudents");

    if (storedRecords) {
      attendanceRecords = JSON.parse(storedRecords);
    }
    if (storedLoggedStudents) {
      loggedStudents = JSON.parse(storedLoggedStudents);
    }

    renderAttendanceTable(); // Render table based on loaded records
  }

  // Save attendance records to local storage
  function saveAttendanceToLocalStorage() {
    localStorage.setItem(
      "attendanceRecords",
      JSON.stringify(attendanceRecords)
    );
    localStorage.setItem("loggedStudents", JSON.stringify(loggedStudents));
  }

  // Render the attendance table from the attendanceRecords object
  function renderAttendanceTable() {
    attendanceTableBody.innerHTML = ""; // Clear existing rows
    for (const studentId in attendanceRecords) {
      attendanceRecords[studentId].forEach((record) => {
        const newRow = attendanceTableBody.insertRow();
        newRow.insertCell().textContent = studentId;
        newRow.insertCell().textContent = record.date;
        newRow.insertCell().textContent = record.timeIn;
        newRow.insertCell().textContent = record.timeOut;
      });
    }
  }

  function updateClock() {
    const now = new Date();
    const formattedDate = now.toLocaleDateString();
    const formattedTime = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    currentDateElement.textContent = formattedDate;
    currentClockElement.textContent = formattedTime;
  }

  setInterval(updateClock, 1000);

  function promptForStudentId() {
    const studentId = prompt("Please enter your Student ID:");
    return studentId ? studentId.trim() : null;
  }

  timeInBtn.addEventListener("click", () => {
    const studentId = promptForStudentId();
    if (studentId) {
      const now = new Date();
      const formattedDate = now.toLocaleDateString();
      const formattedTimeIn = now.toLocaleTimeString();

      // Check if the student has already logged "Time In" for today
      if (
        loggedStudents[studentId] &&
        loggedStudents[studentId][formattedDate]?.timeInLogged
      ) {
        alert(
          "Time In has already been logged for this session. Please log Time Out first."
        );
        return;
      }

      // Log "Time In" for the student
      logAttendance(studentId, formattedDate, formattedTimeIn, "--");

      if (!loggedStudents[studentId]) {
        loggedStudents[studentId] = {};
      }
      loggedStudents[studentId][formattedDate] = {
        timeInLogged: true,
        timeOutLogged: false,
      };

      saveAttendanceToLocalStorage();

      console.log("Time In logged for:", studentId);
    } else {
      alert("Student ID is required to log Time In.");
    }
  });

  timeOutBtn.addEventListener("click", () => {
    const studentId = promptForStudentId();
    if (studentId) {
      const now = new Date();
      const formattedDate = now.toLocaleDateString();
      const formattedTimeOut = now.toLocaleTimeString();

      // Check if the student has logged "Time In" for today
      if (
        !loggedStudents[studentId] ||
        !loggedStudents[studentId][formattedDate]?.timeInLogged
      ) {
        alert("Please log Time In first.");
        return;
      }

      // Check if the student has already logged "Time Out" for today
      if (loggedStudents[studentId][formattedDate]?.timeOutLogged) {
        alert("Time Out has already been logged for this session.");
        return;
      }

      // Find the last "Time In" record without "Time Out" for this student
      if (attendanceRecords[studentId]) {
        const lastRecord = attendanceRecords[studentId]
          .slice() // Create a shallow copy
          .reverse() // Reverse the array to find the last "Time In"
          .find(
            (record) => record.date === formattedDate && record.timeOut === "--"
          );

        if (lastRecord) {
          // Update the last "Time In" record with the "Time Out" time
          lastRecord.timeOut = formattedTimeOut;
          renderAttendanceTable(); // Re-render the table to show updated time out
          saveAttendanceToLocalStorage(); // Save changes to local storage

          // Update the logged state for the student after logging "Time Out"
          loggedStudents[studentId][formattedDate].timeOutLogged = true;

          console.log("Time Out logged for:", studentId);
        } else {
          alert(
            "No corresponding 'Time In' found for today. Please log 'Time In' first."
          );
        }
      } else {
        alert("No records found for this student.");
      }
    } else {
      alert("Student ID is required to log Time Out.");
    }
  });

  function logAttendance(studentId, date, timeIn, timeOut) {
    // Add a new attendance record
    if (!attendanceRecords[studentId]) {
      attendanceRecords[studentId] = [];
    }
    attendanceRecords[studentId].push({ date, timeIn, timeOut });

    renderAttendanceTable(); // Update the table with new data
    saveAttendanceToLocalStorage(); // Save changes to local storage
  }

  // Load initial attendance data when the page is loaded
  loadAttendanceFromLocalStorage();
});
