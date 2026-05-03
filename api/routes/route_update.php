<?php
// route_update.php - Update existing delivery route

session_start();
include "../db.php";

// Check if driver is logged in
if (!isset($_SESSION['user_id'])) {
    echo "unauthorized";
    exit();
}

$driver_id = $_SESSION['user_id'];
$route_id = $_POST['route_id'];
$pickup_area = $_POST['pickup_area'];
$drop_area = $_POST['drop_area'];
$vehicle_type = $_POST['vehicle_type'];
$cargo_type = $_POST['cargo_type'];
$capacity_kg = $_POST['capacity_kg'];
$price_per_trip = $_POST['price_per_trip'];
$contact = $_POST['contact'];
$status = $_POST['status'];
$description = $_POST['description'] ?? '';

// driver_id check - driver can only update their own routes
$sql = "UPDATE delivery_routes SET
            pickup_area    = '$pickup_area',
            drop_area      = '$drop_area',
            vehicle_type   = '$vehicle_type',
            cargo_type     = '$cargo_type',
            capacity_kg    = '$capacity_kg',
            price_per_trip = '$price_per_trip',
            contact        = '$contact',
            status         = '$status',
            description    = '$description'
        WHERE id = '$route_id' AND driver_id = '$driver_id'";

$result = mysqli_query($conn, $sql);

if ($result) {
    echo "success";
} else {
    echo "error";
}
?>