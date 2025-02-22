// === Utility Functions === //

// Function to get query parameter from URL
function getQueryParameter(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

// Utility function to save data to local storage
function saveToLocalStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Utility function to load data from local storage
function loadFromLocalStorage(key, defaultValue = []) {
  return JSON.parse(localStorage.getItem(key)) || defaultValue;
}

// === Core Functionality === //

// Function to render books dynamically from the database
function renderBooks(searchTerm = "") {
  const bookList = document.getElementById("book-list");
  const searchTitle = document.getElementById("search-title");

  axios
    .get("get_books.php")
    .then((response) => {
      const books = response.data.books;

      bookList.innerHTML = ""; // Clear previous results

      // Update the title based on the search term
      searchTitle.textContent = searchTerm
        ? `Search results for "${searchTerm}"`
        : "All Books";

      // Filter books based on the search term
      const filteredBooks = searchTerm
        ? books.filter((book) =>
            book.title.toLowerCase().includes(searchTerm.toLowerCase())
          )
        : books;

      // Display message if no books matched the search
      if (filteredBooks.length === 0) {
        bookList.innerHTML = "<p>No books found.</p>";
        return;
      }

      // Render each book
      filteredBooks.forEach((book, index) => {
        const bookDiv = document.createElement("div");
        bookDiv.className = "book";
        bookDiv.innerHTML = `
          <div class="book-details">
            <div class="title">${book.title}</div>
            <div class="author">by ${book.author}</div>
            <div class="isbn">ISBN: ${book.isbn}</div>
            <div class="isbn">Quantity: ${book.quantity}</div>
            <div class="status">Status: ${book.status}</div>
            <div class="buttons">
              <button onclick="showDatePicker(${index}, 'Reserve')">Reserve</button>
              <button onclick="showDatePicker(${index}, 'Borrow')">Borrow</button>
            </div>
            <div class="date-picker" id="date-picker-${index}" style="display: none;">
              <label for="start-date">Choose a start date:</label>
              <input type="date" class="start-date">
              <label for="return-date">Choose an end date:</label>
              <input type="date" class="return-date">
              <button class="confirm-button" onclick="confirmBorrowOrReserve(${index})">Confirm</button>
            </div>
          </div>
          <img src="${book.image}" alt="${book.title}">
        `;
        bookList.appendChild(bookDiv);
      });
    })
    .catch((error) => console.error("Error fetching books:", error));
}

// Function to show the date picker for Reserve or Borrow action
function showDatePicker(index, actionType) {
  const datePicker = document.getElementById(`date-picker-${index}`);
  datePicker.style.display = "block";
  datePicker.setAttribute("data-action-type", actionType);
}

// Function to confirm borrowing or reservation
function confirmBorrowOrReserve(index) {
  const bookList = document.getElementById("book-list");
  const bookDiv = bookList.children[index];
  const title = bookDiv.querySelector(".title").textContent;
  const startDate = bookDiv.querySelector(".start-date").value;
  const endDate = bookDiv.querySelector(".return-date").value;
  const actionType = document
    .getElementById(`date-picker-${index}`)
    .getAttribute("data-action-type");

  // Validate the date inputs
  if (!startDate || !endDate) {
    alert("Please select both start and end dates.");
    return;
  }

  if (new Date(endDate) <= new Date(startDate)) {
    alert("End date must be after the start date.");
    return;
  }

  // Prompt the user to enter their Student ID (idNumber)
  const idNumber = prompt("Enter your Student ID:").trim();
  if (!idNumber) {
    alert("Student ID is required.");
    return;
  }

  // Prompt the user to enter their name
  const studentName = prompt("Enter your Name:").trim();
  if (!studentName) {
    alert("Student Name is required.");
    return;
  }

  // Use idNumber to create a unique localStorage key for the student
  const idKey = `borrowedBooks_${idNumber}`;
  let borrowedBooks = loadFromLocalStorage(idKey, []);

  // Add the new book to the borrowed or reserved list
  borrowedBooks.push({
    title,
    status: actionType,
    startDate,
    dueDate: endDate,
  });

  // Save the updated list back to localStorage
  saveToLocalStorage(idKey, borrowedBooks);
  alert(`${actionType} confirmed for Student ID: ${idNumber}!`);

  // Update the recent activity log
  addRecentActivity(studentName, idNumber, actionType, title);

  // Update the table to reflect the changes immediately
  showBorrowedBooksSection(idNumber);
}

// Function to add recent activity
function addRecentActivity(studentName, studentId, action, bookTitle) {
  const currentTime = new Date().toLocaleString(); // Get current date and time
  const newActivityItem = `${currentTime}: ${studentName} (ID: ${studentId}) ${action} "${bookTitle}"`;

  // Get the activity list from localStorage
  let recentActivities = loadFromLocalStorage("recentActivities", []);

  // Add the new activity to the beginning of the list
  recentActivities.unshift(newActivityItem);

  // Keep only the last 10 activities to limit the list size
  recentActivities = recentActivities.slice(0, 10);

  // Save the updated activity list to localStorage
  saveToLocalStorage("recentActivities", recentActivities);

  // Update the recent activity display
  updateRecentActivities();
}

// Function to update the recent activity display
function updateRecentActivities() {
  const activityList = document.getElementById("activityList");
  const recentActivities = loadFromLocalStorage("recentActivities", []);

  // Clear the current list
  activityList.innerHTML = "";

  // Display the recent activities in order (most recent first)
  if (recentActivities.length === 0) {
    activityList.innerHTML = "<li>No recent activity.</li>";
    return;
  }

  // Reverse the order to display most recent first
  recentActivities.reverse().forEach((activity) => {
    const newActivityItem = document.createElement("li");
    newActivityItem.textContent = activity;
    activityList.appendChild(newActivityItem);
  });
}

// Utility function to save data to localStorage
function saveToLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Utility function to load data from localStorage
function loadFromLocalStorage(key, defaultValue) {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : defaultValue;
}

// Function to display the student's borrowed books section
function showBorrowedBooksSection(idNumber) {
  hideAllSections();
  const studentBorrowedBooksSection = document.getElementById(
    "studentBorrowedBooksSection"
  );
  studentBorrowedBooksSection.style.display = "block";

  const borrowingInfoTitle = document.querySelector(
    "#studentBorrowedBooksSection h3"
  );
  borrowingInfoTitle.innerText = `Borrowing and Reservation Info for Student ID: ${idNumber}`;

  // Update the borrowed books table for the student
  updateBorrowedBooksTable(idNumber);
}

// Function to update the borrowed books table for a student
function updateBorrowedBooksTable(idNumber) {
  const borrowedBooksSection = document.querySelector(
    "#studentBorrowedBooksSection tbody"
  );
  const totalBorrowedElement = document.getElementById("totalBorrowed");
  const totalReservedElement = document.getElementById("totalReserved");
  borrowedBooksSection.innerHTML = ""; // Clear existing rows

  // Retrieve the borrowed or reserved books from localStorage using the idNumber
  const borrowedBooks = loadFromLocalStorage(`borrowedBooks_${idNumber}`, []);

  if (borrowedBooks.length === 0) {
    borrowedBooksSection.innerHTML =
      "<tr><td colspan='4'>No borrowed or reserved books found.</td></tr>";
    totalBorrowedElement.textContent = 0;
    totalReservedElement.textContent = 0;
    return;
  }

  let borrowedCount = 0;
  let reservedCount = 0;
  borrowedBooks.forEach((book) => {
    const newRow = borrowedBooksSection.insertRow();
    newRow.insertCell().textContent = book.title || "N/A";
    newRow.insertCell().textContent = book.status || "N/A";
    newRow.insertCell().textContent = book.startDate || "N/A";
    newRow.insertCell().textContent = book.dueDate || "N/A";

    if (book.status === "Borrow") {
      borrowedCount++;
    } else if (book.status === "Reserve") {
      reservedCount++;
    }
  });

  // Update the total counts
  totalBorrowedElement.textContent = borrowedCount;
  totalReservedElement.textContent = reservedCount;
}

// === Event Listeners === //

// Search functionality
document.getElementById("search-button").addEventListener("click", () => {
  const searchTerm = document.getElementById("search-bar").value.trim();
  renderBooks(searchTerm);
});

// Render all books on page load
document.addEventListener("DOMContentLoaded", () => {
  const searchTerm = getQueryParameter("search") || "";
  renderBooks(searchTerm);

  // Initialize the recent activity display
  updateRecentActivityDisplay();
});
