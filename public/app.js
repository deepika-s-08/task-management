
let userId = null;

// Function to handle user registration
async function registerUser(event) {
    event.preventDefault();

    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const rollNumber = document.getElementById('roll-number').value.trim();
    const casualLeave = document.getElementById('casual-leave').value;
    const medicalLeave = document.getElementById('medical-leave').value;

    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username,
                email,
                rollNumber,
                casualLeave: casualLeave === '' ? 10 : Number(casualLeave),
                medicalLeave: medicalLeave === '' ? 10 : Number(medicalLeave),
            }),
        });

        const data = await response.json();

        if (response.ok) {
            document.getElementById('registration-response').innerText =
                data.message || 'Registration successful';

            document.getElementById('registration-form').reset();
            document.getElementById('registration-section').style.display = 'none';
            document.getElementById('login-section').style.display = 'block';
        } else {
            document.getElementById('registration-response').innerText =
                data.message || 'Error registering user';
        }
    } catch (error) {
        console.error('Error registering user:', error);
        document.getElementById('registration-response').innerText =
            'Server error. Check your backend server.';
    }
}

// Function to handle user login
async function loginUser(event) {
    event.preventDefault();

    const email = document.getElementById('email').value.trim();

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
        });

        const data = await response.json();

        if (response.ok) {
            userId = data.userId;

            document.getElementById('username-display').innerText = data.username;
            document.getElementById('roll-number-display').innerText = data.rollNumber;
            document.getElementById('casual-leave-display').innerText = data.casualLeave;
            document.getElementById('medical-leave-display').innerText = data.medicalLeave;

            document.getElementById('balance-section').style.display = 'block';
            document.getElementById('apply-leave-section').style.display = 'block';
            document.getElementById('login-section').style.display = 'none';
            document.getElementById('registration-section').style.display = 'none';
            document.getElementById('logout-button').style.display = 'block';

            document.getElementById('response-message').innerText =
                data.message || 'Login successful';
        } else {
            document.getElementById('response-message').innerText =
                data.message || 'Error logging in';
        }
    } catch (error) {
        console.error('Error logging in:', error);
        document.getElementById('response-message').innerText = 'Server error';
    }
}

// Function to handle user logout
function logoutUser() {
    userId = null;

    document.getElementById('balance-section').style.display = 'none';
    document.getElementById('apply-leave-section').style.display = 'none';
    document.getElementById('logout-button').style.display = 'none';
    document.getElementById('login-section').style.display = 'block';
    document.getElementById('registration-section').style.display = 'none';

    document.getElementById('response-message').innerText = '';
    document.getElementById('username-display').innerText = '';
    document.getElementById('roll-number-display').innerText = '';
    document.getElementById('casual-leave-display').innerText = '';
    document.getElementById('medical-leave-display').innerText = '';
}

// Function to refresh leave balance
async function refreshLeaveBalance() {
    if (!userId) {
        document.getElementById('response-message').innerText = 'Please log in first';
        return;
    }

    try {
        const response = await fetch(`/api/leave-balance/${userId}`);
        const data = await response.json();

        if (response.ok) {
            document.getElementById('casual-leave-display').innerText = data.casualLeave;
            document.getElementById('medical-leave-display').innerText = data.medicalLeave;
        } else {
            document.getElementById('response-message').innerText =
                data.message || 'Error fetching balance';
        }
    } catch (error) {
        console.error('Error refreshing balance:', error);
        document.getElementById('response-message').innerText = 'Server error';
    }
}

// Function to apply for leave
async function applyLeave(event) {
    event.preventDefault();

    if (!userId) {
        document.getElementById('response-message').innerText = 'Please log in first';
        return;
    }

    const type = document.getElementById('leave-type').value;
    const days = Number(document.getElementById('leave-days').value);

    if (!Number.isInteger(days) || days <= 0) {
        document.getElementById('response-message').innerText =
            'Enter a valid number of leave days';
        return;
    }

    try {
        const response = await fetch(`/api/apply-leave/${userId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ type, days }),
        });

        const data = await response.json();

        if (response.ok) {
            document.getElementById('casual-leave-display').innerText = data.casualLeave;
            document.getElementById('medical-leave-display').innerText = data.medicalLeave;
            document.getElementById('response-message').innerText =
                data.message || 'Leave application successful';

            document.getElementById('leave-form').reset();
        } else {
            document.getElementById('response-message').innerText =
                data.message || 'Error applying for leave';
        }
    } catch (error) {
        console.error('Error applying for leave:', error);
        document.getElementById('response-message').innerText = 'Server error';
    }
}

// Event listeners
document.getElementById('registration-form').addEventListener('submit', registerUser);
document.getElementById('login-form').addEventListener('submit', loginUser);
document.getElementById('refresh-balance').addEventListener('click', refreshLeaveBalance);
document.getElementById('logout-button').addEventListener('click', logoutUser);
document.getElementById('leave-form').addEventListener('submit', applyLeave);

// Show Login Section
document.getElementById('show-login').addEventListener('click', function () {
    document.getElementById('login-section').style.display = 'block';
    document.getElementById('registration-section').style.display = 'none';
});

// Show Registration Section
document.getElementById('show-registration').addEventListener('click', function () {
    document.getElementById('registration-section').style.display = 'block';
    document.getElementById('login-section').style.display = 'none';
});
