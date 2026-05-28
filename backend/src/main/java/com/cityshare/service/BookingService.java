package com.cityshare.service;

import com.cityshare.dto.BookingPackageDTO;
import com.cityshare.entity.Booking;
import com.cityshare.entity.Trip;
import com.cityshare.entity.User;
import com.cityshare.repository.BookingRepository;
import com.cityshare.repository.TripRepository;
import com.cityshare.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final TripRepository tripRepository;
    private final UserRepository userRepository;

    @Transactional
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

        double total = trip.getPricePerSeat() * request.getSeatsBooked();

        Booking booking = Booking.builder()
                .passenger(passenger)
                .trip(trip)
                .seatsBooked(request.getSeatsBooked())
                .totalPrice(total)
                .status(Booking.BookingStatus.CONFIRMED)
                .pickupStop(request.getPickupStop() != null ? request.getPickupStop() : trip.getDepartureCity())
                .dropoffStop(request.getDropoffStop() != null ? request.getDropoffStop() : trip.getArrivalCity())
                .qrCodeToken(UUID.randomUUID().toString())
                .build();

        trip.setAvailableSeats(trip.getAvailableSeats() - request.getSeatsBooked());
        tripRepository.save(trip);
        booking = bookingRepository.save(booking);

        return toResponse(booking);
    }

    public List<BookingPackageDTO.BookingResponse> getMyBookings(String passengerEmail) {
        User passenger = userRepository.findByEmail(passengerEmail)
                .orElseThrow(() -> new RuntimeException("Passager non trouvé"));
        return bookingRepository.findByPassengerId(passenger.getId())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<BookingPackageDTO.BookingResponse> getTripBookings(Long tripId) {
        return bookingRepository.findByTripId(tripId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional
    public BookingPackageDTO.BookingResponse cancelBooking(Long bookingId, String userEmail) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Réservation non trouvée"));

        if (!booking.getPassenger().getEmail().equals(userEmail)) {
            throw new RuntimeException("Non autorisé");
        }

        booking.setStatus(Booking.BookingStatus.CANCELLED);
        Trip trip = booking.getTrip();
        trip.setAvailableSeats(trip.getAvailableSeats() + booking.getSeatsBooked());
        tripRepository.save(trip);
        bookingRepository.save(booking);
        return toResponse(booking);
    }

    @Transactional
    public void rateBooking(BookingPackageDTO.RatingRequest request, String userEmail) {
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new RuntimeException("Réservation non trouvée"));

        User rater = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        if (booking.getPassenger().getEmail().equals(userEmail)) {
            // passenger rating the driver
            booking.setDriverRating(request.getRating());
            booking.setDriverReview(request.getReview());
            User driver = booking.getTrip().getDriver();
            updateUserRating(driver, request.getRating());
        } else if (booking.getTrip().getDriver().getEmail().equals(userEmail)) {
            // driver rating the passenger
            booking.setPassengerRating(request.getRating());
            booking.setPassengerReview(request.getReview());
            updateUserRating(booking.getPassenger(), request.getRating());
        }
        bookingRepository.save(booking);
    }

    private void updateUserRating(User user, int newRating) {
        double total = (user.getRating() * user.getTotalRatings()) + newRating;
        user.setTotalRatings(user.getTotalRatings() + 1);
        user.setRating(total / user.getTotalRatings());
        userRepository.save(user);
    }

    private BookingPackageDTO.BookingResponse toResponse(Booking b) {
        return BookingPackageDTO.BookingResponse.builder()
                .id(b.getId())
                .passengerId(b.getPassenger().getId())
                .passengerName(b.getPassenger().getFirstName() + " " + b.getPassenger().getLastName())
                .tripId(b.getTrip().getId())
                .tripRoute(b.getTrip().getDepartureCity() + " → " + b.getTrip().getArrivalCity())
                .departureTime(b.getTrip().getDepartureTime())
                .seatsBooked(b.getSeatsBooked())
                .totalPrice(b.getTotalPrice())
                .status(b.getStatus())
                .pickupStop(b.getPickupStop())
                .dropoffStop(b.getDropoffStop())
                .qrCodeToken(b.getQrCodeToken())
                .createdAt(b.getCreatedAt())
                .build();
    }
}
