package com.virtualLaboratory.services;

import com.virtualLaboratory.dto.submission.SubmissionCreateRequest;
import com.virtualLaboratory.dto.submission.SubmissionDTO;
import com.virtualLaboratory.dto.submission.SubmissionGradeRequest;
import com.virtualLaboratory.dto.submission.SubmissionRunRequest;
import com.virtualLaboratory.dto.submission.SubmissionRunResponse;
import com.virtualLaboratory.entities.User;
import com.virtualLaboratory.entities.academics.Student;
import com.virtualLaboratory.entities.codingLaboratoryEntities.Assignment;
import com.virtualLaboratory.entities.codingLaboratoryEntities.Submission;
import com.virtualLaboratory.mapper.SubmissionMapper;
import com.virtualLaboratory.repository.AssignmentRepository;
import com.virtualLaboratory.repository.SubmissionRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SubmissionService {
    private final SubmissionRepository submissionRepository;
    private final AssignmentRepository assignmentRepository;
    private final CurrentUserService currentUserService;
    private final SubmissionMapper submissionMapper;

    public SubmissionService(SubmissionRepository submissionRepository,
                             AssignmentRepository assignmentRepository,
                             CurrentUserService currentUserService,
                             SubmissionMapper submissionMapper) {
        this.submissionRepository = submissionRepository;
        this.assignmentRepository = assignmentRepository;
        this.currentUserService = currentUserService;
        this.submissionMapper = submissionMapper;
    }

    public Page<SubmissionDTO> getSubmissions(Long assignmentId, String status, Long sectionId, Pageable pageable) {
        Long teacherId = currentUserService.getCurrentTeacher().getId();
        List<Submission> submissions = submissionRepository.findByAssignmentTeacherId(teacherId);
        if (assignmentId != null) {
            submissions = submissions.stream()
                .filter(submission -> submission.getAssignment().getId().equals(assignmentId))
                .collect(Collectors.toList());
        }
        if (status != null) {
            submissions = submissions.stream()
                .filter(submission -> submission.getStatus().name().equals(status))
                .collect(Collectors.toList());
        }
        if (sectionId != null) {
            submissions = submissions.stream()
                .filter(submission -> submission.getStudent().getSection() != null
                    && submission.getStudent().getSection().getId().equals(sectionId))
                .collect(Collectors.toList());
        }
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), submissions.size());
        List<SubmissionDTO> content = start > submissions.size()
            ? List.of()
            : submissions.subList(start, end).stream().map(submissionMapper::toDto).collect(Collectors.toList());
        return new PageImpl<>(content, pageable, submissions.size());
    }

    @Transactional
    public SubmissionDTO createSubmission(SubmissionCreateRequest request) {
        Student student = currentUserService.getCurrentStudent();
        Assignment assignment = assignmentRepository.findById(request.assignmentId())
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Assignment not found"));
        if (assignment.getStatus() != Assignment.Status.PUBLISHED) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Assignment not published");
        }
        if (assignment.getLanguage() != null && !assignment.getLanguage().getId().equals(request.languageId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Language does not match assignment");
        }
        if (student.getSection() == null || assignment.getSections() == null
            || assignment.getSections().stream().noneMatch(section -> section.getId().equals(student.getSection().getId()))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Assignment not assigned to student section");
        }

        Submission submission = submissionRepository.findByAssignmentIdAndStudentId(assignment.getId(), student.getId());
        if (submission == null) {
            submission = new Submission();
            submission.setAssignment(assignment);
            submission.setStudent(student);
        }
        submission.setCode(request.code());
        submission.setSubmitAt(LocalDateTime.now());
        submission.setStatus(Submission.Status.SUBMITTED);
        return submissionMapper.toDto(submissionRepository.save(submission));
    }

    public SubmissionRunResponse run(SubmissionRunRequest request) {
        return new SubmissionRunResponse("", "", 0, 0L);
    }

    public SubmissionDTO getSubmission(Long id) {
        Submission submission = submissionRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Submission not found"));
        User user = currentUserService.getCurrentUser();
        if (user.getRole() == User.Role.STUDENT
            && !submission.getStudent().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not allowed");
        }
        return submissionMapper.toDto(submission);
    }

    @Transactional
    public SubmissionDTO grade(Long id, SubmissionGradeRequest request) {
        Submission submission = submissionRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Submission not found"));
        Integer maxScore = submission.getAssignment() != null ? submission.getAssignment().getMaxScore() : null;
        if (maxScore != null && request.score() > maxScore) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Score exceeds max score");
        }
        submission.setMarks(request.score());
        submission.setFeedback(request.feedback());
        submission.setStatus(Submission.Status.GRADED);
        return submissionMapper.toDto(submissionRepository.save(submission));
    }

    public List<SubmissionDTO> getAssignmentSubmissions(Long assignmentId) {
        User user = currentUserService.getCurrentUser();
        if (user.getRole() == User.Role.STUDENT) {
            Submission submission = submissionRepository.findByAssignmentIdAndStudentId(assignmentId, user.getId());
            return submission != null ? List.of(submissionMapper.toDto(submission)) : List.of();
        }
        return submissionRepository.findByAssignmentId(assignmentId).stream().map(submissionMapper::toDto).collect(Collectors.toList());
    }

    public List<SubmissionDTO> getMySubmissions() {
        Student student = currentUserService.getCurrentStudent();
        return submissionRepository.findByStudentId(student.getId()).stream().map(submissionMapper::toDto).collect(Collectors.toList());
    }
}
