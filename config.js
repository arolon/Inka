// Global configuration object
let restaurantConfig = null;

// Load configuration from JSON file
async function loadConfig() {
    try {
        const response = await fetch('config.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        restaurantConfig = await response.json();
        console.log('Configuration loaded successfully:', restaurantConfig);
        
        // Initialize form after config is loaded
        initializeForm();
    } catch (error) {
        console.error('Error loading configuration:', error);
        // Fallback configuration in case JSON fails to load
        restaurantConfig = {
            restaurant: {
                name: "Elinka Restaurant",
                hours: {
                    sunday: { open: "11:30", close: "21:00", closed: false },
                    monday: { open: "11:30", close: "21:00", closed: false },
                    tuesday: { open: "11:30", close: "21:00", closed: false },
                    wednesday: { open: "11:30", close: "21:00", closed: false },
                    thursday: { open: "11:30", close: "22:00", closed: false },
                    friday: { open: "11:30", close: "23:00", closed: false },
                    saturday: { open: "11:30", close: "23:00", closed: false }
                },
                reservation: {
                    maxPeople: 20,
                    minPeople: 1,
                    minDaysAdvance: 1,
                    maxDaysAdvance: 90,
                    timeInterval: 15
                }
            }
        };
        initializeForm();
    }
}

// Initialize form with configuration
function initializeForm() {
    if (!restaurantConfig) {
        console.error('Configuration not loaded');
        return;
    }

    // Update max people attribute
    const peopleInput = document.getElementById('people');
    if (peopleInput) {
        peopleInput.setAttribute('max', restaurantConfig.restaurant.reservation.maxPeople);
        peopleInput.setAttribute('min', restaurantConfig.restaurant.reservation.minPeople);
    }

    // Set date constraints
    const dateInput = document.getElementById('date');
    if (dateInput) {
        const today = new Date();
        const minDate = new Date(today);
        minDate.setDate(today.getDate() + restaurantConfig.restaurant.reservation.minDaysAdvance);
        
        const maxDate = new Date(today);
        maxDate.setDate(today.getDate() + restaurantConfig.restaurant.reservation.maxDaysAdvance);
        
        dateInput.setAttribute('min', minDate.toISOString().split('T')[0]);
        dateInput.setAttribute('max', maxDate.toISOString().split('T')[0]);
    }

    console.log('Form initialized with configuration');
}

// Load configuration when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadConfig);
} else {
    loadConfig();
} 