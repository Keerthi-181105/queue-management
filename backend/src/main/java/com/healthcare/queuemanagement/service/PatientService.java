package com.healthcare.queuemanagement.service;

import com.healthcare.queuemanagement.model.Patient;
import com.healthcare.queuemanagement.repository.PatientRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PatientService {
    
    private final PatientRepository patientRepository;
    
    public PatientService(PatientRepository patientRepository) {
        this.patientRepository = patientRepository;
    }
    
    public List<Patient> getAllPatients() {
        return patientRepository.findAll();
    }
    
    public Optional<Patient> getPatientById(Long id) {
        return patientRepository.findById(id);
    }
    
    public Optional<Patient> getPatientByEmail(String email) {
        return patientRepository.findByEmail(email);
    }
    
    public Patient createPatient(Patient patient) {
        return patientRepository.save(patient);
    }
    
    public Patient updatePatient(Long id, Patient patientDetails) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient not found"));
        
        patient.setName(patientDetails.getName());
        patient.setEmail(patientDetails.getEmail());
        patient.setPhone(patientDetails.getPhone());
        patient.setAge(patientDetails.getAge());
        patient.setGender(patientDetails.getGender());
        patient.setPregnant(patientDetails.getPregnant());
        patient.setAddress(patientDetails.getAddress());
        
        return patientRepository.save(patient);
    }
    
    public void deletePatient(Long id) {
        patientRepository.deleteById(id);
    }
}
