// register.js - Digital Mandi Registration Handler

window.addEventListener('pageshow', function(event) {
    if (event.persisted) {
        resetBtn();
        document.getElementById('reg-msg').style.display = 'none';
    }
});

async function handleRegister(event) {
    event.preventDefault();

    const btn    = document.getElementById('reg-btn');
    const msgBox = document.getElementById('reg-msg');

    const role = document.querySelector('input[name="role"]:checked').value;

    const formData = new FormData(document.getElementById('regForm'));
    formData.append('role', role);

    const pass    = document.getElementById('password').value;
    const confirm = document.getElementById('confirm_password').value;

    if (pass !== confirm) {
        showMsg('Passwords do not match. Please try again.', 'error');
        return;
    }

    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Creating Account...';
    msgBox.style.display = 'none';

    try {
        const response = await fetch('../api/auth/register.php', {
            method: 'POST',
            body: formData
        });

        const result = await response.text();
        const text   = result.trim();

        if (text === 'success') {
        showMsg('Account created successfully! Redirecting...', 'success');
        setTimeout(() => {
    
            if (role === 'farmer') {
                window.location.href = 'farmer_dashboard.html';
            } else if (role === 'buyer') {
                window.location.href = 'buyer_dashboard.html';
            } else if (role === 'shopkeeper') {
                window.location.href = 'shopkeeper_dashboard.html';
            } else if (role === 'delivery') {
                window.location.href = 'delivery_dashboard.html';
            }
    
        }, 1500);

        } else if (text === 'email_exists') {
            showMsg('This email is already registered. Please login.', 'error');
            resetBtn();

        } else if (text === 'phone_exists') {
            showMsg('This phone number is already registered.', 'error');
            resetBtn();

        } else {
            showMsg('Something went wrong. Please try again.', 'error');
            resetBtn();
        }

    } catch (err) {
        showMsg('Network error. Check internet connection.', 'error');
        resetBtn();
    }
}

function showMsg(text, type) {
    const msgBox = document.getElementById('reg-msg');
    msgBox.style.display    = 'block';
    msgBox.style.background = type === 'success' ? '#D8F3DC' : '#FFF5F5';
    msgBox.style.color      = type === 'success' ? '#1B4332' : '#C53030';
    msgBox.style.border     = type === 'success' ? '1px solid #74C69D' : '1px solid #FC8181';
    msgBox.innerHTML = `<i class="fa-solid fa-${type === 'success' ? 'check-circle' : 'triangle-exclamation'}"></i> ${text}`;
}

function resetBtn() {
    const btn = document.getElementById('reg-btn');
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-user-plus"></i> Create My Account';
}