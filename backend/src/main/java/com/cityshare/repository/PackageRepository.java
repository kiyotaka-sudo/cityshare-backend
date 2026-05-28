package com.cityshare.repository;

import com.cityshare.entity.Package;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PackageRepository extends JpaRepository<Package, Long> {
    List<Package> findBySenderId(Long senderId);
    List<Package> findByTripId(Long tripId);
    Optional<Package> findByTrackingCode(String trackingCode);
}
