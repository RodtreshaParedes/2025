<?php
include 'db_connect.php';

if ($conn->connect_error) {
    echo json_encode(["success" => false, "message" => "Connection failed: " . $conn->connect_error]);
    exit();
}

$books = [];
$totalBooks = 0;

$sql = "SELECT * FROM books";
$result = $conn->query($sql);
if ($result) {
    while ($row = $result->fetch_assoc()) {
        $books[] = $row;
    }
}

$sql_count = "SELECT COUNT(*) as totalBooks FROM books";
$count_result = $conn->query($sql_count);
if ($count_result) {
    $totalBooks = $count_result->fetch_assoc()['totalBooks'];
}

echo json_encode([
    "success" => true,
    "books" => $books,
    "totalBooks" => $totalBooks
]);

$conn->close();
?>
