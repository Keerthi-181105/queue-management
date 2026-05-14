package com.healthcare.queuemanagement.repository;

import com.healthcare.queuemanagement.model.QueueEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QueueEntryRepository extends JpaRepository<QueueEntry, Long> {
    List<QueueEntry> findByDoctorIdAndStatusOrderByPositionAsc(Long doctorId, String status);
    List<QueueEntry> findByPatientIdAndStatus(Long patientId, String status);
    List<QueueEntry> findByStatusOrderByPositionAsc(String status);
    List<QueueEntry> findByDoctorIdOrderByPositionAsc(Long doctorId);
    List<QueueEntry> findByDoctorIdAndStatusInOrderByPositionAsc(Long doctorId, List<String> statuses);
    List<QueueEntry> findByDoctorIdAndStatusInOrderByCreatedAtAsc(Long doctorId, List<String> statuses);
    QueueEntry findFirstByPatientIdAndStatusInOrderByCreatedAtDesc(Long patientId, List<String> statuses);
}
