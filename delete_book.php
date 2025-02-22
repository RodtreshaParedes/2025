<?php
include 'db_connect.php';

// Check connection
if ($conn->connect_error) {
    die(json_encode(['success' => false, 'message' => 'Database connection failed: ' . $conn->connect_error]));
}

$data = json_decode(file_get_contents("php://input"), true);
$isbn = $data['isbn'];

// Delete the book from the database
$stmt = $conn->prepare("DELETE FROM books WHERE isbn = ?");
$stmt->bind_param("s", $isbn);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Book deleted successfully']);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to delete book']);
}

$stmt->close();
$conn->close();
