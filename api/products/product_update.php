<?php
// product_update.php - Update existing shop product

session_start();
include "../db.php";

// Check if shopkeeper is logged in
if (!isset($_SESSION['user_id'])) {
    echo "unauthorized";
    exit();
}

$shopkeeper_id = $_SESSION['user_id'];
$product_id = $_POST['product_id'];
$product_name = $_POST['product_name'];
$category = $_POST['category'];
$brand = $_POST['brand'] ?? '';
$quantity = $_POST['quantity'];
$unit = $_POST['unit'];
$price = $_POST['price'];
$status = $_POST['status'];
$description = $_POST['description'] ?? '';

// shopkeeper_id check - shopkeeper can only update their own products
$sql = "UPDATE shop_products SET
            product_name  = '$product_name',
            category      = '$category',
            brand         = '$brand',
            quantity      = '$quantity',
            unit          = '$unit',
            price         = '$price',
            status        = '$status',
            description   = '$description'
        WHERE id = '$product_id' AND shopkeeper_id = '$shopkeeper_id'";

$result = mysqli_query($conn, $sql);

if ($result) {
    echo "success";
} else {
    echo "error";
}
?>