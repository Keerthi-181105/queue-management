package com.healthcare.queuemanagement.service;

import com.healthcare.queuemanagement.model.Doctor;
import com.healthcare.queuemanagement.repository.DoctorRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DoctorService {
    
    private final DoctorRepository doctorRepository;
    
    public DoctorService(DoctorRepository doctorRepository) {
        this.doctorRepository = doctorRepository;
    }
    
    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }
    
    public Optional<Doctor> getDoctorById(Long id) {
        return doctorRepository.findById(id);
    }
    
    public Optional<Doctor> getDoctorByEmail(String email) {
        return doctorRepository.findByEmail(email);
    }
    
    public List<Doctor> getDoctorsBySpecialty(String specialty) {
        return doctorRepository.findBySpecialty(specialty);
    }
    
    public Doctor createDoctor(Doctor doctor) {
        return doctorRepository.save(doctor);
    }
    
    public Doctor updateDoctor(Long id, Doctor doctorDetails) {
        Doctor doctor = doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        
        doctor.setName(doctorDetails.getName());
        doctor.setSpecialty(doctorDetails.getSpecialty());
        doctor.setEmail(doctorDetails.getEmail());
        doctor.setPhone(doctorDetails.getPhone());
        doctor.setRating(doctorDetails.getRating());
        doctor.setAvailability(doctorDetails.getAvailability());
        doctor.setExperienceYears(doctorDetails.getExperienceYears());
        doctor.setQualification(doctorDetails.getQualification());
        
        return doctorRepository.save(doctor);
    }
    
    public void deleteDoctor(Long id) {
        doctorRepository.deleteById(id);
    }
}
