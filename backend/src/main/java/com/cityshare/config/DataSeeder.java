package com.cityshare.config;

import com.cityshare.entity.Trip;
import com.cityshare.entity.User;
import com.cityshare.repository.TripRepository;
import com.cityshare.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final TripRepository tripRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) return;

        // Créer un conducteur
        User driver = User.builder()
                .firstName("Jean")
                .lastName("Fotso")
                .email("driver@cityshare.cm")
                .password(passwordEncoder.encode("password123"))
                .phone("+237699001122")
                .role(User.UserRole.DRIVER)
                .rating(4.8)
                .totalRatings(25)
                .verified(true)
                .active(true)
                .build();
        driver = userRepository.save(driver);

        // Créer un passager
        User passenger = User.builder()
                .firstName("Marie")
                .lastName("Nguemo")
                .email("passenger@cityshare.cm")
                .password(passwordEncoder.encode("password123"))
                .phone("+237677334455")
                .role(User.UserRole.PASSENGER)
                .rating(5.0)
                .totalRatings(3)
                .verified(true)
                .active(true)
                .build();
        userRepository.save(passenger);

        // Créer un expéditeur
        User sender = User.builder()
                .firstName("Paul")
                .lastName("Mbarga")
                .email("sender@cityshare.cm")
                .password(passwordEncoder.encode("password123"))
                .phone("+237655667788")
                .role(User.UserRole.SENDER)
                .rating(4.6)
                .totalRatings(10)
                .verified(true)
                .active(true)
                .build();
        userRepository.save(sender);

        // Créer des trajets de test
        Trip trip1 = Trip.builder()
                .driver(driver)
                .departureCity("Yaoundé")
                .arrivalCity("Bafia")
                .intermediateStops("[\"Obala\", \"Ntui\"]")
                .departureTime(LocalDateTime.now().plusHours(3))
                .totalSeats(4)
                .availableSeats(3)
                .pricePerSeat(3000.0)
                .pricePerKg(500.0)
                .acceptsPackages(true)
                .vehicleDescription("Toyota Corolla Bleue")
                .vehiclePlate("LT-2341-A")
                .status(Trip.TripStatus.PENDING)
                .notes("Départ depuis la Gare Routière de Mvan")
                .build();
        tripRepository.save(trip1);

        Trip trip2 = Trip.builder()
                .driver(driver)
                .departureCity("Yaoundé")
                .arrivalCity("Bertoua")
                .intermediateStops("[\"Ayos\", \"Abong-Mbang\"]")
                .departureTime(LocalDateTime.now().plusHours(6))
                .totalSeats(5)
                .availableSeats(5)
                .pricePerSeat(5000.0)
                .pricePerKg(700.0)
                .acceptsPackages(true)
                .vehicleDescription("Hyundai H1 Blanche")
                .vehiclePlate("CE-5678-B")
                .status(Trip.TripStatus.PENDING)
                .notes("Climatisation disponible")
                .build();
        tripRepository.save(trip2);

        Trip trip3 = Trip.builder()
                .driver(driver)
                .departureCity("Douala")
                .arrivalCity("Yaoundé")
                .intermediateStops("[\"Edéa\"]")
                .departureTime(LocalDateTime.now().plusDays(1))
                .totalSeats(4)
                .availableSeats(4)
                .pricePerSeat(4000.0)
                .pricePerKg(600.0)
                .acceptsPackages(true)
                .vehicleDescription("Peugeot 307 Noire")
                .vehiclePlate("LT-9876-C")
                .status(Trip.TripStatus.PENDING)
                .build();
        tripRepository.save(trip3);

        System.out.println("✅ CityShare - Données de test chargées !");
        System.out.println("👤 Conducteur  : driver@cityshare.cm / password123");
        System.out.println("👤 Passager    : passenger@cityshare.cm / password123");
        System.out.println("👤 Expéditeur  : sender@cityshare.cm / password123");
    }
}
