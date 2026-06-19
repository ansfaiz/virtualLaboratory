// ─────────────────────────────────────────────────────────────────────────────
// services/index.js — Unified Service Exports
//
// PORTFOLIO MODE: All services use the mock layer for standalone demo.
// To switch to the real Spring Boot backend, change DEMO_MODE to false.
// When using the real backend ensure it's running on localhost:8080.
// ─────────────────────────────────────────────────────────────────────────────

export const DEMO_MODE = true  // ← set to false to use real backend

import {
  mockAuthService,
  mockUserService,
  mockBatchService,
  mockSectionService,
  mockLanguageService,
  mockAssignmentService,
  mockSubmissionService,
  mockAnalyticsService,
} from './mockService'

import apiClient from './apiClient'

// ─── Real API services (used when DEMO_MODE = false) ──────────────────────────
const realAuthService = {
  login:  (credentials) => apiClient.post('/auth/login', credentials).then(r => r.data),
  logout: ()             => apiClient.post('/auth/logout'),
  me:     ()             => apiClient.get('/auth/me'),
}

const realUserService = {
  getAll:        (params)   => apiClient.get('/users', { params }),
  getById:       (id)       => apiClient.get(`/users/${id}`),
  create:        (data)     => apiClient.post('/users', data),
  update:        (id, data) => apiClient.put(`/users/${id}`, data),
  delete:        (id)       => apiClient.delete(`/users/${id}`),
  resetPassword: (id, data) => apiClient.put(`/users/${id}/password`, data),
}

const realBatchService = {
  getAll:  ()           => apiClient.get('/batches'),
  getById: (id)         => apiClient.get(`/batches/${id}`),
  create:  (data)       => apiClient.post('/batches', data),
  update:  (id, data)   => apiClient.put(`/batches/${id}`, data),
  delete:  (id)         => apiClient.delete(`/batches/${id}`),
}

const realSectionService = {
  getAll:        (params)          => apiClient.get('/sections', { params }),
  getById:       (id)              => apiClient.get(`/sections/${id}`),
  create:        (data)            => apiClient.post('/sections', data),
  update:        (id, data)        => apiClient.put(`/sections/${id}`, data),
  delete:        (id)              => apiClient.delete(`/sections/${id}`),
  getStudents:   (id)              => apiClient.get(`/sections/${id}/students`),
  enrollStudent: (id, studentId)   => apiClient.post(`/sections/${id}/students/${studentId}`),
  removeStudent: (id, studentId)   => apiClient.delete(`/sections/${id}/students/${studentId}`),
}

const realLanguageService = {
  getAll:  ()           => apiClient.get('/languages'),
  getById: (id)         => apiClient.get(`/languages/${id}`),
  create:  (data)       => apiClient.post('/languages', data),
  update:  (id, data)   => apiClient.put(`/languages/${id}`, data),
  delete:  (id)         => apiClient.delete(`/languages/${id}`),
}

const realAssignmentService = {
  getAll:            (params)         => apiClient.get('/assignments', { params }),
  getById:           (id)             => apiClient.get(`/assignments/${id}`),
  create:            (data)           => apiClient.post('/assignments', data),
  update:            (id, data)       => apiClient.put(`/assignments/${id}`, data),
  delete:            (id)             => apiClient.delete(`/assignments/${id}`),
  publish:           (id)             => apiClient.put(`/assignments/${id}/publish`),
  getForStudent:     ()               => apiClient.get('/assignments/student'),
  getSubmissions:    (id, params)     => apiClient.get(`/assignments/${id}/submissions`, { params }),
  assignToSection:   (id, sectionId)  => apiClient.post(`/assignments/${id}/sections/${sectionId}`),
  removeFromSection: (id, sectionId)  => apiClient.delete(`/assignments/${id}/sections/${sectionId}`),
}

const realSubmissionService = {
  getAll:  (params)   => apiClient.get('/submissions', { params }),
  getById: (id)       => apiClient.get(`/submissions/${id}`),
  submit:  (data)     => apiClient.post('/submissions', data),
  runCode: (data)     => apiClient.post('/submissions/run', data),
  grade:   (id, data) => apiClient.put(`/submissions/${id}/grade`, data),
  getMine: (params)   => apiClient.get('/submissions/my', { params }),
}

const realAnalyticsService = {
  adminStats:         ()          => apiClient.get('/analytics/admin'),
  teacherStats:       (params)    => apiClient.get('/analytics/teacher', { params }),
  studentStats:       ()          => apiClient.get('/analytics/student'),
  sectionPerformance: (sectionId) => apiClient.get(`/analytics/sections/${sectionId}`),
}

// ─── Exported Services ────────────────────────────────────────────────────────
export const authService       = DEMO_MODE ? mockAuthService       : realAuthService
export const userService       = DEMO_MODE ? mockUserService       : realUserService
export const batchService      = DEMO_MODE ? mockBatchService      : realBatchService
export const sectionService    = DEMO_MODE ? mockSectionService    : realSectionService
export const languageService   = DEMO_MODE ? mockLanguageService   : realLanguageService
export const assignmentService = DEMO_MODE ? mockAssignmentService : realAssignmentService
export const submissionService = DEMO_MODE ? mockSubmissionService : realSubmissionService
export const analyticsService  = DEMO_MODE ? mockAnalyticsService  : realAnalyticsService
