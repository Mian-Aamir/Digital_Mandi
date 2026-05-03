<?php
session_start();
include "../db.php";

// Get data from form
$email    = $_POST['email'];
$phone    = $_POST['phone'];
$password = $_POST['password'];
$role     = $_POST['role'];

// Find user in database by email AND role
$result = mysqli_query($conn,
    "SELECT * FROM users
     WHERE email='$email'
     AND phone='$phone'
     AND password='$password'
     AND role='$role'"
);

if (mysqli_num_rows($result) > 0) {

    $user = mysqli_fetch_assoc($result);

    // Save in session
    $_SESSION['user']       = $user['email'];
    $_SESSION['user_id']    = $user['id'];
    $_SESSION['user_name']  = $user['first_name'] . ' ' . $user['last_name'];
    $_SESSION['user_role']  = $user['role'];

    echo "success";

} else {
    echo "invalid";
}
?>