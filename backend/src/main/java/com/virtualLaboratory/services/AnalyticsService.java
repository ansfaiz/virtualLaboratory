package com.virtualLaboratory.services;

import com.virtualLaboratory.dto.analytics.AdminAnalyticsDTO;
import com.virtualLaboratory.dto.analytics.SectionAnalyticsDTO;
import com.virtualLaboratory.dto.analytics.StudentAnalyticsDTO;
import com.virtualLaboratory.dto.analytics.TeacherAnalyticsDTO;
import com.virtualLaboratory.entities.academics.Student;
import com.virtualLaboratory.entities.academics.Teacher;
import com.virtualLaboratory.entities.codingLaboratoryEntities.Assignment;
import com.virtualLaboratory.entities.codingLaboratoryEntities.Submission;
import com.virtualLaboratory.repository.*;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {
    private final UserRepository userRepository;
    private final TeacherRepository teacherRepository;
    private final StudentRepository studentRepository;
    private final BatchRepository batchRepository;
    private final SectionRepository sectionRepository;
    private final ProgrammingLanguageRepository languageRepository;
    private final SubmissionRepository submissionRepository;
    private final AssignmentRepository assignmentRepository;
    private final CurrentUserService currentUserService;

    public AnalyticsService(UserRepository userRepository,
                            TeacherRepository teacherRepository,
                            StudentRepository studentRepository,
                            BatchRepository batchRepository,
                            SectionRepository sectionRepository,
                            ProgrammingLanguageRepository languageRepository,
                            SubmissionRepository submissionRepository,
                            AssignmentRepository assignmentRepository,
                            CurrentUserService currentUserService) {
        this.userRepository = userRepository;
        this.teacherRepository = teacherRepository;
        this.studentRepository = studentRepository;
        this.batchRepository = batchRepository;
        this.sectionRepository = sectionRepository;
        this.languageRepository = languageRepository;
        this.submissionRepository = submissionRepository;
        this.assignmentRepository = assignmentRepository;
        this.currentUserService = currentUserService;
    }

    public AdminAnalyticsDTO getAdminAnalytics() {
        return new AdminAnalyticsDTO(
            userRepository.count(),
            teacherRepository.count(),
            studentRepository.count(),
            batchRepository.count(),
            sectionRepository.count(),
            languageRepository.count(),
            submissionRepository.count()
        );
    }

    public TeacherAnalyticsDTO getTeacherAnalytics(Long sectionId) {
        Teacher teacher = currentUserService.getCurrentTeacher();
        List<Assignment> assignments = assignmentRepository.findByTeacherId(teacher.getId());
        List<Submission> submissions = submissionRepository.findByAssignmentTeacherId(teacher.getId());
        if (sectionId != null) {
            submissions = submissions.stream()
                .filter(submission -> submission.getStudent().getSection() != null
                    && submission.getStudent().getSection().getId().equals(sectionId))
                .collect(Collectors.toList());
        }
        long pending = submissions.stream().filter(sub -> sub.getStatus() == Submission.Status.SUBMITTED).count();
        Double avgScore = submissions.stream()
            .filter(sub -> sub.getMarks() != null)
            .mapToInt(Submission::getMarks)
            .average().isPresent() ? submissions.stream()
            .filter(sub -> sub.getMarks() != null)
            .mapToInt(Submission::getMarks)
            .average().getAsDouble() : null;
        return new TeacherAnalyticsDTO(
            assignments.size(),
            submissions.size(),
            pending,
            avgScore,
            List.of()
        );
    }

    public StudentAnalyticsDTO getStudentAnalytics() {
        Student student = currentUserService.getCurrentStudent();
        List<Assignment> assignments = assignmentRepository.findBySectionsId(
            student.getSection() != null ? student.getSection().getId() : -1L);
        List<Submission> submissions = submissionRepository.findByStudentId(student.getId());
        long submitted = submissions.stream().filter(sub -> sub.getStatus() == Submission.Status.SUBMITTED).count();
        long graded = submissions.stream().filter(sub -> sub.getStatus() == Submission.Status.GRADED).count();
        long pending = assignments.size() - submissions.size();
        Double avgScore = submissions.stream().filter(sub -> sub.getMarks() != null)
            .mapToInt(Submission::getMarks).average().isPresent() ? submissions.stream()
            .filter(sub -> sub.getMarks() != null).mapToInt(Submission::getMarks).average().getAsDouble() : null;
        return new StudentAnalyticsDTO(pending, submitted, graded, avgScore, 0, 0);
    }

    public SectionAnalyticsDTO getSectionAnalytics(Long sectionId) {
        return new SectionAnalyticsDTO(sectionId, null, List.of(), List.of(), List.of());
    }
}
