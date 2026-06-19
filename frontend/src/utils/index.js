import { clsx } from 'clsx'
import { format, formatDistance } from 'date-fns'

// Class names utility
export const cn = (...classes) => clsx(...classes)

// Date formatting
export const formatDate = (date) => format(new Date(date), 'MMM d, yyyy')
export const formatDateTime = (date) => format(new Date(date), 'MMM d, yyyy h:mm a')
export const timeAgo = (date) => formatDistance(new Date(date), new Date(), { addSuffix: true })

// Truncate text
export const truncate = (str, n = 50) =>
  str && str.length > n ? `${str.substring(0, n)}...` : str

// Get initials from name
export const getInitials = (name = '') =>
  name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2)

// Role colors
export const roleColor = {
  ADMIN:       'bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400',
  TEACHER:     'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
  STUDENT:     'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
  Coordinator: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
  Deen:        'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400',
}

// Status colors
export const statusColor = {
  PENDING:   'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400',
  SUBMITTED: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
  GRADED:    'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
  OVERDUE:   'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400',
  PUBLISHED: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400',
  DRAFT:     'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
}

// Language icon map (for display)
export const languageIcon = {
  java: '☕',
  python: '🐍',
  javascript: '🟨',
  cpp: '⚙️',
  c: '🔷',
  typescript: '🔵',
  go: '🐹',
  rust: '🦀',
}

// Monaco language map
export const monacoLanguageMap = {
  java: 'java',
  python: 'python',
  javascript: 'javascript',
  typescript: 'typescript',
  cpp: 'cpp',
  c: 'c',
  go: 'go',
  rust: 'rust',
}

// Default code templates
export const codeTemplates = {
  java: `public class Solution {
    public static void main(String[] args) {
        // Your code here
    }
}`,
  python: `def solution():
    # Your code here
    pass

if __name__ == "__main__":
    solution()`,
  javascript: `function solution() {
    // Your code here
}

solution();`,
  cpp: `#include <iostream>
using namespace std;

int main() {
    // Your code here
    return 0;
}`,
}

// Pagination helpers
export const paginate = (items, page, perPage = 10) => {
  const start = (page - 1) * perPage
  return items.slice(start, start + perPage)
}

// Grade color
export const gradeColor = (score, max) => {
  const pct = (score / max) * 100
  if (pct >= 90) return 'text-emerald-500'
  if (pct >= 70) return 'text-amber-500'
  return 'text-rose-500'
}
