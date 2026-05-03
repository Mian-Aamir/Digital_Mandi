<?php
// route_delete.php - Delete a delivery route

session_start();
include "../db.php";

// Check if driver is logged in
if (!isset($_SESSION['user_id'])) {
    echo "unauthorized";
    exit();
}

$driver_id = $_SESSION['user_id'];
$route_id = $_POST['route_id'];

// driver_id check - only owner can delete
$result = mysqli_query(
    $conn,
    "DELETE FROM delivery_routes WHERE id='$route_id' AND driver_id='$driver_id'"
);

if ($result) {
    echo "success";
} else {
    echo "error";
}
?>