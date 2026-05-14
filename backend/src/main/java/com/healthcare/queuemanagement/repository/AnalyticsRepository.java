package com.healthcare.queuemanagement.repository;

import com.healthcare.queuemanagement.model.Analytics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AnalyticsRepository extends JpaRepository<Analytics, Long> {
    Optional<Analytics> findByDoctorIdAndDate(Long doctorId, LocalDate date);
    List<Analytics> findByDateBetween(LocalDate startDate, LocalDate endDate);
    List<Analytics> findByDoctorId(Long doctorId);
}
