package com.cityshare.service;

import com.cityshare.dto.TripDTO;
import com.cityshare.entity.Trip;
import com.cityshare.entity.User;
import com.cityshare.repository.TripRepository;
import com.cityshare.repository.UserRepository;
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

    public TripDTO.TripResponse createTrip(TripDTO.CreateTripRequest request, String driverEmail) {
        User driver = userRepository.findByEmail(driverEmail)
                .orElseThrow(() -> new RuntimeException("Conducteur non trouvé"));

        Trip trip = Trip.builder()
                .driver(driver)
                .departureCity(request.getDepartureCity())
                .arrivalCity(request.getArrivalCity())
                .intermediateStops(request.getIntermediateStops())
                .departureTime(request.getDepartureTime())
                .totalSeats(request.getTotalSeats())
                .availableSeats(request.getTotalSeats())
                .pricePerSeat(request.getPricePerSeat())
                .pricePerKg(request.getPricePerKg() != null ? request.getPricePerKg() : 500.0)
                .acceptsPackages(request.getAcceptsPackages() != null ? request.getAcceptsPackages() : true)
                .vehicleDescription(request.getVehicleDescription())
                .vehiclePlate(request.getVehiclePlate())
                .notes(request.getNotes())
                .status(Trip.TripStatus.PENDING)
                .build();

        trip = tripRepository.save(trip);
        return toResponse(trip);
    }

    public List<TripDTO.TripResponse> getAvailableTrips() {
        return tripRepository.findAvailableTrips(LocalDateTime.now())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public List<TripDTO.TripResponse> searchTrips(String departure, String arrival,
                                                    LocalDateTime date, int seats) {
        LocalDateTime from = date != null ? date : LocalDateTime.now();
        return tripRepository.searchTrips(departure, arrival, from, seats)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public TripDTO.TripResponse getTripById(Long id) {
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Trajet non trouvé"));
        return toResponse(trip);
    }

    public List<TripDTO.TripResponse> getMyTrips(String driverEmail) {
        User driver = userRepository.findByEmail(driverEmail)
                .orElseThrow(() -> new RuntimeException("Conducteur non trouvé"));
        return tripRepository.findByDriverId(driver.getId())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public TripDTO.TripResponse updateTripStatus(Long tripId, String status, String driverEmail) {
        Trip trip = tripRepository.findById(tripId)
                .orElseThrow(() -> new RuntimeException("Trajet non trouvé"));
        User driver = userRepository.findByEmail(driverEmail)
                .orElseThrow(() -> new RuntimeException("Conducteur non trouvé"));

        if (!trip.getDriver().getId().equals(driver.getId())) {
            throw new RuntimeException("Vous n'êtes pas autorisé à modifier ce trajet");
        }
        trip.setStatus(Trip.TripStatus.valueOf(status.toUpperCase()));
        tripRepository.save(trip);
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
