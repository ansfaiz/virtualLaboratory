// ─────────────────────────────────────────────────────────────────────────────
// utils/dataHelpers.js
//
// Shared display helper utilities that resolve IDs to human-readable labels.
//
// In DEMO_MODE the static mock catalog is used automatically.
// In real mode, call setLanguageCatalog(languages) once at app startup
// (after fetching GET /api/languages) to populate the live catalog.
// The helpers will then use real backend IDs instead of mock IDs.
// ─────────────────────────────────────────────────────────────────────────────

import { MOCK_LANGUAGES, MOCK_USERS } from '../data/mockData'

// ─── Language Catalog ─────────────────────────────────────────────────────────
// Populated at startup from GET /api/languages in real mode.
// Falls back to MOCK_LANGUAGES when empty (DEMO_MODE=true).
let _languageCatalog = []

/**
 * Call this at app startup (after fetching GET /api/languages) to populate
 * the live language catalog used by getLanguageName().
 *
 * @param {Array<{ id: number, name: string, icon?: string }>} languages
 */
export function setLanguageCatalog(languages) {
  _languageCatalog = Array.isArray(languages) ? languages : []
}

/**
 * Resolve a languageId to its display name (with icon).
 * Uses the live catalog (set via setLanguageCatalog) if available,
 * otherwise falls back to the static mock catalog.
 * Falls back to "Lang #<id>" if not found in either catalog.
 *
 * @param {number|string} languageId
 * @returns {string}  e.g. "🐍 Python" or "Lang #99"
 */
export function getLanguageName(languageId) {
  const catalog = _languageCatalog.length > 0 ? _languageCatalog : MOCK_LANGUAGES
  const lang = catalog.find(l => l.id === Number(languageId))
  return lang ? `${lang.icon ?? ''} ${lang.name}`.trim() : `Lang #${languageId}`
}

/**
 * Enrich a SubmissionDTO with the student's display name and email.
 *
 * The Spring Boot SubmissionDTO includes `studentName` (populated by
 * SubmissionMapper from student.user.fullName). This helper forwards
 * that field unchanged when present, and falls back to a mock lookup
 * or a generic label as a last resort.
 *
 * @param {{ studentId: number, studentName?: string, [key: string]: any }} submission
 * @returns {{ studentName: string, studentEmail: string|null, [key: string]: any }}
 */
export function getSubmissionWithName(submission) {
  // If the backend already provided studentName, use it directly.
  if (submission.studentName) {
    return { ...submission, studentEmail: null }
  }
  // Fallback: check mock catalog (DEMO_MODE=true path)
  const user = MOCK_USERS.find(u => u.id === submission.studentId)
  return {
    ...submission,
    studentName:  user?.name  ?? `Student #${submission.studentId}`,
    studentEmail: user?.email ?? null,
  }
}
