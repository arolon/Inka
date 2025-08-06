// Supabase configuration
import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js'

// Load environment variables
function getEnvVar(name) {
    // For browser environment, we'll use a different approach
    // This function will be replaced by build tools or server-side rendering
    return window.ENV_VARS?.[name] || process.env?.[name]
}

// Get Supabase credentials from environment variables
const supabaseUrl = getEnvVar('SUPABASE_URL') 
const supabaseAnonKey = getEnvVar('SUPABASE_ANON_KEY')

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Function to submit reservation to Supabase
async function submitReservationToSupabase(reservationData) {
    try {
        // Format the data for Supabase
        const supabaseData = {
            reservation_date: reservationData.reservation.date,
            reservation_time: reservationData.reservation.time,
            guests: reservationData.reservation.numberOfPeople,
            first_name: reservationData.contact.firstName,
            last_name: reservationData.contact.lastName,
            phone_number: reservationData.contact.phone,
            notes: formatNotes(reservationData)
        }

        // Insert the reservation into the database
        const { data, error } = await supabase
            .from('reservations')
            .insert([supabaseData])
            .select()

        if (error) {
            console.error('Error submitting reservation:', error)
            throw new Error(error.message)
        }

        console.log('Reservation submitted successfully:', data)
        return data

    } catch (error) {
        console.error('Failed to submit reservation:', error)
        throw error
    }
}

// Function to format notes from preferences and special requests
function formatNotes(reservationData) {
    const notes = []
    
    // Add seating preference
    const seating = reservationData.reservation.seating
    if (seating && seating !== 'no-preference') {
        notes.push(`Seating: ${seating}`)
    }
    
    // Add accessibility needs
    const accessibility = []
    if (reservationData.preferences.wheelchair) {
        accessibility.push('Wheelchair accessible seating')
    }
    if (reservationData.preferences.hearing) {
        accessibility.push('Hearing assistance needed')
    }
    if (reservationData.preferences.blind) {
        accessibility.push('Visual assistance needed')
    }
    
    if (accessibility.length > 0) {
        notes.push(`Accessibility: ${accessibility.join(', ')}`)
    }
    
    // Add special requests
    if (reservationData.specialRequests && reservationData.specialRequests !== 'None') {
        notes.push(`Special requests: ${reservationData.specialRequests}`)
    }
    
    return notes.length > 0 ? notes.join(' | ') : 'No special notes'
}

// Export functions for use in other files
window.submitReservationToSupabase = submitReservationToSupabase
window.supabase = supabase 