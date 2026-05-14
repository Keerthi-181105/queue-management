package com.healthcare.queuemanagement.repository;

import com.healthcare.queuemanagement.model.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {
    Optional<Doctor> findByEmail(String email);
    List<Doctor> findBySpecialty(String specialty);
    List<Doctor> findByAvailability(String availability);
}
