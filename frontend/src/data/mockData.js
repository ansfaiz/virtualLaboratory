// ─────────────────────────────────────────────────────────────────────────────
// Shared Mock Data Store
// Single source of truth used across Admin, Teacher, and Student pages.
// Simulates what a real Spring Boot backend would return.
// ─────────────────────────────────────────────────────────────────────────────

export const MOCK_LANGUAGES = [
  { id: 1, name: 'Python',     version: '3.12.0',   extension: '.py',   icon: '🐍', active: true },
  { id: 2, name: 'Java',       version: '21 LTS',   extension: '.java', icon: '☕', active: true },
  { id: 3, name: 'JavaScript', version: 'Node 20',  extension: '.js',   icon: '🟨', active: true },
  { id: 4, name: 'C++',        version: 'GCC 13.2', extension: '.cpp',  icon: '⚙️', active: true },
  { id: 5, name: 'C',          version: 'GCC 13.2', extension: '.c',    icon: '🔷', active: false },
]

export const MOCK_BATCHES = [
  { id: 1, name: '2025-A', year: 2025, students: 62, sections: 3, startDate: '2025-01-15T00:00:00Z' },
  { id: 2, name: '2025-B', year: 2025, students: 58, sections: 2, startDate: '2025-01-15T00:00:00Z' },
  { id: 3, name: '2024-A', year: 2024, students: 71, sections: 4, startDate: '2024-01-20T00:00:00Z' },
]

export const MOCK_SECTIONS = [
  { id: 1, name: 'CS301-A', batch: '2025-A', teacher: 'Dr. Priya Singh',  students: 35, assignments: 5 },
  { id: 2, name: 'CS301-B', batch: '2025-A', teacher: 'Dr. Amit Kapoor',  students: 28, assignments: 5 },
  { id: 3, name: 'CS401-A', batch: '2025-B', teacher: 'Dr. Priya Singh',  students: 32, assignments: 3 },
]

export const MOCK_USERS = [
  { id: 1,  name: 'Super Admin',     email: 'admin@vlab.edu',   role: 'ADMIN',   batch: '—',      createdAt: '2024-01-01T00:00:00Z' },
  { id: 2,  name: 'Dr. Priya Singh', email: 'priya@cs.edu',     role: 'TEACHER', batch: '—',      createdAt: '2024-01-15T00:00:00Z' },
  { id: 3,  name: 'Dr. Amit Kapoor', email: 'amit@cs.edu',      role: 'TEACHER', batch: '—',      createdAt: '2024-01-20T00:00:00Z' },
  { id: 4,  name: 'Aarav Patel',     email: 'aarav@cs.edu',     role: 'STUDENT', batch: '2025-A', createdAt: '2024-02-10T00:00:00Z' },
  { id: 5,  name: 'Rohan Mehta',     email: 'rohan@cs.edu',     role: 'STUDENT', batch: '2025-A', createdAt: '2024-02-10T00:00:00Z' },
  { id: 6,  name: 'Aisha Khan',      email: 'aisha@cs.edu',     role: 'STUDENT', batch: '2025-A', createdAt: '2024-03-01T00:00:00Z' },
  { id: 7,  name: 'Sneha Gupta',     email: 'sneha@cs.edu',     role: 'STUDENT', batch: '2025-A', createdAt: '2024-03-05T00:00:00Z' },
  { id: 8,  name: 'Dev Shah',        email: 'dev@cs.edu',       role: 'STUDENT', batch: '2025-B', createdAt: '2024-03-10T00:00:00Z' },
]

// These are the assignments created by teachers, assigned to sections.
// Students in those sections (CS301-A, CS301-B) will see them.
export const MOCK_ASSIGNMENTS = [
  {
    id: 1,
    title: 'Linked List Reversal',
    description: 'Implement a function to reverse a singly linked list both iteratively and recursively. Return the head of the reversed list.\n\nConstraints:\n- 1 ≤ n ≤ 10,000 nodes\n- Node values are integers\n\nExample:\nInput:  1 → 2 → 3 → 4 → 5\nOutput: 5 → 4 → 3 → 2 → 1',
    language: 'Java',
    difficulty: 'EASY',
    sections: ['CS301-A', 'CS301-B'],
    status: 'PUBLISHED',
    maxScore: 100,
    dueDate: '2025-03-20T23:59:00Z',
    createdBy: 'Dr. Priya Singh',
    starterCode: `public class Solution {
    static class ListNode {
        int val;
        ListNode next;
        ListNode(int val) { this.val = val; }
    }

    // Iterative reversal
    public ListNode reverseIterative(ListNode head) {
        // Your code here
        return null;
    }

    // Recursive reversal
    public ListNode reverseRecursive(ListNode head) {
        // Your code here
        return null;
    }

    public static void main(String[] args) {
        // Test your solution
    }
}`,
  },
  {
    id: 2,
    title: 'Binary Search Tree Operations',
    description: 'Implement a Binary Search Tree (BST) supporting insert, search, delete, and in-order traversal.\n\nOperations required:\n- insert(value): insert a node\n- search(value): return true/false\n- delete(value): remove node correctly\n- inorder(): return sorted list\n\nConstraints:\n- Values are unique integers\n- Tree may be empty initially',
    language: 'Python',
    difficulty: 'MEDIUM',
    sections: ['CS301-A', 'CS301-B'],
    status: 'PUBLISHED',
    maxScore: 100,
    dueDate: '2025-03-25T23:59:00Z',
    createdBy: 'Dr. Priya Singh',
    starterCode: `class Node:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None

class BST:
    def __init__(self):
        self.root = None

    def insert(self, val):
        # Your code here
        pass

    def search(self, val):
        # Your code here
        pass

    def delete(self, val):
        # Your code here
        pass

    def inorder(self):
        # Return sorted list
        pass

# Test
bst = BST()
for v in [5, 3, 7, 1, 4, 6, 8]:
    bst.insert(v)
print(bst.inorder())  # [1, 3, 4, 5, 6, 7, 8]
`,
  },
  {
    id: 3,
    title: 'Graph BFS / DFS Traversal',
    description: 'Given an undirected graph, implement BFS and DFS traversal starting from node 0.\n\nInput format:\nFirst line: n m (nodes, edges)\nNext m lines: u v (edge between u and v)\n\nOutput:\nBFS: <space separated nodes>\nDFS: <space separated nodes>\n\nConstraints:\n- 1 ≤ n ≤ 1000\n- 0 ≤ m ≤ 5000',
    language: 'Python',
    difficulty: 'HARD',
    sections: ['CS301-A'],
    status: 'PUBLISHED',
    maxScore: 100,
    dueDate: '2025-04-01T23:59:00Z',
    createdBy: 'Dr. Priya Singh',
    starterCode: `from collections import deque

def bfs(graph, start, n):
    visited = []
    # Your BFS here
    return visited

def dfs(graph, start, visited=None):
    if visited is None:
        visited = []
    # Your DFS here
    return visited

n, m = map(int, input().split())
graph = [[] for _ in range(n)]
for _ in range(m):
    u, v = map(int, input().split())
    graph[u].append(v)
    graph[v].append(u)

print("BFS:", ' '.join(map(str, bfs(graph, 0, n))))
print("DFS:", ' '.join(map(str, dfs(graph, 0))))
`,
  },
  {
    id: 4,
    title: 'Merge Sort Implementation',
    description: 'Implement the Merge Sort algorithm. Your solution must run in O(n log n) time.\n\nInput: Array of integers on a single line\nOutput: Sorted array on a single line\n\nExample:\nInput:  38 27 43 3 9 82 10\nOutput: 3 9 10 27 38 43 82',
    language: 'Python',
    difficulty: 'EASY',
    sections: ['CS301-A', 'CS301-B'],
    status: 'PUBLISHED',
    maxScore: 100,
    dueDate: '2025-04-05T23:59:00Z',
    createdBy: 'Dr. Amit Kapoor',
    starterCode: `def merge_sort(arr):
    # Your code here
    return arr

def merge(left, right):
    # Your code here
    pass

arr = list(map(int, input().split()))
result = merge_sort(arr)
print(' '.join(map(str, result)))
`,
  },
  {
    id: 5,
    title: 'Hash Table from Scratch',
    description: 'Build a hash table with separate chaining for collision resolution.\n\nImplement:\n- put(key, value)\n- get(key) → value or -1\n- remove(key)\n- load_factor() → float\n\nUse a table of size 16 initially. Double when load factor > 0.75.',
    language: 'C++',
    difficulty: 'MEDIUM',
    sections: ['CS401-A'],
    status: 'PUBLISHED',
    maxScore: 100,
    dueDate: '2025-04-10T23:59:00Z',
    createdBy: 'Dr. Priya Singh',
    starterCode: `#include <bits/stdc++.h>
using namespace std;

class HashTable {
    // Your implementation here
public:
    void put(int key, int value) {}
    int get(int key) { return -1; }
    void remove(int key) {}
    float loadFactor() { return 0.0f; }
};

int main() {
    HashTable ht;
    // Test your implementation
    return 0;
}
`,
  },
  {
    id: 6,
    title: 'Dynamic Programming: Knapsack',
    description: 'Solve the 0/1 Knapsack problem using dynamic programming.\n\nGiven n items each with weight[i] and value[i], and a knapsack of capacity W, find the maximum value you can carry.\n\nInput:\nLine 1: n W\nLine 2: weights (space separated)\nLine 3: values (space separated)\n\nOutput: Maximum value integer',
    language: 'Python',
    difficulty: 'HARD',
    sections: ['CS301-A'],
    status: 'DRAFT',
    maxScore: 100,
    dueDate: '2025-04-15T23:59:00Z',
    createdBy: 'Dr. Priya Singh',
    starterCode: `def knapsack(weights, values, capacity):
    n = len(weights)
    # Build DP table
    dp = [[0] * (capacity + 1) for _ in range(n + 1)]
    # Your code here
    return dp[n][capacity]

n, W = map(int, input().split())
weights = list(map(int, input().split()))
values  = list(map(int, input().split()))
print(knapsack(weights, values, W))
`,
  },
]

// Submissions from the demo student (student@vlab.edu = Aarav Patel, section CS301-A)
export const MOCK_SUBMISSIONS = [
  {
    id: 1,
    assignmentId: 1,
    assignment: 'Linked List Reversal',
    studentName: 'Aarav Patel',
    section: 'CS301-A',
    language: 'Java',
    submittedAt: '2025-03-15T14:30:00Z',
    status: 'GRADED',
    score: 95,
    maxScore: 100,
    feedback: 'Excellent implementation! Both iterative and recursive solutions are clean and correct.',
    attempts: 2,
  },
  {
    id: 2,
    assignmentId: 4,
    assignment: 'Merge Sort Implementation',
    studentName: 'Aarav Patel',
    section: 'CS301-A',
    language: 'Python',
    submittedAt: '2025-03-20T09:15:00Z',
    status: 'GRADED',
    score: 82,
    maxScore: 100,
    feedback: 'Good implementation. Watch for base case when array length is 1.',
    attempts: 1,
  },
  {
    id: 3,
    assignmentId: 2,
    assignment: 'Binary Search Tree Operations',
    studentName: 'Aarav Patel',
    section: 'CS301-A',
    language: 'Python',
    submittedAt: '2025-03-24T16:40:00Z',
    status: 'SUBMITTED',
    score: null,
    maxScore: 100,
    feedback: null,
    attempts: 3,
  },
]

// Teacher-side: all submissions across all students
export const MOCK_ALL_SUBMISSIONS = [
  { id: 1,  assignmentId: 1, assignment: 'Linked List Reversal',        student: 'Aarav Patel',  section: 'CS301-A', language: 'Java',   submittedAt: '2025-03-15T14:30:00Z', status: 'GRADED',    score: 95  },
  { id: 2,  assignmentId: 1, assignment: 'Linked List Reversal',        student: 'Rohan Mehta',  section: 'CS301-A', language: 'Java',   submittedAt: '2025-03-15T11:00:00Z', status: 'GRADED',    score: 88  },
  { id: 3,  assignmentId: 1, assignment: 'Linked List Reversal',        student: 'Aisha Khan',   section: 'CS301-B', language: 'Python', submittedAt: '2025-03-16T09:20:00Z', status: 'GRADED',    score: 76  },
  { id: 4,  assignmentId: 2, assignment: 'Binary Search Tree',          student: 'Aarav Patel',  section: 'CS301-A', language: 'Python', submittedAt: '2025-03-24T16:40:00Z', status: 'SUBMITTED', score: null },
  { id: 5,  assignmentId: 2, assignment: 'Binary Search Tree',          student: 'Rohan Mehta',  section: 'CS301-A', language: 'Python', submittedAt: '2025-03-23T10:00:00Z', status: 'GRADED',    score: 91  },
  { id: 6,  assignmentId: 3, assignment: 'Graph BFS / DFS Traversal',   student: 'Aarav Patel',  section: 'CS301-A', language: 'Python', submittedAt: '2025-03-28T18:00:00Z', status: 'SUBMITTED', score: null },
  { id: 7,  assignmentId: 4, assignment: 'Merge Sort',                  student: 'Aarav Patel',  section: 'CS301-A', language: 'Python', submittedAt: '2025-03-20T09:15:00Z', status: 'GRADED',    score: 82  },
  { id: 8,  assignmentId: 4, assignment: 'Merge Sort',                  student: 'Sneha Gupta',  section: 'CS301-A', language: 'Python', submittedAt: '2025-03-21T14:00:00Z', status: 'GRADED',    score: 79  },
  { id: 9,  assignmentId: 5, assignment: 'Hash Table from Scratch',     student: 'Dev Shah',     section: 'CS401-A', language: 'C++',    submittedAt: '2025-04-02T11:30:00Z', status: 'SUBMITTED', score: null },
]

// ─── Derived helpers ──────────────────────────────────────────────────────────

// Assignments visible to a student in CS301-A (the demo student's section)
export const STUDENT_SECTION = 'CS301-A'

export const getStudentAssignments = () =>
  MOCK_ASSIGNMENTS.filter(
    a => a.status === 'PUBLISHED' && a.sections.includes(STUDENT_SECTION)
  ).map(a => {
    const submission = MOCK_SUBMISSIONS.find(s => s.assignmentId === a.id)
    return {
      ...a,
      submissionStatus: submission?.status ?? 'PENDING',
      score: submission?.score ?? null,
      submissionId: submission?.id ?? null,
    }
  })

// Admin dashboard stats
export const ADMIN_STATS = {
  totalUsers: MOCK_USERS.length,
  totalTeachers: MOCK_USERS.filter(u => u.role === 'TEACHER').length,
  totalStudents: MOCK_USERS.filter(u => u.role === 'STUDENT').length,
  totalBatches: MOCK_BATCHES.length,
  totalSections: MOCK_SECTIONS.length,
  totalLanguages: MOCK_LANGUAGES.filter(l => l.active).length,
}
