// ─────────────────────────────────────────────────────────────────────────────
// Mock Service Layer — Full standalone portfolio demo
// Simulates all backend API responses using realistic data.
// Used as fallback when backend is unreachable, OR as primary in demo mode.
// ─────────────────────────────────────────────────────────────────────────────

import {
  MOCK_LANGUAGES, MOCK_BATCHES, MOCK_SECTIONS, MOCK_USERS,
  MOCK_ASSIGNMENTS, MOCK_SUBMISSIONS, MOCK_ALL_SUBMISSIONS, ADMIN_STATS,
} from '../data/mockData'

// Utility: simulate network delay for realism
const delay = (ms = 250) => new Promise(r => setTimeout(r, ms))

// Wrap data in an axios-like response shape: { data: ... }
const ok = (data) => ({ data })

// Paginate a list
const paginate = (items, page = 0, size = 20) => {
  const start = page * size
  const content = items.slice(start, start + size)
  return {
    content,
    totalElements: items.length,
    totalPages: Math.ceil(items.length / size),
    number: page,
    size,
  }
}

// ─── Demo Users (for auth) ────────────────────────────────────────────────────
// These match the demo accounts shown on the LoginPage
const DEMO_CREDENTIALS = [
  { email: 'admin@vlab.edu',   password: 'Admin@123',   role: 'ADMIN',   id: 1,  name: 'Super Admin',     batchId: null },
  { email: 'priya@cs.edu',     password: 'Teacher@123', role: 'TEACHER', id: 2,  name: 'Dr. Priya Singh', batchId: null },
  { email: 'student@vlab.edu', password: 'Student@123', role: 'STUDENT', id: 4,  name: 'Aarav Patel',     batchId: 1    },
  // Additional accounts accessible via the full mock user list
  { email: 'amit@cs.edu',      password: 'Teacher@123', role: 'TEACHER', id: 3,  name: 'Dr. Amit Kapoor', batchId: null },
  { email: 'rohan@cs.edu',     password: 'Student@123', role: 'STUDENT', id: 5,  name: 'Rohan Mehta',     batchId: 1    },
  { email: 'aisha@cs.edu',     password: 'Student@123', role: 'STUDENT', id: 6,  name: 'Aisha Khan',      batchId: 1    },
  { email: 'aarav@cs.edu',     password: 'Student@123', role: 'STUDENT', id: 4,  name: 'Aarav Patel',     batchId: 1    },
]

// ─── Auth Mock ────────────────────────────────────────────────────────────────
export const mockAuthService = {
  async login({ email, password }) {
    await delay(400)
    const account = DEMO_CREDENTIALS.find(
      u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    )
    if (!account) {
      const err = new Error('Invalid credentials')
      err.response = { status: 401, data: { message: 'Invalid email or password' } }
      throw err
    }
    const { password: _p, ...user } = account
    const token = `mock-jwt-token-${user.role.toLowerCase()}-${user.id}-${Date.now()}`
    return { user, token }
  },

  async logout() {
    await delay(100)
    return ok(null)
  },

  async me() {
    const stored = localStorage.getItem('vlab_user')
    if (!stored) {
      const err = new Error('Unauthorized')
      err.response = { status: 401, data: { message: 'Unauthorized' } }
      throw err
    }
    await delay(100)
    return ok(JSON.parse(stored))
  },
}

// ─── Users Mock ───────────────────────────────────────────────────────────────
let _users = [...MOCK_USERS]
let _nextUserId = Math.max(..._users.map(u => u.id)) + 1

export const mockUserService = {
  async getAll({ role, page = 0, size = 20 } = {}) {
    await delay(200)
    let list = [..._users]
    if (role && role !== 'ALL') list = list.filter(u => u.role === role)
    return ok(paginate(list, page, size))
  },

  async getById(id) {
    await delay(150)
    const user = _users.find(u => u.id === Number(id))
    if (!user) throw Object.assign(new Error('User not found'), { response: { status: 404 } })
    return ok(user)
  },

  async create(data) {
    await delay(300)
    if (_users.find(u => u.email === data.email)) {
      throw Object.assign(new Error('Email already exists'), { response: { status: 409, data: { message: 'An account with this email already exists.' } } })
    }
    const newUser = { id: _nextUserId++, name: data.name, email: data.email, role: data.role, batchId: data.batchId ?? null, createdAt: new Date().toISOString() }
    _users.push(newUser)
    return ok(newUser)
  },

  async update(id, data) {
    await delay(250)
    const idx = _users.findIndex(u => u.id === Number(id))
    if (idx === -1) throw Object.assign(new Error('User not found'), { response: { status: 404 } })
    _users[idx] = { ..._users[idx], ...data }
    return ok(_users[idx])
  },

  async delete(id) {
    await delay(200)
    _users = _users.filter(u => u.id !== Number(id))
    return ok(null)
  },

  async resetPassword(id, _data) {
    await delay(200)
    return ok(null)
  },
}

// ─── Batches Mock ─────────────────────────────────────────────────────────────
let _batches = [...MOCK_BATCHES]
let _nextBatchId = Math.max(..._batches.map(b => b.id)) + 1

export const mockBatchService = {
  async getAll() {
    await delay(200)
    return ok(_batches)
  },

  async getById(id) {
    await delay(150)
    return ok(_batches.find(b => b.id === Number(id)))
  },

  async create(data) {
    await delay(300)
    const b = { id: _nextBatchId++, ...data, students: 0, sections: 0, startDate: data.startDate || new Date().toISOString() }
    _batches.push(b)
    return ok(b)
  },

  async update(id, data) {
    await delay(250)
    const idx = _batches.findIndex(b => b.id === Number(id))
    if (idx === -1) throw new Error('Batch not found')
    _batches[idx] = { ..._batches[idx], ...data }
    return ok(_batches[idx])
  },

  async delete(id) {
    await delay(200)
    _batches = _batches.filter(b => b.id !== Number(id))
    return ok(null)
  },
}

// ─── Sections Mock ────────────────────────────────────────────────────────────
let _sections = [...MOCK_SECTIONS]
let _nextSectionId = Math.max(..._sections.map(s => s.id)) + 1

export const mockSectionService = {
  async getAll({ batchId, page = 0, size = 20 } = {}) {
    await delay(200)
    let list = [..._sections]
    if (batchId) list = list.filter(s => s.batchId === Number(batchId))
    return ok(paginate(list, page, size))
  },

  async getById(id) {
    await delay(150)
    return ok(_sections.find(s => s.id === Number(id)))
  },

  async create(data) {
    await delay(300)
    const s = { id: _nextSectionId++, ...data, students: 0, assignments: 0 }
    _sections.push(s)
    return ok(s)
  },

  async update(id, data) {
    await delay(250)
    const idx = _sections.findIndex(s => s.id === Number(id))
    if (idx === -1) throw new Error('Section not found')
    _sections[idx] = { ..._sections[idx], ...data }
    return ok(_sections[idx])
  },

  async delete(id) {
    await delay(200)
    _sections = _sections.filter(s => s.id !== Number(id))
    return ok(null)
  },

  async getStudents(sectionId) {
    await delay(200)
    const section = _sections.find(s => s.id === Number(sectionId))
    const studentUsers = _users.filter(u => u.role === 'STUDENT').slice(0, section?.students ?? 3)
    return ok(studentUsers)
  },

  async enrollStudent(_sectionId, _studentId) {
    await delay(200)
    return ok(null)
  },

  async removeStudent(_sectionId, _studentId) {
    await delay(200)
    return ok(null)
  },
}

// ─── Languages Mock ───────────────────────────────────────────────────────────
let _languages = [...MOCK_LANGUAGES]
let _nextLangId = Math.max(..._languages.map(l => l.id)) + 1

export const mockLanguageService = {
  async getAll() {
    await delay(150)
    return ok(_languages)
  },

  async getById(id) {
    await delay(100)
    return ok(_languages.find(l => l.id === Number(id)))
  },

  async create(data) {
    await delay(300)
    const l = { id: _nextLangId++, ...data }
    _languages.push(l)
    return ok(l)
  },

  async update(id, data) {
    await delay(250)
    const idx = _languages.findIndex(l => l.id === Number(id))
    if (idx === -1) throw new Error('Language not found')
    _languages[idx] = { ..._languages[idx], ...data }
    return ok(_languages[idx])
  },

  async delete(id) {
    await delay(200)
    _languages = _languages.filter(l => l.id !== Number(id))
    return ok(null)
  },
}

// ─── Assignments Mock ─────────────────────────────────────────────────────────
let _assignments = MOCK_ASSIGNMENTS.map(a => ({
  ...a,
  id:         a.id,
  languageId: _languages.find(l => l.name.toLowerCase().includes(a.language?.toLowerCase?.() || ''))?.id ?? 1,
  sectionIds: a.sections?.map((_, i) => i + 1) ?? [1],
  teacherId:  2,
  dueDate:    a.dueDate,
  maxScore:   a.maxScore,
  status:     a.status,
  starterCode: a.starterCode,
}))
let _nextAssignmentId = Math.max(..._assignments.map(a => a.id)) + 1

export const mockAssignmentService = {
  async getAll({ status, page = 0, size = 50 } = {}) {
    await delay(200)
    let list = _assignments.filter(a => a.teacherId === 2) // demo teacher
    if (status && status !== 'ALL') list = list.filter(a => a.status === status)
    return ok(paginate(list, page, size))
  },

  async getById(id) {
    await delay(150)
    const a = _assignments.find(a => a.id === Number(id))
    if (!a) throw Object.assign(new Error('Assignment not found'), { response: { status: 404 } })
    return ok(a)
  },

  async create(data) {
    await delay(350)
    const a = {
      id: _nextAssignmentId++,
      ...data,
      status: 'DRAFT',
      teacherId: 2,
      maxScore: data.maxScore ?? 100,
    }
    _assignments.push(a)
    return ok(a)
  },

  async update(id, data) {
    await delay(250)
    const idx = _assignments.findIndex(a => a.id === Number(id))
    if (idx === -1) throw Object.assign(new Error('Assignment not found'), { response: { status: 404 } })
    _assignments[idx] = { ..._assignments[idx], ...data }
    return ok(_assignments[idx])
  },

  async delete(id) {
    await delay(200)
    const a = _assignments.find(a => a.id === Number(id))
    if (a?.status === 'PUBLISHED') {
      throw Object.assign(new Error('Published assignment has submissions'), { response: { status: 409 } })
    }
    _assignments = _assignments.filter(a => a.id !== Number(id))
    return ok(null)
  },

  async publish(id) {
    await delay(250)
    const idx = _assignments.findIndex(a => a.id === Number(id))
    if (idx === -1) throw Object.assign(new Error('Assignment not found'), { response: { status: 404 } })
    _assignments[idx] = { ..._assignments[idx], status: 'PUBLISHED' }
    return ok(_assignments[idx])
  },

  async getForStudent() {
    await delay(200)
    // Demo student is in sections [1, 2]
    const studentSectionIds = [1, 2]
    const list = _assignments
      .filter(a => a.status === 'PUBLISHED' && a.sectionIds?.some(sid => studentSectionIds.includes(sid)))
      .map(a => {
        const submission = _allSubmissions.find(s => s.assignmentId === a.id && s.studentId === 4)
        return {
          ...a,
          submissionStatus: submission?.status ?? 'PENDING',
          score: submission?.marks ?? null,
          submissionId: submission?.id ?? null,
        }
      })
    return ok(list)
  },

  async getSubmissions(id) {
    await delay(200)
    const subs = _allSubmissions.filter(s => s.assignmentId === Number(id))
    return ok(subs)
  },

  async assignToSection(_id, _sectionId) {
    await delay(200)
    return ok(null)
  },

  async removeFromSection(id, sectionId) {
    await delay(200)
    const idx = _assignments.findIndex(a => a.id === Number(id))
    if (idx !== -1) {
      _assignments[idx].sectionIds = (_assignments[idx].sectionIds || []).filter(s => s !== Number(sectionId))
    }
    return ok(null)
  },
}

// ─── Submissions Mock ─────────────────────────────────────────────────────────
let _allSubmissions = MOCK_ALL_SUBMISSIONS.map((s, i) => ({
  id:          s.id,
  assignmentId: s.assignmentId,
  studentId:   i < 3 ? 4 : (i < 5 ? 5 : 6),  // map to real user IDs
  studentName: s.student,
  code:        '// Submitted code here\nfunction solution() { return 42; }',
  submitAt:    s.submittedAt,
  marks:       s.score ?? null,
  feedback:    s.status === 'GRADED' ? 'Good work! Clean and efficient solution.' : null,
  status:      s.status,
  stdout:      s.status === 'GRADED' ? 'Test cases passed: 10/10\nExecution time: 12ms' : null,
  stderr:      null,
  exitCode:    s.status === 'GRADED' ? 0 : null,
  executionMs: s.status === 'GRADED' ? Math.floor(Math.random() * 100 + 10) : null,
}))
let _nextSubId = Math.max(..._allSubmissions.map(s => s.id)) + 1

// Student's own submissions (demo student = id 4)
const _mySubmissions = () => _allSubmissions.filter(s => s.studentId === 4)

export const mockSubmissionService = {
  async getAll({ assignmentId, status, page = 0, size = 30 } = {}) {
    await delay(200)
    let list = [..._allSubmissions]
    if (assignmentId) list = list.filter(s => s.assignmentId === Number(assignmentId))
    if (status && status !== 'ALL') list = list.filter(s => s.status === status)
    return ok(paginate(list, page, size))
  },

  async getById(id) {
    await delay(150)
    const s = _allSubmissions.find(s => s.id === Number(id))
    if (!s) throw Object.assign(new Error('Submission not found'), { response: { status: 404 } })
    return ok(s)
  },

  async submit({ assignmentId, code, languageId }) {
    await delay(500)
    const existing = _allSubmissions.find(s => s.assignmentId === Number(assignmentId) && s.studentId === 4)
    if (existing) {
      existing.code = code
      existing.submitAt = new Date().toISOString()
      existing.status = 'SUBMITTED'
      existing.marks = null
      existing.feedback = null
      return ok(existing)
    }
    const newSub = {
      id: _nextSubId++,
      assignmentId: Number(assignmentId),
      studentId: 4,
      studentName: 'Aarav Patel',
      code,
      submitAt: new Date().toISOString(),
      marks: null,
      feedback: null,
      status: 'SUBMITTED',
      stdout: null,
      stderr: null,
      exitCode: null,
      executionMs: null,
    }
    _allSubmissions.push(newSub)
    return ok(newSub)
  },

  async runCode({ code, languageId }) {
    await delay(1200) // simulate execution delay
    // Simulate a realistic run response
    const hasError = code.includes('syntax error') || code.includes('undefined_var')
    if (hasError) {
      return ok({
        stdout: '',
        stderr: 'NameError: name \'undefined_var\' is not defined\n  at line 3',
        exitCode: 1,
        executionMs: 45,
      })
    }
    return ok({
      stdout: 'Hello, World!\nExecution successful.\nTest cases: 10/10 passed.',
      stderr: '',
      exitCode: 0,
      executionMs: Math.floor(Math.random() * 150 + 20),
    })
  },

  async grade(id, { score, feedback }) {
    await delay(300)
    const idx = _allSubmissions.findIndex(s => s.id === Number(id))
    if (idx === -1) throw Object.assign(new Error('Submission not found'), { response: { status: 404 } })
    _allSubmissions[idx] = { ..._allSubmissions[idx], marks: score, feedback: feedback ?? null, status: 'GRADED' }
    return ok(_allSubmissions[idx])
  },

  async getMine() {
    await delay(200)
    return ok(_mySubmissions())
  },
}

// ─── Analytics Mock ───────────────────────────────────────────────────────────
export const mockAnalyticsService = {
  async adminStats() {
    await delay(200)
    return ok({
      totalUsers:       MOCK_USERS.length,
      totalTeachers:    MOCK_USERS.filter(u => u.role === 'TEACHER').length,
      totalStudents:    MOCK_USERS.filter(u => u.role === 'STUDENT').length,
      totalBatches:     MOCK_BATCHES.length,
      totalSections:    MOCK_SECTIONS.length,
      totalLanguages:   MOCK_LANGUAGES.filter(l => l.active).length,
      totalSubmissions: MOCK_ALL_SUBMISSIONS.length,
    })
  },

  async teacherStats() {
    await delay(200)
    const myAssignments = _assignments.filter(a => a.teacherId === 2)
    const mySubs = _allSubmissions.filter(s => myAssignments.some(a => a.id === s.assignmentId))
    const gradedSubs = mySubs.filter(s => s.marks != null)
    const avgScore = gradedSubs.length
      ? Math.round(gradedSubs.reduce((sum, s) => sum + s.marks, 0) / gradedSubs.length)
      : null
    return ok({
      assignmentCount: myAssignments.length,
      submissionCount: mySubs.length,
      pendingGrade:    mySubs.filter(s => s.status === 'SUBMITTED').length,
      avgScore,
      scoreDistribution: [],
    })
  },

  async studentStats() {
    await delay(200)
    const mySubs = _mySubmissions()
    const gradedSubs = mySubs.filter(s => s.marks != null)
    const avgScore = gradedSubs.length
      ? Math.round(gradedSubs.reduce((sum, s) => sum + s.marks, 0) / gradedSubs.length)
      : null
    return ok({
      pending:   4 - mySubs.length,
      submitted: mySubs.filter(s => s.status === 'SUBMITTED').length,
      graded:    gradedSubs.length,
      avgScore,
      streak:    5,
      rank:      3,
    })
  },

  async sectionPerformance(sectionId) {
    await delay(200)
    const section = _sections.find(s => s.id === Number(sectionId))
    return ok({
      sectionId: Number(sectionId),
      sectionName: section?.name ?? `Section #${sectionId}`,
      students: [],
      assignments: [],
      scoreDistribution: [],
    })
  },
}

// ─── Lookup helper: get full submission with student name ─────────────────────
export function getSubmissionWithName(submission) {
  const user = _users.find(u => u.id === submission.studentId)
  return {
    ...submission,
    studentName: user?.name ?? submission.studentName ?? `Student #${submission.studentId}`,
    studentEmail: user?.email ?? null,
  }
}

// ─── Lookup helper: get language name by ID ───────────────────────────────────
export function getLanguageName(languageId) {
  const lang = _languages.find(l => l.id === Number(languageId))
  return lang ? `${lang.icon ?? ''} ${lang.name}`.trim() : `Lang #${languageId}`
}

export function getLanguageById(languageId) {
  return _languages.find(l => l.id === Number(languageId)) ?? null
}
