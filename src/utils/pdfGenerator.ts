import { jsPDF } from "jspdf";
import { StudentRecord, CollegeSubject } from "../types";

export function generatePDF(filename: string, title: string, subtitle: string, textContent: string) {
  const doc = new jsPDF();
  
  const margin = 20;
  const maxLineWidth = doc.internal.pageSize.width - margin * 2;
  let y = 20;

  // Header Banner styling
  doc.setFillColor(15, 23, 42); // slate-900 color
  doc.rect(0, 0, doc.internal.pageSize.width, 38, "F");

  // Title in Banner
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text("SRINIX COLLEGE OF ENGINEERING", margin, 18);

  // Subtitle/Branding
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text("CollegeGPT Secured Academic Portal Document Hub", margin, 26);

  // Title of the specific document
  y = 50;
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(30, 41, 59); // slate-800
  doc.text(title, margin, y);
  y += 7;

  // Metadata subtitle
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text(subtitle, margin, y);
  y += 5;

  // Thin separator line
  doc.setLineWidth(0.3);
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.line(margin, y, doc.internal.pageSize.width - margin, y);
  y += 10;

  // Main Text formatting
  doc.setFont("Courier", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(51, 65, 85); // slate-700

  // Preprocess lines to wrap nicely
  const rawLines = textContent.split("\n");
  for (const rawLine of rawLines) {
    const wrapped = doc.splitTextToSize(rawLine, maxLineWidth);
    for (const line of wrapped) {
      if (y > doc.internal.pageSize.height - 25) {
        // Footer before adding page
        doc.setFont("Helvetica", "normal");
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text("Report generated dynamically by CollegeGPT - Srinix College. Strictly Confidential.", margin, doc.internal.pageSize.height - 12);
        
        doc.addPage();
        y = 25;
        
        // Re-apply Courier normal font settings on the new page
        doc.setFont("Courier", "normal");
        doc.setFontSize(9.5);
        doc.setTextColor(51, 65, 85);
      }
      doc.text(line, margin, y);
      y += 5.5; // line spacing
    }
  }

  // Footer on final page
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text("Report generated dynamically by CollegeGPT - Srinix College. Strictly Confidential.", margin, doc.internal.pageSize.height - 12);

  doc.save(filename.endsWith(".pdf") ? filename : `${filename}.pdf`);
}

export interface MonthlyAttendanceReportData {
  monthYear: string;
  department: string;
  generatedBy?: string;
  students: StudentRecord[];
  selectedStudentRoll?: string;
  subjects?: CollegeSubject[];
}

export function generateMonthlyAttendancePDFReport(data: MonthlyAttendanceReportData) {
  const doc = new jsPDF();
  const margin = 14;
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  const contentWidth = pageWidth - margin * 2;

  let y = 0;

  const addHeader = (title: string, sub: string) => {
    doc.setFillColor(15, 23, 42); // dark navy
    doc.rect(0, 0, pageWidth, 36, "F");

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(255, 255, 255);
    doc.text("SRINIX COLLEGE OF ENGINEERING", margin, 14);

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(56, 189, 248); // sky blue
    doc.text(title.toUpperCase(), margin, 22);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(sub, margin, 29);
  };

  const addFooter = (pageNum: number) => {
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text("CollegeGPT Secured Academic Portal • Official Monthly Attendance Record • Confidential", margin, pageHeight - 10);
    doc.text(`Page ${pageNum}`, pageWidth - margin - 12, pageHeight - 10);
  };

  let pageNum = 1;
  const isIndividual = Boolean(data.selectedStudentRoll && data.selectedStudentRoll !== "ALL");
  let filteredStudents = isIndividual
    ? data.students.filter(s => s.roll === data.selectedStudentRoll)
    : (data.department && data.department !== "ALL" 
        ? data.students.filter(s => s.department === data.department) 
        : data.students);

  if (filteredStudents.length === 0 && data.students.length > 0) {
    filteredStudents = data.students;
  }

  // Render Header
  addHeader(
    isIndividual ? "INDIVIDUAL STUDENT MONTHLY ATTENDANCE REPORT" : "MONTHLY STUDENT ATTENDANCE LEDGER REPORT",
    `Period: ${data.monthYear} | Department: ${data.department || "All Departments"} | Generated: ${new Date().toLocaleDateString()}`
  );

  y = 44;

  // Executive Summary Box
  const totalStudents = filteredStudents.length;
  const avgAttendance = totalStudents > 0 
    ? (filteredStudents.reduce((acc, s) => acc + (s.attendance || 0), 0) / totalStudents).toFixed(1)
    : "0.0";
  const goodStandingCount = filteredStudents.filter(s => (s.attendance || 0) >= 75).length;
  const warningCount = filteredStudents.filter(s => (s.attendance || 0) < 75).length;

  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(margin, y, contentWidth, 24, 2, 2, "FD");

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59); // slate-800
  doc.text("MONTHLY ATTENDANCE METRICS SUMMARY", margin + 5, y + 6);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);

  doc.text(`Total Students Enrolled: ${totalStudents}`, margin + 5, y + 13);
  doc.text(`Batch Avg Attendance: ${avgAttendance}%`, margin + 55, y + 13);
  doc.text(`Good Standing (>=75%): ${goodStandingCount}`, margin + 115, y + 13);

  doc.setTextColor(warningCount > 0 ? 220 : 71, warningCount > 0 ? 38 : 85, warningCount > 0 ? 38 : 105);
  doc.text(`Attendance Warnings (<75%): ${warningCount}`, margin + 5, y + 19);

  y += 30;

  if (isIndividual && filteredStudents.length > 0) {
    const student = filteredStudents[0];

    // Student Info Card
    doc.setFillColor(241, 245, 249);
    doc.roundedRect(margin, y, contentWidth, 30, 2, 2, "FD");

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(student.name, margin + 5, y + 8);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text(`Roll / Reg No: ${student.roll}`, margin + 5, y + 16);
    doc.text(`Department: ${student.department || "Computer Science & Engineering"}`, margin + 5, y + 23);
    doc.text(`Email: ${student.email || "N/A"}`, margin + 95, y + 16);
    doc.text(`Mobile: ${student.mobile || "N/A"}`, margin + 95, y + 23);

    y += 36;

    // Attendance Standing Badge
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(9.5);
    const overallPct = student.attendance || 0;
    if (overallPct >= 75) {
      doc.setFillColor(220, 252, 231); // green-100
      doc.setTextColor(21, 128, 61); // green-700
      doc.roundedRect(margin, y, contentWidth, 11, 1, 1, "F");
      doc.text(`MONTHLY ACADEMIC STANDING: GOOD STANDING (${overallPct}% Attendance Rate)`, margin + 5, y + 7.5);
    } else {
      doc.setFillColor(254, 226, 226); // red-100
      doc.setTextColor(185, 28, 28); // red-700
      doc.roundedRect(margin, y, contentWidth, 11, 1, 1, "F");
      doc.text(`MONTHLY ACADEMIC STANDING: ATTENDANCE WARNING (${overallPct}% - Below 75% Mandate)`, margin + 5, y + 7.5);
    }

    y += 18;

    // Subject Breakdown Header
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59);
    doc.text("MONTHLY SUBJECT-WISE ATTENDANCE BREAKDOWN", margin, y);
    y += 5;

    // Subject Table Header
    doc.setFillColor(226, 232, 240);
    doc.rect(margin, y, contentWidth, 7, "F");

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(30, 41, 59);
    doc.text("#", margin + 2, y + 5);
    doc.text("Subject Code & Title", margin + 10, y + 5);
    doc.text("Conducted", margin + 105, y + 5);
    doc.text("Attended", margin + 130, y + 5);
    doc.text("Rate (%)", margin + 155, y + 5);

    y += 7;

    const subjectsToUse = (data.subjects && data.subjects.length > 0)
      ? data.subjects
      : [
          { id: "1", name: "Python Programming", code: "CS301", department: "CSE", semester: 5 },
          { id: "2", name: "Operating Systems", code: "CS302", department: "CSE", semester: 5 },
          { id: "3", name: "Database Management Systems", code: "CS303", department: "CSE", semester: 5 },
          { id: "4", name: "Data Structures & Algorithms", code: "CS304", department: "CSE", semester: 5 },
          { id: "5", name: "Computer Networks", code: "CS305", department: "CSE", semester: 5 },
          { id: "6", name: "Software Engineering", code: "CS306", department: "CSE", semester: 5 }
        ];

    let count = 1;
    for (const sub of subjectsToUse) {
      const totalC = 30;
      const basePct = overallPct / 100;
      const variation = ((count % 3) - 1) * 0.04;
      const subPct = Math.min(100, Math.max(35, Math.round((basePct + variation) * 100)));
      const attendedC = Math.round((subPct / 100) * totalC);

      if (count % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, y, contentWidth, 6, "F");
      }

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);
      doc.text(`${count}`, margin + 2, y + 4.5);
      doc.text(`${sub.code || "CS" + (300 + count)} - ${sub.name}`, margin + 10, y + 4.5);
      doc.text(`${totalC}`, margin + 108, y + 4.5);
      doc.text(`${attendedC}`, margin + 133, y + 4.5);

      doc.setFont("Helvetica", "bold");
      if (subPct < 75) {
        doc.setTextColor(220, 38, 38);
      } else {
        doc.setTextColor(22, 163, 74);
      }
      doc.text(`${subPct}%`, margin + 155, y + 4.5);

      y += 6.5;
      count++;
    }

  } else {
    // Batch Ledger Report
    // Table Header
    doc.setFillColor(15, 23, 42); // dark slate
    doc.rect(margin, y, contentWidth, 8, "F");

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);

    doc.text("#", margin + 2, y + 5.5);
    doc.text("Roll No", margin + 10, y + 5.5);
    doc.text("Student Name", margin + 36, y + 5.5);
    doc.text("Department", margin + 92, y + 5.5);
    doc.text("Conducted", margin + 130, y + 5.5);
    doc.text("Attended", margin + 150, y + 5.5);
    doc.text("Rate %", margin + 170, y + 5.5);

    y += 8;

    let index = 1;
    for (const student of filteredStudents) {
      if (y > pageHeight - 38) {
        addFooter(pageNum);
        doc.addPage();
        pageNum++;
        addHeader(
          "MONTHLY STUDENT ATTENDANCE LEDGER REPORT (CONTINUED)",
          `Period: ${data.monthYear} | Page ${pageNum}`
        );
        y = 44;

        // Repeat table header
        doc.setFillColor(15, 23, 42);
        doc.rect(margin, y, contentWidth, 8, "F");
        doc.setFont("Helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(255, 255, 255);
        doc.text("#", margin + 2, y + 5.5);
        doc.text("Roll No", margin + 10, y + 5.5);
        doc.text("Student Name", margin + 36, y + 5.5);
        doc.text("Department", margin + 92, y + 5.5);
        doc.text("Conducted", margin + 130, y + 5.5);
        doc.text("Attended", margin + 150, y + 5.5);
        doc.text("Rate %", margin + 170, y + 5.5);
        y += 8;
      }

      const totalClasses = 180;
      const pct = student.attendance || 0;
      const attendedClasses = Math.round((pct / 100) * totalClasses);

      if (index % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, y, contentWidth, 6.5, "F");
      }

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);

      doc.text(`${index}`, margin + 2, y + 4.5);
      doc.text(student.roll, margin + 10, y + 4.5);
      
      const nameText = student.name.length > 25 ? student.name.substring(0, 23) + ".." : student.name;
      doc.text(nameText, margin + 36, y + 4.5);

      const deptShort = (student.department || "CSE").replace("Engineering", "Engg.");
      const deptTrunc = deptShort.length > 20 ? deptShort.substring(0, 18) + ".." : deptShort;
      doc.text(deptTrunc, margin + 92, y + 4.5);

      doc.text(`${totalClasses}`, margin + 133, y + 4.5);
      doc.text(`${attendedClasses}`, margin + 153, y + 4.5);

      doc.setFont("Helvetica", "bold");
      if (pct < 75) {
        doc.setTextColor(220, 38, 38);
        doc.text(`${pct}% !`, margin + 170, y + 4.5);
      } else {
        doc.setTextColor(22, 163, 74);
        doc.text(`${pct}%`, margin + 170, y + 4.5);
      }

      y += 6.5;
      index++;
    }
  }

  // Official Signatures Block
  if (y > pageHeight - 45) {
    addFooter(pageNum);
    doc.addPage();
    pageNum++;
    addHeader(
      "MONTHLY STUDENT ATTENDANCE REPORT - AUTHORIZATION",
      `Period: ${data.monthYear} | Page ${pageNum}`
    );
    y = 48;
  } else {
    y += 12;
  }

  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 12;

  doc.setFont("Helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(30, 41, 59);
  doc.text("OFFICIAL APPROVAL & ACADEMIC AUTHORIZATION SIGNATURES", margin, y);
  y += 14;

  const colWidth = contentWidth / 3;

  doc.line(margin + 5, y, margin + colWidth - 10, y);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text("Class Coordinator / Advisor", margin + 5, y + 5);

  doc.line(margin + colWidth + 5, y, margin + colWidth * 2 - 10, y);
  doc.text("Head of Department (HOD)", margin + colWidth + 5, y + 5);

  doc.line(margin + colWidth * 2 + 5, y, margin + contentWidth - 5, y);
  doc.text("Dean / Principal Office", margin + colWidth * 2 + 5, y + 5);

  addFooter(pageNum);

  const cleanMonthStr = data.monthYear.toLowerCase().replace(/\s+/g, "_");
  const cleanDeptStr = (data.department || "all_departments").toLowerCase().replace(/[^a-z0-9]/g, "_");
  const filename = isIndividual && filteredStudents.length > 0
    ? `${filteredStudents[0].roll}_monthly_attendance_${cleanMonthStr}.pdf`
    : `monthly_attendance_report_${cleanDeptStr}_${cleanMonthStr}.pdf`;

  doc.save(filename);
}

