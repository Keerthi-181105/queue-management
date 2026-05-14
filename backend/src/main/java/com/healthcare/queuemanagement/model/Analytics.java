package com.healthcare.queuemanagement.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "analytics")
public class Analytics {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne
    @JoinColumn(name = "doctor_id")
    private Doctor doctor;
    
    @Column(nullable = false)
    private LocalDate date;
    
    private Integer totalPatients = 0;
    
    private Double averageWaitTime = 0.0; // in minutes
    
    private Double satisfactionScore = 0.0; // 0-100
    
    private Double revenue = 0.0;
    
    private Integer completedAppointments = 0;
    
    private Integer cancelledAppointments = 0;
    
    private Double efficiencyScore = 0.0; // 0-100
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    private LocalDateTime updatedAt;
    
    public Analytics() {}
    
    public Analytics(Long id, Doctor doctor, LocalDate date, Integer totalPatients, 
                     Double averageWaitTime, Double satisfactionScore, Double revenue, 
                     Integer completedAppointments, Integer cancelledAppointments, 
                     Double efficiencyScore, LocalDateTime createdAt, 
                     LocalDateTime updatedAt) {
        this.id = id;
        this.doctor = doctor;
        this.date = date;
        this.totalPatients = totalPatients;
        this.averageWaitTime = averageWaitTime;
        this.satisfactionScore = satisfactionScore;
        this.revenue = revenue;
        this.completedAppointments = completedAppointments;
        this.cancelledAppointments = cancelledAppointments;
        this.efficiencyScore = efficiencyScore;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }
    
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Doctor getDoctor() { return doctor; }
    public void setDoctor(Doctor doctor) { this.doctor = doctor; }
    
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    
    public Integer getTotalPatients() { return totalPatients; }
    public void setTotalPatients(Integer totalPatients) { this.totalPatients = totalPatients; }
    
    public Double getAverageWaitTime() { return averageWaitTime; }
    public void setAverageWaitTime(Double averageWaitTime) { this.averageWaitTime = averageWaitTime; }
    
    public Double getSatisfactionScore() { return satisfactionScore; }
    public void setSatisfactionScore(Double satisfactionScore) { this.satisfactionScore = satisfactionScore; }
    
    public Double getRevenue() { return revenue; }
    public void setRevenue(Double revenue) { this.revenue = revenue; }
    
    public Integer getCompletedAppointments() { return completedAppointments; }
    public void setCompletedAppointments(Integer completedAppointments) { this.completedAppointments = completedAppointments; }
    
    public Integer getCancelledAppointments() { return cancelledAppointments; }
    public void setCancelledAppointments(Integer cancelledAppointments) { this.cancelledAppointments = cancelledAppointments; }
    
    public Double getEfficiencyScore() { return efficiencyScore; }
    public void setEfficiencyScore(Double efficiencyScore) { this.efficiencyScore = efficiencyScore; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
