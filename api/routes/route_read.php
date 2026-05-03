<?php
// route_read.php - Get all delivery routes of logged in driver

session_start();
include "../db.php";

// Check if driver is logged in
if (!isset($_SESSION['user_id'])) {
    echo "unauthorized";
    exit();
}

$driver_id = $_SESSION['user_id'];

$result = mysqli_query(
    $conn,
    "SELECT * FROM delivery_routes WHERE driver_id='$driver_id' ORDER BY created_at DESC"
);

$routes = [];

while ($row = mysqli_fetch_assoc($result)) {
    $routes[] = $row;
}

// Return as JSON - JS will use this to build table
echo json_encode($routes);
?>