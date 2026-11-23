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
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
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
        sectionRepository.findById(sectionId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Section not found"));

        List<Student> students = studentRepository.findBySectionId(sectionId);
        List<Assignment> assignments = assignmentRepository.findBySectionsId(sectionId).stream()
            .filter(assignment -> assignment.getStatus() == Assignment.Status.PUBLISHED)
            .collect(Collectors.toList());

        List<Submission> submissions = assignments.stream()
            .flatMap(assignment -> submissionRepository.findByAssignmentId(assignment.getId()).stream())
            .filter(submission -> submission.getStudent() != null
                && submission.getStudent().getSection() != null
                && submission.getStudent().getSection().getId().equals(sectionId))
            .collect(Collectors.toList());

        Double completionRate = null;
        if (!students.isEmpty() && !assignments.isEmpty()) {
            completionRate = submissions.size() * 100.0 / (students.size() * assignments.size());
        }

        List<Long> topStudentIds = submissions.stream()
            .filter(submission -> submission.getStatus() == Submission.Status.GRADED && submission.getMarks() != null)
            .collect(Collectors.groupingBy(submission -> submission.getStudent().getId(), Collectors.averagingInt(Submission::getMarks)))
            .entrySet().stream()
            .sorted(Map.Entry.<Long, Double>comparingByValue().reversed())
            .limit(5)
            .map(Map.Entry::getKey)
            .collect(Collectors.toList());

        List<SectionAnalyticsDTO.ScoreHistogramBucket> scoreHistogram = buildScoreHistogram(submissions);

        List<SectionAnalyticsDTO.LanguageUsageStat> languageUsage = submissions.stream()
            .filter(submission -> submission.getAssignment() != null && submission.getAssignment().getLanguage() != null)
            .collect(Collectors.groupingBy(
                submission -> submission.getAssignment().getLanguage().getId(),
                Collectors.counting()
            ))
            .entrySet().stream()
            .map(entry -> new SectionAnalyticsDTO.LanguageUsageStat(entry.getKey(), entry.getValue()))
            .sorted(Comparator.comparing(SectionAnalyticsDTO.LanguageUsageStat::languageId))
            .collect(Collectors.toList());

        return new SectionAnalyticsDTO(sectionId, completionRate, topStudentIds, scoreHistogram, languageUsage);
    }

    private List<SectionAnalyticsDTO.ScoreHistogramBucket> buildScoreHistogram(List<Submission> submissions) {
        String[] buckets = {"0-20", "21-40", "41-60", "61-80", "81-100"};
        long[] counts = new long[buckets.length];
        submissions.stream()
            .filter(submission -> submission.getMarks() != null)
            .forEach(submission -> counts[scoreBucketIndex(submission.getMarks())]++);
        List<SectionAnalyticsDTO.ScoreHistogramBucket> histogram = new ArrayList<>(buckets.length);
        for (int i = 0; i < buckets.length; i++) {
            histogram.add(new SectionAnalyticsDTO.ScoreHistogramBucket(buckets[i], counts[i]));
        }
        return histogram;
    }

    private int scoreBucketIndex(int marks) {
        if (marks <= 20) {
            return 0;
        }
        if (marks <= 40) {
            return 1;
        }
        if (marks <= 60) {
            return 2;
        }
        if (marks <= 80) {
            return 3;
        }
        return 4;
    }
}
