package com.healthcare.queuemanagement.service;

import com.healthcare.queuemanagement.model.Analytics;
import com.healthcare.queuemanagement.repository.AnalyticsRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class AnalyticsService {
    
    private final AnalyticsRepository analyticsRepository;
    
    public AnalyticsService(AnalyticsRepository analyticsRepository) {
        this.analyticsRepository = analyticsRepository;
    }
    
    public List<Analytics> getAllAnalytics() {
        return analyticsRepository.findAll();
    }
    
    public Optional<Analytics> getAnalyticsById(Long id) {
        return analyticsRepository.findById(id);
    }
    
    public List<Analytics> getAnalyticsByDateRange(LocalDate startDate, LocalDate endDate) {
        return analyticsRepository.findByDateBetween(startDate, endDate);
    }
    
    public List<Analytics> getAnalyticsByDoctorId(Long doctorId) {
        return analyticsRepository.findByDoctorId(doctorId);
    }
    
    public Analytics createOrUpdateAnalytics(Analytics analytics) {
        Optional<Analytics> existing = analyticsRepository
                .findByDoctorIdAndDate(analytics.getDoctor().getId(), analytics.getDate());
        
        if (existing.isPresent()) {
            Analytics existingAnalytics = existing.get();
            existingAnalytics.setTotalPatients(analytics.getTotalPatients());
            existingAnalytics.setAverageWaitTime(analytics.getAverageWaitTime());
            existingAnalytics.setSatisfactionScore(analytics.getSatisfactionScore());
            existingAnalytics.setRevenue(analytics.getRevenue());
            existingAnalytics.setCompletedAppointments(analytics.getCompletedAppointments());
            existingAnalytics.setCancelledAppointments(analytics.getCancelledAppointments());
            existingAnalytics.setEfficiencyScore(analytics.getEfficiencyScore());
            return analyticsRepository.save(existingAnalytics);
        }
        
        return analyticsRepository.save(analytics);
    }
}
