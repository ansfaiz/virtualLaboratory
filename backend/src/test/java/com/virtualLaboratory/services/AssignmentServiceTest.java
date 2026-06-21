package com.virtualLaboratory.services;

import com.virtualLaboratory.dto.assignment.AssignmentDTO;
import com.virtualLaboratory.dto.assignment.AssignmentUpdateRequest;
import com.virtualLaboratory.entities.academicStructureEntities.Section;
import com.virtualLaboratory.entities.academics.Teacher;
import com.virtualLaboratory.entities.codingLaboratoryEntities.Assignment;
import com.virtualLaboratory.entities.codingLaboratoryEntities.ProgrammingLanguage;
import com.virtualLaboratory.entities.codingLaboratoryEntities.Submission;
import com.virtualLaboratory.mapper.AssignmentMapper;
import com.virtualLaboratory.repository.AssignmentRepository;
import com.virtualLaboratory.repository.ProgrammingLanguageRepository;
import com.virtualLaboratory.repository.SectionRepository;
import com.virtualLaboratory.repository.SubmissionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AssignmentServiceTest {
    @Mock
    private AssignmentRepository assignmentRepository;
    @Mock
    private SectionRepository sectionRepository;
    @Mock
    private ProgrammingLanguageRepository languageRepository;
    @Mock
    private SubmissionRepository submissionRepository;
    @Mock
    private CurrentUserService currentUserService;

    private AssignmentService assignmentService;

    @BeforeEach
    void setUp() {
        assignmentService = new AssignmentService(
            assignmentRepository,
            sectionRepository,
            languageRepository,
            submissionRepository,
            currentUserService,
            new AssignmentMapper()
        );
    }

    @Test
    void updateAllowsPublishedAssignmentTitleUpdate() {
        Assignment assignment = assignment(Assignment.Status.PUBLISHED);
        AssignmentUpdateRequest request = new AssignmentUpdateRequest("Updated title", null, null, null, null);

        when(assignmentRepository.findById(1L)).thenReturn(Optional.of(assignment));
        when(assignmentRepository.save(assignment)).thenReturn(assignment);

        AssignmentDTO dto = assignmentService.update(1L, request);

        assertEquals("Updated title", dto.title());
        assertImmutablePublishedFields(dto);
    }

    @Test
    void updateAllowsPublishedAssignmentDescriptionUpdate() {
        Assignment assignment = assignment(Assignment.Status.PUBLISHED);
        AssignmentUpdateRequest request = new AssignmentUpdateRequest(null, "Updated description", null, null, null);

        when(assignmentRepository.findById(1L)).thenReturn(Optional.of(assignment));
        when(assignmentRepository.save(assignment)).thenReturn(assignment);

        AssignmentDTO dto = assignmentService.update(1L, request);

        assertEquals("Updated description", dto.description());
        assertImmutablePublishedFields(dto);
    }

    @Test
    void updateAllowsPublishedAssignmentStarterCodeUpdate() {
        Assignment assignment = assignment(Assignment.Status.PUBLISHED);
        AssignmentUpdateRequest request = new AssignmentUpdateRequest(
            null,
            null,
            "System.out.println(\"updated\");",
            null,
            null
        );

        when(assignmentRepository.findById(1L)).thenReturn(Optional.of(assignment));
        when(assignmentRepository.save(assignment)).thenReturn(assignment);

        AssignmentDTO dto = assignmentService.update(1L, request);

        assertEquals("System.out.println(\"updated\");", dto.starterCode());
        assertImmutablePublishedFields(dto);
    }

    @Test
    void updateAllowsPublishedAssignmentDueDateUpdate() {
        Assignment assignment = assignment(Assignment.Status.PUBLISHED);
        LocalDateTime updatedDueDate = LocalDateTime.of(2026, 7, 1, 10, 30);
        AssignmentUpdateRequest request = new AssignmentUpdateRequest(null, null, null, updatedDueDate, null);

        when(assignmentRepository.findById(1L)).thenReturn(Optional.of(assignment));
        when(assignmentRepository.save(assignment)).thenReturn(assignment);

        AssignmentDTO dto = assignmentService.update(1L, request);

        assertEquals(updatedDueDate, dto.dueDate());
        assertImmutablePublishedFields(dto);
    }

    @Test
    void updateAllowsPublishedMaxScoreIncrease() {
        Assignment assignment = assignment(Assignment.Status.PUBLISHED);
        AssignmentUpdateRequest request = new AssignmentUpdateRequest(null, null, null, null, 120);

        when(assignmentRepository.findById(1L)).thenReturn(Optional.of(assignment));
        when(submissionRepository.existsByAssignmentIdAndStatusAndMarksGreaterThan(
            1L,
            Submission.Status.GRADED,
            120
        )).thenReturn(false);
        when(assignmentRepository.save(assignment)).thenReturn(assignment);

        AssignmentDTO dto = assignmentService.update(1L, request);

        assertEquals(120, dto.maxScore());
        assertImmutablePublishedFields(dto);
    }

    @Test
    void updateAllowsPublishedMaxScoreDecreaseWhenNoGradedSubmissionExceedsNewMaxScore() {
        Assignment assignment = assignment(Assignment.Status.PUBLISHED);
        AssignmentUpdateRequest request = new AssignmentUpdateRequest(null, null, null, null, 80);

        when(assignmentRepository.findById(1L)).thenReturn(Optional.of(assignment));
        when(submissionRepository.existsByAssignmentIdAndStatusAndMarksGreaterThan(
            1L,
            Submission.Status.GRADED,
            80
        )).thenReturn(false);
        when(assignmentRepository.save(assignment)).thenReturn(assignment);

        AssignmentDTO dto = assignmentService.update(1L, request);

        assertEquals(80, dto.maxScore());
        verify(assignmentRepository).save(assignment);
    }

    @Test
    void updateRejectsPublishedMaxScoreDecreaseWhenGradedSubmissionExceedsNewMaxScore() {
        Assignment assignment = assignment(Assignment.Status.PUBLISHED);
        AssignmentUpdateRequest request = new AssignmentUpdateRequest(null, null, null, null, 70);

        when(assignmentRepository.findById(1L)).thenReturn(Optional.of(assignment));
        when(submissionRepository.existsByAssignmentIdAndStatusAndMarksGreaterThan(
            1L,
            Submission.Status.GRADED,
            70
        )).thenReturn(true);

        ResponseStatusException exception = assertThrows(
            ResponseStatusException.class,
            () -> assignmentService.update(1L, request)
        );

        assertEquals(HttpStatus.CONFLICT, exception.getStatusCode());
        verify(assignmentRepository, never()).save(any());
    }

    @Test
    void updatePreservesExistingDraftPartialUpdateBehavior() {
        Assignment assignment = assignment(Assignment.Status.DRAFT);
        AssignmentUpdateRequest request = new AssignmentUpdateRequest("Draft title", null, null, null, null);

        when(assignmentRepository.findById(1L)).thenReturn(Optional.of(assignment));
        when(assignmentRepository.save(assignment)).thenReturn(assignment);

        AssignmentDTO dto = assignmentService.update(1L, request);

        assertEquals("Draft title", dto.title());
        assertEquals("Original description", dto.description());
        assertEquals("class Main {}", dto.starterCode());
        assertEquals(LocalDateTime.of(2026, 6, 30, 9, 0), dto.dueDate());
        assertEquals(100, dto.maxScore());
        verify(submissionRepository, never()).existsByAssignmentIdAndStatusAndMarksGreaterThan(
            any(),
            any(),
            any()
        );
    }

    private Assignment assignment(Assignment.Status status) {
        ProgrammingLanguage language = new ProgrammingLanguage();
        language.setId(10L);

        Section section = new Section();
        section.setId(20L);

        Teacher teacher = new Teacher();
        teacher.setId(30L);

        Assignment assignment = new Assignment();
        assignment.setId(1L);
        assignment.setTitle("Original title");
        assignment.setDescription("Original description");
        assignment.setStarterCode("class Main {}");
        assignment.setLanguage(language);
        assignment.setSections(List.of(section));
        assignment.setTeacher(teacher);
        assignment.setDueDate(LocalDateTime.of(2026, 6, 30, 9, 0));
        assignment.setMaxScore(100);
        assignment.setStatus(status);
        return assignment;
    }

    private void assertImmutablePublishedFields(AssignmentDTO dto) {
        assertEquals(10L, dto.languageId());
        assertEquals(List.of(20L), dto.sectionIds());
        assertEquals("PUBLISHED", dto.status());
        assertEquals(30L, dto.teacherId());
    }
}
