package com.cityshare.backend.controller;

import com.cityshare.backend.dto.TripDTO;
import com.cityshare.backend.service.TripService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/trips")
@RequiredArgsConstructor
public class TripController {

    private final TripService tripService;

    @PostMapping
    public ResponseEntity<TripDTO.TripResponse> createTrip(
            @RequestBody TripDTO.CreateTripRequest request,
            Principal principal) {
        return ResponseEntity.ok(tripService.createTrip(request, principal.getName()));
    }

    @GetMapping
    public ResponseEntity<List<TripDTO.TripResponse>> getAllTrips() {
        return ResponseEntity.ok(tripService.getAllTrips());
    }

    @PostMapping("/search")
    public ResponseEntity<List<TripDTO.TripResponse>> searchTrips(
            @RequestBody TripDTO.SearchRequest request) {
        return ResponseEntity.ok(tripService.searchTrips(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TripDTO.TripResponse> getTripById(@PathVariable Long id) {
        return ResponseEntity.ok(tripService.getTripById(id));
    }

    @GetMapping("/my-trips")
    public ResponseEntity<List<TripDTO.TripResponse>> getMyTrips(Principal principal) {
        return ResponseEntity.ok(tripService.getMyTrips(principal.getName()));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<TripDTO.TripResponse> cancelTrip(
            @PathVariable Long id,
            Principal principal) {
        return ResponseEntity.ok(tripService.cancelTrip(id, principal.getName()));
    }
}
