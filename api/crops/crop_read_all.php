<?php
// crop_read_all.php - Get all available crops for buyers

session_start();
include "../db.php";

// Check if user is logged in (any role can see crops)
if (!isset($_SESSION['user_id'])) {
    echo "unauthorized";
    exit();
}

// Get all available crops with farmer name
$result = mysqli_query($conn,
    "SELECT crops.*, CONCAT(users.first_name, ' ', users.last_name) AS farmer_name
     FROM crops
     JOIN users ON crops.farmer_id = users.id
     WHERE crops.status = 'available'
     ORDER BY crops.created_at DESC"
);

$crops = [];

while ($row = mysqli_fetch_assoc($result)) {
    $crops[] = $row;
}

echo json_encode($crops);
?>