// Dashboard JavaScript functionality

// Global variables
let currentDate = new Date();
let currentTimePeriod = 'AM';
let reservationsCache = {};
let allReservations = [];
let currentEditingReservation = null;

// Authentication
const ADMIN_CODE = '1234'; // Change this to your desired 4-digit code
let isAuthenticated = false;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    updateDateDisplay();
});

function setupEventListeners() {
    // Enter key for authentication
    document.getElementById('authCode').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            authenticate();
        }
    });

    // Set today's date in date picker
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('datePicker').value = today;
    
    // Edit form submission
    document.getElementById('editForm').addEventListener('submit', function(e) {
        e.preventDefault();
        saveReservationChanges();
    });
    
    // Close modal when clicking overlay
    document.getElementById('editOverlay').addEventListener('click', function(e) {
        if (e.target === this) {
            closeEditModal();
        }
    });
}

function authenticate() {
    const code = document.getElementById('authCode').value;
    if (code === ADMIN_CODE) {
        isAuthenticated = true;
        document.getElementById('authOverlay').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
        loadReservations();
    } else {
        alert('Invalid access code. Please try again.');
        document.getElementById('authCode').value = '';
        document.getElementById('authCode').focus();
    }
}

function updateDateDisplay() {
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    document.getElementById('currentDate').textContent = currentDate.toLocaleDateString('en-US', options);
    document.getElementById('datePicker').value = currentDate.toISOString().split('T')[0];
}

function previousDay() {
    currentDate.setDate(currentDate.getDate() - 1);
    updateDateDisplay();
    loadReservations();
}

function nextDay() {
    currentDate.setDate(currentDate.getDate() + 1);
    updateDateDisplay();
    loadReservations();
}

function selectDate(dateString) {
    currentDate = new Date(dateString);
    updateDateDisplay();
    loadReservations();
}

function toggleTimePeriod(period) {
    currentTimePeriod = period;
    
    // Update button states
    document.getElementById('amToggle').classList.toggle('active', period === 'AM');
    document.getElementById('pmToggle').classList.toggle('active', period === 'PM');
    
    // Show/hide sections
    document.getElementById('amSection').classList.toggle('active', period === 'AM');
    document.getElementById('pmSection').classList.toggle('active', period === 'PM');
    
    // Update display
    displayReservations();
}

async function loadReservations() {
    const dateString = currentDate.toISOString().split('T')[0];
    
    // Check cache first
    if (reservationsCache[dateString]) {
        allReservations = reservationsCache[dateString];
        displayReservations();
        return;
    }

    // Show loading state
    document.getElementById('amReservations').innerHTML = '<div class="loading">Loading...</div>';
    document.getElementById('pmReservations').innerHTML = '<div class="loading">Loading...</div>';

    try {
        // Use the existing submitReservationToSupabase function pattern
        const { data, error } = await window.supabase
            .from('reservations')
            .select('*')
            .eq('reservation_date', dateString)
            .order('reservation_time', { ascending: true });

        if (error) {
            throw error;
        }

        allReservations = data || [];
        reservationsCache[dateString] = allReservations;
        displayReservations();

    } catch (error) {
        console.error('Error loading reservations:', error);
        showError('Failed to load reservations. Please try again.');
    }
}

function displayReservations() {
    const amReservations = [];
    const pmReservations = [];

    allReservations.forEach(reservation => {
        const time = reservation.reservation_time;
        const hour = parseInt(time.split(':')[0]);
        
        if (hour < 15) { // Before 3 PM
            amReservations.push(reservation);
        } else {
            pmReservations.push(reservation);
        }
    });

    // Render both sections but only show the active one
    renderReservationTable('amReservations', amReservations);
    renderReservationTable('pmReservations', pmReservations);
    
    // Update guest counts
    updateGuestCounts(amReservations, pmReservations);
    
    // Show the current time period
    toggleTimePeriod(currentTimePeriod);
}

function renderReservationTable(containerId, reservations) {
    const container = document.getElementById(containerId);
    
    if (reservations.length === 0) {
        container.innerHTML = '<div class="no-reservations">No reservations for this time period</div>';
        return;
    }

    const tableHTML = `
        <table class="reservations-table">
            <thead>
                <tr>
                    <th>Time</th>
                    <th>Guests</th>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Notes</th>
                </tr>
            </thead>
            <tbody>
                ${reservations.map((reservation, index) => `
                    <tr onclick="openEditModal('${containerId}', ${index})">
                        <td class="time-cell">${formatTime(reservation.reservation_time)}</td>
                        <td class="guests-cell">${reservation.guests}</td>
                        <td class="name-cell">${reservation.first_name} ${reservation.last_name}</td>
                        <td class="phone-cell">${reservation.phone_number}</td>
                        <td class="notes-cell">${reservation.notes || '-'}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    
    container.innerHTML = tableHTML;
}

function openEditModal(containerId, index) {
    // Determine which reservations array to use
    const reservations = containerId === 'amReservations' ? 
        allReservations.filter(r => parseInt(r.reservation_time.split(':')[0]) < 15) :
        allReservations.filter(r => parseInt(r.reservation_time.split(':')[0]) >= 15);
    
    currentEditingReservation = reservations[index];
    
    // Populate form fields
    document.getElementById('editFirstName').value = currentEditingReservation.first_name;
    document.getElementById('editLastName').value = currentEditingReservation.last_name;
    document.getElementById('editPhone').value = currentEditingReservation.phone_number;
    document.getElementById('editGuests').value = currentEditingReservation.guests;
    document.getElementById('editDate').value = currentEditingReservation.reservation_date;
    document.getElementById('editTime').value = currentEditingReservation.reservation_time;
    document.getElementById('editNotes').value = currentEditingReservation.notes || '';
    
    // Show modal
    document.getElementById('editOverlay').style.display = 'flex';
}

function closeEditModal() {
    document.getElementById('editOverlay').style.display = 'none';
    currentEditingReservation = null;
    
    // Clear form
    document.getElementById('editForm').reset();
}

async function saveReservationChanges() {
    if (!currentEditingReservation) return;
    
    const saveBtn = document.getElementById('saveBtn');
    const originalText = saveBtn.textContent;
    
    try {
        // Disable save button and show loading
        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving...';
        
        // Get form data
        const formData = {
            first_name: document.getElementById('editFirstName').value,
            last_name: document.getElementById('editLastName').value,
            phone_number: document.getElementById('editPhone').value,
            guests: parseInt(document.getElementById('editGuests').value),
            reservation_date: document.getElementById('editDate').value,
            reservation_time: document.getElementById('editTime').value,
            notes: document.getElementById('editNotes').value
        };
        
        // Update in Supabase
        const { data, error } = await window.supabase
            .from('reservations')
            .update(formData)
            .eq('id', currentEditingReservation.id)
            .select();
            
        if (error) {
            throw error;
        }
        
        // Update local data
        const reservationIndex = allReservations.findIndex(r => r.id === currentEditingReservation.id);
        if (reservationIndex !== -1) {
            allReservations[reservationIndex] = { ...currentEditingReservation, ...formData };
        }
        
        // Clear cache to force refresh
        const dateString = currentDate.toISOString().split('T')[0];
        delete reservationsCache[dateString];
        
        // Close modal and refresh display
        closeEditModal();
        displayReservations();
        
        // Show success message
        showSuccess('Reservation updated successfully!');
        
    } catch (error) {
        console.error('Error updating reservation:', error);
        showError('Failed to update reservation. Please try again.');
    } finally {
        // Re-enable save button
        saveBtn.disabled = false;
        saveBtn.textContent = originalText;
    }
}

function updateGuestCounts(amReservations, pmReservations) {
    const amGuestCount = amReservations.reduce((total, reservation) => total + reservation.guests, 0);
    const pmGuestCount = pmReservations.reduce((total, reservation) => total + reservation.guests, 0);
    
    // Update AM section guest count
    const amSection = document.getElementById('amSection');
    let amSummary = amSection.querySelector('.guest-summary');
    if (!amSummary) {
        amSummary = document.createElement('div');
        amSummary.className = 'guest-summary';
        amSection.insertBefore(amSummary, amSection.firstChild);
    }
    amSummary.textContent = `Total Guests: ${amGuestCount}`;
    
    // Update PM section guest count
    const pmSection = document.getElementById('pmSection');
    let pmSummary = pmSection.querySelector('.guest-summary');
    if (!pmSummary) {
        pmSummary = document.createElement('div');
        pmSummary.className = 'guest-summary';
        pmSection.insertBefore(pmSummary, pmSection.firstChild);
    }
    pmSummary.textContent = `Total Guests: ${pmGuestCount}`;
}

function formatTime(timeString) {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${period}`;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
    });
}

function refreshData() {
    const dateString = currentDate.toISOString().split('T')[0];
    delete reservationsCache[dateString]; // Clear cache for this date
    loadReservations();
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    const container = document.querySelector('.container');
    container.insertBefore(errorDiv, container.firstChild);
    
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.remove();
        }
    }, 5000);
}

function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.style.cssText = `
        background: #4CAF50;
        color: white;
        padding: 1rem;
        margin-bottom: 1rem;
        border-radius: 0;
        text-align: center;
        font-family: 'Futura PT', sans-serif;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 1px;
    `;
    successDiv.textContent = message;
    
    const container = document.querySelector('.container');
    container.insertBefore(successDiv, container.firstChild);
    
    setTimeout(() => {
        if (successDiv.parentNode) {
            successDiv.remove();
        }
    }, 3000);
}

// Initialize time period toggle
document.addEventListener('DOMContentLoaded', function() {
    toggleTimePeriod('AM');
}); 