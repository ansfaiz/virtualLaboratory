package com.virtualLaboratory.mapper;

import com.virtualLaboratory.dto.submission.SubmissionDTO;
import com.virtualLaboratory.entities.codingLaboratoryEntities.Submission;
import org.springframework.stereotype.Component;

@Component
public class SubmissionMapper {
    public SubmissionDTO toDto(Submission submission) {
        return new SubmissionDTO(
            submission.getId(),
            submission.getAssignment() != null ? submission.getAssignment().getId() : null,
            submission.getStudent() != null ? submission.getStudent().getId() : null,
            getStudentName(submission),
            submission.getCode(),
            submission.getSubmitAt(),
            submission.getMarks(),
            submission.getFeedback(),
            submission.getStatus() != null ? submission.getStatus().name() : null,
            submission.getStdout(),
            submission.getStderr(),
            submission.getExitCode(),
            submission.getExecutionMs()
        );
    }

    private String getStudentName(Submission submission) {
        if (submission.getStudent() == null || submission.getStudent().getUser() == null) {
            return null;
        }
        return submission.getStudent().getUser().getFullName();
    }
}
