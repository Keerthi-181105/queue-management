package com.healthcare.queuemanagement.controller;

import com.healthcare.queuemanagement.model.QueueEntry;
import com.healthcare.queuemanagement.service.QueueService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/queue")
@CrossOrigin(origins = "http://localhost:3000")
public class QueueController {
    
    private final QueueService queueService;
    
    public QueueController(QueueService queueService) {
        this.queueService = queueService;
    }
    
    @GetMapping
    public ResponseEntity<List<QueueEntry>> getAllQueueEntries() {
        return ResponseEntity.ok(queueService.getAllQueueEntries());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<QueueEntry> getQueueEntryById(@PathVariable Long id) {
        return queueService.getQueueEntryById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<QueueEntry>> getQueueByDoctorId(@PathVariable Long doctorId) {
        return ResponseEntity.ok(queueService.getQueueByDoctorId(doctorId));
    }
    
    @GetMapping("/doctor/{doctorId}/active")
    public ResponseEntity<List<QueueEntry>> getActiveQueueByDoctorId(@PathVariable Long doctorId) {
        return ResponseEntity.ok(queueService.getActiveQueueByDoctorId(doctorId));
    }

    @GetMapping("/patient/{patientId}/active")
    public ResponseEntity<QueueEntry> getActiveQueueByPatientId(@PathVariable Long patientId) {
        return queueService.getActiveQueueByPatientId(patientId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }
    
    @PostMapping
    public ResponseEntity<QueueEntry> addToQueue(@RequestBody QueueEntry queueEntry) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(queueService.addToQueue(queueEntry));
    }
    
    @PostMapping("/doctor/{doctorId}/next")
    public ResponseEntity<QueueEntry> callNextPatient(@PathVariable Long doctorId) {
        QueueEntry entry = queueService.callNextPatient(doctorId);
        if (entry != null) {
            return ResponseEntity.ok(entry);
        }
        return ResponseEntity.noContent().build();
    }
    
    @PutMapping("/{id}/complete")
    public ResponseEntity<QueueEntry> completeAppointment(@PathVariable Long id) {
        return ResponseEntity.ok(queueService.completeAppointment(id));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> cancelQueueEntry(@PathVariable Long id) {
        queueService.cancelQueueEntry(id);
        return ResponseEntity.noContent().build();
    }
}
