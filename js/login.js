// login.js - Digital Mandi Login Handler

window.addEventListener('pageshow', function(event) {
    if (event.persisted) {
        resetBtn();
        document.getElementById('msg-box').style.display = 'none';
    }
});

async function handleLogin(event) {
    event.preventDefault();

    const btn    = document.getElementById('login-btn');
    const msgBox = document.getElementById('msg-box');

    const phone    = document.getElementById('phone').value.trim();
    const email    = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    const role     = document.querySelector('input[name="role"]:checked').value;

    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Checking...';

    msgBox.style.display = 'none';

    try {
        const response = await fetch('../api/auth/login.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({ phone, email, password, role })
        });

        const result = await response.text();
        const text   = result.trim();

        if (text === 'success') {
        showMsg('Login successful! Redirecting...', 'success');
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
    
        }, 1000);

        } else if (text === 'invalid') {
            showMsg('Wrong credentials. Check phone, email, password.', 'error');
            resetBtn();

        } else {
            showMsg('Server error. Please try again.', 'error');
            resetBtn();
        }

    } catch (err) {
        showMsg('Network error. Check internet connection.', 'error');
        resetBtn();
    }
}

function showMsg(text, type) {
    const msgBox = document.getElementById('msg-box');
    msgBox.style.display    = 'block';
    msgBox.style.background = type === 'success' ? '#D8F3DC' : '#FFF5F5';
    msgBox.style.color      = type === 'success' ? '#1B4332' : '#C53030';
    msgBox.style.border     = type === 'success' ? '1px solid #74C69D' : '1px solid #FC8181';
    msgBox.innerHTML = `<i class="fa-solid fa-${type === 'success' ? 'check-circle' : 'triangle-exclamation'}"></i> ${text}`;
}

function resetBtn() {
    const btn = document.getElementById('login-btn');
    btn.disabled = false;
    btn.innerHTML = '<i class="fa-solid fa-right-to-bracket"></i> Login';
}