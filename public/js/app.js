// Global state
let currentUser = null;
let authToken = null;

// DOM Elements
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const profileForm = document.getElementById('profileForm');
const mealForm = document.getElementById('mealForm');
const appointmentForm = document.getElementById('appointmentForm');
const logoutBtn = document.getElementById('logoutBtn');

// Tab switching
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadEducationContent();
    setupEventListeners();
});

function setupEventListeners() {
    // Auth forms
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Dashboard forms
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileSave);
    }
    if (mealForm) {
        mealForm.addEventListener('submit', handleMealLog);
    }
    if (appointmentForm) {
        appointmentForm.addEventListener('submit', handleAppointmentBook);
    }
    
    // Logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Tab switching
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });
    
    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
}

// Authentication Functions
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentUser = data.user;
            authToken = data.token;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            localStorage.setItem('authToken', authToken);
            showDashboard();
            alert('Login successful!');
        } else {
            alert(data.error || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('An error occurred. Please try again.');
    }
}

async function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const role = document.getElementById('registerRole').value;
    
    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, role })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentUser = data.user;
            authToken = data.token;
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            localStorage.setItem('authToken', authToken);
            showDashboard();
            alert('Registration successful!');
        } else {
            alert(data.error || 'Registration failed');
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert('An error occurred. Please try again.');
    }
}

function handleLogout() {
    currentUser = null;
    authToken = null;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('authToken');
    hideDashboard();
    alert('Logged out successfully');
}

function showDashboard() {
    document.getElementById('patientDashboard').classList.remove('hidden');
    document.getElementById('login').classList.add('hidden');
    document.getElementById('register').classList.add('hidden');
    document.getElementById('home').classList.add('hidden');
    document.getElementById('features').classList.add('hidden');
    
    // Load user data
    loadUserProfile();
    loadUserMeals();
    loadUserAppointments();
}

function hideDashboard() {
    document.getElementById('patientDashboard').classList.add('hidden');
    document.getElementById('login').classList.remove('hidden');
    document.getElementById('register').classList.remove('hidden');
    document.getElementById('home').classList.remove('hidden');
    document.getElementById('features').classList.remove('hidden');
}

// Tab Switching
function switchTab(tabName) {
    tabBtns.forEach(btn => btn.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));
    
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`${tabName}Tab`).classList.add('active');
}

// Profile Functions
async function handleProfileSave(e) {
    e.preventDefault();
    
    const diabetesType = document.getElementById('diabetesType').value;
    const bloodSugarTarget = document.getElementById('bloodSugarTarget').value;
    const medications = document.getElementById('medications').value;
    const notes = document.getElementById('notes').value;
    
    try {
        const response = await fetch('/api/patient-profile', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                userId: currentUser.id,
                diabetesType,
                bloodSugarTarget,
                medications,
                notes
            })
        });
        
        if (response.ok) {
            alert('Profile saved successfully!');
        } else {
            alert('Failed to save profile');
        }
    } catch (error) {
        console.error('Profile save error:', error);
        alert('An error occurred. Please try again.');
    }
}

async function loadUserProfile() {
    try {
        const response = await fetch(`/api/patient-profile/${currentUser.id}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        const profile = await response.json();
        
        if (profile) {
            document.getElementById('diabetesType').value = profile.diabetesType || '';
            document.getElementById('bloodSugarTarget').value = profile.bloodSugarTarget || '';
            document.getElementById('medications').value = profile.medications || '';
            document.getElementById('notes').value = profile.notes || '';
        }
    } catch (error) {
        console.error('Profile load error:', error);
    }
}

// Meal Functions
async function handleMealLog(e) {
    e.preventDefault();
    
    const mealType = document.getElementById('mealType').value;
    const food = document.getElementById('food').value;
    const calories = document.getElementById('calories').value;
    const carbs = document.getElementById('carbs').value;
    const bloodSugarAfter = document.getElementById('bloodSugarAfter').value;
    
    try {
        const response = await fetch('/api/meals', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                userId: currentUser.id,
                mealType,
                food,
                calories,
                carbs,
                bloodSugarAfter
            })
        });
        
        if (response.ok) {
            alert('Meal logged successfully!');
            mealForm.reset();
            loadUserMeals();
        } else {
            alert('Failed to log meal');
        }
    } catch (error) {
        console.error('Meal log error:', error);
        alert('An error occurred. Please try again.');
    }
}

async function loadUserMeals() {
    try {
        const response = await fetch(`/api/meals/${currentUser.id}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        const meals = await response.json();
        
        const mealsList = document.getElementById('mealsList');
        mealsList.innerHTML = '';
        
        meals.slice(-5).reverse().forEach(meal => {
            const mealItem = document.createElement('div');
            mealItem.className = 'meal-item';
            mealItem.innerHTML = `
                <h4>${meal.mealType.charAt(0).toUpperCase() + meal.mealType.slice(1)} - ${new Date(meal.date).toLocaleDateString()}</h4>
                <p><strong>Food:</strong> ${meal.food}</p>
                <p><strong>Calories:</strong> ${meal.calories} | <strong>Carbs:</strong> ${meal.carbs}g</p>
                ${meal.bloodSugarAfter ? `<p><strong>Blood Sugar After:</strong> ${meal.bloodSugarAfter} mg/dL</p>` : ''}
            `;
            mealsList.appendChild(mealItem);
        });
    } catch (error) {
        console.error('Meals load error:', error);
    }
}

// Appointment Functions
async function handleAppointmentBook(e) {
    e.preventDefault();
    
    const date = document.getElementById('appointmentDate').value;
    const time = document.getElementById('appointmentTime').value;
    const reason = document.getElementById('appointmentReason').value;
    
    // For demo, using a fixed doctor ID (in real app, you'd select a doctor)
    const doctorId = 1;
    
    try {
        const response = await fetch('/api/appointments', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                patientId: currentUser.id,
                doctorId,
                date,
                time,
                reason
            })
        });
        
        if (response.ok) {
            alert('Appointment booked successfully!');
            appointmentForm.reset();
            loadUserAppointments();
        } else {
            alert('Failed to book appointment');
        }
    } catch (error) {
        console.error('Appointment booking error:', error);
        alert('An error occurred. Please try again.');
    }
}

async function loadUserAppointments() {
    try {
        const response = await fetch(`/api/appointments/patient/${currentUser.id}`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        const appointments = await response.json();
        
        const appointmentsList = document.getElementById('appointmentsList');
        appointmentsList.innerHTML = '';
        
        appointments.forEach(appointment => {
            const appointmentItem = document.createElement('div');
            appointmentItem.className = 'appointment-item';
            appointmentItem.innerHTML = `
                <h4>${new Date(appointment.date).toLocaleDateString()} at ${appointment.time}</h4>
                <p><strong>Reason:</strong> ${appointment.reason}</p>
                <p><strong>Status:</strong> ${appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}</p>
            `;
            appointmentsList.appendChild(appointmentItem);
        });
    } catch (error) {
        console.error('Appointments load error:', error);
    }
}

// Education Functions
async function loadEducationContent() {
    try {
        const response = await fetch('/api/education');
        const content = await response.json();
        
        const educationGrid = document.getElementById('educationContent');
        educationGrid.innerHTML = '';
        
        content.forEach(item => {
            const card = document.createElement('div');
            card.className = 'education-card';
            card.innerHTML = `
                <span class="category">${item.category}</span>
                <h3>${item.title}</h3>
                <p>${item.content}</p>
            `;
            educationGrid.appendChild(card);
        });
    } catch (error) {
        console.error('Education content load error:', error);
    }
}

// Check for existing session on page load
const savedUser = localStorage.getItem('currentUser');
const savedToken = localStorage.getItem('authToken');
if (savedUser && savedToken) {
    currentUser = JSON.parse(savedUser);
    authToken = savedToken;
    showDashboard();
}
