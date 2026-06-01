package com.cityshare.backend.service;

import com.cityshare.backend.dto.BookingPackageDTO;
import com.cityshare.backend.entity.Package;
import com.cityshare.backend.entity.Trip;
import com.cityshare.backend.entity.User;
import com.cityshare.backend.repository.PackageRepository;
import com.cityshare.backend.repository.TripRepository;
import com.cityshare.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PackageService {

    private final PackageRepository packageRepository;
    private final TripRepository tripRepository;
    private final UserRepository userRepository;

    public BookingPackageDTO.PackageResponse createPackage(
            BookingPackageDTO.CreatePackageRequest request, String senderEmail) {

        User sender = userRepository.findByEmail(senderEmail)
                .orElseThrow(() -> new RuntimeException("Expéditeur non trouvé"));

        Trip trip = tripRepository.findById(request.getTripId())
                .orElseThrow(() -> new RuntimeException("Trajet non trouvé"));

        if (!trip.getAcceptsPackages()) {
            throw new RuntimeException("Ce trajet n'accepte pas de colis");
        }

        double totalPrice = trip.getPricePerKg() * request.getWeightKg();

        Package pkg = Package.builder()
                .sender(sender)
                .trip(trip)
                .description(request.getDescription())
                .weightKg(request.getWeightKg())
                .totalPrice(totalPrice)
                .recipientName(request.getRecipientName())
                .recipientPhone(request.getRecipientPhone())
                .pickupAddress(request.getPickupAddress())
                .deliveryAddress(request.getDeliveryAddress())
                .fragile(request.getFragile() != null && request.getFragile())
                .notes(request.getNotes())
                .status(Package.PackageStatus.PENDING)
                .build();

        pkg = packageRepository.save(pkg);
        return toResponse(pkg);
    }

    public List<BookingPackageDTO.PackageResponse> getMyPackages(String senderEmail) {
        User sender = userRepository.findByEmail(senderEmail)
                .orElseThrow(() -> new RuntimeException("Expéditeur non trouvé"));
        return packageRepository.findBySenderId(sender.getId())
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public BookingPackageDTO.PackageResponse getPackageById(Long id) {
        Package pkg = packageRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Colis non trouvé"));
        return toResponse(pkg);
    }

    public BookingPackageDTO.PackageResponse trackPackage(String trackingCode) {
        Package pkg = packageRepository.findByTrackingCode(trackingCode)
                .orElseThrow(() -> new RuntimeException("Colis non trouvé avec ce code : " + trackingCode));
        return toResponse(pkg);
    }

    public BookingPackageDTO.PackageResponse updateStatus(
            Long packageId, String newStatus, String userEmail) {

        Package pkg = packageRepository.findById(packageId)
                .orElseThrow(() -> new RuntimeException("Colis non trouvé"));

        pkg.setStatus(Package.PackageStatus.valueOf(newStatus));
        pkg = packageRepository.save(pkg);
        return toResponse(pkg);
    }

    private BookingPackageDTO.PackageResponse toResponse(Package pkg) {
        return BookingPackageDTO.PackageResponse.builder()
                .id(pkg.getId())
                .senderId(pkg.getSender().getId())
                .senderName(pkg.getSender().getFirstName() + " " + pkg.getSender().getLastName())
                .tripId(pkg.getTrip().getId())
                .tripRoute(pkg.getTrip().getDepartureCity() + " → " + pkg.getTrip().getArrivalCity())
                .description(pkg.getDescription())
                .weightKg(pkg.getWeightKg())
                .totalPrice(pkg.getTotalPrice())
                .recipientName(pkg.getRecipientName())
                .recipientPhone(pkg.getRecipientPhone())
                .pickupAddress(pkg.getPickupAddress())
                .deliveryAddress(pkg.getDeliveryAddress())
                .status(pkg.getStatus())
                .trackingCode(pkg.getTrackingCode())
                .fragile(pkg.getFragile())
                .createdAt(pkg.getCreatedAt())
                .build();
    }
}
