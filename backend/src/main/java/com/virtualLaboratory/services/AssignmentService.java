package com.virtualLaboratory.services;

import com.virtualLaboratory.dto.assignment.AssignmentCreateRequest;
import com.virtualLaboratory.dto.assignment.AssignmentDTO;
import com.virtualLaboratory.dto.assignment.AssignmentUpdateRequest;
import com.virtualLaboratory.dto.assignment.AssignmentWithStatusDTO;
import com.virtualLaboratory.entities.User;
import com.virtualLaboratory.entities.academicStructureEntities.Section;
import com.virtualLaboratory.entities.academics.Student;
import com.virtualLaboratory.entities.academics.Teacher;
import com.virtualLaboratory.entities.codingLaboratoryEntities.Assignment;
import com.virtualLaboratory.entities.codingLaboratoryEntities.ProgrammingLanguage;
import com.virtualLaboratory.entities.codingLaboratoryEntities.Submission;
import com.virtualLaboratory.mapper.AssignmentMapper;
import com.virtualLaboratory.repository.AssignmentRepository;
import com.virtualLaboratory.repository.ProgrammingLanguageRepository;
import com.virtualLaboratory.repository.SectionRepository;
import com.virtualLaboratory.repository.SubmissionRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class AssignmentService {
    private final AssignmentRepository assignmentRepository;
    private final SectionRepository sectionRepository;
    private final ProgrammingLanguageRepository languageRepository;
    private final SubmissionRepository submissionRepository;
    private final CurrentUserService currentUserService;
    private final AssignmentMapper assignmentMapper;

    public AssignmentService(AssignmentRepository assignmentRepository,
                             SectionRepository sectionRepository,
                             ProgrammingLanguageRepository languageRepository,
                             SubmissionRepository submissionRepository,
                             CurrentUserService currentUserService,
                             AssignmentMapper assignmentMapper) {
        this.assignmentRepository = assignmentRepository;
        this.sectionRepository = sectionRepository;
        this.languageRepository = languageRepository;
        this.submissionRepository = submissionRepository;
        this.currentUserService = currentUserService;
        this.assignmentMapper = assignmentMapper;
    }

    public Page<AssignmentDTO> getTeacherAssignments(String status, Long sectionId, Pageable pageable) {
        Teacher teacher = currentUserService.getCurrentTeacher();
        List<Assignment> assignments;
        if (status != null) {
            assignments = assignmentRepository.findByTeacherIdAndStatus(teacher.getId(), Assignment.Status.valueOf(status));
        } else {
            assignments = assignmentRepository.findByTeacherId(teacher.getId());
        }
        if (sectionId != null) {
            assignments = assignments.stream()
                .filter(assignment -> assignment.getSections() != null
                    && assignment.getSections().stream().anyMatch(section -> Objects.equals(section.getId(), sectionId)))
                .collect(Collectors.toList());
        }
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), assignments.size());
        List<AssignmentDTO> content = start > assignments.size()
            ? List.of()
            : assignments.subList(start, end).stream().map(assignmentMapper::toDto).collect(Collectors.toList());
        return new PageImpl<>(content, pageable, assignments.size());
    }

    @Transactional
    public AssignmentDTO create(AssignmentCreateRequest request) {
        Teacher teacher = currentUserService.getCurrentTeacher();
        ProgrammingLanguage language = languageRepository.findById(request.languageId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Language not found"));
        List<Section> sections = sectionRepository.findAllById(request.sectionIds());
        if (sections.size() != request.sectionIds().size()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid section id");
        }
        for (Section section : sections) {
            if (section.getTeacher() != null && !section.getTeacher().getId().equals(teacher.getId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Section belongs to another teacher");
            }
        }

        Assignment assignment = new Assignment();
        assignment.setTitle(request.title());
        assignment.setDescription(request.description());
        assignment.setStarterCode(request.starterCode());
        assignment.setLanguage(language);
        assignment.setTeacher(teacher);
        assignment.setDueDate(request.dueDate());
        assignment.setMaxScore(request.maxScore() != null ? request.maxScore() : 100);
        assignment.setStatus(Assignment.Status.DRAFT);
        assignment.setSections(sections);
        return assignmentMapper.toDto(assignmentRepository.save(assignment));
    }

    public AssignmentDTO getById(Long id) {
        Assignment assignment = assignmentRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Assignment not found"));
        var user = currentUserService.getCurrentUser();
        if (user.getRole() == User.Role.STUDENT) {
            Student student = currentUserService.getCurrentStudent();
            boolean inSection = student.getSection() != null && assignment.getSections() != null
                && assignment.getSections().stream().anyMatch(section -> section.getId().equals(student.getSection().getId()));
            if (!inSection || assignment.getStatus() != Assignment.Status.PUBLISHED) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Assignment not visible");
            }
        }
        return assignmentMapper.toDto(assignment);
    }

    @Transactional
    public AssignmentDTO update(Long id, AssignmentUpdateRequest request) {
        Assignment assignment = assignmentRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Assignment not found"));
        if (assignment.getStatus() == Assignment.Status.PUBLISHED) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Assignment already published");
        }
        if (request.title() != null) {
            assignment.setTitle(request.title());
        }
        if (request.description() != null) {
            assignment.setDescription(request.description());
        }
        if (request.starterCode() != null) {
            assignment.setStarterCode(request.starterCode());
        }
        if (request.dueDate() != null) {
            assignment.setDueDate(request.dueDate());
        }
        if (request.maxScore() != null) {
            assignment.setMaxScore(request.maxScore());
        }
        return assignmentMapper.toDto(assignmentRepository.save(assignment));
    }

    @Transactional
    public void delete(Long id) {
        Assignment assignment = assignmentRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Assignment not found"));
        if (assignment.getStatus() == Assignment.Status.PUBLISHED
            && !submissionRepository.findByAssignmentId(id).isEmpty()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Published assignment has submissions");
        }
        assignmentRepository.delete(assignment);
    }

    @Transactional
    public AssignmentDTO publish(Long id) {
        Assignment assignment = assignmentRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Assignment not found"));
        assignment.setStatus(Assignment.Status.PUBLISHED);
        return assignmentMapper.toDto(assignmentRepository.save(assignment));
    }

    public List<AssignmentWithStatusDTO> getStudentAssignments() {
        Student student = currentUserService.getCurrentStudent();
        if (student.getSection() == null) {
            return List.of();
        }
        List<Assignment> assignments = assignmentRepository.findBySectionsId(student.getSection().getId()).stream()
            .filter(assignment -> assignment.getStatus() == Assignment.Status.PUBLISHED)
            .collect(Collectors.toList());
        return assignments.stream()
            .map(assignment -> {
                AssignmentDTO dto = assignmentMapper.toDto(assignment);
                return new AssignmentWithStatusDTO(
                    dto.id(),
                    dto.title(),
                    dto.description(),
                    dto.starterCode(),
                    dto.languageId(),
                    dto.sectionIds(),
                    dto.dueDate(),
                    dto.maxScore(),
                    dto.status(),
                    dto.teacherId(),
                    submissionStatus(assignment.getId(), student.getId())
                );
            })
            .collect(Collectors.toList());
    }

    @Transactional
    public void assignSection(Long assignmentId, Long sectionId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Assignment not found"));
        Section section = sectionRepository.findById(sectionId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Section not found"));
        if (assignment.getSections() == null) {
            assignment.setSections(new java.util.ArrayList<>());
        }
        if (assignment.getSections().stream().noneMatch(existing -> existing.getId().equals(sectionId))) {
            assignment.getSections().add(section);
        }
        assignmentRepository.save(assignment);
    }

    @Transactional
    public void unassignSection(Long assignmentId, Long sectionId) {
        Assignment assignment = assignmentRepository.findById(assignmentId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Assignment not found"));
        if (assignment.getSections() != null) {
            assignment.setSections(assignment.getSections().stream()
                .filter(section -> !section.getId().equals(sectionId))
                .collect(Collectors.toList()));
        }
        assignmentRepository.save(assignment);
    }

    private String submissionStatus(Long assignmentId, Long studentId) {
        List<Submission> submissions = submissionRepository.findByAssignmentId(assignmentId);
        return submissions.stream().anyMatch(submission -> submission.getStudent().getId().equals(studentId))
            ? submissions.stream().filter(sub -> sub.getStudent().getId().equals(studentId))
                .map(sub -> sub.getStatus().name())
                .findFirst().orElse("PENDING")
            : "PENDING";
    }

}
