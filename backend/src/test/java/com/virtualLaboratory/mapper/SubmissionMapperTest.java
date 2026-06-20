package com.virtualLaboratory.mapper;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.virtualLaboratory.dto.submission.SubmissionDTO;
import com.virtualLaboratory.entities.User;
import com.virtualLaboratory.entities.academics.Student;
import com.virtualLaboratory.entities.codingLaboratoryEntities.Assignment;
import com.virtualLaboratory.entities.codingLaboratoryEntities.Submission;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class SubmissionMapperTest {
    private final SubmissionMapper mapper = new SubmissionMapper();

    @Test
    void toDtoIncludesStudentNameAndKeepsStudentId() {
        Submission submission = submissionWithStudent("Ayesha Khan");

        SubmissionDTO dto = mapper.toDto(submission);

        assertEquals(7L, dto.studentId());
        assertEquals("Ayesha Khan", dto.studentName());
        assertEquals(3L, dto.assignmentId());
        assertEquals("SUBMITTED", dto.status());
    }

    @Test
    void toDtoUsesNullStudentNameWhenStudentUserIsMissing() {
        Submission submission = new Submission();
        Student student = new Student();
        student.setId(7L);
        submission.setStudent(student);

        SubmissionDTO dto = mapper.toDto(submission);

        assertEquals(7L, dto.studentId());
        assertNull(dto.studentName());
    }

    @Test
    void toDtoUsesNullStudentNameWhenStudentIsMissing() {
        Submission submission = new Submission();

        SubmissionDTO dto = mapper.toDto(submission);

        assertNull(dto.studentId());
        assertNull(dto.studentName());
    }

    @Test
    void submissionDtoJsonKeepsExistingFieldsAndAddsStudentName() throws Exception {
        SubmissionDTO dto = mapper.toDto(submissionWithStudent("Ayesha Khan"));
        ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

        JsonNode json = objectMapper.readTree(objectMapper.writeValueAsString(dto));

        assertEquals(12L, json.get("id").asLong());
        assertEquals(3L, json.get("assignmentId").asLong());
        assertEquals(7L, json.get("studentId").asLong());
        assertEquals("Ayesha Khan", json.get("studentName").asText());
        assertTrue(json.has("code"));
        assertTrue(json.has("submitAt"));
        assertTrue(json.has("marks"));
        assertTrue(json.has("feedback"));
        assertTrue(json.has("status"));
        assertTrue(json.has("stdout"));
        assertTrue(json.has("stderr"));
        assertTrue(json.has("exitCode"));
        assertTrue(json.has("executionMs"));
    }

    private Submission submissionWithStudent(String fullName) {
        User user = new User();
        user.setId(7L);
        user.setFullName(fullName);

        Student student = new Student();
        student.setId(7L);
        student.setUser(user);

        Assignment assignment = new Assignment();
        assignment.setId(3L);

        Submission submission = new Submission();
        submission.setId(12L);
        submission.setAssignment(assignment);
        submission.setStudent(student);
        submission.setCode("print('hello')");
        submission.setSubmitAt(LocalDateTime.of(2026, 6, 20, 13, 45));
        submission.setMarks(95);
        submission.setFeedback("Good work");
        submission.setStatus(Submission.Status.SUBMITTED);
        submission.setStdout("hello");
        submission.setStderr("");
        submission.setExitCode(0);
        submission.setExecutionMs(25L);
        return submission;
    }
}
