// sessions.js

// Function to check if the user is logged in
function checkUserSession() {
    const token = sessionStorage.getItem('accessToken');
    if (!token) {
        window.location.href = '/'; // Redirect to landing page if not logged in
    }
}

// Call the function on page load to ensure the user is logged in
window.onload = checkUserSession;

// Function to log the user out
function logoutUser() {
    sessionStorage.removeItem('accessToken'); // Clear the JWT token
    window.location.href = '/'; // Redirect to landing page after logout
}

// Example: If you have a logout button, attach the logout function to it
const logoutButton = document.getElementById('logoutButton');
if (logoutButton) {
    logoutButton.addEventListener('click', logoutUser);
}

// Store JWT after successful login (this would typically be handled in your login script, not here)
function storeToken(token) {
    sessionStorage.setItem('accessToken', token);
}