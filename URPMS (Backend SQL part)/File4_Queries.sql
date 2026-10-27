-- =============================================
-- FILE 4: SEARCH AND FUNCTIONAL QUERIES
-- University Research Project Management System
-- Run this FOURTH in SSMS (or run parts anytime)
-- =============================================

USE UniversityResearchDB;
GO

-- =============================================
-- DDL COMMANDS (Already done in File 2)
-- Shown here for reference / viva
-- =============================================

-- ALTER: Add a new column to Student table
ALTER TABLE Student ADD EnrollmentNumber VARCHAR(20);
GO

-- ALTER: Drop that column
ALTER TABLE Student DROP COLUMN EnrollmentNumber;
GO

-- =============================================
-- DML - SELECT (View All Records)
-- =============================================

-- View all departments
SELECT * FROM Department;

-- View all supervisors
SELECT * FROM Supervisor;

-- View all students
SELECT * FROM Student;

-- View all projects
SELECT * FROM Project;

-- View all funding
SELECT * FROM Funding;

-- View all publications
SELECT * FROM Publication;

-- =============================================
-- DML - SEARCH QUERIES
-- =============================================

-- Search student by name
SELECT * FROM Student
WHERE FullName LIKE '%Ali%';

-- Search students whose name starts with A
SELECT * FROM Student
WHERE FullName LIKE 'A%';

-- Search male students
SELECT * FROM Student
WHERE Gender = 'Male';

-- Search female students
SELECT * FROM Student
WHERE Gender = 'Female';

-- Search students older than 22
SELECT * FROM Student
WHERE Age > 22;

-- Search students by department
SELECT * FROM Student
WHERE DepartmentID = 1;

-- Search student by ID
SELECT * FROM Student
WHERE StudentID = 5;

-- Search projects by status
SELECT * FROM Project
WHERE Status = 'Active';

-- Search completed projects
SELECT * FROM Project
WHERE Status = 'Completed';

-- Search projects by type
SELECT * FROM Project
WHERE ProjectType = 'Basic Research';

-- Search funding by status
SELECT * FROM Funding
WHERE Status = 'Active';

-- Search publications by year
SELECT * FROM Publication
WHERE PublishedYear = 2024;

-- Search publications with high impact factor
SELECT * FROM Publication
WHERE ImpactFactor > 5.0;

-- =============================================
-- DML - JOIN QUERIES
-- =============================================

-- Student with their department name
SELECT
    S.StudentID,
    S.FullName,
    S.Gender,
    S.Age,
    S.Degree,
    D.DepartmentName
FROM Student S
INNER JOIN Department D ON S.DepartmentID = D.DepartmentID;

-- Student with their supervisor name
SELECT
    S.StudentID,
    S.FullName        AS StudentName,
    S.Degree,
    SV.FullName       AS SupervisorName,
    SV.Designation
FROM Student S
INNER JOIN Supervisor SV ON S.SupervisorID = SV.SupervisorID;

-- Project with supervisor and department
SELECT
    P.ProjectID,
    P.ProjectTitle,
    P.Status,
    P.Budget,
    SV.FullName       AS SupervisorName,
    D.DepartmentName
FROM Project P
INNER JOIN Supervisor SV ON P.SupervisorID = SV.SupervisorID
INNER JOIN Department D  ON P.DepartmentID  = D.DepartmentID;

-- Funding with project title
SELECT
    F.FundingID,
    F.FundingSource,
    F.Amount,
    F.Status,
    P.ProjectTitle
FROM Funding F
INNER JOIN Project P ON F.ProjectID = P.ProjectID;

-- Publication with project title
SELECT
    PB.PublicationID,
    PB.Title,
    PB.PublishedYear,
    PB.ImpactFactor,
    P.ProjectTitle
FROM Publication PB
LEFT JOIN Project P ON PB.ProjectID = P.ProjectID;

-- =============================================
-- DML - AGGREGATE QUERIES
-- =============================================

-- Count students by department
SELECT
    D.DepartmentName,
    COUNT(S.StudentID) AS TotalStudents
FROM Department D
LEFT JOIN Student S ON D.DepartmentID = S.DepartmentID
GROUP BY D.DepartmentName;

-- Count male and female students
SELECT Gender, COUNT(*) AS Total
FROM Student
GROUP BY Gender;

-- Total funding per project
SELECT
    P.ProjectTitle,
    SUM(F.Amount) AS TotalFunding
FROM Project P
LEFT JOIN Funding F ON P.ProjectID = F.ProjectID
GROUP BY P.ProjectTitle;

-- Average budget of all projects
SELECT AVG(Budget) AS AverageBudget FROM Project;

-- Total publications per year
SELECT PublishedYear, COUNT(*) AS TotalPublications
FROM Publication
WHERE PublishedYear IS NOT NULL
GROUP BY PublishedYear
ORDER BY PublishedYear DESC;

-- =============================================
-- DML - UPDATE QUERIES
-- =============================================

-- Update student age
UPDATE Student
SET Age = 25
WHERE StudentID = 1;

-- Update project status
UPDATE Project
SET Status = 'Completed'
WHERE ProjectID = 11;

-- Revert project status back
UPDATE Project
SET Status = 'Active'
WHERE ProjectID = 11;

-- Update funding status
UPDATE Funding
SET Status = 'Expired'
WHERE ExpiryDate < GETDATE() AND Status = 'Active';

-- =============================================
-- DML - DELETE QUERIES
-- =============================================

-- Example: Delete a specific publication author record
-- (safe delete - no cascade issues)
-- DELETE FROM PublicationAuthor WHERE AuthorID = 999;

-- =============================================
-- TCL - TRANSACTION COMMANDS
-- =============================================

-- ROLLBACK example (change is undone)
BEGIN TRANSACTION;
    UPDATE Project
    SET Budget = Budget + 100000
    WHERE ProjectID = 1;
    SELECT ProjectID, ProjectTitle, Budget FROM Project WHERE ProjectID = 1;
ROLLBACK;
SELECT ProjectID, ProjectTitle, Budget FROM Project WHERE ProjectID = 1;

-- COMMIT example (change is saved permanently)
BEGIN TRANSACTION;
    UPDATE Project
    SET AmountSpent = AmountSpent + 50000
    WHERE ProjectID = 2;
COMMIT;

-- SAVEPOINT example
BEGIN TRANSACTION;
    SAVE TRANSACTION BeforeUpdate;

    UPDATE Student SET Age = 30 WHERE StudentID = 1;

    -- Rollback only to the savepoint
    ROLLBACK TRANSACTION BeforeUpdate;
COMMIT;

-- =============================================
-- DCL - GRANT AND REVOKE
-- =============================================

-- Create a login first (run once if needed)
-- CREATE LOGIN ResearchUser WITH PASSWORD = 'Research@123';
-- CREATE USER  ResearchUser FOR LOGIN ResearchUser;

-- GRANT permissions
-- GRANT SELECT ON Student    TO ResearchUser;
-- GRANT SELECT ON Project    TO ResearchUser;
-- GRANT INSERT ON Student    TO ResearchUser;
-- GRANT UPDATE ON Project    TO ResearchUser;

-- REVOKE permissions
-- REVOKE DELETE ON Student   FROM ResearchUser;
-- REVOKE INSERT ON Funding   FROM ResearchUser;

-- =============================================
-- ADVANCED FILTER QUERIES
-- =============================================

-- Students between age 20 and 24
SELECT * FROM Student
WHERE Age BETWEEN 20 AND 24;

-- Projects with budget greater than 3000000
SELECT * FROM Project
WHERE Budget > 3000000
ORDER BY Budget DESC;

-- Top 5 publications by citations
SELECT TOP 5 * FROM Publication
ORDER BY Citations DESC;

-- Active projects with their total funding
SELECT
    P.ProjectTitle,
    P.Status,
    P.Budget,
    ISNULL(SUM(F.Amount), 0) AS TotalFundingReceived,
    (P.Budget - ISNULL(SUM(F.Amount), 0)) AS FundingGap
FROM Project P
LEFT JOIN Funding F ON P.ProjectID = F.ProjectID
WHERE P.Status = 'Active'
GROUP BY P.ProjectTitle, P.Status, P.Budget
ORDER BY TotalFundingReceived DESC;

-- Supervisors with number of projects
SELECT
    SV.FullName        AS SupervisorName,
    SV.Designation,
    COUNT(P.ProjectID) AS TotalProjects
FROM Supervisor SV
LEFT JOIN Project P ON SV.SupervisorID = P.SupervisorID
GROUP BY SV.FullName, SV.Designation
ORDER BY TotalProjects DESC;

PRINT 'All queries executed successfully!';
GO
