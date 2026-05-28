package com.cityshare.service;

import com.cityshare.dto.BookingPackageDTO;
import com.cityshare.entity.Package;
import com.cityshare.entity.Trip;
import com.cityshare.entity.User;
import com.cityshare.repository.PackageRepository;
import com.cityshare.repository.TripRepository;
import com.cityshare.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PackageService {

    private final PackageRepository packageRepository;
    private final TripRepository tripRepository;
    private final UserRepository userRepository;

    @Transactional
    public BookingPackageDTO.PackageResponse sendPackage(
            BookingPackageDTO.CreatePackageRequest request, String senderEmail) {

        User sender = userRepository.findByEmail(senderEmail)
                .orElseThrow(() -> new RuntimeException("Expéditeur non trouvé"));

        Trip trip = tripRepository.findById(request.getTripId())
                .orElseThrow(() -> new RuntimeException("Trajet non trouvé"));

        if (!trip.getAcceptsPackages()) {
            throw new RuntimeException("Ce trajet n'accepte pas les colis");
        }

        double total = trip.getPricePerKg() * request.getWeightKg();

        Package pkg = Package.builder()
                .sender(sender)
                .trip(trip)
                .description(request.getDescription())
                .weightKg(request.getWeightKg())
                .totalPrice(total)
                .recipientName(request.getRecipientName())
                .recipientPhone(request.getRecipientPhone())
                .pickupAddress(request.getPickupAddress())
                .deliveryAddress(request.getDeliveryAddress())
                .status(Package.PackageStatus.PENDING)
                .fragile(request.getFragile() != null ? request.getFragile() : false)
                .notes(request.getNotes())
                .build();

        pkg = packageRepository.save(pkg);
        return toResponse(pkg);
    }

    public List<BookingPackageDTO.PackageResponse> getMyPackages(String senderEmail) {
        User sender = userRepository.findByEmail(senderEmail)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        return packageRepository.findBySenderId(sender.getId())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public BookingPackageDTO.PackageResponse trackPackage(String trackingCode) {
        Package pkg = packageRepository.findByTrackingCode(trackingCode)
                .orElseThrow(() -> new RuntimeException("Colis non trouvé avec ce code: " + trackingCode));
        return toResponse(pkg);
    }

    @Transactional
    public BookingPackageDTO.PackageResponse updatePackageStatus(Long packageId, String status, String driverEmail) {
        Package pkg = packageRepository.findById(packageId)
                .orElseThrow(() -> new RuntimeException("Colis non trouvé"));

        if (!pkg.getTrip().getDriver().getEmail().equals(driverEmail)) {
            throw new RuntimeException("Non autorisé");
        }
        pkg.setStatus(Package.PackageStatus.valueOf(status.toUpperCase()));
        packageRepository.save(pkg);
        return toResponse(pkg);
    }

    public List<BookingPackageDTO.PackageResponse> getPackagesForTrip(Long tripId, String driverEmail) {
        return packageRepository.findByTripId(tripId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    private BookingPackageDTO.PackageResponse toResponse(Package p) {
        return BookingPackageDTO.PackageResponse.builder()
                .id(p.getId())
                .senderId(p.getSender().getId())
                .senderName(p.getSender().getFirstName() + " " + p.getSender().getLastName())
                .tripId(p.getTrip().getId())
                .tripRoute(p.getTrip().getDepartureCity() + " → " + p.getTrip().getArrivalCity())
                .description(p.getDescription())
                .weightKg(p.getWeightKg())
                .totalPrice(p.getTotalPrice())
                .recipientName(p.getRecipientName())
                .recipientPhone(p.getRecipientPhone())
                .pickupAddress(p.getPickupAddress())
                .deliveryAddress(p.getDeliveryAddress())
                .status(p.getStatus())
                .trackingCode(p.getTrackingCode())
                .fragile(p.getFragile())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
