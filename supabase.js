// Supabase configuration
import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js'

// Replace with your Supabase URL and anon key
const supabaseUrl = 'https://lmmacdkoiwhmjhscjssa.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxtbWFjZGtvaXdobWpoc2Nqc3NhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0MjAxNjEsImV4cCI6MjA2OTk5NjE2MX0.38HIXiAtv0U93jzqpY1wHSiPgf1C2VepKIJhsJwbaGw'

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Make Supabase client available globally
window.supabase = supabase

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