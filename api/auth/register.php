<?php
// ============================================================
// register.php - User Registration API
// Called by register.html using fetch (AJAX)
// Saves new user to database
// ============================================================

session_start();
include "../db.php";

// Get common fields from form
$first_name = $_POST['first_name'];
$last_name  = $_POST['last_name'];
$phone      = $_POST['phone'];
$email      = $_POST['email'];
$cnic       = $_POST['cnic'];
$province   = $_POST['province'];
$city       = $_POST['city'];
$password   = $_POST['password'];
$role       = $_POST['role'];

// Check if email already exists
$check = mysqli_query($conn,
    "SELECT id FROM users WHERE email='$email'"
);

if (mysqli_num_rows($check) > 0) {
    echo "email_exists";
    exit();
}

// Check if phone already exists
$check2 = mysqli_query($conn,
    "SELECT id FROM users WHERE phone='$phone'"
);

if (mysqli_num_rows($check2) > 0) {
    echo "phone_exists";
    exit();
}

// Insert common fields first
$sql = "INSERT INTO users
        (first_name, last_name, phone, email, password, role, city, province)
        VALUES
        ('$first_name','$last_name','$phone','$email','$password','$role','$city','$province')";

$result = mysqli_query($conn, $sql);

if (!$result) {
    echo "error";
    exit();
}

// Get new user ID
$user_id = mysqli_insert_id($conn);

// ── Role specific fields ──

if ($role === 'farmer') {

    $farm_size    = $_POST['farm_size']    ?? '';
    $crop_type    = $_POST['crop_type']    ?? '';
    $farm_address = $_POST['farm_address'] ?? '';

    mysqli_query($conn,
        "INSERT INTO farmer_details (user_id, farm_size, crop_type, farm_address)
         VALUES ('$user_id','$farm_size','$crop_type','$farm_address')"
    );

} elseif ($role === 'buyer') {

    $buyer_type     = $_POST['buyer_type']     ?? '';
    $business_name  = $_POST['business_name']  ?? '';
    $crop_interest  = $_POST['crop_interest']  ?? '';

    mysqli_query($conn,
        "INSERT INTO buyer_details (user_id, buyer_type, business_name, crop_interest)
         VALUES ('$user_id','$buyer_type','$business_name','$crop_interest')"
    );

} elseif ($role === 'shopkeeper') {

    $shop_name    = $_POST['shop_name']    ?? '';
    $shop_reg     = $_POST['shop_reg']     ?? '';
    $product_type = $_POST['product_type'] ?? '';
    $shop_address = $_POST['shop_address'] ?? '';

    mysqli_query($conn,
        "INSERT INTO shopkeeper_details (user_id, shop_name, shop_reg, product_type, shop_address)
         VALUES ('$user_id','$shop_name','$shop_reg','$product_type','$shop_address')"
    );

} elseif ($role === 'delivery') {

    $vehicle_type = $_POST['vehicle_type'] ?? '';
    $vehicle_reg  = $_POST['vehicle_reg']  ?? '';
    $license_no   = $_POST['license_no']   ?? '';
    $delivery_area= $_POST['delivery_area']?? '';

    mysqli_query($conn,
        "INSERT INTO delivery_details (user_id, vehicle_type, vehicle_reg, license_no, delivery_area)
         VALUES ('$user_id','$vehicle_type','$vehicle_reg','$license_no','$delivery_area')"
    );
}

// Registration successful - create session
$_SESSION['user']      = $email;
$_SESSION['user_id']   = $user_id;
$_SESSION['user_name'] = $first_name . ' ' . $last_name;
$_SESSION['user_role'] = $role;

echo "success";
?>