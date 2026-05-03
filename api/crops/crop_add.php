<?php
// crop_add.php - Add new crop to database

session_start();
include "../db.php";

// Check if farmer is logged in
if (!isset($_SESSION['user_id'])) {
    echo "unauthorized";
    exit();
}

$farmer_id   = $_SESSION['user_id'];
$crop_name   = $_POST['crop_name'];
$quantity    = $_POST['quantity'];
$price       = $_POST['price'];
$location    = $_POST['location'];
$status      = $_POST['status'];
$description = $_POST['description'] ?? '';

$sql = "INSERT INTO crops (farmer_id, crop_name, quantity, price, location, status, description)
        VALUES ('$farmer_id','$crop_name','$quantity','$price','$location','$status','$description')";

$result = mysqli_query($conn, $sql);

if ($result) {
    echo "success";
} else {
    echo "error";
}
?>