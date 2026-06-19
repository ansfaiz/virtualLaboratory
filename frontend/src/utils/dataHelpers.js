// ─────────────────────────────────────────────────────────────────────────────
// utils/dataHelpers.js
//
// Shared display helper utilities that resolve IDs to human-readable labels.
//
// These helpers import from the static mock data store (data/mockData.js),
// NOT from mockService.js, making them safe to use in any build context:
//   - DEMO_MODE=true (mock backend)
//   - DEMO_MODE=false (real backend)
//   - Production builds without the mock service layer
//
// Why this matters:
//   Pages that call getLanguageName() or getSubmissionWithName() previously
//   imported them from mockService.js, which would cause a compilation error
//   if mockService.js is removed or tree-shaken in a production build.
// ─────────────────────────────────────────────────────────────────────────────

import { MOCK_LANGUAGES, MOCK_USERS } from '../data/mockData'

/**
 * Resolve a languageId to its display name (with icon).
 * Falls back to "Lang #<id>" if not found in the mock language catalog.
 *
 * In a real backend integration this catalog would be fetched from GET /languages
 * and injected here, but for demo mode the static catalog is sufficient.
 *
 * @param {number|string} languageId
 * @returns {string}  e.g. "🐍 Python" or "Lang #99"
 */
export function getLanguageName(languageId) {
  const lang = MOCK_LANGUAGES.find(l => l.id === Number(languageId))
  return lang ? `${lang.icon ?? ''} ${lang.name}`.trim() : `Lang #${languageId}`
}

/**
 * Enrich a SubmissionDTO with the student's display name and email.
 *
 * The Spring Boot SubmissionDTO returns `studentId` but not `studentName`.
 * This helper resolves the name from the local user catalog.
 * When the backend adds a `studentName` field to SubmissionDTO, this
 * function will gracefully forward that field unchanged.
 *
 * @param {{ studentId: number, studentName?: string, [key: string]: any }} submission
 * @returns {{ studentName: string, studentEmail: string|null, [key: string]: any }}
 */
export function getSubmissionWithName(submission) {
  const user = MOCK_USERS.find(u => u.id === submission.studentId)
  return {
    ...submission,
    studentName:  user?.name  ?? submission.studentName  ?? `Student #${submission.studentId}`,
    studentEmail: user?.email ?? null,
  }
}
