// Drop all collections so the script is safe to re-run on every deployment
db.employees.drop();
db.interactive_courses.drop();
db.assigned_interactive_courses.drop();
db.quizzes.drop();
db.quiz_attempts.drop();

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

// ── Interactive Courses ───────────────────────────────────────────────────────

db.interactive_courses.insertMany([
  {
    id: "icr_iso9001",
    company_id: "cmp_demo",
    name: "ISO 9001 – Quality Management Systems",
    documents: ["vid_iso9001"],
    quiz_required: true,
  },
  {
    id: "icr_iso45001",
    company_id: "cmp_demo",
    name: "ISO 45001 – Occupational Health & Safety",
    documents: ["vid_iso45001"],
    quiz_required: true,
  },
  {
    id: "icr_gdpr",
    company_id: "cmp_demo",
    name: "GDPR – General Data Protection Regulation",
    documents: ["vid_gdpr"],
    quiz_required: true,
  },
  {
    id: "icr_iso14001",
    company_id: "cmp_demo",
    name: "ISO 14001 – Environmental Management",
    documents: ["vid_iso14001"],
    quiz_required: false,
  },
  {
    id: "icr_iso27001",
    company_id: "cmp_demo",
    name: "ISO 27001 – Information Security Management",
    documents: ["vid_iso27001"],
    quiz_required: false,
  },
]);

// ── Assigned Interactive Courses ──────────────────────────────────────────────

db.assigned_interactive_courses.insertMany([
  // Course 1 – ISO 9001: fresh (TODO)
  {
    id: "aic_iso9001",
    company_id: "cmp_demo",
    interactive_course_id: "icr_iso9001",
    employee_id: "usr_demo001",
    status: "todo",
    documents_read: {},
    quiz_status: "not_started",
    quiz_attempts_count: 0,
    content_completed_date: null,
    completed_date: null,
    last_quiz_score: null,
  },
  // Course 2 – ISO 45001: content done, quiz EXHAUSTED
  {
    id: "aic_iso45001",
    company_id: "cmp_demo",
    interactive_course_id: "icr_iso45001",
    employee_id: "usr_demo001",
    status: "pending",
    documents_read: { vid_iso45001: "2026-05-01T09:00:00" },
    quiz_status: "exhausted",
    quiz_attempts_count: 3,
    content_completed_date: "2026-05-01T09:00:00",
    completed_date: null,
    last_quiz_score: 0.25,
  },
  // Course 3 – GDPR: fresh (TODO)
  {
    id: "aic_gdpr",
    company_id: "cmp_demo",
    interactive_course_id: "icr_gdpr",
    employee_id: "usr_demo001",
    status: "todo",
    documents_read: {},
    quiz_status: "not_started",
    quiz_attempts_count: 0,
    content_completed_date: null,
    completed_date: null,
    last_quiz_score: null,
  },
  // Course 4 – ISO 14001: DONE (no quiz)
  {
    id: "aic_iso14001",
    company_id: "cmp_demo",
    interactive_course_id: "icr_iso14001",
    employee_id: "usr_demo001",
    status: "done",
    documents_read: { vid_iso14001: "2026-05-10T14:30:00" },
    quiz_status: "not_started",
    quiz_attempts_count: 0,
    content_completed_date: "2026-05-10T14:30:00",
    completed_date: "2026-05-10T14:30:00",
    last_quiz_score: null,
  },
  // Course 5 – ISO 27001: fresh (TODO)
  {
    id: "aic_iso27001",
    company_id: "cmp_demo",
    interactive_course_id: "icr_iso27001",
    employee_id: "usr_demo001",
    status: "todo",
    documents_read: {},
    quiz_status: "not_started",
    quiz_attempts_count: 0,
    content_completed_date: null,
    completed_date: null,
    last_quiz_score: null,
  },
]);

// ── Quizzes ───────────────────────────────────────────────────────────────────

// Quiz 1: ISO 9001 – 3 questions per attempt, pool of 8
db.quizzes.insertOne({
  id: "qiz_iso9001",
  course_id: "icr_iso9001",
  company_id: null,
  questions_per_attempt: 3,
  passing_score: 0.67,
  max_attempts: 3,
  questions: [
    {
      id: "q9001_001",
      type: "multiple_choice",
      text: "What is the primary purpose of ISO 9001?",
      options: [
        { id: "q9001_001_a", text: "To certify individual employees" },
        { id: "q9001_001_b", text: "To provide a framework for a quality management system" },
        { id: "q9001_001_c", text: "To regulate product pricing" },
        { id: "q9001_001_d", text: "To manage environmental impact" },
      ],
      correct_option_ids: ["q9001_001_b"],
    },
    {
      id: "q9001_002",
      type: "multiple_choice",
      text: "Which principle is NOT one of the seven quality management principles in ISO 9001?",
      options: [
        { id: "q9001_002_a", text: "Customer focus" },
        { id: "q9001_002_b", text: "Leadership" },
        { id: "q9001_002_c", text: "Cost minimisation" },
        { id: "q9001_002_d", text: "Evidence-based decision making" },
      ],
      correct_option_ids: ["q9001_002_c"],
    },
    {
      id: "q9001_003",
      type: "multiple_choice",
      text: "In ISO 9001, what does the Plan-Do-Check-Act (PDCA) cycle support?",
      options: [
        { id: "q9001_003_a", text: "Financial auditing" },
        { id: "q9001_003_b", text: "Continual improvement of the quality management system" },
        { id: "q9001_003_c", text: "Employee performance reviews" },
        { id: "q9001_003_d", text: "Supply chain management only" },
      ],
      correct_option_ids: ["q9001_003_b"],
    },
    {
      id: "q9001_004",
      type: "multiple_choice",
      text: "Who is responsible for the quality management system under ISO 9001?",
      options: [
        { id: "q9001_004_a", text: "Only the quality department" },
        { id: "q9001_004_b", text: "External auditors" },
        { id: "q9001_004_c", text: "Top management" },
        { id: "q9001_004_d", text: "The ISO committee" },
      ],
      correct_option_ids: ["q9001_004_c"],
    },
    {
      id: "q9001_005",
      type: "multiple_choice",
      text: "What is a 'nonconformity' in the context of ISO 9001?",
      options: [
        { id: "q9001_005_a", text: "A customer complaint form" },
        { id: "q9001_005_b", text: "The failure to meet a requirement" },
        { id: "q9001_005_c", text: "An employee performance issue" },
        { id: "q9001_005_d", text: "A corrective action plan" },
      ],
      correct_option_ids: ["q9001_005_b"],
    },
    {
      id: "q9001_006",
      type: "multiple_choice",
      text: "How often must an organisation conduct internal audits under ISO 9001?",
      options: [
        { id: "q9001_006_a", text: "Every month" },
        { id: "q9001_006_b", text: "Only when a problem occurs" },
        { id: "q9001_006_c", text: "At planned intervals" },
        { id: "q9001_006_d", text: "Once every five years" },
      ],
      correct_option_ids: ["q9001_006_c"],
    },
    {
      id: "q9001_007",
      type: "multiple_choice",
      text: "What does 'risk-based thinking' mean in ISO 9001:2015?",
      options: [
        { id: "q9001_007_a", text: "Eliminating all business risks" },
        { id: "q9001_007_b", text: "Transferring risks to suppliers" },
        { id: "q9001_007_c", text: "Identifying and addressing risks and opportunities that could affect quality outcomes" },
        { id: "q9001_007_d", text: "Creating a separate risk management department" },
      ],
      correct_option_ids: ["q9001_007_c"],
    },
    {
      id: "q9001_008",
      type: "multiple_choice",
      text: "Which document is mandatory under ISO 9001:2015?",
      options: [
        { id: "q9001_008_a", text: "A quality manual" },
        { id: "q9001_008_b", text: "Documented information to support the operation of processes" },
        { id: "q9001_008_c", text: "A product catalogue" },
        { id: "q9001_008_d", text: "An organisational chart" },
      ],
      correct_option_ids: ["q9001_008_b"],
    },
  ],
});

// Quiz 2: ISO 45001 – 4 questions per attempt, pool of 8
db.quizzes.insertOne({
  id: "qiz_iso45001",
  course_id: "icr_iso45001",
  company_id: null,
  questions_per_attempt: 4,
  passing_score: 0.75,
  max_attempts: 3,
  questions: [
    {
      id: "q45001_001",
      type: "multiple_choice",
      text: "What is the main objective of ISO 45001?",
      options: [
        { id: "q45001_001_a", text: "To improve employee productivity" },
        { id: "q45001_001_b", text: "To provide a framework for managing occupational health and safety risks" },
        { id: "q45001_001_c", text: "To certify workplace equipment" },
        { id: "q45001_001_d", text: "To regulate working hours" },
      ],
      correct_option_ids: ["q45001_001_b"],
    },
    {
      id: "q45001_002",
      type: "multiple_choice",
      text: "Which standard did ISO 45001 replace?",
      options: [
        { id: "q45001_002_a", text: "ISO 14001:2015" },
        { id: "q45001_002_b", text: "OHSAS 18001" },
        { id: "q45001_002_c", text: "ISO 9001:2008" },
        { id: "q45001_002_d", text: "ISO 31000" },
      ],
      correct_option_ids: ["q45001_002_b"],
    },
    {
      id: "q45001_003",
      type: "multiple_choice",
      text: "Under ISO 45001, what is a 'hazard'?",
      options: [
        { id: "q45001_003_a", text: "An incident that has already caused harm" },
        { id: "q45001_003_b", text: "A source with potential to cause injury or ill health" },
        { id: "q45001_003_c", text: "A written safety procedure" },
        { id: "q45001_003_d", text: "A near-miss report" },
      ],
      correct_option_ids: ["q45001_003_b"],
    },
    {
      id: "q45001_004",
      type: "multiple_choice",
      text: "Worker participation in ISO 45001 is considered:",
      options: [
        { id: "q45001_004_a", text: "Optional and encouraged only at management discretion" },
        { id: "q45001_004_b", text: "A key requirement for an effective OH&S management system" },
        { id: "q45001_004_c", text: "Only necessary during audits" },
        { id: "q45001_004_d", text: "Limited to safety officers" },
      ],
      correct_option_ids: ["q45001_004_b"],
    },
    {
      id: "q45001_005",
      type: "multiple_choice",
      text: "What must an organisation do after an occupational incident under ISO 45001?",
      options: [
        { id: "q45001_005_a", text: "Only file an insurance claim" },
        { id: "q45001_005_b", text: "Investigate, determine root causes, and take corrective action" },
        { id: "q45001_005_c", text: "Dismiss the affected employee" },
        { id: "q45001_005_d", text: "Wait for the external auditor to review it" },
      ],
      correct_option_ids: ["q45001_005_b"],
    },
    {
      id: "q45001_006",
      type: "multiple_choice",
      text: "In the hierarchy of controls for OH&S risks, which is the most effective?",
      options: [
        { id: "q45001_006_a", text: "Personal protective equipment (PPE)" },
        { id: "q45001_006_b", text: "Administrative controls" },
        { id: "q45001_006_c", text: "Elimination of the hazard" },
        { id: "q45001_006_d", text: "Warning signs" },
      ],
      correct_option_ids: ["q45001_006_c"],
    },
    {
      id: "q45001_007",
      type: "multiple_choice",
      text: "Top management commitment in ISO 45001 means:",
      options: [
        { id: "q45001_007_a", text: "Delegating all OH&S responsibilities to the HR department" },
        { id: "q45001_007_b", text: "Signing an annual safety pledge" },
        { id: "q45001_007_c", text: "Taking accountability for the effectiveness of the OH&S management system" },
        { id: "q45001_007_d", text: "Attending one safety meeting per year" },
      ],
      correct_option_ids: ["q45001_007_c"],
    },
    {
      id: "q45001_008",
      type: "multiple_choice",
      text: "What is the purpose of an OH&S audit under ISO 45001?",
      options: [
        { id: "q45001_008_a", text: "To punish non-compliant employees" },
        { id: "q45001_008_b", text: "To assess whether the OH&S management system conforms to requirements and is effectively implemented" },
        { id: "q45001_008_c", text: "To review financial performance" },
        { id: "q45001_008_d", text: "To update the company's insurance policy" },
      ],
      correct_option_ids: ["q45001_008_b"],
    },
  ],
});

// Quiz 3: GDPR – 3 questions per attempt, pool of 5
db.quizzes.insertOne({
  id: "qiz_gdpr",
  course_id: "icr_gdpr",
  company_id: null,
  questions_per_attempt: 3,
  passing_score: 0.67,
  max_attempts: 3,
  questions: [
    {
      id: "qgdpr_001",
      type: "multiple_choice",
      text: "What does GDPR stand for?",
      options: [
        { id: "qgdpr_001_a", text: "General Data Protection Regulation" },
        { id: "qgdpr_001_b", text: "Global Data Privacy Rules" },
        { id: "qgdpr_001_c", text: "General Document Processing Rights" },
        { id: "qgdpr_001_d", text: "General Data Processing Regulation" },
      ],
      correct_option_ids: ["qgdpr_001_a"],
    },
    {
      id: "qgdpr_002",
      type: "multiple_choice",
      text: "Which of the following is a principle of GDPR?",
      options: [
        { id: "qgdpr_002_a", text: "Data minimisation" },
        { id: "qgdpr_002_b", text: "Unlimited data retention" },
        { id: "qgdpr_002_c", text: "Mandatory data sharing with third parties" },
        { id: "qgdpr_002_d", text: "Data maximisation" },
      ],
      correct_option_ids: ["qgdpr_002_a"],
    },
    {
      id: "qgdpr_003",
      type: "multiple_choice",
      text: "Within how many hours must a personal data breach be reported to the supervisory authority?",
      options: [
        { id: "qgdpr_003_a", text: "24 hours" },
        { id: "qgdpr_003_b", text: "48 hours" },
        { id: "qgdpr_003_c", text: "72 hours" },
        { id: "qgdpr_003_d", text: "7 days" },
      ],
      correct_option_ids: ["qgdpr_003_c"],
    },
    {
      id: "qgdpr_004",
      type: "multiple_choice",
      text: "Which right allows individuals to obtain a copy of their personal data?",
      options: [
        { id: "qgdpr_004_a", text: "Right to erasure" },
        { id: "qgdpr_004_b", text: "Right of access" },
        { id: "qgdpr_004_c", text: "Right to rectification" },
        { id: "qgdpr_004_d", text: "Right to portability" },
      ],
      correct_option_ids: ["qgdpr_004_b"],
    },
    {
      id: "qgdpr_005",
      type: "multiple_choice",
      text: "What is a lawful basis for processing personal data under GDPR?",
      options: [
        { id: "qgdpr_005_a", text: "Business interest" },
        { id: "qgdpr_005_b", text: "Consent" },
        { id: "qgdpr_005_c", text: "Internal policy" },
        { id: "qgdpr_005_d", text: "Company revenue goals" },
      ],
      correct_option_ids: ["qgdpr_005_b"],
    },
  ],
});

print("Seed complete: 5 courses, 3 quizzes, 1 completed course, 1 exhausted course inserted.");
