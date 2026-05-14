package com.healthcare.queuemanagement.service;

import com.healthcare.queuemanagement.model.Doctor;
import com.healthcare.queuemanagement.model.Patient;
import com.healthcare.queuemanagement.model.QueueEntry;
import com.healthcare.queuemanagement.repository.DoctorRepository;
import com.healthcare.queuemanagement.repository.PatientRepository;
import com.healthcare.queuemanagement.repository.QueueEntryRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
public class QueueService {

    private static final String STATUS_WAITING = "WAITING";
    private static final String STATUS_NEXT = "NEXT";
    private static final String STATUS_CALLED = "CALLED";
    private static final String STATUS_COMPLETED = "COMPLETED";
    private static final String STATUS_CANCELLED = "CANCELLED";

    private static final String PRIORITY_URGENT = "URGENT";
    private static final String PRIORITY_MEDIUM = "MEDIUM";
    private static final String PRIORITY_LOW = "LOW";
    
    private final QueueEntryRepository queueEntryRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    
    public QueueService(QueueEntryRepository queueEntryRepository,
                        PatientRepository patientRepository,
                        DoctorRepository doctorRepository) {
        this.queueEntryRepository = queueEntryRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
    }
    
    public List<QueueEntry> getAllQueueEntries() {
        return queueEntryRepository.findAll();
    }
    
    public Optional<QueueEntry> getQueueEntryById(Long id) {
        return queueEntryRepository.findById(Objects.requireNonNull(id, "Queue entry id is required"));
    }
    
    public List<QueueEntry> getQueueByDoctorId(Long doctorId) {
        return queueEntryRepository.findByDoctorIdOrderByPositionAsc(doctorId);
    }
    
    public List<QueueEntry> getActiveQueueByDoctorId(Long doctorId) {
        return queueEntryRepository.findByDoctorIdAndStatusInOrderByPositionAsc(
                doctorId,
                Arrays.asList(STATUS_WAITING, STATUS_NEXT)
        );
    }

    public Optional<QueueEntry> getActiveQueueByPatientId(Long patientId) {
        QueueEntry entry = queueEntryRepository.findFirstByPatientIdAndStatusInOrderByCreatedAtDesc(
                patientId,
                Arrays.asList(STATUS_WAITING, STATUS_NEXT, STATUS_CALLED)
        );
        return Optional.ofNullable(entry);
    }
    
    public QueueEntry addToQueue(QueueEntry queueEntry) {
        Long patientId = Objects.requireNonNull(
            Objects.requireNonNull(queueEntry.getPatient(), "Patient is required").getId(),
            "Patient id is required"
        );
        Long doctorId = Objects.requireNonNull(
            Objects.requireNonNull(queueEntry.getDoctor(), "Doctor is required").getId(),
            "Doctor id is required"
        );

        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        queueEntry.setPatient(patient);
        queueEntry.setDoctor(doctor);
        queueEntry.setStatus(STATUS_WAITING);
        queueEntry.setPriority(resolvePriority(queueEntry, patient));
        queueEntry.setPriorityReason(buildPriorityReason(queueEntry, patient));
        queueEntry.setPosition(0);
        queueEntry.setEstimatedWaitTime(0);

        QueueEntry saved = queueEntryRepository.save(queueEntry);
        recalculateQueueForDoctor(doctor.getId());
        return queueEntryRepository.findById(Objects.requireNonNull(saved.getId(), "Saved queue id missing"))
            .orElse(saved);
    }
    
    public QueueEntry callNextPatient(Long doctorId) {
        recalculateQueueForDoctor(doctorId);
        List<QueueEntry> queue = queueEntryRepository.findByDoctorIdAndStatusInOrderByPositionAsc(
                doctorId,
                Arrays.asList(STATUS_WAITING, STATUS_NEXT)
        );
        
        if (!queue.isEmpty()) {
            QueueEntry nextEntry = queue.get(0);
            nextEntry.setStatus(STATUS_CALLED);
            nextEntry.setCalledAt(LocalDateTime.now());
            nextEntry.setEstimatedWaitTime(0);
            QueueEntry calledEntry = queueEntryRepository.save(nextEntry);
            recalculateQueueForDoctor(doctorId);
            return calledEntry;
        }
        
        return null;
    }
    
    public QueueEntry completeAppointment(Long queueEntryId) {
        QueueEntry entry = queueEntryRepository.findById(
                Objects.requireNonNull(queueEntryId, "Queue entry id is required")
            )
                .orElseThrow(() -> new RuntimeException("Queue entry not found"));
        
        entry.setStatus(STATUS_COMPLETED);
        entry.setCompletedAt(LocalDateTime.now());
        QueueEntry completedEntry = queueEntryRepository.save(entry);
        recalculateQueueForDoctor(entry.getDoctor().getId());
        return completedEntry;
    }
    
    public void cancelQueueEntry(Long id) {
        QueueEntry entry = queueEntryRepository.findById(
                Objects.requireNonNull(id, "Queue entry id is required")
            )
                .orElseThrow(() -> new RuntimeException("Queue entry not found"));
        
        entry.setStatus(STATUS_CANCELLED);
        queueEntryRepository.save(entry);
        recalculateQueueForDoctor(entry.getDoctor().getId());
    }

    private void recalculateQueueForDoctor(Long doctorId) {
        List<QueueEntry> activeEntries = queueEntryRepository.findByDoctorIdAndStatusInOrderByCreatedAtAsc(
                doctorId,
                Arrays.asList(STATUS_WAITING, STATUS_NEXT)
        );

        activeEntries.sort(Comparator
                .comparingInt(this::priorityRank)
                .thenComparing(QueueEntry::getCreatedAt)
        );

        List<QueueEntry> updatedEntries = new ArrayList<>();
        for (int i = 0; i < activeEntries.size(); i++) {
            QueueEntry entry = activeEntries.get(i);
            entry.setPosition(i + 1);
            entry.setEstimatedWaitTime(i * 15);
            entry.setStatus(i == 0 ? STATUS_NEXT : STATUS_WAITING);
            updatedEntries.add(entry);
        }

        if (!updatedEntries.isEmpty()) {
            queueEntryRepository.saveAll(updatedEntries);
        }
    }

    private String resolvePriority(QueueEntry queueEntry, Patient patient) {
        if (isEmergency(queueEntry)) {
            return PRIORITY_URGENT;
        }

        boolean elderly = patient.getAge() != null && patient.getAge() >= 60;
        boolean pregnant = Boolean.TRUE.equals(patient.getPregnant());
        if (elderly || pregnant) {
            return PRIORITY_MEDIUM;
        }

        return PRIORITY_LOW;
    }

    private String buildPriorityReason(QueueEntry queueEntry, Patient patient) {
        List<String> reasons = new ArrayList<>();
        if (isEmergency(queueEntry)) {
            reasons.add("Emergency");
        }
        if (patient.getAge() != null && patient.getAge() >= 60) {
            reasons.add("Elderly");
        }
        if (Boolean.TRUE.equals(patient.getPregnant())) {
            reasons.add("Pregnant");
        }
        if (reasons.isEmpty()) {
            return "Standard";
        }
        return String.join(" + ", reasons);
    }

    private boolean isEmergency(QueueEntry queueEntry) {
        if (Boolean.TRUE.equals(queueEntry.getEmergency())) {
            return true;
        }
        if (queueEntry.getReason() == null) {
            return false;
        }
        String reason = queueEntry.getReason().toLowerCase();
        return reason.contains("emergency")
                || reason.contains("severe")
                || reason.contains("critical")
                || reason.contains("chest pain")
                || reason.contains("bleeding")
                || reason.contains("accident");
    }

    private int priorityRank(QueueEntry entry) {
        if (PRIORITY_URGENT.equals(entry.getPriority())) {
            return 0;
        }
        if (PRIORITY_MEDIUM.equals(entry.getPriority())) {
            return 1;
        }
        return 2;
    }
}
