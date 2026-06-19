package com.virtualLaboratory.services;

import com.virtualLaboratory.entities.academics.Student;
import com.virtualLaboratory.entities.academics.Teacher;
import com.virtualLaboratory.entities.User;
import com.virtualLaboratory.repository.StudentRepository;
import com.virtualLaboratory.repository.TeacherRepository;
import com.virtualLaboratory.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class CurrentUserService {
    private final UserRepository userRepository;
    private final TeacherRepository teacherRepository;
    private final StudentRepository studentRepository;

    public CurrentUserService(UserRepository userRepository,
                              TeacherRepository teacherRepository,
                              StudentRepository studentRepository) {
        this.userRepository = userRepository;
        this.teacherRepository = teacherRepository;
        this.studentRepository = studentRepository;
    }

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = authentication != null ? authentication.getName() : null;
        if (email == null) {
            throw new IllegalStateException("Unauthenticated");
        }
        User user = userRepository.findByEmail(email);
        if (user == null) {
            throw new IllegalStateException("User not found");
        }
        return user;
    }

    public Teacher getCurrentTeacher() {
        User user = getCurrentUser();
        return teacherRepository.findById(user.getId())
            .orElseThrow(() -> new IllegalStateException("Teacher not found"));
    }

    public Student getCurrentStudent() {
        User user = getCurrentUser();
        return studentRepository.findById(user.getId())
            .orElseThrow(() -> new IllegalStateException("Student not found"));
    }
}
