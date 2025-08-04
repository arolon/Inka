# Restaurant Reservation Form

A modern, responsive restaurant reservation form built with HTML, CSS, and JavaScript. Features a dark theme design with elegant styling and comprehensive form validation.

## Features

### HTML Structure
- **Semantic HTML5** with proper form structure
- **Accessible form elements** with proper labels and ARIA attributes
- **Organized sections** for different types of information
- **Required field indicators** with asterisks

### Form Fields
- **Date picker** with minimum date validation (today or future)
- **Time selector** with 15-minute intervals from 11:00 AM to 10:00 PM
- **Number of people** input (1-20 range)
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
- **Comprehensive form validation** for all required fields
- **Real-time error clearing** as users type
- **Data collection and formatting** for easy processing
- **Console logging** of reservation data
- **Success messages** with auto-dismiss
- **Phone number formatting** for better UX
- **Loading states** for submit button

## Files

- `index.html` - Main HTML structure
- `styles.css` - All styling and responsive design
- `script.js` - Form validation and data handling
- `README.md` - This documentation

## Usage

1. **Open the form**: Simply open `index.html` in any modern web browser
2. **Fill out the form**: Complete all required fields (marked with *)
3. **Submit**: Click "Book Reservation" to submit
4. **View data**: Check the browser console (F12) to see the logged reservation data

## Form Validation

The form validates:
- **Required fields** are not empty
- **Date** is today or in the future
- **Number of people** is between 1 and 20
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

### Colors
The main color scheme can be modified in `styles.css`:
- Primary gold: `#ffd700`
- Background: `#1a1a1a` to `#2d2d2d`
- Text: `#ffffff`

### Time Slots
Time intervals can be adjusted in the HTML select options in `index.html`.

### Validation Rules
Validation logic can be modified in the `validateForm()` function in `script.js`.

## License

This project is open source and available under the MIT License.
