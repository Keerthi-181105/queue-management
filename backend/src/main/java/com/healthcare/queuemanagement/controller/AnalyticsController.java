package com.healthcare.queuemanagement.controller;

import com.healthcare.queuemanagement.model.Analytics;
import com.healthcare.queuemanagement.service.AnalyticsService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "http://localhost:3000")
public class AnalyticsController {
    
    private final AnalyticsService analyticsService;
    
    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }
    
    @GetMapping
    public ResponseEntity<List<Analytics>> getAllAnalytics() {
        return ResponseEntity.ok(analyticsService.getAllAnalytics());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<Analytics> getAnalyticsById(@PathVariable Long id) {
        return analyticsService.getAnalyticsById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/range")
    public ResponseEntity<List<Analytics>> getAnalyticsByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return ResponseEntity.ok(analyticsService.getAnalyticsByDateRange(startDate, endDate));
    }
    
    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<Analytics>> getAnalyticsByDoctorId(@PathVariable Long doctorId) {
        return ResponseEntity.ok(analyticsService.getAnalyticsByDoctorId(doctorId));
    }
    
    @PostMapping
    public ResponseEntity<Analytics> createOrUpdateAnalytics(@RequestBody Analytics analytics) {
        return ResponseEntity.ok(analyticsService.createOrUpdateAnalytics(analytics));
    }
}
