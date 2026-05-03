<?php
// ============================================================
// check_auth.php
// Checks whether the user has an active session.
// Returns "ok" if logged in, "unauthorized" if not.
// Called by the dashboard page before it loads.
// ============================================================

session_start();

if (!isset($_SESSION['user'])) {
    echo "unauthorized";
    exit();
}

// Session is valid
echo "ok";
?>