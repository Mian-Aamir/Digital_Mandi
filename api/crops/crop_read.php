<?php
// crop_read.php - Get all crops of logged in farmer

session_start();
include "../db.php";

// Check if farmer is logged in
if (!isset($_SESSION['user_id'])) {
    echo "unauthorized";
    exit();
}

$farmer_id = $_SESSION['user_id'];

$result = mysqli_query($conn,
    "SELECT * FROM crops WHERE farmer_id='$farmer_id' ORDER BY created_at DESC"
);

$crops = [];

while ($row = mysqli_fetch_assoc($result)) {
    $crops[] = $row;
}

// Return as JSON - JS will use this to build table
echo json_encode($crops);
?>