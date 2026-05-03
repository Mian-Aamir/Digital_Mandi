<?php
// get_user_info.php
// Session se logged-in user ki info return karta hai (JSON mein)
session_start();

if (!isset($_SESSION['user'])) {
    echo json_encode(['error' => 'not logged in']);
    exit();
}

echo json_encode([
    'name' => $_SESSION['user_name'],
    'role' => $_SESSION['user_role']
]);
?>
