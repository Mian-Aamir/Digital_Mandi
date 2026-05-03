<?php
// crop_update.php - Update existing crop

session_start();
include "../db.php";

// Check if farmer is logged in
if (!isset($_SESSION['user_id'])) {
    echo "unauthorized";
    exit();
}

$farmer_id   = $_SESSION['user_id'];
$crop_id     = $_POST['crop_id'];
$crop_name   = $_POST['crop_name'];
$quantity    = $_POST['quantity'];
$price       = $_POST['price'];
$location    = $_POST['location'];
$status      = $_POST['status'];
$description = $_POST['description'] ?? '';

// farmer_id check - farmer sirf apni crop update kar sakta hai
$sql = "UPDATE crops SET
            crop_name   = '$crop_name',
            quantity    = '$quantity',
            price       = '$price',
            location    = '$location',
            status      = '$status',
            description = '$description'
        WHERE id = '$crop_id' AND farmer_id = '$farmer_id'";

$result = mysqli_query($conn, $sql);

if ($result) {
    echo "success";
} else {
    echo "error";
}
?>