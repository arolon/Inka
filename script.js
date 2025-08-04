// DOM Elements
const form = document.getElementById('reservationForm');
const submitBtn = document.querySelector('.submit-btn');

// Form validation and submission
form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Clear previous error states
    clearErrors();
    
    // Validate form
    if (validateForm()) {
        // Collect form data
        const formData = collectFormData();
        
        // Log the data to console
        console.log('Reservation Data:', formData);
        
        // Show success message
        showSuccessMessage();
        
        // Reset form
        form.reset();
        
        // Reset custom radio/checkbox styling
        resetCustomInputs();
    }
});

// Form validation function
function validateForm() {
    let isValid = true;
    
    // Required fields
    const requiredFields = [
        { id: 'date', name: 'Date' },
        { id: 'time', name: 'Time' },
        { id: 'people', name: 'Number of People' },
        { id: 'firstName', name: 'First Name' },
        { id: 'lastName', name: 'Last Name' },
        { id: 'phone', name: 'Phone Number' }
    ];
    
    // Check required fields
    requiredFields.forEach(field => {
        const element = document.getElementById(field.id);
        const value = element.value.trim();
        
        if (!value) {
            showError(element, `${field.name} is required`);
            isValid = false;
        }
    });
    
    // Validate date (must be today or future)
    const dateInput = document.getElementById('date');
    if (dateInput.value) {
        const selectedDate = new Date(dateInput.value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
            showError(dateInput, 'Date must be today or in the future');
            isValid = false;
        }
    }
    
    // Validate number of people
    const peopleInput = document.getElementById('people');
    if (peopleInput.value) {
        const people = parseInt(peopleInput.value);
        if (people < 1 || people > 20) {
            showError(peopleInput, 'Number of people must be between 1 and 20');
            isValid = false;
        }
    }
    
    // Validate phone number (basic format)
    const phoneInput = document.getElementById('phone');
    if (phoneInput.value) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        const cleanPhone = phoneInput.value.replace(/[\s\-\(\)]/g, '');
        
        if (!phoneRegex.test(cleanPhone)) {
            showError(phoneInput, 'Please enter a valid phone number');
            isValid = false;
        }
    }
    
    // Validate names (no numbers or special characters)
    const nameRegex = /^[a-zA-Z\s\-']+$/;
    
    const firstNameInput = document.getElementById('firstName');
    if (firstNameInput.value && !nameRegex.test(firstNameInput.value.trim())) {
        showError(firstNameInput, 'First name can only contain letters, spaces, hyphens, and apostrophes');
        isValid = false;
    }
    
    const lastNameInput = document.getElementById('lastName');
    if (lastNameInput.value && !nameRegex.test(lastNameInput.value.trim())) {
        showError(lastNameInput, 'Last name can only contain letters, spaces, hyphens, and apostrophes');
        isValid = false;
    }
    
    return isValid;
}

// Show error for a specific field
function showError(element, message) {
    element.classList.add('error');
    
    // Remove existing error message
    const existingError = element.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // Create and add error message
    const errorElement = document.createElement('span');
    errorElement.className = 'error-message';
    errorElement.textContent = message;
    element.parentNode.appendChild(errorElement);
}

// Clear all error states
function clearErrors() {
    // Remove error classes
    const errorElements = document.querySelectorAll('.error');
    errorElements.forEach(element => {
        element.classList.remove('error');
    });
    
    // Remove error messages
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(message => {
        message.remove();
    });
}

// Collect form data
function collectFormData() {
    const formData = new FormData(form);
    const data = {};
    
    // Convert FormData to object
    for (let [key, value] of formData.entries()) {
        if (data[key]) {
            // Handle multiple values (like checkboxes)
            if (Array.isArray(data[key])) {
                data[key].push(value);
            } else {
                data[key] = [data[key], value];
            }
        } else {
            data[key] = value;
        }
    }
    
    // Format the data for better readability
    const formattedData = {
        reservation: {
            date: data.date,
            time: data.time,
            numberOfPeople: parseInt(data.people),
            seating: data.seating || 'no-preference'
        },
        contact: {
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone
        },
        preferences: {
            wheelchair: data.wheelchair === 'true',
            hearing: data.hearing === 'true'
        },
        specialRequests: data.specialRequests || 'None'
    };
    
    return formattedData;
}

// Show success message
function showSuccessMessage() {
    // Create success message
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.innerHTML = `
        <div style="
            background: rgba(81, 207, 102, 0.1);
            border: 2px solid #51cf66;
            border-radius: 10px;
            padding: 1rem;
            margin: 1rem 0;
            text-align: center;
            color: #51cf66;
            font-weight: 500;
        ">
            <h3 style="margin-bottom: 0.5rem;">Reservation Submitted Successfully!</h3>
            <p style="margin: 0; font-size: 0.9rem;">Your reservation has been logged to the console. Check the browser's developer tools to view the data.</p>
        </div>
    `;
    
    // Insert before the form
    form.parentNode.insertBefore(successDiv, form);
    
    // Remove success message after 5 seconds
    setTimeout(() => {
        if (successDiv.parentNode) {
            successDiv.remove();
        }
    }, 5000);
}

// Reset custom radio/checkbox styling
function resetCustomInputs() {
    // Reset radio buttons to default
    const radioButtons = document.querySelectorAll('input[type="radio"]');
    radioButtons.forEach(radio => {
        if (radio.value === 'no-preference') {
            radio.checked = true;
        } else {
            radio.checked = false;
        }
    });
    
    // Reset checkboxes
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
}

// Real-time validation for better UX
const inputs = form.querySelectorAll('input, select, textarea');
inputs.forEach(input => {
    input.addEventListener('blur', function() {
        // Clear error when user starts typing/selecting
        if (this.classList.contains('error')) {
            this.classList.remove('error');
            const errorMessage = this.parentNode.querySelector('.error-message');
            if (errorMessage) {
                errorMessage.remove();
            }
        }
    });
    
    input.addEventListener('input', function() {
        // Clear error on input
        if (this.classList.contains('error')) {
            this.classList.remove('error');
            const errorMessage = this.parentNode.querySelector('.error-message');
            if (errorMessage) {
                errorMessage.remove();
            }
        }
    });
});

// Set minimum date to today
const dateInput = document.getElementById('date');
const today = new Date().toISOString().split('T')[0];
dateInput.setAttribute('min', today);

// Add loading state to submit button
form.addEventListener('submit', function() {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    
    // Re-enable button after a short delay (simulating processing)
    setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Book Reservation';
    }, 2000);
});

// Phone number formatting (optional enhancement)
const phoneInput = document.getElementById('phone');
phoneInput.addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    
    // Format as (XXX) XXX-XXXX
    if (value.length >= 6) {
        value = value.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    } else if (value.length >= 3) {
        value = value.replace(/(\d{3})(\d{0,3})/, '($1) $2');
    }
    
    e.target.value = value;
});

// Console welcome message
console.log('%c🍽️ Restaurant Reservation Form', 'color: #ffd700; font-size: 20px; font-weight: bold;');
console.log('%cForm data will be logged here when submitted!', 'color: #cccccc; font-size: 14px;'); 