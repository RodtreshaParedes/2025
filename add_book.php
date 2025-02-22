<?php
include 'db_connect.php';

if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Connection failed: " . $conn->connect_error]);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $title = $_POST['title'] ?? '';
    $author = $_POST['author'] ?? '';
    $isbn = $_POST['isbn'] ?? '';
    $quantity = $_POST['quantity'] ?? '';
    $edition = $_POST['edition'] ?? '';
    $year = $_POST['year'] ?? '';

    if (empty($title) || empty($author) || empty($isbn) || empty($quantity) || empty($edition) || empty($year) || empty($_FILES["image"]["name"])) {
        echo json_encode(["success" => false, "message" => "Please provide all required fields."]);
        exit();
    }

    $target_dir = "../images/";
    if (!is_dir($target_dir)) {
        mkdir($target_dir, 0755, true);
    }

    if ($_FILES["image"]["error"] === UPLOAD_ERR_OK) {
        $target_file = $target_dir . basename($_FILES["image"]["name"]);
        if (move_uploaded_file($_FILES["image"]["tmp_name"], $target_file)) {
            $image_path = "/images/" . basename($_FILES["image"]["name"]);

            $conn->begin_transaction();
            try {
                $stmt = $conn->prepare("INSERT INTO books (title, author, isbn, image, quantity, edition, year) VALUES (?, ?, ?, ?, ?, ?, ?)");
                $stmt->bind_param("ssssisi", $title, $author, $isbn, $image_path, $quantity, $edition, $year);

                if ($stmt->execute()) {
                    $conn->commit();
                    echo json_encode(["success" => true, "message" => "Book added successfully!"]);
                } else {
                    throw new Exception("Database insertion failed: " . $stmt->error);
                }

            } catch (Exception $e) {
                $conn->rollback();
                echo json_encode(["success" => false, "message" => $e->getMessage()]);
            }
        } else {
            echo json_encode(["success" => false, "message" => "File upload failed."]);
        }
    } else {
        echo json_encode(["success" => false, "message" => "Error during file upload: " . $_FILES["image"]["error"]]);
    }
}

$conn->close();
?>
