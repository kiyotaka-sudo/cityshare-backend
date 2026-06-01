package com.cityshare.backend.service;

import com.cityshare.backend.dto.TripDTO;
import com.cityshare.backend.entity.Trip;
import com.cityshare.backend.entity.User;
import com.cityshare.backend.repository.TripRepository;
import com.cityshare.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TripService {

    private final TripRepository tripRepository;
    private final UserRepository userRepository;

    private static final String DRIVER_NOT_FOUND = "Conducteur non trouvé";

    public TripDTO.TripResponse createTrip(TripDTO.CreateTripRequest request, String driverEmail) {
        User driver = userRepository.findByEmail(driverEmail)
                .orElseThrow(() -> new RuntimeException(DRIVER_NOT_FOUND));

        Trip trip = Trip.builder()
                .driver(driver)
                .departureCity(request.getDepartureCity())
                .arrivalCity(request.getArrivalCity())
                .intermediateStops(request.getIntermediateStops())
                .departureTime(request.getDepartureTime())
                .totalSeats(request.getTotalSeats())
                .availableSeats(request.getTotalSeats())
                .pricePerSeat(request.getPricePerSeat())
                .pricePerKg(request.getPricePerKg() != null ? request.getPricePerKg() : 0.0)
                .acceptsPackages(request.getAcceptsPackages() != null && request.getAcceptsPackages())
                .vehicleDescription(request.getVehicleDescription())
                .vehiclePlate(request.getVehiclePlate())
                .notes(request.getNotes())
                .status(Trip.TripStatus.PENDING)
                .build();

        trip = tripRepository.save(trip);
        return toResponse(trip);
    }

    public List<TripDTO.TripResponse> getAllTrips() {
        return tripRepository.findAvailableTrips(LocalDateTime.now())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public List<TripDTO.TripResponse> searchTrips(TripDTO.SearchRequest request) {
        return tripRepository.searchTrips(
                request.getDepartureCity(),
                request.getArrivalCity(),
                request.getDate() != null ? request.getDate() : LocalDateTime.now(),
                request.getSeats() != null ? request.getSeats() : 1)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public TripDTO.TripResponse getTripById(Long id) {
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Trajet non trouvé"));
        return toResponse(trip);
    }

    public List<TripDTO.TripResponse> getMyTrips(String driverEmail) {
        User driver = userRepository.findByEmail(driverEmail)
                .orElseThrow(() -> new RuntimeException(DRIVER_NOT_FOUND));
        return tripRepository.findByDriverId(driver.getId())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public TripDTO.TripResponse cancelTrip(Long tripId, String driverEmail) {
        User driver = userRepository.findByEmail(driverEmail)
                .orElseThrow(() -> new RuntimeException(DRIVER_NOT_FOUND));

        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trajet non trouvé"));

        if (!trip.getDriver().getId().equals(driver.getId())) {
            throw new RuntimeException("Action non autorisée");
        }

        trip.setStatus(Trip.TripStatus.CANCELLED);
        trip = tripRepository.save(trip);
        return toResponse(trip);
    }

    private TripDTO.TripResponse toResponse(Trip trip) {
        return TripDTO.TripResponse.builder()
                .id(trip.getId())
                .driverId(trip.getDriver().getId())
                .driverName(trip.getDriver().getFirstName() + " " + trip.getDriver().getLastName())
                .driverRating(trip.getDriver().getRating())
                .departureCity(trip.getDepartureCity())
                .arrivalCity(trip.getArrivalCity())
                .intermediateStops(trip.getIntermediateStops())
                .departureTime(trip.getDepartureTime())
                .availableSeats(trip.getAvailableSeats())
                .totalSeats(trip.getTotalSeats())
                .pricePerSeat(trip.getPricePerSeat())
                .pricePerKg(trip.getPricePerKg())
                .status(trip.getStatus())
                .acceptsPackages(trip.getAcceptsPackages())
                .vehicleDescription(trip.getVehicleDescription())
                .vehiclePlate(trip.getVehiclePlate())
                .notes(trip.getNotes())
                .createdAt(trip.getCreatedAt())
                .build();
    }
}
