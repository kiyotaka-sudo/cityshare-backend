package com.cityshare.dto;

import com.cityshare.entity.Trip;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

public class TripDTO {

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CreateTripRequest {
        private String departureCity;
        private String arrivalCity;
        private String intermediateStops;
        private LocalDateTime departureTime;
        private Integer totalSeats;
        private Double pricePerSeat;
        private Double pricePerKg;
        private Boolean acceptsPackages;
        private String vehicleDescription;
        private String vehiclePlate;
        private String notes;
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class TripResponse {
        private Long id;
        private Long driverId;
        private String driverName;
        private Double driverRating;
        private String departureCity;
        private String arrivalCity;
        private String intermediateStops;
        private LocalDateTime departureTime;
        private Integer availableSeats;
        private Integer totalSeats;
        private Double pricePerSeat;
        private Double pricePerKg;
        private Trip.TripStatus status;
        private Boolean acceptsPackages;
        private String vehicleDescription;
        private String vehiclePlate;
        private String notes;
        private LocalDateTime createdAt;
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class SearchRequest {
        private String departureCity;
        private String arrivalCity;
        private LocalDateTime date;
        private Integer seats;
    }
}
