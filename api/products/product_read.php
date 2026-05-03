<?php
// product_read.php - Get all products of logged in shopkeeper

session_start();
include "../db.php";

// Check if shopkeeper is logged in
if (!isset($_SESSION['user_id'])) {
    echo "unauthorized";
    exit();
}

$shopkeeper_id = $_SESSION['user_id'];

$result = mysqli_query($conn,
    "SELECT * FROM shop_products WHERE shopkeeper_id='$shopkeeper_id' ORDER BY created_at DESC"
);

$products = [];

while ($row = mysqli_fetch_assoc($result)) {
    $products[] = $row;
}

// Return as JSON - JS will use this to build table
echo json_encode($products);
?>
