package com.healthcare.queuemanagement.service;

import com.healthcare.queuemanagement.model.Appointment;
import com.healthcare.queuemanagement.model.Doctor;
import com.healthcare.queuemanagement.model.Patient;
import com.healthcare.queuemanagement.model.QueueEntry;
import com.healthcare.queuemanagement.repository.AppointmentRepository;
import com.healthcare.queuemanagement.repository.DoctorRepository;
import com.healthcare.queuemanagement.repository.PatientRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class AppointmentService {
    
    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final QueueService queueService;
    
    public AppointmentService(AppointmentRepository appointmentRepository,
                            PatientRepository patientRepository,
                            DoctorRepository doctorRepository,
                            QueueService queueService) {
        this.appointmentRepository = appointmentRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.queueService = queueService;
    }
    
    public List<Appointment> getAllAppointments() {
        return appointmentRepository.findAll();
    }
    
    public Optional<Appointment> getAppointmentById(Long id) {
        return appointmentRepository.findById(id);
    }
    
    public List<Appointment> getAppointmentsByDoctorAndDate(Long doctorId, LocalDate date) {
        return appointmentRepository.findByDoctorIdAndAppointmentDate(doctorId, date);
    }
    
    public List<Appointment> getAppointmentsByPatientId(Long patientId) {
        return appointmentRepository.findByPatientId(patientId);
    }
    
    public Appointment createAppointment(Appointment appointment) {
        // Fetch the actual Patient and Doctor entities
        if (appointment.getPatient() != null && appointment.getPatient().getId() != null) {
            Patient patient = patientRepository.findById(appointment.getPatient().getId())
                    .orElseThrow(() -> new RuntimeException("Patient not found with id: " + appointment.getPatient().getId()));
            appointment.setPatient(patient);
        }
        
        if (appointment.getDoctor() != null && appointment.getDoctor().getId() != null) {
            Doctor doctor = doctorRepository.findById(appointment.getDoctor().getId())
                    .orElseThrow(() -> new RuntimeException("Doctor not found with id: " + appointment.getDoctor().getId()));
            appointment.setDoctor(doctor);
        }
        
        appointment.setStatus("SCHEDULED");
        appointment.setCreatedAt(LocalDateTime.now());
        appointment.setUpdatedAt(LocalDateTime.now());
        
        Appointment savedAppointment = appointmentRepository.save(appointment);
        
        // Automatically add patient to queue when appointment is created
        QueueEntry queueEntry = new QueueEntry();
        queueEntry.setPatient(appointment.getPatient());
        queueEntry.setDoctor(appointment.getDoctor());
        queueEntry.setReason(appointment.getReason());
        queueEntry.setPriority("LOW"); // Default priority for new appointments
        queueEntry.setEmergency(false);
        
        try {
            queueService.addToQueue(queueEntry);
        } catch (Exception e) {
            // Log the error but don't fail the appointment creation
            System.err.println("Error adding patient to queue: " + e.getMessage());
        }
        
        return savedAppointment;
    }
    
    public Appointment updateAppointment(Long id, Appointment appointmentDetails) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found"));
        
        appointment.setAppointmentDate(appointmentDetails.getAppointmentDate());
        appointment.setAppointmentTime(appointmentDetails.getAppointmentTime());
        appointment.setStatus(appointmentDetails.getStatus());
        appointment.setReason(appointmentDetails.getReason());
        appointment.setNotes(appointmentDetails.getNotes());
        appointment.setDiagnosis(appointmentDetails.getDiagnosis());
        appointment.setPrescription(appointmentDetails.getPrescription());
        appointment.setUpdatedAt(LocalDateTime.now());
        
        return appointmentRepository.save(appointment);
    }
    
    public void deleteAppointment(Long id) {
        appointmentRepository.deleteById(id);
    }
}
