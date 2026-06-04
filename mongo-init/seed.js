// Runs automatically on first container start via /docker-entrypoint-initdb.d
// Uses the complaion_demo database (set via MONGO_INITDB_DATABASE)

db = db.getSiblingDB("complaion_demo");

// ── Employee ──────────────────────────────────────────────────────────────────
db.employees.insertOne({
  id: "usr_demo001",
  company_id: "cmp_demo",
  email: "demo@complaion.com",
  // demo1234
  hashed_password: "$2b$12$gsbgD/5s/RDZXGxRrCuJoejgh5MXI.6SlgWNiZPHDcDJuifHiXTsu",
  first_name: "Demo",
  last_name: "User",
});

// ── Interactive Course ────────────────────────────────────────────────────────
db.interactive_courses.insertOne({
  id: "icr_demo001",
  company_id: "cmp_demo",
  name: "GDPR Essentials for Employees",
  documents: ["doc_001", "doc_002", "doc_003"],
  quiz_required: true,
});

// ── Assigned Interactive Course ───────────────────────────────────────────────
// documents_read pre-filled → content already completed, quiz gate is active
db.assigned_interactive_courses.insertOne({
  id: "aic_demo001",
  company_id: "cmp_demo",
  interactive_course_id: "icr_demo001",
  employee_id: "usr_demo001",
  status: "pending",
  documents_read: {
    doc_001: "2025-01-01T10:00:00",
    doc_002: "2025-01-01T10:05:00",
    doc_003: "2025-01-01T10:10:00",
  },
  quiz_status: "not_started",
  quiz_attempts_count: 0,
  content_completed_date: "2025-01-01T10:10:00",
  completed_date: null,
});

// ── Quiz ──────────────────────────────────────────────────────────────────────
// company_id: null → default quiz for all companies
db.quizzes.insertOne({
  id: "qiz_demo001",
  course_id: "icr_demo001",
  company_id: null,
  questions_per_attempt: 3,
  passing_score: 0.6,
  max_attempts: 3,
  questions: [
    {
      id: "q_001",
      type: "multiple_choice",
      text: "What does GDPR stand for?",
      options: [
        { id: "q_001_a", text: "General Data Protection Regulation" },
        { id: "q_001_b", text: "Global Data Privacy Rules" },
        { id: "q_001_c", text: "General Document Processing Rights" },
        { id: "q_001_d", text: "General Data Processing Regulation" },
      ],
      correct_option_ids: ["q_001_a"],
    },
    {
      id: "q_002",
      type: "multiple_choice",
      text: "Which of the following is a principle of GDPR?",
      options: [
        { id: "q_002_a", text: "Data minimisation" },
        { id: "q_002_b", text: "Unlimited data retention" },
        { id: "q_002_c", text: "Mandatory data sharing with third parties" },
        { id: "q_002_d", text: "Data maximisation" },
      ],
      correct_option_ids: ["q_002_a"],
    },
    {
      id: "q_003",
      type: "multiple_choice",
      text: "Within how many hours must a personal data breach be reported to the supervisory authority?",
      options: [
        { id: "q_003_a", text: "24 hours" },
        { id: "q_003_b", text: "48 hours" },
        { id: "q_003_c", text: "72 hours" },
        { id: "q_003_d", text: "7 days" },
      ],
      correct_option_ids: ["q_003_c"],
    },
    {
      id: "q_004",
      type: "multiple_choice",
      text: "Which right allows individuals to obtain a copy of their personal data?",
      options: [
        { id: "q_004_a", text: "Right to erasure" },
        { id: "q_004_b", text: "Right of access" },
        { id: "q_004_c", text: "Right to rectification" },
        { id: "q_004_d", text: "Right to portability" },
      ],
      correct_option_ids: ["q_004_b"],
    },
    {
      id: "q_005",
      type: "multiple_choice",
      text: "What is a lawful basis for processing personal data under GDPR?",
      options: [
        { id: "q_005_a", text: "Business interest" },
        { id: "q_005_b", text: "Consent" },
        { id: "q_005_c", text: "Internal policy" },
        { id: "q_005_d", text: "Company revenue goals" },
      ],
      correct_option_ids: ["q_005_b"],
    },
  ],
});

print("✅ Seed complete: employee, course, assignment, and quiz inserted.");
