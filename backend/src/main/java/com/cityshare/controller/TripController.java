package com.cityshare.controller;

import com.cityshare.dto.TripDTO;
import com.cityshare.service.TripService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/trips")
@RequiredArgsConstructor
public class TripController {

    private final TripService tripService;

    @PostMapping
    public ResponseEntity<TripDTO.TripResponse> createTrip(
            @RequestBody TripDTO.CreateTripRequest request, Principal principal) {
        return ResponseEntity.ok(tripService.createTrip(request, principal.getName()));
    }

    @GetMapping("/available")
    public ResponseEntity<List<TripDTO.TripResponse>> getAvailableTrips() {
        return ResponseEntity.ok(tripService.getAvailableTrips());
    }

    @GetMapping("/search")
    public ResponseEntity<List<TripDTO.TripResponse>> searchTrips(
            @RequestParam String departure,
            @RequestParam String arrival,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime date,
            @RequestParam(defaultValue = "1") int seats) {
        return ResponseEntity.ok(tripService.searchTrips(departure, arrival, date, seats));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TripDTO.TripResponse> getTripById(@PathVariable Long id) {
        return ResponseEntity.ok(tripService.getTripById(id));
    }

    @GetMapping("/my")
    public ResponseEntity<List<TripDTO.TripResponse>> getMyTrips(Principal principal) {
        return ResponseEntity.ok(tripService.getMyTrips(principal.getName()));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<TripDTO.TripResponse> updateTripStatus(
            @PathVariable Long id,
            @RequestParam String status,
            Principal principal) {
        return ResponseEntity.ok(tripService.updateTripStatus(id, status, principal.getName()));
    }
}
