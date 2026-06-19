package com.virtualLaboratory.services;

import com.virtualLaboratory.dto.user.PasswordResetRequest;
import com.virtualLaboratory.dto.user.UserCreateRequest;
import com.virtualLaboratory.dto.user.UserDTO;
import com.virtualLaboratory.dto.user.UserUpdateRequest;
import com.virtualLaboratory.entities.User;
import com.virtualLaboratory.entities.academics.Student;
import com.virtualLaboratory.entities.academics.Teacher;
import com.virtualLaboratory.entities.academicStructureEntities.Batch;
import com.virtualLaboratory.mapper.UserMapper;
import com.virtualLaboratory.repository.BatchRepository;
import com.virtualLaboratory.repository.StudentRepository;
import com.virtualLaboratory.repository.TeacherRepository;
import com.virtualLaboratory.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.List;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final TeacherRepository teacherRepository;
    private final BatchRepository batchRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;

    public UserService(UserRepository userRepository,
                       StudentRepository studentRepository,
                       TeacherRepository teacherRepository,
                       BatchRepository batchRepository,
                       PasswordEncoder passwordEncoder,
                       UserMapper userMapper) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.teacherRepository = teacherRepository;
        this.batchRepository = batchRepository;
        this.passwordEncoder = passwordEncoder;
        this.userMapper = userMapper;
    }

    @Transactional
    public UserDTO createUser(UserCreateRequest request) {
        User.Role role = User.Role.valueOf(request.role());
        User user = userMapper.toEntity(request, passwordEncoder.encode(request.password()), role);
        User saved = userRepository.save(user);

        if (saved.getRole() == User.Role.STUDENT) {
            Student student = new Student();
            student.setUser(saved);
            if (request.batchId() != null) {
                Batch batch = batchRepository.findById(request.batchId())
                    .orElseThrow(() -> new IllegalArgumentException("Batch not found"));
                student.setBatch(batch);
            }
            studentRepository.save(student);
        } else if (saved.getRole() == User.Role.TEACHER) {
            Teacher teacher = new Teacher();
            teacher.setUser(saved);
            teacherRepository.save(teacher);
        }

        return toDto(saved);
    }

    public Page<UserDTO> getUsers(String role, Long batchId, Pageable pageable) {
        if (batchId != null) {
            var students = studentRepository.findByBatchId(batchId);
            var users = students.stream().map(Student::getUser).toList();
            var start = (int) pageable.getOffset();
            var end = Math.min(start + pageable.getPageSize(), users.size());
            var slice = start > users.size() ? List.<User>of() : users.subList(start, end);
            return new PageImpl<>(slice.stream().map(this::toDto).toList(), pageable, users.size());
        }
        Page<User> page = userRepository.findAll(pageable);
        if (role != null) {
            User.Role desired = User.Role.valueOf(role);
            var filtered = page.getContent().stream().filter(user -> user.getRole() == desired).toList();
            return new PageImpl<>(filtered.stream().map(this::toDto).toList(), pageable, filtered.size());
        }
        return page.map(this::toDto);
    }

    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return toDto(user);
    }

    @Transactional
    public UserDTO updateUser(Long id, UserUpdateRequest request) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        User.Role role = request.role() != null ? User.Role.valueOf(request.role()) : null;
        userMapper.updateEntity(user, request, role);
        User saved = userRepository.save(user);

        if (request.batchId() != null) {
            Optional<Student> student = studentRepository.findById(saved.getId());
            if (student.isPresent()) {
                Batch batch = batchRepository.findById(request.batchId())
                    .orElseThrow(() -> new IllegalArgumentException("Batch not found"));
                student.get().setBatch(batch);
                studentRepository.save(student.get());
            }
        }

        return toDto(saved);
    }

    @Transactional
    public void deleteUser(Long id) {
        studentRepository.findById(id).ifPresent(studentRepository::delete);
        teacherRepository.findById(id).ifPresent(teacherRepository::delete);
        userRepository.deleteById(id);
    }

    @Transactional
    public void resetPassword(Long id, PasswordResetRequest request) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
    }

    public UserDTO toDto(User user) {
        return userMapper.toDto(user, getBatchId(user));
    }

    public Long getBatchId(User user) {
        return studentRepository.findById(user.getId())
            .map(student -> student.getBatch() != null ? student.getBatch().getId() : null)
            .orElse(null);
    }
}
