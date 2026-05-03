<?php
// product_add.php - Add new fertilizer/seed product for shopkeeper

session_start();
include "../db.php";

// Check if shopkeeper is logged in
if (!isset($_SESSION['user_id'])) {
    echo "unauthorized";
    exit();
}

$shopkeeper_id  = $_SESSION['user_id'];
$product_name   = $_POST['product_name'];
$category       = $_POST['category'];        // fertilizer | seed
$brand          = $_POST['brand']       ?? '';
$quantity       = $_POST['quantity'];
$unit           = $_POST['unit'];            // kg | bag | sachet | litre
$price          = $_POST['price'];
$status         = $_POST['status'];          // available | out_of_stock
$description    = $_POST['description'] ?? '';

$sql = "INSERT INTO shop_products
            (shopkeeper_id, product_name, category, brand, quantity, unit, price, status, description)
        VALUES
            ('$shopkeeper_id','$product_name','$category','$brand','$quantity','$unit','$price','$status','$description')";

$result = mysqli_query($conn, $sql);

if ($result) {
    echo "success";
} else {
    echo "error";
}
?>
