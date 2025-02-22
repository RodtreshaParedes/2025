<?php
include 'db_connect.php';

// Check connection
if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Connection failed: " . $conn->connect_error]);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $originalIsbn = $_POST['originalIsbn'] ?? null;
    $title = $_POST['title'] ?? '';
    $author = $_POST['author'] ?? '';
    $isbn = $_POST['isbn'] ?? '';
    $quantity = $_POST['quantity'] ?? 0;
    $edition = $_POST['edition'] ?? '';
    $year = $_POST['year'] ?? '';
    $imageUrl = null;

    // Check if an image file was uploaded
    if (!empty($_FILES['image']['name'])) {
        $target_dir = "../images/";

        // Ensure the images directory exists
        if (!is_dir($target_dir)) {
            mkdir($target_dir, 0755, true);
        }

        $target_file = $target_dir . basename($_FILES["image"]["name"]);

        // Attempt to move the uploaded file
        if (move_uploaded_file($_FILES["image"]["tmp_name"], $target_file)) {
            $imageUrl = "/images/" . basename($_FILES["image"]["name"]); // Store the relative image path
        } else {
            echo json_encode(["success" => false, "message" => "Failed to upload image"]);
            exit();
        }
    }

    // Prepare SQL query to update book information
    $sql = "UPDATE books SET title = ?, author = ?, isbn = ?, quantity = ?, edition = ?, year = ?";
    $params = [$title, $author, $isbn, $quantity, $edition, $year];

    // If an image was uploaded, add the image column to the update query
    if ($imageUrl) {
        $sql .= ", image = ?";
        $params[] = $imageUrl;
    }

    $sql .= " WHERE isbn = ?";
    $params[] = $originalIsbn;

    // Prepare and bind the query dynamically
    $stmt = $conn->prepare($sql);
    $types = str_repeat("s", count($params));
    $stmt->bind_param($types, ...$params);

    // Execute the query and check if it was successful
    if ($stmt->execute()) {
        $response = ["success" => true];
        if ($imageUrl) {
            $response['newImageURL'] = $imageUrl; // Include new image URL if updated
        }
        echo json_encode($response);
    } else {
        echo json_encode(["success" => false, "message" => "Failed to update book: " . $stmt->error]);
    }

    // Close the statement and connection
    $stmt->close();
    $conn->close();
} else {
    echo json_encode(["success" => false, "message" => "Invalid request method"]);
}
