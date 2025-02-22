document.addEventListener("DOMContentLoaded", () => {
  // Sidebar Links
  const dashboardLink = document.getElementById("dashboardLink");
  const bookRecordsLink = document.getElementById("bookRecordsLink");
  const studentRecordsLink = document.getElementById("studentRecordsLink");
  const queriesLink = document.getElementById("queriesLink");
  const messagesLink = document.getElementById("messagesLink");
  const adminSettingsLink = document.getElementById("adminSettingsLink");

  // Sections
  const contentArea = document.getElementById("contentArea");
  const bookDetailsSection = document.getElementById("bookDetailsSection");
  const editBookSection = document.getElementById("editBookSection");
  const bookRecordsSection = document.getElementById("bookRecordsSection");
  const studentRecordsSection = document.getElementById(
    "studentRecordsSection"
  );
  const studentDetailsSection = document.getElementById(
    "studentDetailsSection"
  );
  const studentBorrowedBooksSection = document.getElementById(
    "studentBorrowedBooksSection"
  );
  const editStudentSection = document.getElementById("editStudentSection");
  const queriesSection = document.getElementById("queriesSection");
  const messagesSection = document.getElementById("messagesSection");
  const adminSettingsSection = document.getElementById("adminSettingsSection");
  const addBookModal = document.getElementById("addBookModal");
  const returnBookModal = document.getElementById("returnBookModal");

  // Function to hide all sections
  const hideAllSections = () => {
    contentArea.style.display = "none";
    bookDetailsSection.style.display = "none";
    editBookSection.style.display = "none";
    bookRecordsSection.style.display = "none";
    studentDetailsSection.style.display = "none";
    studentBorrowedBooksSection.style.display = "none";
    editStudentSection.style.display = "none";
    studentRecordsSection.style.display = "none";
    queriesSection.style.display = "none";
    messagesSection.style.display = "none";
    adminSettingsSection.style.display = "none";
  };

  // Show dashboard by default
  dashboardLink.addEventListener("click", () => {
    hideAllSections();
    contentArea.style.display = "block";
  });

  // Show dashboard by default and load total books when the page loads
  hideAllSections();
  contentArea.style.display = "block";
  loadTotalBooks(); // Load the total number of books initially

  // Event listeners for sidebar links
  dashboardLink.addEventListener("click", () => {
    hideAllSections();
    contentArea.style.display = "block";
    loadTotalBooks(); // Ensure total books are refreshed when returning to the dashboard
  });

  bookRecordsLink.addEventListener("click", () => {
    hideAllSections();
    bookRecordsSection.style.display = "block";
    loadBooksFromDatabase(); // Fetch books from the database
  });

  // Show student records section
  studentRecordsLink.addEventListener("click", () => {
    hideAllSections();
    studentRecordsSection.style.display = "block";
  });

  // // Show queries section
  // queriesLink.addEventListener("click", () => {
  //   hideAllSections();
  //   queriesSection.style.display = "block";
  // });

  // // Show messages section
  // messagesLink.addEventListener("click", () => {
  //   hideAllSections();
  //   messagesSection.style.display = "block";
  // });

  // Show admin settings section
  adminSettingsLink.addEventListener("click", () => {
    hideAllSections();
    adminSettingsSection.style.display = "block";
  });

  // Load initial data when the page is loaded
  document.addEventListener("DOMContentLoaded", () => {
    loadStudentsFromLocalStorage();
    loadAttendanceFromLocalStorage();
    updateActiveUsersCount(); // Initialize active users count on page load
    appendNewBookToList();
  });

  //! Return a Book
  document.querySelectorAll(".return-book-button").forEach((button) => {
    button.addEventListener("click", function () {
      returnBookModal.style.display = "block";
    });
  });

  // Close modal when clicking outside of it
  window.addEventListener("click", function (event) {
    if (event.target === returnBookModal) {
      returnBookModal.style.display = "none";
    }
  });

  // Close modal when clicking on the close button
  document.querySelector(".return-close-button").onclick = function () {
    returnBookModal.style.display = "none";
  };

  //! Function to load total number of books
  function loadTotalBooks() {
    const totalBooksElement = document.getElementById("totalBooks");

    // Set a loading message while the data is being fetched
    if (totalBooksElement) {
      totalBooksElement.innerText = "Loading...";
    }

    axios
      .get("fetch_books.php")
      .then((response) => {
        if (response.data.success) {
          const totalBooks = response.data.totalBooks;

          // Update the totalBooks element with the number of books
          if (totalBooksElement) {
            totalBooksElement.innerText = totalBooks;
          }
        } else {
          if (totalBooksElement) {
            totalBooksElement.innerText = "Error retrieving total books.";
          }
          alert("Error fetching total books: " + response.data.message);
        }
      })
      .catch((error) => {
        console.error("Error fetching total books:", error);
        if (totalBooksElement) {
          totalBooksElement.innerText = "Error retrieving total books.";
        }
        alert("Error fetching total books: " + error.message);
      });
  }

  // Function to load books from the database and populate the book list
  function loadBooksFromDatabase() {
    axios
      .get("fetch_books.php")
      .then((response) => {
        if (response.data.success) {
          const books = response.data.books;
          const totalBooks = response.data.totalBooks; // Get the total number of books

          const bookList = document.getElementById("bookList");
          const totalBooksElement = document.getElementById("totalBooks");

          // Update the totalBooks element if available
          if (totalBooksElement && totalBooks !== undefined) {
            totalBooksElement.innerText = totalBooks;
          }

          // Clear previous book records
          bookList.innerHTML = "";

          // Populate the book list
          books.forEach((book) => {
            const { title, author, isbn, quantity, edition, year, image } =
              book;

            // Create a new book record element
            const newBookRecord = document.createElement("div");
            newBookRecord.className = "book-record";
            newBookRecord.setAttribute("data-isbn", isbn);
            newBookRecord.setAttribute("data-quantity", quantity);
            newBookRecord.setAttribute("data-edition", edition);
            newBookRecord.setAttribute("data-year", year);
            newBookRecord.setAttribute("data-image", image);

            // Set the inner HTML for the new book record
            newBookRecord.innerHTML = `
              <p class="inline-block">${title} by ${author}</p>
              <img src="${image}" alt="${title}" style="display:none;" />
              <div class="actions">
                <button class="book-details-button inline-block">View Book Details</button>
                <i class="fas fa-edit edit-icon"></i>
                <i class="fas fa-trash-alt delete-icon"></i>
              </div>
            `;

            // Append the new book record to the book list
            bookList.appendChild(newBookRecord);

            // Add event listeners to the buttons in the new book record
            newBookRecord
              .querySelector(".book-details-button")
              .addEventListener("click", () => {
                updateBookDetails(
                  title,
                  author,
                  isbn,
                  quantity,
                  edition,
                  year,
                  image
                );
              });

            newBookRecord
              .querySelector(".edit-icon")
              .addEventListener("click", () => {
                handleEditButtonClick(newBookRecord);
              });

            newBookRecord
              .querySelector(".delete-icon")
              .addEventListener("click", () => {
                handleDeleteBook(isbn, newBookRecord);
              });
          });
        } else {
          alert("Error fetching books: " + response.data.message);
        }
      })
      .catch((error) => {
        console.error("Error fetching books:", error);
        alert("Error fetching books: " + error.message);
      });
  }

  // Event listener for the "Add Book" form submission
  document
    .getElementById("submitBookButton")
    .addEventListener("click", function (event) {
      event.preventDefault(); // Prevent form from submitting traditionally

      // Gather form data
      const title = document.getElementById("title").value;
      const author = document.getElementById("author").value;
      const isbn = document.getElementById("isbn").value;
      const quantity = document.getElementById("quantity").value;
      const edition = document.getElementById("edition").value;
      const year = document.getElementById("year").value;
      const bookImage = document.getElementById("bookImage").files[0];

      if (title && author && isbn && quantity && edition && year && bookImage) {
        const formData = new FormData();
        formData.append("title", title);
        formData.append("author", author);
        formData.append("isbn", isbn);
        formData.append("quantity", quantity);
        formData.append("edition", edition);
        formData.append("year", year);
        formData.append("image", bookImage);

        // Post request to save the book
        axios
          .post("add_book.php", formData)
          .then((response) => {
            if (response.data.success) {
              alert("Book added successfully!");

              // Close modal and reset the form
              document.getElementById("bookForm").reset();
              document.getElementById("addBookModal").style.display = "none";

              // Append new book directly to the book list without reloading
              appendNewBookToList(
                title,
                author,
                isbn,
                quantity,
                edition,
                year,
                response.data.newImageURL // Assuming API returns new image URL
              );
            } else {
              alert("Error adding the book: " + response.data.message);
            }
          })
          .catch((error) => {
            console.error("Error:", error);
            alert("Error: " + error.message);
          });
      } else {
        alert("Please fill in all the fields and select an image.");
      }
    });

  // Function to append the newly added book to the book list
  function appendNewBookToList(
    title,
    author,
    isbn,
    quantity,
    edition,
    year,
    bookImageURL
  ) {
    const bookList = document.getElementById("bookList");

    const newBookRecord = document.createElement("div");
    newBookRecord.className = "book-record";
    newBookRecord.setAttribute("data-isbn", isbn);
    newBookRecord.setAttribute("data-quantity", quantity); // Ensure quantity is set
    newBookRecord.setAttribute("data-edition", edition); // Ensure edition is set
    newBookRecord.setAttribute("data-year", year); // Ensure year is set
    newBookRecord.setAttribute("data-image", bookImageURL); // Set image URL in data attribute only

    // No <img> tag here to avoid showing the image in the book list
    newBookRecord.innerHTML = `
    <p class="inline-block">${title} by ${author}</p>
    <div class="actions">
      <button class="book-details-button inline-block">View Book Details</button>
      <i class="fas fa-edit edit-icon"></i>
      <i class="fas fa-trash-alt delete-icon"></i>
    </div>
  `;

    bookList.appendChild(newBookRecord);

    // Add event listeners to the buttons in the new book record
    newBookRecord
      .querySelector(".book-details-button")
      .addEventListener("click", function () {
        updateBookDetails(
          title,
          author,
          isbn,
          quantity,
          edition,
          year,
          bookImageURL
        );
      });

    newBookRecord
      .querySelector(".edit-icon")
      .addEventListener("click", function () {
        handleEditButtonClick(newBookRecord);
      });

    newBookRecord
      .querySelector(".delete-icon")
      .addEventListener("click", function () {
        handleDeleteBook(isbn, newBookRecord);
      });

    // // Force CSS reflow by manipulating the display style briefly
    // newBookRecord.style.display = "none"; // Temporarily hide
    // setTimeout(() => {
    //   newBookRecord.style.display = "block"; // Show again to trigger reflow
    // }, 0);

    // Add event listeners to the buttons in the new book record
    newBookRecord
      .querySelector(".book-details-button")
      .addEventListener("click", function () {
        updateBookDetails(
          title,
          author,
          isbn,
          quantity,
          edition,
          year,
          bookImageURL
        );
      });

    newBookRecord
      .querySelector(".edit-icon")
      .addEventListener("click", function () {
        handleEditButtonClick(newBookRecord);
      });

    newBookRecord
      .querySelector(".delete-icon")
      .addEventListener("click", function () {
        handleDeleteBook(isbn, newBookRecord);
      });
  }

  // Function to handle the edit button click (reused from your code)
  function handleEditButtonClick(bookRecord) {
    const title = bookRecord
      .querySelector("p.inline-block")
      .innerText.split(" by ")[0];
    const author = bookRecord
      .querySelector("p.inline-block")
      .innerText.split(" by ")[1];
    const isbn = bookRecord.getAttribute("data-isbn");
    const quantity = bookRecord.getAttribute("data-quantity");
    const edition = bookRecord.getAttribute("data-edition");
    const year = bookRecord.getAttribute("data-year");
    const imageURL = bookRecord.getAttribute("data-image");

    // Populate edit form fields
    document.getElementById("editTitle").value = title;
    document.getElementById("editAuthor").value = author;
    document.getElementById("editISBN").value = isbn;
    document.getElementById("editQuantity").value = quantity;
    document.getElementById("editEdition").value = edition;
    document.getElementById("editYear").value = year;
    document.getElementById("originalIsbn").value = isbn;

    // Append timestamp to force image refresh
    const timestamp = new Date().getTime();
    document.getElementById(
      "currentBookImage"
    ).src = `${imageURL}?t=${timestamp}`;

    hideAllSections();
    document.getElementById("editBookSection").style.display = "block";
  }

  // Function to update book details in the book details section
  function updateBookDetails(
    title,
    author,
    isbn,
    quantity,
    edition,
    year,
    bookImageURL
  ) {
    hideAllSections();
    const bookDetailsSection = document.getElementById("bookDetailsSection");
    bookDetailsSection.style.display = "block";
    document.getElementById("bookDetailTitle").innerText = title;
    document.getElementById("bookDetailAuthor").innerText = author;
    document.getElementById("bookDetailIsbn").innerText = isbn;
    document.getElementById("bookDetailQuantity").innerText = quantity;
    document.getElementById("bookDetailEdition").innerText = edition;
    document.getElementById("bookDetailYear").innerText = year;

    // Append timestamp to force image refresh
    const timestamp = new Date().getTime();
    document.getElementById(
      "bookDetailImage"
    ).src = `${bookImageURL}?t=${timestamp}`;
  }

  // Function to handle deleting a book (reused from your code)
  function handleDeleteBook(isbn, bookRecord) {
    if (confirm("Are you sure you want to delete this book?")) {
      // Send a request to delete the book from the database
      axios
        .post("delete_book.php", { isbn })
        .then((response) => {
          if (response.data.success) {
            // Remove the book record from the DOM
            bookRecord.remove();
            alert("Book deleted successfully");
          } else {
            alert("Error deleting book: " + response.data.message);
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          alert("Error deleting book: " + error.message);
        });
    }
  }

  // Add event listener for Add Book button to show the modal
  document.querySelectorAll(".add-book-button").forEach((button) => {
    button.addEventListener("click", function () {
      addBookModal.style.display = "block";
    });
  });

  // Close modal when clicking outside of it
  window.addEventListener("click", function (event) {
    if (event.target === addBookModal) {
      addBookModal.style.display = "none";
    }
  });

  // Close modal when clicking on the close button
  document.querySelector(".close-button-book").onclick = function () {
    addBookModal.style.display = "none";
  };
});

// Add an event listener to handle the form submission
document
  .getElementById("editBookForm")
  .addEventListener("submit", function (event) {
    event.preventDefault(); // Prevent the default form submission behavior

    const originalIsbn = document.getElementById("originalIsbn").value; // Hidden input
    const title = document.getElementById("editTitle").value;
    const author = document.getElementById("editAuthor").value;
    const isbn = document.getElementById("editISBN").value;
    const quantity = document.getElementById("editQuantity").value;
    const edition = document.getElementById("editEdition").value;
    const year = document.getElementById("editYear").value;
    const bookImage = document.getElementById("editBookImage").files[0];

    if (title && author && isbn && quantity && edition && year) {
      const formData = new FormData();
      formData.append("originalIsbn", originalIsbn); // Send original ISBN for identification
      formData.append("title", title);
      formData.append("author", author);
      formData.append("isbn", isbn);
      formData.append("quantity", quantity);
      formData.append("edition", edition);
      formData.append("year", year);
      if (bookImage) {
        formData.append("image", bookImage); // Only if the user updates the image
      }

      axios
        .post("update_book.php", formData)
        .then((response) => {
          if (response.data.success) {
            // Show the book records section without reloading the page
            hideAllSections();
            document.getElementById("bookRecordsSection").style.display =
              "block";

            // Optionally, update the book list UI with the new data
            const bookRecord = document.querySelector(
              `[data-isbn="${originalIsbn}"]`
            );
            if (bookRecord) {
              bookRecord.querySelector(
                "p.inline-block"
              ).innerText = `${title} by ${author}`;
              if (bookImage) {
                const newImageURL = response.data.newImageURL; // Get the new image URL from the response
                bookRecord.querySelector("img").src = newImageURL;
              }
              bookRecord.setAttribute("data-isbn", isbn); // Update ISBN if it changed
            }
          } else {
            alert("Error updating the book: " + response.data.message);
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          alert("Error updating the book: " + error.message);
        });
    } else {
      alert("Please fill in all the fields.");
    }
  });

//! Add New Student
// === Utility Functions === //

// Function to get query parameter from URL
function getQueryParameter(name) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(name);
}

// Function to save data to local storage
function saveToLocalStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Function to load data from local storage
function loadFromLocalStorage(key, defaultValue = []) {
  return JSON.parse(localStorage.getItem(key)) || defaultValue;
}

// Save students to local storage
function saveStudentsToLocalStorage(students) {
  saveToLocalStorage("students", students);
}

// Load students from local storage
function loadStudentsFromLocalStorage() {
  const students = loadFromLocalStorage("students", []);
  displayStudentList(students);
  return students;
}

// Save attendance records to local storage
function saveAttendanceToLocalStorage(attendanceRecords) {
  saveToLocalStorage("attendanceRecords", attendanceRecords);
}

// Load attendance records from local storage
function loadAttendanceFromLocalStorage() {
  return loadFromLocalStorage("attendanceRecords", {});
}

// === Core Functionality === //

// Function to update the "Active Users" count based on the number of students
function updateActiveUsersCount() {
  const students = loadFromLocalStorage("students", []);
  const activeUsersElement = document.getElementById("activeUsers");
  activeUsersElement.textContent = students.length;
}

// Display student list function
function displayStudentList(students) {
  const studentList = document.getElementById("studentList");
  studentList.innerHTML = ""; // Clear existing records

  students.forEach((student) => {
    const newStudentRecord = document.createElement("div");
    newStudentRecord.className = "student-record";
    newStudentRecord.setAttribute("data-id", student.idNumber);

    newStudentRecord.innerHTML = `
      <p class="inline-block">${student.firstName} ${student.lastName}</p>
      <span class="email" style="display:none;">${student.email}</span>
      <span class="contact-number" style="display:none;">${student.contactNumber}</span>
      <span class="address" style="display:none;">${student.address}</span>
      <span class="password" style="display:none;">${student.password}</span>
      <div class="actions">
        <button class="student-details-button inline-block">View Student Details</button>
        <button class="book-borrowed-button inline-block">Books Borrowed</button>
        <i class="fas fa-edit edit-icon"></i>
        <i class="fas fa-trash-alt delete-icon"></i>
      </div>
    `;

    studentList.appendChild(newStudentRecord);

    // Attach event listeners for each action
    attachStudentEventListeners(newStudentRecord);
  });

  // Update active users count
  updateActiveUsersCount();
}

// Function to attach event listeners to student actions
function attachStudentEventListeners(studentRecord) {
  const deleteIcon = studentRecord.querySelector(".delete-icon");
  const editIcon = studentRecord.querySelector(".edit-icon");
  const detailsButton = studentRecord.querySelector(".student-details-button");
  const bookButton = studentRecord.querySelector(".book-borrowed-button");

  deleteIcon.addEventListener("click", () =>
    handleDeleteStudentButtonClick(studentRecord)
  );
  editIcon.addEventListener("click", () =>
    handleEditStudentButtonClick(studentRecord)
  );
  detailsButton.addEventListener("click", () =>
    showStudentDetails(studentRecord)
  );
  bookButton.addEventListener("click", () =>
    showBorrowedBooksSection(studentRecord.getAttribute("data-id"))
  );
}

// Function to handle deleting a student
function handleDeleteStudentButtonClick(studentRecord) {
  const idNumber = studentRecord.getAttribute("data-id");

  if (confirm("Are you sure you want to delete this student?")) {
    // Load existing students from local storage
    let students = loadStudentsFromLocalStorage();

    // Filter out the student to delete
    students = students.filter((student) => student.idNumber !== idNumber);

    // Save the updated list to local storage
    saveStudentsToLocalStorage(students);

    // Update the displayed student list
    displayStudentList(students);

    // Update the active users count
    updateActiveUsersCount();

    alert("Student deleted successfully.");
  }
}

// Function to show student details
function showStudentDetails(studentRecord) {
  const fullName = studentRecord.querySelector("p.inline-block").innerText;
  const idNumber = studentRecord.getAttribute("data-id");
  const email = studentRecord.querySelector("span.email").innerText;
  const contactNumber = studentRecord.querySelector(
    "span.contact-number"
  ).innerText;
  const address = studentRecord.querySelector("span.address").innerText;
  const password = studentRecord.querySelector("span.password").innerText;

  updateStudentDetails(
    fullName,
    idNumber,
    email,
    contactNumber,
    address,
    password
  );
}

// Function to update student details in the student details section
function updateStudentDetails(
  fullName,
  idNumber,
  email,
  contactNumber,
  address,
  password
) {
  hideAllSections();
  const studentDetailsSection = document.getElementById(
    "studentDetailsSection"
  );
  studentDetailsSection.style.display = "block";

  // Display the full name
  document.getElementById("studentDetailName").innerText = fullName;
  document.getElementById("studentDetailId").innerText = idNumber;
  document.getElementById("studentDetailEmail").innerText = email;
  document.getElementById("studentDetailContact").innerText = contactNumber;
  document.getElementById("studentDetailAddress").innerText = address;
  document.getElementById("studentDetailPassword").innerText = "********"; // Mask password

  // Display the student's attendance information
  displayAttendanceInfo(idNumber);
}

// Function to display the attendance information for a specific student
function displayAttendanceInfo(idNumber) {
  const attendanceTableBody = document.querySelector(
    "#studentDetailsSection .student-attendance-info tbody"
  );
  const totalAttendanceElement = document.getElementById("totalAttendance");

  // Clear existing rows in the attendance table
  attendanceTableBody.innerHTML = "";

  // Load attendance records from local storage
  const attendanceRecords = loadAttendanceFromLocalStorage();
  const studentRecords = attendanceRecords[idNumber] || [];

  // Populate the table with the student's attendance data
  studentRecords.forEach((record) => {
    const newRow = attendanceTableBody.insertRow();
    newRow.insertCell().textContent = record.date;
    newRow.insertCell().textContent = record.timeIn;
    newRow.insertCell().textContent = record.timeOut;
  });

  // Update the total attendance count
  totalAttendanceElement.textContent = studentRecords.length;
}

// Event listener for "Return a Book" form submission
document
  .getElementById("returnBookForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();

    const bookTitle = document.getElementById("bookTitle").value.trim();
    const studentId = document.getElementById("studentId").value.trim();
    const returnDate = document.getElementById("returnDate").value;

    if (!bookTitle || !studentId || !returnDate) {
      alert("Please fill out all fields.");
      return;
    }

    // Load the student details (assuming you have a function to get student by ID)
    const students = loadStudentsFromLocalStorage();
    const student = students.find((s) => s.idNumber === studentId);
    if (!student) {
      alert("Student not found.");
      return;
    }

    // Load the borrowed books from localStorage
    const borrowedBooksKey = `borrowedBooks_${studentId}`;
    const borrowedBooks = loadFromLocalStorage(borrowedBooksKey, []);
    const bookIndex = borrowedBooks.findIndex(
      (book) =>
        book.title.toLowerCase() === bookTitle.toLowerCase() &&
        book.status === "Borrow"
    );

    if (bookIndex === -1) {
      alert("The book is not found or it is not currently borrowed.");
      return;
    }

    // Update the return date and save the changes
    borrowedBooks[bookIndex].returnDate = returnDate;
    saveToLocalStorage(borrowedBooksKey, borrowedBooks);

    // Add the recent activity
    addRecentActivity(
      student.firstName + " " + student.lastName,
      studentId,
      bookTitle,
      "returned"
    );

    // Close the modal and refresh the table
    document.getElementById("returnBookModal").style.display = "none";
    showBorrowedBooksSection(studentId);
    alert("The book has been successfully returned.");
  });

//! Function to add recent activity
function addRecentActivity(studentName, studentId, bookTitle, action) {
  const activityList = document.getElementById("activityList");
  const currentTime = new Date().toLocaleString(); // Get current timestamp

  const newActivityItem = `${currentTime}: ${studentName} (ID: ${studentId}) ${action} "${bookTitle}"`;

  // Update local storage
  let recentActivities = loadFromLocalStorage("recentActivities", []);
  recentActivities.push(newActivityItem);

  // Keep only the last 10 activities
  if (recentActivities.length > 10) {
    recentActivities.shift();
  }

  saveToLocalStorage("recentActivities", recentActivities);

  // Update the activity list in the DOM
  updateRecentActivities();
}

// Helper function to update the recent activities displayed on the page
function updateRecentActivities() {
  const activityList = document.getElementById("activityList");
  let recentActivities = loadFromLocalStorage("recentActivities", []);

  activityList.innerHTML = ""; // Clear the existing activities

  if (recentActivities.length === 0) {
    activityList.innerHTML = "<li>No recent activity.</li>";
  } else {
    recentActivities.forEach((activity) => {
      const newActivityItem = document.createElement("li");
      newActivityItem.textContent = activity;
      activityList.appendChild(newActivityItem);
    });
  }
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

// Function to calculate the total number of overdue books across all students
function calculateTotalOverdueBooks() {
  let totalOverdueCount = 0;

  // Load all students from local storage
  const students = loadStudentsFromLocalStorage();

  // Iterate through each student's borrowed books to check for overdue books
  students.forEach((student) => {
    const borrowedBooks = loadFromLocalStorage(
      `borrowedBooks_${student.idNumber}`,
      []
    );

    borrowedBooks.forEach((book) => {
      const dueDate = book.dueDate ? new Date(book.dueDate) : null;
      const returnDate = book.returnDate ? new Date(book.returnDate) : null;

      // Check if the book was overdue before being returned or is still overdue
      if (book.status === "Borrow") {
        const today = new Date();

        // Case 1: The book was overdue and hasn't been returned yet
        if (dueDate && dueDate < today && !returnDate) {
          totalOverdueCount++;
        }
        // Case 2: The book was returned after the due date, count as overdue
        else if (returnDate && dueDate && returnDate > dueDate) {
        }
        // Case 3: The book was returned on time, do not count as overdue
        else if (returnDate && dueDate && returnDate <= dueDate) {
          // No action needed, book is considered returned on time
        }
      }
    });
  });

  // Update the overdue books count in the DOM
  const overdueBooksElement = document.getElementById("overdueBooks");
  overdueBooksElement.textContent = totalOverdueCount;
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

  // Recalculate the total overdue books across all students
  calculateTotalOverdueBooks();
}

function updateBorrowedBooksTable(idNumber) {
  const borrowedBooksSection = document.querySelector(
    "#studentBorrowedBooksSection tbody"
  );
  const totalBorrowedElement = document.getElementById("totalBorrowed");
  const totalReservedElement = document.getElementById("totalReserved");
  borrowedBooksSection.innerHTML = ""; // Clear existing rows

  const borrowedBooks = loadFromLocalStorage(`borrowedBooks_${idNumber}`, []);

  if (borrowedBooks.length === 0) {
    borrowedBooksSection.innerHTML =
      "<tr><td colspan='5'>No borrowed or reserved books found.</td></tr>";
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
    newRow.insertCell().textContent = book.returnDate || "N/A"; // Display the return date

    if (book.status === "Borrow") {
      borrowedCount++;
    } else if (book.status === "Reserve") {
      reservedCount++;
    }
  });

  totalBorrowedElement.textContent = borrowedCount;
  totalReservedElement.textContent = reservedCount;

  // Recalculate the total overdue books across all students
  calculateTotalOverdueBooks();
}

// Function to handle book return and update overdue notifications if applicable
function returnBook(studentId, bookTitle) {
  const borrowedBooksKey = `borrowedBooks_${studentId}`;
  let borrowedBooks = loadFromLocalStorage(borrowedBooksKey, []);

  const bookIndex = borrowedBooks.findIndex(
    (book) => book.title === bookTitle && book.status === "Borrow"
  );

  if (bookIndex !== -1) {
    borrowedBooks[bookIndex].returnDate = new Date().toLocaleDateString();

    // Update localStorage
    saveToLocalStorage(borrowedBooksKey, borrowedBooks);

    // Update notifications immediately
    updateNotifications();

    alert(
      `Book "${bookTitle}" returned successfully for student ID: ${studentId}.`
    );
  } else {
    alert("Book not found or already returned.");
  }
}

// Update the `updateNotifications` function to clear existing notifications and refresh them
function updateNotifications() {
  const notificationArea = document.getElementById("notificationArea");
  let notifications = [];

  // Load all students from localStorage
  const students = loadStudentsFromLocalStorage();

  students.forEach((student) => {
    const borrowedBooks = loadFromLocalStorage(
      `borrowedBooks_${student.idNumber}`,
      []
    );

    borrowedBooks.forEach((book) => {
      // Check if the book is overdue and hasn't been returned
      if (book.status === "Borrow" && book.dueDate) {
        const dueDate = new Date(book.dueDate);
        const today = new Date();

        // Calculate days overdue
        if (dueDate < today && !book.returnDate) {
          const daysOverdue = Math.floor(
            (today - dueDate) / (1000 * 60 * 60 * 24)
          );
          notifications.push(
            `${student.firstName} ${student.lastName} (ID: ${student.idNumber}) has an overdue book: "${book.title}". Overdue by ${daysOverdue} days.`
          );
        }
      }
    });
  });

  // Clear existing notifications
  notificationArea.innerHTML = "<h3>Notifications</h3><ul></ul>";

  // Display notifications
  const notificationList = notificationArea.querySelector("ul");
  if (notifications.length === 0) {
    notificationList.innerHTML = "<li>No new notifications.</li>";
  } else {
    notifications.forEach((message) => {
      const notificationItem = document.createElement("li");
      notificationItem.textContent = message;
      notificationList.appendChild(notificationItem);
    });
  }
}

// Event listener to refresh notifications on page load
document.addEventListener("DOMContentLoaded", () => {
  updateNotifications();
});

// Load initial data when the page is loaded
document.addEventListener("DOMContentLoaded", () => {
  loadStudentsFromLocalStorage();
  loadAttendanceFromLocalStorage();
  calculateTotalOverdueBooks(); // Calculate the total overdue books on page load
  updateRecentActivities();
});

// Function to handle editing a student
function handleEditStudentButtonClick(studentRecord) {
  const fullName = studentRecord
    .querySelector("p.inline-block")
    .innerText.trim();
  const nameParts = fullName.split(" ").filter(Boolean); // Split by spaces and remove empty elements

  let firstName = "";
  let lastName = "";

  if (nameParts.length >= 4) {
    // Four or more parts: first two are first name, last two are last name
    firstName = nameParts.slice(0, 2).join(" ");
    lastName = nameParts.slice(-2).join(" ");
  } else if (nameParts.length === 3) {
    // Three parts: use the preference flag to decide how to split
    firstName = nameParts.slice(0, 2).join(" ");
    lastName = nameParts[2];
  } else if (nameParts.length === 2) {
    // Two parts: first is first name, second is last name
    firstName = nameParts[0];
    lastName = nameParts[1];
  } else if (nameParts.length === 1) {
    // One part: use as first name, leave last name empty
    firstName = nameParts[0];
    lastName = "";
  }

  // Populate the edit form with existing student data
  document.getElementById("editFirstName").value = firstName;
  document.getElementById("editLastName").value = lastName;
  const idNumber = studentRecord.getAttribute("data-id");
  const email = studentRecord.querySelector("span.email").innerText;
  const contactNumber = studentRecord.querySelector(
    "span.contact-number"
  ).innerText;
  const address = studentRecord.querySelector("span.address").innerText;
  const password = studentRecord.querySelector("span.password").innerText;

  document.getElementById("editIdNumber").value = idNumber;
  document.getElementById("editEmail").value = email;
  document.getElementById("editContactNumber").value = contactNumber;
  document.getElementById("editAddress").value = address;
  document.getElementById("editPassword").value = password;
  document.getElementById("originalId").value = idNumber; // Store the original ID

  // Hide all other sections and show the edit section
  hideAllSections();
  document.getElementById("editStudentSection").style.display = "block ";
}

// Hide all sections
function hideAllSections() {
  document.querySelectorAll(".content").forEach((section) => {
    section.style.display = "none";
  });
}

// === Event Listeners === //

// Show the Add Student Modal
document.querySelector(".add-student-button").addEventListener("click", () => {
  document.getElementById("addStudentModal").style.display = "block";
});

// Close the modal when the close button is clicked
document
  .querySelector(".close-button-student")
  .addEventListener("click", () => {
    document.getElementById("addStudentModal").style.display = "none";
  });

// Handle form submission for adding a new student
document
  .getElementById("submitStudentButton")
  .addEventListener("click", (event) => {
    event.preventDefault();

    // Get input values
    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const idNumber = document.getElementById("idNumber").value.trim();
    const email = document.getElementById("email").value.trim();
    const contactNumber = document.getElementById("contactNumber").value.trim();
    const address = document.getElementById("address").value.trim();
    const password = document.getElementById("password").value.trim();

    // Validate form data
    if (
      firstName &&
      lastName &&
      idNumber &&
      email &&
      contactNumber &&
      address &&
      password
    ) {
      // Create new student object
      const newStudent = {
        firstName,
        lastName,
        idNumber,
        email,
        contactNumber,
        address,
        password,
      };

      // Load existing students from local storage
      let students = loadStudentsFromLocalStorage();
      students.push(newStudent); // Add new student to the list

      // Save updated list to local storage
      saveStudentsToLocalStorage(students);

      // Update displayed student list
      displayStudentList(students);

      // Reset the form
      document.getElementById("studentForm").reset();

      // Close the modal
      document.getElementById("addStudentModal").style.display = "none";

      // Update the active users count
      updateActiveUsersCount();
    } else {
      alert("Please fill in all the fields.");
    }
  });

// Handle form submission for editing a student
document
  .getElementById("editStudentForm")
  .addEventListener("submit", (event) => {
    event.preventDefault(); // Prevent the default form submission

    // Get input values from the edit form
    const firstName = document.getElementById("editFirstName").value.trim();
    const lastName = document.getElementById("editLastName").value.trim();
    const idNumber = document.getElementById("editIdNumber").value.trim();
    const email = document.getElementById("editEmail").value.trim();
    const contactNumber = document
      .getElementById("editContactNumber")
      .value.trim();
    const address = document.getElementById("editAddress").value.trim();
    const password = document.getElementById("editPassword").value.trim();
    const originalId = document.getElementById("originalId").value; // Original ID for lookup

    // Validate form data
    if (
      firstName &&
      lastName &&
      idNumber &&
      email &&
      contactNumber &&
      address &&
      password
    ) {
      // Load existing students from local storage
      let students = loadStudentsFromLocalStorage();

      // Find the student to update
      const studentIndex = students.findIndex(
        (student) => student.idNumber === originalId
      );

      if (studentIndex !== -1) {
        // Update the student details
        students[studentIndex] = {
          firstName,
          lastName,
          idNumber,
          email,
          contactNumber,
          address,
          password,
        };

        // Save updated list to local storage
        saveStudentsToLocalStorage(students);

        // Update the displayed student list
        displayStudentList(students);

        // Hide the edit section and show the student records section
        document.getElementById("editStudentSection").style.display = "none";
        document.getElementById("studentRecordsSection").style.display =
          "block";

        // Update the student details section if it's currently being displayed
        const fullName = `${firstName} ${lastName}`;
        updateStudentDetails(
          fullName,
          idNumber,
          email,
          contactNumber,
          address,
          password
        );
      } else {
        alert("Student not found.");
      }
    } else {
      alert("Please fill in all the fields.");
    }
  });

// Load initial data when the page is loaded
document.addEventListener("DOMContentLoaded", () => {
  loadStudentsFromLocalStorage();
  loadAttendanceFromLocalStorage(); // Ensure attendance data is available
});

//! Register New User
document.addEventListener("DOMContentLoaded", () => {
  const registerModal = document.getElementById("registerModal");
  const registerUserButton = document.getElementById("registerUserButton");
  const closeButtonRegister = document.querySelector(".close-button-register");

  // Function to close registration modal
  function closeModal(modal) {
    modal.style.display = "none";
  }

  // Function to display user list
  function displayUserList() {
    const userList = document.getElementById("userList");
    userList.innerHTML = "";

    const users = JSON.parse(localStorage.getItem("users")) || [];

    users.forEach((user, index) => {
      const userCard = document.createElement("div");
      userCard.className = "user-card";
      userCard.innerHTML = `
        <div class="user-info">
          <p class="inline-block">${user.email}</p>
          <p class="inline-block">${user.role}</p>
        </div>
        <div class="actions">
          <button class="delete-user-button" data-index="${index}">Delete</button>
        </div>
      `;

      userList.appendChild(userCard);

      userCard
        .querySelector(".delete-user-button")
        .addEventListener("click", function () {
          const index = this.getAttribute("data-index");
          const users = JSON.parse(localStorage.getItem("users")) || [];
          users.splice(index, 1);
          localStorage.setItem("users", JSON.stringify(users));
          displayUserList(); // Refresh the list
        });
    });
  }

  // Show registration modal when registerUserButton is clicked
  registerUserButton.addEventListener("click", () => {
    registerModal.style.display = "block";
  });

  // Close the registration modal when close button is clicked
  closeButtonRegister.addEventListener("click", () => {
    closeModal(registerModal);
  });

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function (event) {
    if (event.target === registerModal) {
      closeModal(registerModal);
    }
  };

  // Handle registration form submission
  document
    .getElementById("registerForm")
    .addEventListener("submit", function (event) {
      event.preventDefault();
      const registerEmail = document.getElementById("registerEmail").value;
      const registerPassword =
        document.getElementById("registerPassword").value;
      const registerRole = document.getElementById("registerRole").value;

      // Store the new user in localStorage
      let users = JSON.parse(localStorage.getItem("users")) || [];
      users.push({
        email: registerEmail,
        password: registerPassword,
        role: registerRole,
      });
      localStorage.setItem("users", JSON.stringify(users));

      // Close the registration modal after successful registration
      closeModal(registerModal);

      // Update the user list
      displayUserList();
    });

  // Load the initial user list
  displayUserList();
});

// Handle login
document.getElementById("loginForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const loginEmail = document.getElementById("loginEmail").value;
  const loginPassword = document.getElementById("loginPassword").value;

  // Retrieve users from localStorage
  let users = JSON.parse(localStorage.getItem("users")) || [];

  // Check for default admin credentials
  if (loginEmail === "admin" && loginPassword === "password") {
    localStorage.setItem("loggedIn", "true");
    document.getElementById("loginScreen").style.display = "none";
    document.getElementById("dashboard").style.display = "block";
  } else {
    // Check for registered users
    const validUser = users.find(
      (user) => user.email === loginEmail && user.password === loginPassword
    );

    if (validUser) {
      localStorage.setItem("loggedIn", "true");
      document.getElementById("loginScreen").style.display = "none";
      document.getElementById("dashboard").style.display = "block";
    } else {
      document.getElementById("errorMsg").innerText =
        "Invalid login credentials";
    }
  }
});

// Handle logout
const logoutButton = document.getElementById("logoutButton");
logoutButton.addEventListener("click", () => {
  localStorage.removeItem("loggedIn");
  document.getElementById("loginScreen").style.display = "block";
  document.getElementById("dashboard").style.display = "none";
  document.getElementById("loginForm").reset();
});

const labels = document.querySelectorAll(".form-control label");
labels.forEach((label) => {
  label.innerHTML = label.innerText
    .split("")
    .map(
      (letter, index) =>
        `<span style="transition-delay:${index * 40}ms">${letter}</span>`
    )
    .join("");
});

// Add a class to the cancel button
document.querySelectorAll(".cancel-edit-button").forEach((button) => {
  button.addEventListener("click", function () {
    document.getElementById("studentRecordsSection").style.display = "block";
    document.getElementById("editStudentSection").style.display = "none";
  });
});

// Close modal when clicking outside of it
window.addEventListener("click", function (event) {
  if (event.target === registerModal) {
    closeModal(registerModal);
  }
  if (event.target === document.getElementById("addBookModal")) {
    document.getElementById("addBookModal").style.display = "none";
  }
  if (event.target === document.getElementById("addStudentModal")) {
    document.getElementById("addStudentModal").style.display = "none";
  }
});

// Close modal when clicking on the close button
document.querySelector(".close-button-register").onclick = function () {
  closeModal(registerModal);
};
document.querySelector(".close-button-book").onclick = function () {
  document.getElementById("addBookModal").style.display = "none";
};
document.querySelector(".close-button-student").onclick = function () {
  document.getElementById("addStudentModal").style.display = "none";
};

// Close modal after submitting the form
document.getElementById("registerForm").addEventListener("submit", function () {
  registerModal.style.display = "none";
});
document.getElementById("bookForm").addEventListener("submit", function () {
  document.getElementById("addBookModal").style.display = "none";
});
document.getElementById("studentForm").addEventListener("submit", function () {
  document.getElementById("addStudentModal").style.display = "none";
});
