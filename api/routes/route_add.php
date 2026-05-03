<?php
// route_add.php - Add new delivery route for driver

session_start();
include "../db.php";

// Check if driver is logged in
if (!isset($_SESSION['user_id'])) {
    echo "unauthorized";
    exit();
}

$driver_id = $_SESSION['user_id'];
$pickup_area = $_POST['pickup_area'];
$drop_area = $_POST['drop_area'];
$vehicle_type = $_POST['vehicle_type'];
$cargo_type = $_POST['cargo_type'];
$capacity_kg = $_POST['capacity_kg'];
$price_per_trip = $_POST['price_per_trip'];
$contact = $_POST['contact'];
$status = $_POST['status'];
$description = $_POST['description'] ?? '';

$sql = "INSERT INTO delivery_routes
            (driver_id, pickup_area, drop_area, vehicle_type, cargo_type, capacity_kg, price_per_trip, contact, status, description)
        VALUES
            ('$driver_id','$pickup_area','$drop_area','$vehicle_type','$cargo_type','$capacity_kg','$price_per_trip','$contact','$status','$description')";

$result = mysqli_query($conn, $sql);

if ($result) {
    echo "success";
} else {
    echo "error";
}
?>