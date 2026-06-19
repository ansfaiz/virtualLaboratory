package com.virtualLaboratory.services;

import com.virtualLaboratory.dto.section.SectionCreateRequest;
import com.virtualLaboratory.dto.section.SectionDTO;
import com.virtualLaboratory.dto.section.SectionUpdateRequest;
import com.virtualLaboratory.dto.user.UserDTO;
import com.virtualLaboratory.entities.academicStructureEntities.Batch;
import com.virtualLaboratory.entities.academicStructureEntities.Section;
import com.virtualLaboratory.entities.academics.Student;
import com.virtualLaboratory.entities.academics.Teacher;
import com.virtualLaboratory.mapper.SectionMapper;
import com.virtualLaboratory.mapper.UserMapper;
import com.virtualLaboratory.repository.BatchRepository;
import com.virtualLaboratory.repository.SectionRepository;
import com.virtualLaboratory.repository.StudentRepository;
import com.virtualLaboratory.repository.TeacherRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SectionService {
    private final SectionRepository sectionRepository;
    private final BatchRepository batchRepository;
    private final TeacherRepository teacherRepository;
    private final StudentRepository studentRepository;
    private final UserMapper userMapper;
    private final SectionMapper sectionMapper;

    public SectionService(SectionRepository sectionRepository,
                          BatchRepository batchRepository,
                          TeacherRepository teacherRepository,
                          StudentRepository studentRepository,
                          UserMapper userMapper,
                          SectionMapper sectionMapper) {
        this.sectionRepository = sectionRepository;
        this.batchRepository = batchRepository;
        this.teacherRepository = teacherRepository;
        this.studentRepository = studentRepository;
        this.userMapper = userMapper;
        this.sectionMapper = sectionMapper;
    }

    public Page<SectionDTO> getAll(Long batchId, Long teacherId, Pageable pageable) {
        List<Section> sections;
        if (batchId != null) {
            sections = sectionRepository.findByBatchId(batchId);
        } else if (teacherId != null) {
            sections = sectionRepository.findByTeacherId(teacherId);
        } else {
            sections = sectionRepository.findAll();
        }
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), sections.size());
        List<SectionDTO> content = start > sections.size()
            ? List.of()
            : sections.subList(start, end).stream().map(this::toDto).collect(Collectors.toList());
        return new PageImpl<>(content, pageable, sections.size());
    }

    public SectionDTO getById(Long id) {
        return toDto(sectionRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Section not found")));
    }

    @Transactional
    public SectionDTO create(SectionCreateRequest request) {
        Batch batch = batchRepository.findById(request.batchId())
            .orElseThrow(() -> new IllegalArgumentException("Batch not found"));
        Teacher teacher = teacherRepository.findById(request.teacherId())
            .orElseThrow(() -> new IllegalArgumentException("Teacher not found"));

        Section section = new Section();
        section.setName(request.name());
        section.setBatch(batch);
        section.setTeacher(teacher);
        return toDto(sectionRepository.save(section));
    }

    @Transactional
    public SectionDTO update(Long id, SectionUpdateRequest request) {
        Section section = sectionRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Section not found"));
        if (request.name() != null) {
            section.setName(request.name());
        }
        if (request.teacherId() != null) {
            Teacher teacher = teacherRepository.findById(request.teacherId())
                .orElseThrow(() -> new IllegalArgumentException("Teacher not found"));
            section.setTeacher(teacher);
        }
        return toDto(sectionRepository.save(section));
    }

    @Transactional
    public void delete(Long id) {
        Section section = sectionRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Section not found"));
        List<Student> students = studentRepository.findBySectionId(id);
        for (Student student : students) {
            student.setSection(null);
            studentRepository.save(student);
        }
        sectionRepository.delete(section);
    }

    public List<UserDTO> getStudents(Long id) {
        return studentRepository.findBySectionId(id).stream()
            .map(this::toUserDto)
            .collect(Collectors.toList());
    }

    @Transactional
    public void enrollStudent(Long sectionId, Long studentId) {
        Section section = sectionRepository.findById(sectionId)
            .orElseThrow(() -> new IllegalArgumentException("Section not found"));
        Student student = studentRepository.findById(studentId)
            .orElseThrow(() -> new IllegalArgumentException("Student not found"));
        if (student.getBatch() != null && section.getBatch() != null
            && !student.getBatch().getId().equals(section.getBatch().getId())) {
            throw new IllegalArgumentException("Student batch does not match section batch");
        }
        if (student.getSection() != null && student.getSection().getId().equals(sectionId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Student already enrolled");
        }
        student.setSection(section);
        studentRepository.save(student);
    }

    @Transactional
    public void unenrollStudent(Long sectionId, Long studentId) {
        Student student = studentRepository.findById(studentId)
            .orElseThrow(() -> new IllegalArgumentException("Student not found"));
        if (student.getSection() != null && student.getSection().getId().equals(sectionId)) {
            student.setSection(null);
            studentRepository.save(student);
        }
    }

    public SectionDTO toDto(Section section) {
        List<Student> students = studentRepository.findBySectionId(section.getId());
        List<UserDTO> studentDtos = students.stream()
            .map(this::toUserDto)
            .collect(Collectors.toList());
        return sectionMapper.toDto(section, studentDtos);
    }

    private UserDTO toUserDto(Student student) {
        Long batchId = student.getBatch() != null ? student.getBatch().getId() : null;
        return userMapper.toDto(student.getUser(), batchId);
    }
}
