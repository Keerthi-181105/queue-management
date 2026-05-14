package com.healthcare.queuemanagement.config;

import com.healthcare.queuemanagement.model.Doctor;
import com.healthcare.queuemanagement.repository.DoctorRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {
    
    private final DoctorRepository doctorRepository;
    
    public DataInitializer(DoctorRepository doctorRepository) {
        this.doctorRepository = doctorRepository;
    }
    
    @Override
    public void run(String... args) {
        if (doctorRepository.count() == 0) {
            List<Doctor> doctors = Arrays.asList(
                    createDoctor("Dr. Sarah Mitchell", "Dermatology", "sarah.mitchell@hospital.com", 
                            "+1-555-0101", 4.8, 12, "MD, Board Certified Dermatologist"),
                    createDoctor("Dr. Michael Thompson", "Cardiology", "michael.thompson@hospital.com",
                            "+1-555-0102", 4.9, 15, "MD, FACC, Cardiology Specialist"),
                    createDoctor("Dr. Emily Rodriguez", "Pediatrics", "emily.rodriguez@hospital.com",
                            "+1-555-0103", 4.7, 8, "MD, Pediatrics Specialist"),
                    createDoctor("Dr. James Wilson", "Orthopedics", "james.wilson@hospital.com",
                            "+1-555-0104", 4.6, 10, "MD, Orthopedic Surgeon"),
                    createDoctor("Dr. Lisa Chen", "Neurology", "lisa.chen@hospital.com",
                            "+1-555-0105", 4.9, 14, "MD, PhD, Neurology Specialist"),
                    createDoctor("Dr. Robert Anderson", "General Medicine", "robert.anderson@hospital.com",
                            "+1-555-0106", 4.5, 20, "MD, Family Medicine")
            );
            
            doctorRepository.saveAll(doctors);
            System.out.println("Sample doctors initialized successfully!");
        }
    }
    
    private Doctor createDoctor(String name, String specialty, String email, String phone,
                                Double rating, Integer experienceYears, String qualification) {
        Doctor doctor = new Doctor();
        doctor.setName(name);
        doctor.setSpecialty(specialty);
        doctor.setEmail(email);
        doctor.setPhone(phone);
        doctor.setRating(rating);
        doctor.setAvailability("Available");
        doctor.setExperienceYears(experienceYears);
        doctor.setQualification(qualification);
        return doctor;
    }
}
