// DOM Elements
const form = document.getElementById('reservationForm');
const submitBtn = document.querySelector('.submit-btn');
const dateInput = document.getElementById('date');
const datePickerInput = document.getElementById('date-picker');
const timeSelect = document.getElementById('time');
const peopleInput = document.getElementById('people');
const langToggle = document.getElementById('langToggle');

// Language state
let currentLanguage = 'en';
let flatpickrInstance = null;

// Wait for configuration to be loaded
function waitForConfig() {
    return new Promise((resolve) => {
        if (restaurantConfig) {
            resolve();
        } else {
            const checkConfig = setInterval(() => {
                if (restaurantConfig) {
                    clearInterval(checkConfig);
                    resolve();
                }
            }, 100);
        }
    });
}

// Initialize form functionality after config is loaded
async function initializeFormFunctionality() {
    await waitForConfig();
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize form constraints
    initializeFormConstraints();
    
    // Initialize language
    initializeLanguage();
    
    // Initialize date picker
    initializeDatePicker();
}

// Set up all event listeners
function setupEventListeners() {
    // Form submission
    form.addEventListener('submit', handleFormSubmit);
    
    // Date change event
    dateInput.addEventListener('change', handleDateChange);
    
    // Language toggle
    langToggle.addEventListener('click', toggleLanguage);
    
    // Real-time validation
    const inputs = form.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', clearFieldError);
        input.addEventListener('input', clearFieldError);
    });
    
    // Phone number formatting
    const phoneInput = document.getElementById('phone');
    phoneInput.addEventListener('input', formatPhoneNumber);
}

// Initialize date picker
function initializeDatePicker() {
    if (!restaurantConfig) return;
    
    const config = restaurantConfig.restaurant;
    const today = new Date();
    const minDate = new Date(today);
    minDate.setDate(today.getDate() + config.reservation.minDaysAdvance);
    
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + config.reservation.maxDaysAdvance);
    
    // Create available dates array
    const availableDates = [];
    const closedDates = [];
    
    for (let d = new Date(minDate); d <= maxDate; d.setDate(d.getDate() + 1)) {
        const dayOfWeek = getDayOfWeek(d);
        const dayConfig = config.hours[dayOfWeek];
        
        if (dayConfig.closed) {
            closedDates.push(new Date(d));
        } else {
            availableDates.push(new Date(d));
        }
    }
    
    // Initialize Flatpickr on the wrapper div
    const datePickerWrapper = document.querySelector('.date-picker-wrapper');
    flatpickrInstance = flatpickr(datePickerWrapper, {
        dateFormat: "Y-m-d",
        minDate: minDate,
        maxDate: maxDate,
        disable: closedDates,
        enable: availableDates,
        allowInput: false,
        inline: true,
        locale: {
            firstDayOfWeek: 1, // Monday
            weekdays: {
                shorthand: currentLanguage === 'en' ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] : ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
                longhand: currentLanguage === 'en' ? ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] : ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
            },
            months: {
                shorthand: currentLanguage === 'en' ? ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] : ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
                longhand: currentLanguage === 'en' ? ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"] : ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
            }
        },
        onChange: function(selectedDates, dateStr) {
            if (selectedDates.length > 0) {
                // Update both the hidden date field and the visible date-picker field
                dateInput.value = dateStr;
                datePickerInput.value = formatSelectedDate(selectedDates[0]);
                
                // Generate time options
                generateTimeOptions(dateStr);
            } else {
                // Clear both fields
                dateInput.value = '';
                datePickerInput.value = '';
                resetTimeOptions();
            }
        },
        onDayCreate: function(dObj, dStr, fp, dayElem) {
            // Add custom classes for different day types
            const date = new Date(dayElem.dateObj);
            const dayOfWeek = getDayOfWeek(date);
            const dayConfig = config.hours[dayOfWeek];
            
            if (dayConfig.closed) {
                dayElem.classList.add('closed');
                dayElem.title = getTranslation('placeholders.restaurantClosed');
            } else {
                dayElem.classList.add('available');
                dayElem.title = getTranslation('placeholders.selectTime');
            }
            
            // Highlight today
            const today = new Date();
            if (date.toDateString() === today.toDateString()) {
                dayElem.classList.add('today');
            }
        }
    });
    
    // Set placeholder text for the visible date picker input
    datePickerInput.placeholder = getTranslation('placeholders.selectDateFirst');
}

// Format selected date for display
function formatSelectedDate(date) {
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    
    if (currentLanguage === 'es') {
        return date.toLocaleDateString('es-ES', options);
    } else {
        return date.toLocaleDateString('en-US', options);
    }
}

// Update date picker locale when language changes
function updateDatePickerLocale() {
    if (!flatpickrInstance) return;
    
    const locale = {
        firstDayOfWeek: 1,
        weekdays: {
            shorthand: currentLanguage === 'en' ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] : ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
            longhand: currentLanguage === 'en' ? ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"] : ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]
        },
        months: {
            shorthand: currentLanguage === 'en' ? ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"] : ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
            longhand: currentLanguage === 'en' ? ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"] : ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]
        }
    };
    
    flatpickrInstance.set('locale', locale);
    flatpickrInstance.redraw();
    
    // Update placeholder text
    datePickerInput.placeholder = getTranslation('placeholders.selectDateFirst');
}

// Initialize language system
function initializeLanguage() {
    // Set initial language
    updateLanguageDisplay();
    translatePage();
}

// Toggle language between English and Spanish
function toggleLanguage() {
    currentLanguage = currentLanguage === 'en' ? 'es' : 'en';
    updateLanguageDisplay();
    translatePage();
    updateDatePickerLocale();
    
    // Update time options if a date is selected
    if (dateInput.value) {
        generateTimeOptions(dateInput.value);
    }
}

// Update language toggle display
function updateLanguageDisplay() {
    const langText = langToggle.querySelector('.lang-text');
    langText.textContent = currentLanguage.toUpperCase();
}

// Translate the entire page
function translatePage() {
    if (!restaurantConfig || !restaurantConfig.languages) return;
    
    const translations = restaurantConfig.languages[currentLanguage];
    
    // Translate elements with data-translate attribute
    const translatableElements = document.querySelectorAll('[data-translate]');
    translatableElements.forEach(element => {
        const key = element.getAttribute('data-translate');
        const translation = getNestedTranslation(translations, key);
        if (translation) {
            element.textContent = translation;
        }
    });
    
    // Translate placeholders
    const placeholderElements = document.querySelectorAll('[data-translate-placeholder]');
    placeholderElements.forEach(element => {
        const key = element.getAttribute('data-translate-placeholder');
        const translation = getNestedTranslation(translations, key);
        if (translation) {
            element.placeholder = translation;
        }
    });
    
    // Update document language
    document.documentElement.lang = currentLanguage;
}

// Get nested translation value
function getNestedTranslation(translations, key) {
    const keys = key.split('.');
    let value = translations;
    
    for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
            value = value[k];
        } else {
            return null;
        }
    }
    
    return value;
}

// Get translation for a specific key
function getTranslation(key) {
    if (!restaurantConfig || !restaurantConfig.languages) return key;
    return getNestedTranslation(restaurantConfig.languages[currentLanguage], key) || key;
}

// Initialize form constraints from config
function initializeFormConstraints() {
    if (!restaurantConfig) return;
    
    // Update people input constraints
    peopleInput.setAttribute('max', restaurantConfig.restaurant.reservation.maxPeople);
    peopleInput.setAttribute('min', restaurantConfig.restaurant.reservation.minPeople);
}

// Handle form submission
async function handleFormSubmit(e) {
    e.preventDefault();
    
    // Clear previous error states
    clearErrors();
    
    // Validate form
    if (validateForm()) {
        // Show loading state
        submitBtn.disabled = true;
        submitBtn.textContent = getTranslation('buttons.submitting');
        
        try {
            // Collect form data
            const formData = collectFormData();
            
            // Log the data to console
            console.log('Reservation Data:', formData);
            
            // Submit to Supabase
            await submitReservationToSupabase(formData);
            
            // Show success message
            showSuccessMessage();
            
            // Reset form
            form.reset();
            
            // Reset custom radio/checkbox styling
            resetCustomInputs();
            
            // Reset time options
            resetTimeOptions();
            
            // Clear date picker
            if (flatpickrInstance) {
                flatpickrInstance.clear();
            }
            
            // Clear the visible date picker field
            datePickerInput.value = '';
            
        } catch (error) {
            // Show error message
            showErrorMessage(error.message);
        } finally {
            // Re-enable submit button
            submitBtn.disabled = false;
            submitBtn.textContent = getTranslation('buttons.submit');
        }
    }
}

// Handle date change
function handleDateChange() {
    const selectedDate = dateInput.value;
    if (selectedDate) {
        generateTimeOptions(selectedDate);
    } else {
        resetTimeOptions();
    }
}

// Generate time options based on selected date
function generateTimeOptions(selectedDate) {
    if (!restaurantConfig) return;
    
    const date = new Date(selectedDate);
    const dayOfWeek = getDayOfWeek(date);
    const dayConfig = restaurantConfig.restaurant.hours[dayOfWeek];
    
    // Clear existing options
    timeSelect.innerHTML = '';
    
    // Add default option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = getTranslation('placeholders.selectTime');
    timeSelect.appendChild(defaultOption);
    
    if (dayConfig.closed) {
        const closedOption = document.createElement('option');
        closedOption.value = '';
        closedOption.textContent = getTranslation('placeholders.restaurantClosed');
        closedOption.disabled = true;
        timeSelect.appendChild(closedOption);
        timeSelect.disabled = true;
        return;
    }
    
    timeSelect.disabled = false;
    
    // Parse opening and closing times
    const openTime = parseTime(dayConfig.open);
    const closeTime = parseTime(dayConfig.close);
    const interval = restaurantConfig.restaurant.reservation.timeInterval;
    
    // Generate time slots
    const timeSlots = generateTimeSlots(openTime, closeTime, interval);
    
    // Add options to select
    timeSlots.forEach(timeSlot => {
        const option = document.createElement('option');
        option.value = timeSlot.value;
        option.textContent = timeSlot.display;
        timeSelect.appendChild(option);
    });
}

// Get day of week as string
function getDayOfWeek(date) {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    return days[date.getDay()];
}

// Parse time string (HH:MM) to minutes since midnight
function parseTime(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
}

// Convert minutes since midnight to time string
function minutesToTimeString(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

// Generate time slots between open and close times
function generateTimeSlots(openMinutes, closeMinutes, intervalMinutes) {
    const slots = [];
    let currentTime = openMinutes;
    
    while (currentTime < closeMinutes) {
        const timeString = minutesToTimeString(currentTime);
        const displayTime = formatTimeForDisplay(timeString);
        
        slots.push({
            value: timeString,
            display: displayTime
        });
        
        currentTime += intervalMinutes;
    }
    
    return slots;
}

// Format time for display (12-hour format)
function formatTimeForDisplay(timeString) {
    const [hours, minutes] = timeString.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

// Reset time options
function resetTimeOptions() {
    timeSelect.innerHTML = '';
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = getTranslation('placeholders.selectDateFirst');
    timeSelect.appendChild(defaultOption);
    timeSelect.disabled = true;
}

// Form validation function
function validateForm() {
    let isValid = true;
    
    // Required fields
    const requiredFields = [
        { id: 'date', name: getTranslation('fields.date') },
        { id: 'time', name: getTranslation('fields.time') },
        { id: 'people', name: getTranslation('fields.people') },
        { id: 'firstName', name: getTranslation('fields.firstName') },
        { id: 'lastName', name: getTranslation('fields.lastName') },
        { id: 'phone', name: getTranslation('fields.phone') }
    ];
    
    // Check required fields
    requiredFields.forEach(field => {
        const element = document.getElementById(field.id);
        const value = element.value.trim();
        
        if (!value) {
            showError(element, `${field.name} ${getTranslation('validation.required')}`);
            isValid = false;
        }
    });
    
    // Validate date using config
    if (dateInput.value && restaurantConfig) {
        const selectedDate = new Date(dateInput.value);
        const today = new Date();
        const minDate = new Date(today);
        minDate.setDate(today.getDate() + restaurantConfig.restaurant.reservation.minDaysAdvance);
        minDate.setHours(0, 0, 0, 0);
        
        if (selectedDate < minDate) {
            const message = getTranslation('validation.dateAdvance').replace('{days}', restaurantConfig.restaurant.reservation.minDaysAdvance);
            showError(dateInput, message);
            isValid = false;
        }
        
        // Check if restaurant is closed on selected day
        const dayOfWeek = getDayOfWeek(selectedDate);
        const dayConfig = restaurantConfig.restaurant.hours[dayOfWeek];
        if (dayConfig.closed) {
            showError(dateInput, getTranslation('validation.restaurantClosed'));
            isValid = false;
        }
    }
    
    // Validate number of people using config
    if (peopleInput.value && restaurantConfig) {
        const people = parseInt(peopleInput.value);
        const { minPeople, maxPeople } = restaurantConfig.restaurant.reservation;
        
        if (people < minPeople || people > maxPeople) {
            const message = getTranslation('validation.peopleRange')
                .replace('{min}', minPeople)
                .replace('{max}', maxPeople);
            showError(peopleInput, message);
            isValid = false;
        }
    }
    
    // Validate phone number
    const phoneInput = document.getElementById('phone');
    if (phoneInput.value) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        const cleanPhone = phoneInput.value.replace(/[\s\-\(\)]/g, '');
        
        if (!phoneRegex.test(cleanPhone)) {
            showError(phoneInput, getTranslation('validation.validPhone'));
            isValid = false;
        }
    }
    
    // Validate names
    const nameRegex = /^[a-zA-Z\s\-']+$/;
    
    const firstNameInput = document.getElementById('firstName');
    if (firstNameInput.value && !nameRegex.test(firstNameInput.value.trim())) {
        showError(firstNameInput, `${getTranslation('fields.firstName')} ${getTranslation('validation.validName')}`);
        isValid = false;
    }
    
    const lastNameInput = document.getElementById('lastName');
    if (lastNameInput.value && !nameRegex.test(lastNameInput.value.trim())) {
        showError(lastNameInput, `${getTranslation('fields.lastName')} ${getTranslation('validation.validName')}`);
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

// Clear error for a specific field
function clearFieldError() {
    if (this.classList.contains('error')) {
        this.classList.remove('error');
        const errorMessage = this.parentNode.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    }
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
            <h3 style="margin-bottom: 0.5rem;">${getTranslation('success.title')}</h3>
            <p style="margin: 0; font-size: 0.9rem;">${getTranslation('success.message')}</p>
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

// Show error message
function showErrorMessage(message) {
    // Create error message
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.innerHTML = `
        <div style="
            background: rgba(255, 107, 107, 0.1);
            border: 2px solid #ff6b6b;
            border-radius: 0;
            padding: 1rem;
            margin: 1rem 0;
            text-align: center;
            color: #ff6b6b;
            font-weight: 500;
        ">
            <h3 style="margin-bottom: 0.5rem;">${getTranslation('error.title')}</h3>
            <p style="margin: 0; font-size: 0.9rem;">${getTranslation('error.message')}</p>
        </div>
    `;
    
    // Insert before the form
    form.parentNode.insertBefore(errorDiv, form);
    
    // Remove error message after 5 seconds
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.remove();
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

// Phone number formatting
function formatPhoneNumber(e) {
    let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    
    // Format as (XXX) XXX-XXXX
    if (value.length >= 6) {
        value = value.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
    } else if (value.length >= 3) {
        value = value.replace(/(\d{3})(\d{0,3})/, '($1) $2');
    }
    
    e.target.value = value;
}

// Initialize form functionality
initializeFormFunctionality();

// Console welcome message
console.log(`%c🍽️ ${getTranslation('console.welcome')}`, 'color: #f08800; font-size: 20px; font-weight: bold;');
console.log(`%c${getTranslation('console.dataMessage')}`, 'color: #666666; font-size: 14px;'); 