import { 
  Notice, 
  CollegeEvent, 
  PlacementJob, 
  CollegeClass, 
  Assignment, 
  FacultyMember, 
  DepartmentItem, 
  LibraryBook,
  UserProfile,
  CollegeSubject,
  Scholarship
} from './types';

export const INITIAL_USER: UserProfile = {
  id: "student-421",
  name: "PANDA AI",
  email: "anishchauhan1678@gmail.com",
  role: "student",
  rollNo: "2024CSB1098",
  department: "Computer Science & Engineering",
  semester: 6,
  gpa: 9.24,
  attendanceRate: 88.5,
  avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"
};

export const INITIAL_CLASSES: CollegeClass[] = [
  // --- Computer Science & Engineering (CSE) ---
  {
    id: "cls-cse-1",
    subject: "Distributed Systems & Cloud Architecture",
    faculty: "Prof. Alan Turing Jr.",
    time: "10:00 AM - 11:30 AM",
    room: "Lecture Hall 102",
    duration: "1.5 hrs",
    status: "ongoing",
    department: "Computer Science & Engineering",
    semester: 6
  },
  {
    id: "cls-cse-2",
    subject: "Compiler Design & Automata Theory",
    faculty: "Dr. Grace Hopper II",
    time: "11:45 AM - 01:15 PM",
    room: "Seminar Room A",
    duration: "1.5 hrs",
    status: "upcoming",
    department: "Computer Science & Engineering",
    semester: 6
  },
  {
    id: "cls-cse-3",
    subject: "Cybersecurity & Blockchain Cryptography",
    faculty: "Prof. Satoshi Nakamura",
    time: "02:00 PM - 03:30 PM",
    room: "Lab 1, Block-D",
    duration: "1.5 hrs",
    status: "upcoming",
    department: "Computer Science & Engineering",
    semester: 6
  },
  {
    id: "cls-cse-4",
    subject: "Computer Networks & Protocol Design",
    faculty: "Prof. Linus Torvalds III",
    time: "03:45 PM - 05:15 PM",
    room: "Lab 2, Block-C",
    duration: "1.5 hrs",
    status: "upcoming",
    department: "Computer Science & Engineering",
    semester: 5
  },

  // --- Artificial Intelligence & Data Science (AIDS) ---
  {
    id: "cls-aids-1",
    subject: "Artificial Intelligence & Neural Networks",
    faculty: "Dr. Evelyn Vance",
    time: "10:00 AM - 11:30 AM",
    room: "Lab 4, Block-C",
    duration: "1.5 hrs",
    status: "ongoing",
    department: "Artificial Intelligence & Data Science",
    semester: 6
  },
  {
    id: "cls-aids-2",
    subject: "Natural Language Processing",
    faculty: "Prof. Alan Turing Jr.",
    time: "11:45 AM - 01:15 PM",
    room: "Lab 3, Block-A",
    duration: "1.5 hrs",
    status: "upcoming",
    department: "Artificial Intelligence & Data Science",
    semester: 6
  },
  {
    id: "cls-aids-3",
    subject: "Big Data Analytics & Pipeline Engineering",
    faculty: "Dr. Grace Hopper II",
    time: "02:00 PM - 03:30 PM",
    room: "Lecture Hall 204",
    duration: "1.5 hrs",
    status: "upcoming",
    department: "Artificial Intelligence & Data Science",
    semester: 5
  },
  {
    id: "cls-aids-4",
    subject: "Reinforcement Learning & Agent Systems",
    faculty: "Dr. Evelyn Vance",
    time: "03:45 PM - 05:15 PM",
    room: "Seminar Room B",
    duration: "1.5 hrs",
    status: "upcoming",
    department: "Artificial Intelligence & Data Science",
    semester: 6
  },

  // --- Electronics & Communication Engineering (ECE) ---
  {
    id: "cls-ece-1",
    subject: "Microprocessors & Embedded Controllers",
    faculty: "Dr. Nikola Tesla III",
    time: "10:00 AM - 11:30 AM",
    room: "Lab 5, Block-B",
    duration: "1.5 hrs",
    status: "ongoing",
    department: "Electronics & Communication Engineering",
    semester: 5
  },
  {
    id: "cls-ece-2",
    subject: "Signal Processing & Wave Propagation",
    faculty: "Prof. Sarah Connor",
    time: "11:45 AM - 01:15 PM",
    room: "Lecture Hall 105",
    duration: "1.5 hrs",
    status: "upcoming",
    department: "Electronics & Communication Engineering",
    semester: 6
  },
  {
    id: "cls-ece-3",
    subject: "VLSI Circuit Design & Fabrication",
    faculty: "Dr. Nikola Tesla III",
    time: "02:00 PM - 03:30 PM",
    room: "Cleanroom 2, Block-D",
    duration: "1.5 hrs",
    status: "upcoming",
    department: "Electronics & Communication Engineering",
    semester: 6
  },
  {
    id: "cls-ece-4",
    subject: "Satellite & Wireless Communications",
    faculty: "Prof. Alan Turing Jr.",
    time: "03:45 PM - 05:15 PM",
    room: "Lecture Hall 103",
    duration: "1.5 hrs",
    status: "upcoming",
    department: "Electronics & Communication Engineering",
    semester: 7
  },

  // --- Robotics & Automation (ROBO) ---
  {
    id: "cls-robo-1",
    subject: "Robot Kinematics & Spatial Dynamics",
    faculty: "Dr. Charles Xavier Jr.",
    time: "10:00 AM - 11:30 AM",
    room: "Robotics Arena Lab",
    duration: "1.5 hrs",
    status: "ongoing",
    department: "Robotics & Automation",
    semester: 6
  },
  {
    id: "cls-robo-2",
    subject: "Industrial Automation & PLC Systems",
    faculty: "Prof. Sarah Connor",
    time: "11:45 AM - 01:15 PM",
    room: "Lab 6, Block-A",
    duration: "1.5 hrs",
    status: "upcoming",
    department: "Robotics & Automation",
    semester: 6
  },
  {
    id: "cls-robo-3",
    subject: "Computer Vision for Autonomous Vehicles",
    faculty: "Dr. Evelyn Vance",
    time: "02:00 PM - 03:30 PM",
    room: "Lab 4, Block-C",
    duration: "1.5 hrs",
    status: "upcoming",
    department: "Robotics & Automation",
    semester: 7
  },
  {
    id: "cls-robo-4",
    subject: "Control Systems & Sensor Fusion",
    faculty: "Dr. Charles Xavier Jr.",
    time: "03:45 PM - 05:15 PM",
    room: "Lecture Hall 110",
    duration: "1.5 hrs",
    status: "upcoming",
    department: "Robotics & Automation",
    semester: 5
  }
];

export const INITIAL_NOTICES: Notice[] = [
  {
    id: "not-01",
    title: "Google AI Research Lab Placement Drive",
    category: "placement",
    content: "Google is hiring for AI/ML Research Intern roles starting tomorrow. Package of 24 LPA. Apply on the placement portal before tonight 11:59 PM. Open to CSE, ECE and Data Science students with CGPA > 8.5.",
    date: "July 11, 2026",
    author: "T&P Cell Office",
    isUrgent: true
  },
  {
    id: "not-02",
    title: "Mid-Semester Examinations Schedule Released",
    category: "exam",
    content: "The mid-semester examinations for 6th and 8th semester will commence from July 20, 2026. The detailed subject-wise schedule has been published on the Academic Calendar tab. Ensure all dues are cleared by July 15.",
    date: "July 10, 2026",
    author: "Controller of Exams",
    isUrgent: true
  },
  {
    id: "not-03",
    title: "College Research Grant Funding - Round 2",
    category: "academic",
    content: "Applications are invited for the student-led IoT and Robotics Research Grant. Funding up to $5,000 per team will be awarded to top proposals. Submit draft abstract by next Friday.",
    date: "July 08, 2026",
    author: "Dean Research & Development",
    isUrgent: false
  },
  {
    id: "not-04",
    title: "Campus Smart Parking Network System Offline",
    category: "general",
    content: "The South Campus parking lot sensor upgrade is underway. Please use North Gate parking slots. Sensor connectivity expected to restore by tomorrow morning.",
    date: "July 07, 2026",
    author: "Facilities Management",
    isUrgent: false
  }
];

export const INITIAL_ASSIGNMENTS: Assignment[] = [
  {
    id: "asg-01",
    title: "Transformer Model Implementation from Scratch",
    subject: "Artificial Intelligence",
    dueDate: "July 14, 2026",
    status: "pending",
    totalPoints: 100
  },
  {
    id: "asg-02",
    title: "Consensus Algorithms Comparison Report",
    subject: "Distributed Systems",
    dueDate: "July 18, 2026",
    status: "pending",
    totalPoints: 50
  },
  {
    id: "asg-03",
    title: "Lexical Analyzer and Parser Generator",
    subject: "Compiler Design",
    dueDate: "July 12, 2026",
    status: "submitted",
    totalPoints: 80
  },
  {
    id: "asg-04",
    title: "Zero Knowledge Proofs Experiment",
    subject: "Cybersecurity",
    dueDate: "July 05, 2026",
    status: "graded",
    score: "95/100",
    totalPoints: 100
  }
];

export const INITIAL_EVENTS: CollegeEvent[] = [
  {
    id: "evt-01",
    title: "Nebula Hackathon 2026",
    category: "hackathon",
    description: "Our annual flagship 36-hour hackathon themed around decentralized AI, spatial computing, and zero-gravity UI architectures. Prize pool of $10,000 sponsored by tech pioneers.",
    date: "July 15-16, 2026",
    location: "Auditorium Main Hall",
    attendeesCount: 420
  },
  {
    id: "evt-02",
    title: "Future of Quantum Networks Symposium",
    category: "seminar",
    description: "Distinguished guest lectures from IBM Quantum Research & Nobel laureates. Covers quantum key distribution and silicon photonics networking breakthroughs.",
    date: "July 19, 2026",
    location: "Block B Conference Hall",
    attendeesCount: 180
  },
  {
    id: "evt-03",
    title: "Cosmic Beats Electronic Music Fest",
    category: "cultural",
    description: "An evening featuring modular synthesizer jams, algorithmic visual arts projections, and dynamic lasers.",
    date: "July 24, 2026",
    location: "Open Air Amphitheatre",
    attendeesCount: 850
  },
  {
    id: "evt-04",
    title: "Inter-Department Robotics Soccer Cup",
    category: "sports",
    description: "Autonomous micro-robot soccer teams square off in a high-octane programming tournament.",
    date: "July 28, 2026",
    location: "Robotics Arena Lab",
    attendeesCount: 310
  }
];

export const INITIAL_PLACEMENTS: PlacementJob[] = [
  {
    id: "job-01",
    company: "NVIDIA Corp",
    position: "AI Infrastructure Architect",
    ctc: "36 LPA",
    eligibility: "CSE, ECE, AI. Min CGPA 9.0",
    deadline: "July 13, 2026",
    status: "open",
    category: "tech"
  },
  {
    id: "job-02",
    company: "OpenAI",
    position: "Model Alignment Scientist",
    ctc: "48 LPA",
    eligibility: "All Tech branches. Open projects count.",
    deadline: "July 15, 2026",
    status: "open",
    category: "tech"
  },
  {
    id: "job-03",
    company: "Tesla Inc",
    position: "Autonomous Navigation Planner",
    ctc: "28 LPA",
    eligibility: "CSE, Robotics, Mech. CGPA > 8.0",
    deadline: "July 18, 2026",
    status: "open",
    category: "tech"
  },
  {
    id: "job-04",
    company: "Stripe",
    position: "Fintech Platform Engineer",
    ctc: "22 LPA",
    eligibility: "Any degree, outstanding coding portfolio.",
    deadline: "July 08, 2026",
    status: "closed",
    category: "tech"
  }
];

export const INITIAL_FACULTY: FacultyMember[] = [
  {
    id: "fac-01",
    name: "Dr. Evelyn Vance",
    designation: "Professor & Head",
    department: "Computer Science & Engineering",
    email: "e.vance@cyber-tech.edu",
    specialization: "AI, Generative Models & Deep Learning",
    imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200"
  },
  {
    id: "fac-02",
    name: "Prof. Alan Turing Jr.",
    designation: "Associate Professor",
    department: "Computer Science & Engineering",
    email: "a.turing@cyber-tech.edu",
    specialization: "Decentralized Networks & Distributed Systems",
    imageUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=200"
  },
  {
    id: "fac-03",
    name: "Dr. Grace Hopper II",
    designation: "Assistant Professor",
    department: "Information Technology",
    email: "g.hopper@cyber-tech.edu",
    specialization: "Compilers, Programming Language Theory",
    imageUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200"
  },
  {
    id: "fac-04",
    name: "Prof. Linus Torvalds III",
    designation: "Visiting Specialist",
    department: "Computer Science & Engineering",
    email: "l.torvalds@cyber-tech.edu",
    specialization: "Operating System Kernels & Linux Architecture",
    imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200"
  }
];

export const INITIAL_DEPARTMENTS: DepartmentItem[] = [
  {
    id: "dept-01",
    name: "Computer Science & Engineering",
    code: "CSE",
    hod: "Dr. Evelyn Vance",
    studentsCount: 680,
    labsCount: 12
  },
  {
    id: "dept-02",
    name: "Artificial Intelligence & Data Science",
    code: "AIDS",
    hod: "Prof. Sarah Connor",
    studentsCount: 320,
    labsCount: 6
  },
  {
    id: "dept-03",
    name: "Electronics & Communication Engineering",
    code: "ECE",
    hod: "Dr. Nikola Tesla III",
    studentsCount: 450,
    labsCount: 8
  },
  {
    id: "dept-04",
    name: "Robotics & Automation",
    code: "ROBO",
    hod: "Dr. Charles Xavier Jr.",
    studentsCount: 240,
    labsCount: 5
  }
];

export const INITIAL_LIBRARY: LibraryBook[] = [
  {
    id: "bk-01",
    title: "Deep Learning Architectures",
    author: "Ian Goodfellow et al.",
    dueDate: "July 15, 2026",
    status: "borrowed"
  },
  {
    id: "bk-02",
    title: "Introduction to Algorithms (4th Edition)",
    author: "Cormen, Leiserson, Rivest, Stein",
    dueDate: "July 24, 2026",
    status: "borrowed"
  },
  {
    id: "bk-03",
    title: "Designing Data-Intensive Applications",
    author: "Martin Kleppmann",
    status: "available"
  },
  {
    id: "bk-04",
    title: "Computer Networks: A Systems Approach",
    author: "Larry Peterson & Bruce Davie",
    status: "available"
  }
];

export const MOCK_FAQS = [
  {
    q: "How can I apply for the Google AI research placement internship?",
    a: "Eligible students (CSE, ECE, AIDS branches with CGPA above 8.5) can apply directly through the Placement portal under 'Placements' menu, or click the Google Notice in your Dashboard to auto-fill the details with PANDA AI assistance."
  },
  {
    q: "What is the passing criteria for exams?",
    a: "To pass a course, you need a minimum of 40% aggregate in continuous assessments (mid-semester exams, quizzes, assignments) and the final end-semester examination combined, with a minimum attendance requirement of 75%."
  },
  {
    q: "How can I secure research funding for a project?",
    a: "Submit a comprehensive proposal including abstract, system design, hardware bill-of-materials, and faculty advisor approval to the Dean of R&D. Review rounds occur quarterly, with funding up to $5,000."
  },
  {
    q: "Where is the Robotics Soccer Cup being held?",
    a: "The Robotics Soccer Cup takes place on July 28, 2026, in the Robotics Arena Lab (Building C, ground floor). Students and faculty can register team entries through the Events page."
  }
];

export const INITIAL_SUBJECTS: CollegeSubject[] = [
  // CSE Semesters
  { id: "sub-cse-s1-1", name: "Programming in C", code: "CS-101", department: "Computer Science & Engineering", semester: 1 },
  { id: "sub-cse-s1-2", name: "Engineering Physics", code: "PH-101", department: "Computer Science & Engineering", semester: 1 },
  { id: "sub-cse-s2-1", name: "Object Oriented Programming using C++", code: "CS-201", department: "Computer Science & Engineering", semester: 2 },
  { id: "sub-cse-s2-2", name: "Digital Logic Design", code: "CS-202", department: "Computer Science & Engineering", semester: 2 },
  { id: "sub-cse-s3-1", name: "Data Structures & Algorithms (DSA)", code: "CS-301", department: "Computer Science & Engineering", semester: 3 },
  { id: "sub-cse-s3-2", name: "Discrete Mathematics", code: "CS-302", department: "Computer Science & Engineering", semester: 3 },
  { id: "sub-cse-s4-1", name: "Operating Systems", code: "CS-401", department: "Computer Science & Engineering", semester: 4 },
  { id: "sub-cse-s4-2", name: "Database Management Systems (DBMS)", code: "CS-402", department: "Computer Science & Engineering", semester: 4 },
  { id: "sub-cse-s5-1", name: "Computer Networks", code: "CS-501", department: "Computer Science & Engineering", semester: 5 },
  { id: "sub-cse-s5-2", name: "Software Engineering", code: "CS-502", department: "Computer Science & Engineering", semester: 5 },
  { id: "sub-cse-s6-1", name: "Distributed Systems & Cloud Architecture", code: "CS-601", department: "Computer Science & Engineering", semester: 6 },
  { id: "sub-cse-s6-2", name: "Compiler Design & Automata Theory", code: "CS-602", department: "Computer Science & Engineering", semester: 6 },
  { id: "sub-cse-s6-3", name: "Python Programming", code: "CS-603", department: "Computer Science & Engineering", semester: 6 },
  { id: "sub-cse-s7-1", name: "Cryptography & Network Security", code: "CS-701", department: "Computer Science & Engineering", semester: 7 },
  { id: "sub-cse-s8-1", name: "Cloud Computing & Devops", code: "CS-801", department: "Computer Science & Engineering", semester: 8 },

  // AIDS Semesters
  { id: "sub-aids-s1-1", name: "Introduction to Python", code: "AI-101", department: "Artificial Intelligence & Data Science", semester: 1 },
  { id: "sub-aids-s3-1", name: "Mathematics for AI", code: "AI-301", department: "Artificial Intelligence & Data Science", semester: 3 },
  { id: "sub-aids-s5-1", name: "Machine Learning Foundations", code: "AI-501", department: "Artificial Intelligence & Data Science", semester: 5 },
  { id: "sub-aids-s6-1", name: "Artificial Intelligence & Neural Networks", code: "AI-601", department: "Artificial Intelligence & Data Science", semester: 6 },
  { id: "sub-aids-s6-2", name: "Natural Language Processing", code: "AI-602", department: "Artificial Intelligence & Data Science", semester: 6 },
  { id: "sub-aids-s7-1", name: "Deep Learning & Vision", code: "AI-701", department: "Artificial Intelligence & Data Science", semester: 7 },

  // ECE Semesters
  { id: "sub-ece-s1-1", name: "Basic Electronics", code: "EC-101", department: "Electronics & Communication Engineering", semester: 1 },
  { id: "sub-ece-s3-1", name: "Analog Circuits", code: "EC-301", department: "Electronics & Communication Engineering", semester: 3 },
  { id: "sub-ece-s5-1", name: "Microprocessors & Embedded Controllers", code: "EC-501", department: "Electronics & Communication Engineering", semester: 5 },
  { id: "sub-ece-s6-1", name: "VLSI Circuit Design & Fabrication", code: "EC-601", department: "Electronics & Communication Engineering", semester: 6 },
  { id: "sub-ece-s6-2", name: "Signal Processing & Wave Propagation", code: "EC-602", department: "Electronics & Communication Engineering", semester: 6 },
  { id: "sub-ece-s7-1", name: "Satellite & Wireless Communications", code: "EC-701", department: "Electronics & Communication Engineering", semester: 7 },

  // ROBO Semesters
  { id: "sub-robo-s1-1", name: "Basic Robotics & Sensors", code: "RB-101", department: "Robotics & Automation", semester: 1 },
  { id: "sub-robo-s3-1", name: "Actuators & Drive Systems", code: "RB-301", department: "Robotics & Automation", semester: 3 },
  { id: "sub-robo-s5-1", name: "Control Systems & Sensor Fusion", code: "RB-501", department: "Robotics & Automation", semester: 5 },
  { id: "sub-robo-s6-1", name: "Robot Kinematics & Spatial Dynamics", code: "RB-601", department: "Robotics & Automation", semester: 6 },
  { id: "sub-robo-s6-2", name: "Industrial Automation & PLC Systems", code: "RB-602", department: "Robotics & Automation", semester: 6 },
  { id: "sub-robo-s7-1", name: "Computer Vision for Autonomous Vehicles", code: "RB-701", department: "Robotics & Automation", semester: 7 }
];

export const INITIAL_SCHOLARSHIPS: Scholarship[] = [
  {
    id: "sch-1",
    title: "PANDA Merit-cum-Means Scholarship",
    provider: "PANDA AI Foundation",
    amount: "₹75,000 / Semester",
    startingDate: "2026-07-15",
    deadline: "2026-08-30",
    requiredDocuments: [
      "Income Certificate (issued by competent authority)",
      "Previous Semester Marksheet / CGPA Transcript",
      "College ID Card copy",
      "Aadhaar Card copy"
    ],
    description: "Designed to support talented students with exceptional academic performance who require financial aid. Helps cover tuition, lab fees, and reading resources.",
    eligibility: "CGPA > 8.5, Annual Family Income < 6 LPA. Applicable to all branches of engineering and technology.",
    status: "open"
  },
  {
    id: "sch-2",
    title: "Dean's Excellence Tech Fellowship",
    provider: "Academic Council of Cyber-Tech University",
    amount: "₹1,20,000 / Year",
    startingDate: "2026-07-10",
    deadline: "2026-09-15",
    requiredDocuments: [
      "Detailed Technical Project Proposal",
      "Letter of Recommendation from HOD",
      "Grade Transcript showing latest semester CGPA",
      "Updated Resume and GitHub repository links"
    ],
    description: "Prestigious fellowship awarded to outstanding young innovators. Recipients get opportunities to work under senior research mentors and receive research grants.",
    eligibility: "CGPA > 9.0, limited to CSE and AIDS Branch. Candidates must have built and deployed at least one verified software program or AI model.",
    status: "open"
  },
  {
    id: "sch-3",
    title: "Vigyan Pragati Girls Scholarship",
    provider: "Ministry of Science and Technology, Govt. of India",
    amount: "₹50,000 / Year",
    startingDate: "2026-06-01",
    deadline: "2026-07-20",
    requiredDocuments: [
      "Domicile Certificate of State",
      "Latest Grade Transcript",
      "Income Affidavit",
      "Applicant Bank Account Passbook copy"
    ],
    description: "National initiative to improve gender representation and empower future female leaders in STEM fields. Provides fully funded tuition support and technical skill development workshops.",
    eligibility: "Female students registered in undergraduate technology/engineering courses, CGPA > 7.5.",
    status: "open"
  }
];


