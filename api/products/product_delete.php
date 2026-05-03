<?php
// product_delete.php - Delete a shop product

session_start();
include "../db.php";

// Check if shopkeeper is logged in
if (!isset($_SESSION['user_id'])) {
    echo "unauthorized";
    exit();
}

$shopkeeper_id = $_SESSION['user_id'];
$product_id = $_POST['product_id'];

// shopkeeper_id check - only owner can delete
$result = mysqli_query(
    $conn,
    "DELETE FROM shop_products WHERE id='$product_id' AND shopkeeper_id='$shopkeeper_id'"
);

if ($result) {
    echo "success";
} else {
    echo "error";
}
?>