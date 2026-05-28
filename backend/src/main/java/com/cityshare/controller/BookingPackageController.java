package com.cityshare.controller;

import com.cityshare.dto.BookingPackageDTO;
import com.cityshare.service.BookingService;
import com.cityshare.service.PackageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<BookingPackageDTO.BookingResponse> createBooking(
            @RequestBody BookingPackageDTO.CreateBookingRequest request, Principal principal) {
        return ResponseEntity.ok(bookingService.createBooking(request, principal.getName()));
    }

    @GetMapping("/my")
    public ResponseEntity<List<BookingPackageDTO.BookingResponse>> getMyBookings(Principal principal) {
        return ResponseEntity.ok(bookingService.getMyBookings(principal.getName()));
    }

    @GetMapping("/trip/{tripId}")
    public ResponseEntity<List<BookingPackageDTO.BookingResponse>> getTripBookings(@PathVariable Long tripId) {
        return ResponseEntity.ok(bookingService.getTripBookings(tripId));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<BookingPackageDTO.BookingResponse> cancelBooking(
            @PathVariable Long id, Principal principal) {
        return ResponseEntity.ok(bookingService.cancelBooking(id, principal.getName()));
    }

    @PostMapping("/rate")
    public ResponseEntity<Void> rateBooking(
            @RequestBody BookingPackageDTO.RatingRequest request, Principal principal) {
        bookingService.rateBooking(request, principal.getName());
        return ResponseEntity.ok().build();
    }
}

@RestController
@RequestMapping("/api/packages")
@RequiredArgsConstructor
class PackageController {

    private final PackageService packageService;

    @PostMapping
    public ResponseEntity<BookingPackageDTO.PackageResponse> sendPackage(
            @RequestBody BookingPackageDTO.CreatePackageRequest request, Principal principal) {
        return ResponseEntity.ok(packageService.sendPackage(request, principal.getName()));
    }

    @GetMapping("/my")
    public ResponseEntity<List<BookingPackageDTO.PackageResponse>> getMyPackages(Principal principal) {
        return ResponseEntity.ok(packageService.getMyPackages(principal.getName()));
    }

    @GetMapping("/track/{trackingCode}")
    public ResponseEntity<BookingPackageDTO.PackageResponse> trackPackage(@PathVariable String trackingCode) {
        return ResponseEntity.ok(packageService.trackPackage(trackingCode));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<BookingPackageDTO.PackageResponse> updateStatus(
            @PathVariable Long id,
            @RequestParam String status,
            Principal principal) {
        return ResponseEntity.ok(packageService.updatePackageStatus(id, status, principal.getName()));
    }

    @GetMapping("/trip/{tripId}")
    public ResponseEntity<List<BookingPackageDTO.PackageResponse>> getPackagesForTrip(
            @PathVariable Long tripId, Principal principal) {
        return ResponseEntity.ok(packageService.getPackagesForTrip(tripId, principal.getName()));
    }
}
