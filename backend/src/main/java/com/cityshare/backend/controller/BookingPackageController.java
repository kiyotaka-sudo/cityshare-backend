package com.cityshare.backend.controller;

import com.cityshare.backend.dto.BookingPackageDTO;
import com.cityshare.backend.service.BookingService;
import com.cityshare.backend.service.PackageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequiredArgsConstructor
public class BookingPackageController {

    private final BookingService bookingService;
    private final PackageService packageService;

    // ========== BOOKINGS ==========

    @PostMapping("/api/bookings")
    public ResponseEntity<BookingPackageDTO.BookingResponse> createBooking(
            @RequestBody BookingPackageDTO.CreateBookingRequest request,
            Principal principal) {
        return ResponseEntity.ok(bookingService.createBooking(request, principal.getName()));
    }

    @GetMapping("/api/bookings/my-bookings")
    public ResponseEntity<List<BookingPackageDTO.BookingResponse>> getMyBookings(Principal principal) {
        return ResponseEntity.ok(bookingService.getMyBookings(principal.getName()));
    }

    @GetMapping("/api/bookings/{id}")
    public ResponseEntity<BookingPackageDTO.BookingResponse> getBookingById(@PathVariable Long id) {
        return ResponseEntity.ok(bookingService.getBookingById(id));
    }

    @PutMapping("/api/bookings/{id}/cancel")
    public ResponseEntity<BookingPackageDTO.BookingResponse> cancelBooking(
            @PathVariable Long id,
            Principal principal) {
        return ResponseEntity.ok(bookingService.cancelBooking(id, principal.getName()));
    }

    @PostMapping("/api/bookings/rate")
    public ResponseEntity<BookingPackageDTO.BookingResponse> rateBooking(
            @RequestBody BookingPackageDTO.RatingRequest request,
            Principal principal) {
        return ResponseEntity.ok(bookingService.rateBooking(request, principal.getName()));
    }

    // ========== PACKAGES ==========

    @PostMapping("/api/packages")
    public ResponseEntity<BookingPackageDTO.PackageResponse> createPackage(
            @RequestBody BookingPackageDTO.CreatePackageRequest request,
            Principal principal) {
        return ResponseEntity.ok(packageService.createPackage(request, principal.getName()));
    }

    @GetMapping("/api/packages/my-packages")
    public ResponseEntity<List<BookingPackageDTO.PackageResponse>> getMyPackages(Principal principal) {
        return ResponseEntity.ok(packageService.getMyPackages(principal.getName()));
    }

    @GetMapping("/api/packages/{id}")
    public ResponseEntity<BookingPackageDTO.PackageResponse> getPackageById(@PathVariable Long id) {
        return ResponseEntity.ok(packageService.getPackageById(id));
    }

    @GetMapping("/api/packages/track/{trackingCode}")
    public ResponseEntity<BookingPackageDTO.PackageResponse> trackPackage(
            @PathVariable String trackingCode) {
        return ResponseEntity.ok(packageService.trackPackage(trackingCode));
    }

    @PutMapping("/api/packages/{id}/status")
    public ResponseEntity<BookingPackageDTO.PackageResponse> updatePackageStatus(
            @PathVariable Long id,
            @RequestParam String status,
            Principal principal) {
        return ResponseEntity.ok(packageService.updateStatus(id, status, principal.getName()));
    }
}
