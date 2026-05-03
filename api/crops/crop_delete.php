<?php
// crop_delete.php - Delete a crop

session_start();
include "../db.php";

// Check if farmer is logged in
if (!isset($_SESSION['user_id'])) {
    echo "unauthorized";
    exit();
}

$farmer_id = $_SESSION['user_id'];
$crop_id   = $_POST['crop_id'];

// farmer_id check - farmer sirf apni crop delete kar sakta hai
$result = mysqli_query($conn,
    "DELETE FROM crops WHERE id='$crop_id' AND farmer_id='$farmer_id'"
);

if ($result) {
    echo "success";
} else {
    echo "error";
}
?>