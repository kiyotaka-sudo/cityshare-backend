package com.cityshare.backend.dto;

import com.cityshare.backend.entity.Booking;
import com.cityshare.backend.entity.Package;
import lombok.*;
import java.time.LocalDateTime;

public class BookingPackageDTO {

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CreateBookingRequest {
        private Long tripId;
        private Integer seatsBooked;
        private String pickupStop;
        private String dropoffStop;
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class BookingResponse {
        private Long id;
        private Long passengerId;
        private String passengerName;
        private Long tripId;
        private String tripRoute;
        private LocalDateTime departureTime;
        private Integer seatsBooked;
        private Double totalPrice;
        private Booking.BookingStatus status;
        private String pickupStop;
        private String dropoffStop;
        private String qrCodeToken;
        private LocalDateTime createdAt;
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CreatePackageRequest {
        private Long tripId;
        private String description;
        private Double weightKg;
        private String recipientName;
        private String recipientPhone;
        private String pickupAddress;
        private String deliveryAddress;
        private Boolean fragile;
        private String notes;
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class PackageResponse {
        private Long id;
        private Long senderId;
        private String senderName;
        private Long tripId;
        private String tripRoute;
        private String description;
        private Double weightKg;
        private Double totalPrice;
        private String recipientName;
        private String recipientPhone;
        private String pickupAddress;
        private String deliveryAddress;
        private Package.PackageStatus status;
        private String trackingCode;
        private Boolean fragile;
        private LocalDateTime createdAt;
    }

    @Data @NoArgsConstructor @AllArgsConstructor @Builder
    public static class RatingRequest {
        private Long bookingId;
        private Integer rating;
        private String review;
    }
}
