package com.cityshare.repository;

import com.cityshare.entity.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TripRepository extends JpaRepository<Trip, Long> {

    List<Trip> findByDriverId(Long driverId);

    @Query("SELECT t FROM Trip t WHERE " +
           "LOWER(t.departureCity) LIKE LOWER(CONCAT('%', :dep, '%')) AND " +
           "LOWER(t.arrivalCity) LIKE LOWER(CONCAT('%', :arr, '%')) AND " +
           "t.departureTime >= :from AND " +
           "t.availableSeats >= :seats AND " +
           "t.status = 'PENDING'")
    List<Trip> searchTrips(@Param("dep") String departure,
                           @Param("arr") String arrival,
                           @Param("from") LocalDateTime from,
                           @Param("seats") int seats);

    @Query("SELECT t FROM Trip t WHERE t.status = 'PENDING' AND t.departureTime >= :now ORDER BY t.departureTime ASC")
    List<Trip> findAvailableTrips(@Param("now") LocalDateTime now);

    List<Trip> findByStatusOrderByDepartureTimeAsc(Trip.TripStatus status);
}
