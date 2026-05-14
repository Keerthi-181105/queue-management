package com.healthcare.queuemanagement.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "queue_entries")
public class QueueEntry {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;
    
    @ManyToOne
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;
    
    @Column(nullable = false)
    private Integer position;
    
    @Column(nullable = false)
    private String status; // WAITING, NEXT, CALLED, COMPLETED, CANCELLED
    
    @Column(nullable = false)
    private String priority = "MEDIUM"; // URGENT, MEDIUM, LOW

    private Boolean emergency = false;

    private String priorityReason;
    
    private Integer estimatedWaitTime; // in minutes
    
    private String reason;
    
    private String notes;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    private LocalDateTime updatedAt;
    
    private LocalDateTime calledAt;
    
    private LocalDateTime completedAt;
    
    public QueueEntry() {}
    
    public QueueEntry(Long id, Patient patient, Doctor doctor, Integer position, 
                      String status, String priority, Integer estimatedWaitTime, 
                      String reason, String notes, LocalDateTime createdAt, 
                      LocalDateTime updatedAt, LocalDateTime calledAt, 
                      LocalDateTime completedAt) {
        this.id = id;
        this.patient = patient;
        this.doctor = doctor;
        this.position = position;
        this.status = status;
        this.priority = priority;
        this.estimatedWaitTime = estimatedWaitTime;
        this.reason = reason;
        this.notes = notes;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.calledAt = calledAt;
        this.completedAt = completedAt;
    }
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Patient getPatient() { return patient; }
    public void setPatient(Patient patient) { this.patient = patient; }
    
    public Doctor getDoctor() { return doctor; }
    public void setDoctor(Doctor doctor) { this.doctor = doctor; }
    
    public Integer getPosition() { return position; }
    public void setPosition(Integer position) { this.position = position; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public String getPriority() { return priority; }
    public void setPriority(String priority) { this.priority = priority; }

    public Boolean getEmergency() { return emergency; }
    public void setEmergency(Boolean emergency) { this.emergency = emergency; }

    public String getPriorityReason() { return priorityReason; }
    public void setPriorityReason(String priorityReason) { this.priorityReason = priorityReason; }
    
    public Integer getEstimatedWaitTime() { return estimatedWaitTime; }
    public void setEstimatedWaitTime(Integer estimatedWaitTime) { this.estimatedWaitTime = estimatedWaitTime; }
    
    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }
    
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    public LocalDateTime getCalledAt() { return calledAt; }
    public void setCalledAt(LocalDateTime calledAt) { this.calledAt = calledAt; }
    
    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
