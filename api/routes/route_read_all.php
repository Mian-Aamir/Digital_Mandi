<?php
// route_read_all.php
// Returns all available delivery routes with driver info
// Accessible by all logged-in roles (farmer, buyer, shopkeeper)

session_start();
include "../db.php";

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    echo "unauthorized";
    exit();
}

// Get all available routes with driver name and contact
$result = mysqli_query($conn,
    "SELECT
        delivery_routes.*,
        CONCAT(users.first_name, ' ', users.last_name) AS driver_name
     FROM delivery_routes
     JOIN users ON delivery_routes.driver_id = users.id
     WHERE delivery_routes.status = 'available'
     ORDER BY delivery_routes.created_at DESC"
);

$routes = [];

while ($row = mysqli_fetch_assoc($result)) {
    $routes[] = $row;
}

echo json_encode($routes);
?>