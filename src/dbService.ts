import { 
  db, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  collection, 
  query, 
  where,
  deleteDoc
} from "./firebase";
import { UserProfile, StudentRecord, Assignment, PlacementJob, Notice, Scholarship, DepartmentItem, CollegeClass, CollegeEvent, FacultyMember, ExamSchedule, StudyMaterial } from "./types";

// DB Service for persistency in Firestore
export const dbService = {
  // Save or update user profile
  async saveUserProfile(profile: UserProfile): Promise<void> {
    try {
      let avatarUrl = profile.avatarUrl || "";
      // Compression safety check: if base64 data url is too large, downscale it
      if (avatarUrl.startsWith("data:image/") && avatarUrl.length > 100000) {
        try {
          avatarUrl = await new Promise<string>((resolve) => {
            const img = new Image();
            img.src = avatarUrl;
            img.onload = () => {
              const canvas = document.createElement("canvas");
              const max_size = 180;
              let width = img.width;
              let height = img.height;
              if (width > height) {
                if (width > max_size) {
                  height *= max_size / width;
                  width = max_size;
                }
              } else {
                if (height > max_size) {
                  width *= max_size / height;
                  height = max_size;
                }
              }
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext("2d");
              if (ctx) {
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL("image/jpeg", 0.7));
              } else {
                resolve(avatarUrl);
              }
            };
            img.onerror = () => {
              resolve(avatarUrl);
            };
          });
        } catch (e) {
          console.warn("Failed to compress avatar in dbService", e);
        }
      }

      const userDocRef = doc(db, "users", profile.id);
      await setDoc(userDocRef, {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role,
        rollNo: profile.rollNo || "",
        department: profile.department || "",
        semester: profile.semester || 6,
        gpa: profile.gpa || 8.75,
        attendanceRate: profile.attendanceRate || 90.0,
        avatarUrl: avatarUrl,
        mobile: profile.mobile || "",
        previousCgpa: profile.previousCgpa || 0,
        password: profile.password || ""
      }, { merge: true });
      console.log(`User profile successfully saved to Firestore for ID: ${profile.id}`);
    } catch (error) {
      console.error("Error saving user profile to Firestore:", error);
    }
  },

  // Get user profile by ID
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const userDocRef = doc(db, "users", userId);
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        return docSnap.data() as UserProfile;
      }
      return null;
    } catch (error) {
      console.error("Error fetching user profile from Firestore:", error);
      return null;
    }
  },

  // Get user profile by Roll Number or Email
  async getUserProfileByEmail(email: string): Promise<UserProfile | null> {
    try {
      const q = query(collection(db, "users"), where("email", "==", email));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        return querySnapshot.docs[0].data() as UserProfile;
      }
      return null;
    } catch (error) {
      console.error("Error finding user profile by email:", error);
      return null;
    }
  },

  // Save/log user portal visit/login details for SuperAdmin dashboard
  async logPortalVisit(profile: UserProfile): Promise<void> {
    try {
      const visitId = `visit-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const visitRef = doc(db, "portal_visits", visitId);
      const d = new Date();
      // Store dateStr in standard YYYY-MM-DD local format
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      await setDoc(visitRef, {
        id: visitId,
        userId: profile.id,
        userName: profile.name,
        userEmail: profile.email,
        userRole: profile.role,
        timestamp: Date.now(),
        dateStr: dateStr
      });
      console.log(`Portal visit auto-saved to Firestore: ${profile.name} (${profile.role})`);
    } catch (error) {
      console.error("Error saving portal visit log:", error);
    }
  },

  // Fetch all portal visits for analytics
  async getPortalVisits(): Promise<any[]> {
    try {
      const colRef = collection(db, "portal_visits");
      const querySnapshot = await getDocs(colRef);
      const list: any[] = [];
      querySnapshot.forEach((docSnap) => {
        list.push(docSnap.data());
      });
      // Sort from most recent to oldest
      list.sort((a, b) => b.timestamp - a.timestamp);
      return list;
    } catch (error) {
      console.error("Error loading portal visits from Firestore:", error);
      return [];
    }
  },

  // Load all user profiles for SuperAdmin to view and edit
  async getAllUserProfiles(): Promise<UserProfile[]> {
    try {
      const colRef = collection(db, "users");
      const querySnapshot = await getDocs(colRef);
      const list: UserProfile[] = [];
      querySnapshot.forEach((docSnap) => {
        list.push(docSnap.data() as UserProfile);
      });
      return list;
    } catch (error) {
      console.error("Error loading all user profiles from Firestore:", error);
      return [];
    }
  },

  // Load all students (for admin panel or student lists)
  async getAllStudents(): Promise<StudentRecord[]> {
    try {
      const q = query(collection(db, "users"), where("role", "==", "student"));
      const querySnapshot = await getDocs(q);
      const list: StudentRecord[] = [];
      querySnapshot.forEach((docSnap) => {
        const d = docSnap.data();
        list.push({
          id: d.id,
          name: d.name,
          roll: d.rollNo || "N/A",
          gpa: d.gpa || 8.75,
          attendance: d.attendanceRate || 90.0,
          status: (d.attendanceRate || 90.0) < 75 ? "Attendance Warning" : "Good Standing",
          email: d.email,
          department: d.department || "Computer Science & Engineering",
          mobile: d.mobile || "",
          semester: d.semester || 6,
          previousCgpa: d.previousCgpa || undefined
        });
      });
      return list;
    } catch (error) {
      console.error("Error loading students from Firestore:", error);
      return [];
    }
  },

  // Save/Update an assignment status for a user
  async saveUserAssignment(userId: string, assignment: Assignment): Promise<void> {
    try {
      const assignmentRef = doc(db, "users", userId, "assignments", assignment.id);
      await setDoc(assignmentRef, {
        id: assignment.id,
        title: assignment.title,
        subject: assignment.subject,
        dueDate: assignment.dueDate,
        status: assignment.status,
        score: assignment.score || "",
        totalPoints: assignment.totalPoints || 100
      }, { merge: true });
    } catch (error) {
      console.error("Error saving user assignment:", error);
    }
  },

  // Get all assignment statuses for a user
  async getUserAssignments(userId: string): Promise<Assignment[]> {
    try {
      const colRef = collection(db, "users", userId, "assignments");
      const querySnapshot = await getDocs(colRef);
      const list: Assignment[] = [];
      querySnapshot.forEach((docSnap) => {
        list.push(docSnap.data() as Assignment);
      });
      return list;
    } catch (error) {
      console.error("Error fetching user assignments:", error);
      return [];
    }
  },

  // Save placement status
  async saveUserPlacement(userId: string, job: PlacementJob): Promise<void> {
    try {
      const jobRef = doc(db, "users", userId, "placements", job.id);
      await setDoc(jobRef, {
        id: job.id,
        company: job.company,
        position: job.position,
        ctc: job.ctc,
        eligibility: job.eligibility,
        deadline: job.deadline,
        status: job.status,
        category: job.category
      }, { merge: true });
    } catch (error) {
      console.error("Error saving user placement status:", error);
    }
  },

  // Get user placements status
  async getUserPlacements(userId: string): Promise<PlacementJob[]> {
    try {
      const colRef = collection(db, "users", userId, "placements");
      const querySnapshot = await getDocs(colRef);
      const list: PlacementJob[] = [];
      querySnapshot.forEach((docSnap) => {
        list.push(docSnap.data() as PlacementJob);
      });
      return list;
    } catch (error) {
      console.error("Error fetching user placements:", error);
      return [];
    }
  },

  // Get all notices
  async getAllNotices(): Promise<Notice[]> {
    try {
      const q = query(collection(db, "notices"));
      const querySnapshot = await getDocs(q);
      const list: Notice[] = [];
      querySnapshot.forEach((docSnap) => {
        list.push(docSnap.data() as Notice);
      });
      return list;
    } catch (error) {
      console.error("Error loading notices from Firestore:", error);
      return [];
    }
  },

  // Save/Update a notice
  async saveNotice(notice: Notice): Promise<void> {
    try {
      const noticeRef = doc(db, "notices", notice.id);
      await setDoc(noticeRef, {
        ...notice,
        createdAt: Date.now()
      }, { merge: true });
    } catch (error) {
      console.error("Error saving notice:", error);
    }
  },

  // Delete a notice
  async deleteNotice(id: string): Promise<void> {
    try {
      const noticeRef = doc(db, "notices", id);
      await deleteDoc(noticeRef);
    } catch (error) {
      console.error("Error deleting notice:", error);
    }
  },

  // Get all scholarships
  async getAllScholarships(): Promise<Scholarship[]> {
    try {
      const q = query(collection(db, "scholarships"));
      const querySnapshot = await getDocs(q);
      const list: Scholarship[] = [];
      querySnapshot.forEach((docSnap) => {
        list.push(docSnap.data() as Scholarship);
      });
      return list;
    } catch (error) {
      console.error("Error loading scholarships from Firestore:", error);
      return [];
    }
  },

  // Save/Update a scholarship
  async saveScholarship(scholarship: Scholarship): Promise<void> {
    try {
      const scholarshipRef = doc(db, "scholarships", scholarship.id);
      await setDoc(scholarshipRef, scholarship, { merge: true });
    } catch (error) {
      console.error("Error saving scholarship:", error);
    }
  },

  // Delete a scholarship
  async deleteScholarship(id: string): Promise<void> {
    try {
      const scholarshipRef = doc(db, "scholarships", id);
      await deleteDoc(scholarshipRef);
    } catch (error) {
      console.error("Error deleting scholarship:", error);
    }
  },

  // Save/Update a department
  async saveDepartment(dept: DepartmentItem): Promise<void> {
    try {
      const ref = doc(db, "departments", dept.id);
      await setDoc(ref, dept, { merge: true });
    } catch (error) {
      console.error("Error saving department:", error);
    }
  },

  // Delete a department
  async deleteDepartment(id: string): Promise<void> {
    try {
      const ref = doc(db, "departments", id);
      await deleteDoc(ref);
    } catch (error) {
      console.error("Error deleting department:", error);
    }
  },

  // Get all departments
  async getAllDepartments(): Promise<DepartmentItem[]> {
    try {
      const colRef = collection(db, "departments");
      const querySnapshot = await getDocs(colRef);
      const list: DepartmentItem[] = [];
      querySnapshot.forEach((docSnap) => {
        list.push(docSnap.data() as DepartmentItem);
      });
      return list;
    } catch (error) {
      console.error("Error loading departments from Firestore:", error);
      return [];
    }
  },

  // Save/Update a class
  async saveClass(cls: CollegeClass): Promise<void> {
    try {
      const ref = doc(db, "classes", cls.id);
      await setDoc(ref, cls, { merge: true });
    } catch (error) {
      console.error("Error saving class:", error);
    }
  },

  // Delete a class
  async deleteClass(id: string): Promise<void> {
    try {
      const ref = doc(db, "classes", id);
      await deleteDoc(ref);
    } catch (error) {
      console.error("Error deleting class:", error);
    }
  },

  // Save/Update an event
  async saveEvent(evt: CollegeEvent): Promise<void> {
    try {
      const ref = doc(db, "events", evt.id);
      await setDoc(ref, evt, { merge: true });
    } catch (error) {
      console.error("Error saving event:", error);
    }
  },

  // Delete an event
  async deleteEvent(id: string): Promise<void> {
    try {
      const ref = doc(db, "events", id);
      await deleteDoc(ref);
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  },

  // Save/Update faculty
  async saveFaculty(fac: FacultyMember): Promise<void> {
    try {
      const ref = doc(db, "faculty", fac.id);
      await setDoc(ref, fac, { merge: true });
    } catch (error) {
      console.error("Error saving faculty:", error);
    }
  },

  // Delete faculty
  async deleteFaculty(id: string): Promise<void> {
    try {
      const ref = doc(db, "faculty", id);
      await deleteDoc(ref);
    } catch (error) {
      console.error("Error deleting faculty:", error);
    }
  },

  // Save/Update an exam
  async saveExam(exam: ExamSchedule): Promise<void> {
    try {
      const ref = doc(db, "exams", exam.id);
      await setDoc(ref, exam, { merge: true });
    } catch (error) {
      console.error("Error saving exam:", error);
    }
  },

  // Delete an exam
  async deleteExam(id: string): Promise<void> {
    try {
      const ref = doc(db, "exams", id);
      await deleteDoc(ref);
    } catch (error) {
      console.error("Error deleting exam:", error);
    }
  },

  // Save/Update a study material
  async saveStudyMaterial(mat: StudyMaterial): Promise<void> {
    try {
      const ref = doc(db, "study_materials", mat.id);
      await setDoc(ref, mat, { merge: true });
    } catch (error) {
      console.error("Error saving study material:", error);
    }
  },

  // Delete a study material
  async deleteStudyMaterial(id: string): Promise<void> {
    try {
      const ref = doc(db, "study_materials", id);
      await deleteDoc(ref);
    } catch (error) {
      console.error("Error deleting study material:", error);
    }
  }
};
