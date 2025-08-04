# Restaurant Reservation Form

A modern, responsive restaurant reservation form built with HTML, CSS, and JavaScript. Features a dark theme design with elegant styling, comprehensive form validation, and **dynamic time slot generation** based on restaurant hours.

## Features

### HTML Structure
- **Semantic HTML5** with proper form structure
- **Accessible form elements** with proper labels and ARIA attributes
- **Organized sections** for different types of information
- **Required field indicators** with asterisks

### Form Fields
- **Date picker** with dynamic validation based on restaurant policy
- **Dynamic time selector** that generates options based on selected date and restaurant hours
- **Number of people** input with configurable min/max values
- **Contact information** (First Name, Last Name, Phone Number)
- **Seating preferences** (Inside, Patio, No Preference)
- **Accessibility options** (Wheelchair Accessible, Hearing Impairment)
- **Special requests** textarea for additional notes

### CSS Design
- **Dark theme** with gold accents (#ffd700)
- **Modern glassmorphism** effect with backdrop blur
- **Responsive design** that works on desktop and mobile
- **Smooth animations** and hover effects
- **Custom radio buttons and checkboxes** with elegant styling
- **Gradient backgrounds** and subtle shadows

### JavaScript Functionality
- **Dynamic configuration loading** from JSON file
- **Intelligent time slot generation** based on restaurant hours per day
- **Comprehensive form validation** using configurable rules
- **Real-time error clearing** as users type
- **Data collection and formatting** for easy processing
- **Console logging** of reservation data
- **Success messages** with auto-dismiss
- **Phone number formatting** for better UX
- **Loading states** for submit button

## Files

- `index.html` - Main HTML structure
- `styles.css` - All styling and responsive design
- `script.js` - Form validation and dynamic functionality
- `config.js` - Configuration loader
- `config.json` - Restaurant configuration (hours, policies, etc.)
- `README.md` - This documentation

## Configuration System

The form uses a JSON configuration file (`config.json`) to manage:

### Restaurant Hours
```json
{
  "hours": {
    "sunday": { "open": "11:30", "close": "21:00", "closed": false },
    "monday": { "open": "11:30", "close": "21:00", "closed": false },
    "tuesday": { "open": "11:30", "close": "21:00", "closed": false },
    "wednesday": { "open": "11:30", "close": "21:00", "closed": false },
    "thursday": { "open": "11:30", "close": "22:00", "closed": false },
    "friday": { "open": "11:30", "close": "23:00", "closed": false },
    "saturday": { "open": "11:30", "close": "23:00", "closed": false }
  }
}
```

### Reservation Policies
```json
{
  "reservation": {
    "maxPeople": 20,
    "minPeople": 1,
    "minDaysAdvance": 1,
    "maxDaysAdvance": 90,
    "timeInterval": 15
  }
}
```

## Usage

1. **Open the form**: Simply open `index.html` in any modern web browser
2. **Select a date**: Choose your preferred dining date
3. **Choose a time**: Time slots are automatically generated based on restaurant hours for that day
4. **Fill out the form**: Complete all required fields (marked with *)
5. **Submit**: Click "Book Reservation" to submit
6. **View data**: Check the browser console (F12) to see the logged reservation data

## Dynamic Time Generation

The form automatically generates time slots based on:

- **Selected date** (determines day of week)
- **Restaurant hours** for that specific day
- **Time interval** (default: 15 minutes)
- **Opening and closing times** from configuration

### Example Time Slots
- **Sunday-Wednesday**: 11:30 AM to 9:00 PM (15-minute intervals)
- **Thursday**: 11:30 AM to 10:00 PM (15-minute intervals)
- **Friday-Saturday**: 11:30 AM to 11:00 PM (15-minute intervals)

## Form Validation

The form validates using configuration values:
- **Required fields** are not empty
- **Date** meets minimum advance booking requirements
- **Date** is not on a closed day
- **Number of people** is within configured min/max range
- **Phone number** format is valid
- **Names** contain only letters, spaces, hyphens, and apostrophes

## Data Structure

When submitted, the form logs data in this format:

```javascript
{
  reservation: {
    date: "2024-01-15",
    time: "19:00",
    numberOfPeople: 4,
    seating: "patio"
  },
  contact: {
    firstName: "John",
    lastName: "Doe",
    phone: "(555) 123-4567"
  },
  preferences: {
    wheelchair: false,
    hearing: true
  },
  specialRequests: "Window seat preferred"
}
```

## Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Customization

### Restaurant Hours
Edit `config.json` to modify:
- Opening and closing times for each day
- Set days as closed (`"closed": true`)
- Change time intervals

### Reservation Policies
Modify in `config.json`:
- Maximum/minimum people per reservation
- Minimum days advance booking required
- Maximum days in advance for booking
- Time slot intervals

### Colors
The main color scheme can be modified in `styles.css`:
- Primary gold: `#ffd700`
- Background: `#1a1a1a` to `#2d2d2d`
- Text: `#ffffff`

### Validation Rules
Validation logic can be modified in the `validateForm()` function in `script.js`.

## Technical Notes

- **Configuration Loading**: Uses `fetch()` API to load JSON configuration
- **Fallback System**: Includes fallback configuration if JSON fails to load
- **Async Operations**: Properly handles asynchronous configuration loading
- **Error Handling**: Graceful error handling for configuration issues

## License

This project is open source and available under the MIT License.
