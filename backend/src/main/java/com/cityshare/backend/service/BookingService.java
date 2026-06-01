package com.cityshare.backend.service;

import com.cityshare.backend.dto.BookingPackageDTO;
import com.cityshare.backend.entity.Booking;
import com.cityshare.backend.entity.Trip;
import com.cityshare.backend.entity.User;
import com.cityshare.backend.repository.BookingRepository;
import com.cityshare.backend.repository.TripRepository;
import com.cityshare.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final TripRepository tripRepository;
    private final UserRepository userRepository;

    public BookingPackageDTO.BookingResponse createBooking(
            BookingPackageDTO.CreateBookingRequest request, String passengerEmail) {

        User passenger = userRepository.findByEmail(passengerEmail)
                .orElseThrow(() -> new RuntimeException("Passager non trouvé"));

        Trip trip = tripRepository.findById(request.getTripId())
                .orElseThrow(() -> new RuntimeException("Trajet non trouvé"));

        if (trip.getAvailableSeats() < request.getSeatsBooked()) {
            throw new RuntimeException("Pas assez de places disponibles");
        }

        if (bookingRepository.existsByPassengerIdAndTripId(passenger.getId(), trip.getId())) {
            throw new RuntimeException("Vous avez déjà réservé ce trajet");
        }

        double totalPrice = trip.getPricePerSeat() * request.getSeatsBooked();

        Booking booking = Booking.builder()
                .passenger(passenger)
                .trip(trip)
                .seatsBooked(request.getSeatsBooked())
                .totalPrice(totalPrice)
                .status(Booking.BookingStatus.PENDING)
                .pickupStop(request.getPickupStop())
                .dropoffStop(request.getDropoffStop())
                .qrCodeToken(UUID.randomUUID().toString())
                .build();

        booking = bookingRepository.save(booking);

        // Mettre à jour les places disponibles
        trip.setAvailableSeats(trip.getAvailableSeats() - request.getSeatsBooked());
        tripRepository.save(trip);

        return toResponse(booking);
    }

    public List<BookingPackageDTO.BookingResponse> getMyBookings(String passengerEmail) {
        User passenger = userRepository.findByEmail(passengerEmail)
                .orElseThrow(() -> new RuntimeException("Passager non trouvé"));
        return bookingRepository.findByPassengerId(passenger.getId())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public BookingPackageDTO.BookingResponse getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Réservation non trouvée"));
        return toResponse(booking);
    }

    public BookingPackageDTO.BookingResponse cancelBooking(Long bookingId, String passengerEmail) {
        User passenger = userRepository.findByEmail(passengerEmail)
                .orElseThrow(() -> new RuntimeException("Passager non trouvé"));

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Réservation non trouvée"));

        if (!booking.getPassenger().getId().equals(passenger.getId())) {
            throw new RuntimeException("Action non autorisée");
        }

        booking.setStatus(Booking.BookingStatus.CANCELLED);
        booking = bookingRepository.save(booking);

        // Remettre les places disponibles
        Trip trip = booking.getTrip();
        trip.setAvailableSeats(trip.getAvailableSeats() + booking.getSeatsBooked());
        tripRepository.save(trip);

        return toResponse(booking);
    }

    public BookingPackageDTO.BookingResponse rateBooking(
            BookingPackageDTO.RatingRequest request, String userEmail) {

        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new RuntimeException("Réservation non trouvée"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        if (booking.getPassenger().getId().equals(user.getId())) {
            booking.setDriverRating(request.getRating());
            booking.setDriverReview(request.getReview());
            updateUserRating(booking.getTrip().getDriver(), request.getRating());
        } else if (booking.getTrip().getDriver().getId().equals(user.getId())) {
            booking.setPassengerRating(request.getRating());
            booking.setPassengerReview(request.getReview());
            updateUserRating(booking.getPassenger(), request.getRating());
        } else {
            throw new RuntimeException("Action non autorisée");
        }

        booking = bookingRepository.save(booking);
        return toResponse(booking);
    }

    private void updateUserRating(User user, Integer newRating) {
        int total = user.getTotalRatings() + 1;
        double avg = ((user.getRating() * user.getTotalRatings()) + newRating) / total;
        user.setRating(avg);
        user.setTotalRatings(total);
        userRepository.save(user);
    }

    private BookingPackageDTO.BookingResponse toResponse(Booking booking) {
        return BookingPackageDTO.BookingResponse.builder()
                .id(booking.getId())
                .passengerId(booking.getPassenger().getId())
                .passengerName(booking.getPassenger().getFirstName() + " " + booking.getPassenger().getLastName())
                .tripId(booking.getTrip().getId())
                .tripRoute(booking.getTrip().getDepartureCity() + " → " + booking.getTrip().getArrivalCity())
                .departureTime(booking.getTrip().getDepartureTime())
                .seatsBooked(booking.getSeatsBooked())
                .totalPrice(booking.getTotalPrice())
                .status(booking.getStatus())
                .pickupStop(booking.getPickupStop())
                .dropoffStop(booking.getDropoffStop())
                .qrCodeToken(booking.getQrCodeToken())
                .createdAt(booking.getCreatedAt())
                .build();
    }
}
