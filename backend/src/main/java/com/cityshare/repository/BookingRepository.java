package com.cityshare.repository;

import com.cityshare.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByPassengerId(Long passengerId);
    List<Booking> findByTripId(Long tripId);
    boolean existsByPassengerIdAndTripId(Long passengerId, Long tripId);
}
