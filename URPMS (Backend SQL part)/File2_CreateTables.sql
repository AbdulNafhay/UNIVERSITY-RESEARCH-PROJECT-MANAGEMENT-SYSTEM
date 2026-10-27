-- =============================================
-- FILE 2: CREATE TABLES
-- University Research Project Management System
-- Run this SECOND in SSMS
-- =============================================

USE UniversityResearchDB;
GO

-- TABLE 1: Department
CREATE TABLE Department (
    DepartmentID      INT           PRIMARY KEY IDENTITY(1,1),
    DepartmentName    VARCHAR(100)  NOT NULL,
    DepartmentCode    VARCHAR(10)   NOT NULL,
    Faculty           VARCHAR(100),
    PhoneNumber       VARCHAR(20),
    Email             VARCHAR(100),
    Location          VARCHAR(100),
    EstablishedYear   INT
);
GO

-- TABLE 2: Supervisor
CREATE TABLE Supervisor (
    SupervisorID      INT           PRIMARY KEY IDENTITY(1,1),
    FullName          VARCHAR(100)  NOT NULL,
    Gender            VARCHAR(10),
    DateOfBirth       DATE,
    Email             VARCHAR(100),
    Phone             VARCHAR(20),
    Designation       VARCHAR(100),
    Qualification     VARCHAR(100),
    Specialization    VARCHAR(150),
    DepartmentID      INT,
    FOREIGN KEY (DepartmentID) REFERENCES Department(DepartmentID)
);
GO

-- TABLE 3: Student
CREATE TABLE Student (
    StudentID         INT           PRIMARY KEY IDENTITY(1,1),
    FullName          VARCHAR(100)  NOT NULL,
    Gender            VARCHAR(10),
    DateOfBirth       DATE,
    Age               INT,
    Email             VARCHAR(100),
    Phone             VARCHAR(20),
    Degree            VARCHAR(50),
    Semester          INT,
    DepartmentID      INT,
    SupervisorID      INT,
    FOREIGN KEY (DepartmentID) REFERENCES Department(DepartmentID),
    FOREIGN KEY (SupervisorID) REFERENCES Supervisor(SupervisorID)
);
GO

-- TABLE 4: Project
CREATE TABLE Project (
    ProjectID         INT           PRIMARY KEY IDENTITY(1,1),
    ProjectTitle      VARCHAR(200)  NOT NULL,
    ProjectType       VARCHAR(100),
    Description       VARCHAR(500),
    StartDate         DATE,
    EndDate           DATE,
    Budget            DECIMAL(12,2),
    AmountSpent       DECIMAL(12,2) DEFAULT 0,
    Status            VARCHAR(50),
    DepartmentID      INT,
    SupervisorID      INT,
    FOREIGN KEY (DepartmentID) REFERENCES Department(DepartmentID),
    FOREIGN KEY (SupervisorID) REFERENCES Supervisor(SupervisorID)
);
GO

-- TABLE 5: Funding
CREATE TABLE Funding (
    FundingID         INT           PRIMARY KEY IDENTITY(1,1),
    FundingSource     VARCHAR(150)  NOT NULL,
    FundingType       VARCHAR(100),
    Amount            DECIMAL(12,2),
    GrantDate         DATE,
    ExpiryDate        DATE,
    Status            VARCHAR(50),
    ProjectID         INT,
    FOREIGN KEY (ProjectID) REFERENCES Project(ProjectID)
);
GO

-- TABLE 6: Publication
CREATE TABLE Publication (
    PublicationID     INT           PRIMARY KEY IDENTITY(1,1),
    Title             VARCHAR(300)  NOT NULL,
    PublicationType   VARCHAR(100),
    JournalName       VARCHAR(200),
    PublishedYear     INT,
    ImpactFactor      DECIMAL(5,2),
    Citations         INT           DEFAULT 0,
    DOI               VARCHAR(100),
    ProjectID         INT,
    FOREIGN KEY (ProjectID) REFERENCES Project(ProjectID)
);
GO

-- TABLE 7: ProjectMember (Student assigned to Project)
CREATE TABLE ProjectMember (
    MemberID          INT           PRIMARY KEY IDENTITY(1,1),
    ProjectID         INT,
    StudentID         INT,
    Role              VARCHAR(100),
    JoinDate          DATE,
    FOREIGN KEY (ProjectID) REFERENCES Project(ProjectID),
    FOREIGN KEY (StudentID) REFERENCES Student(StudentID)
);
GO

-- TABLE 8: PublicationAuthor (Student linked to Publication)
CREATE TABLE PublicationAuthor (
    AuthorID          INT           PRIMARY KEY IDENTITY(1,1),
    PublicationID     INT,
    StudentID         INT,
    AuthorOrder       INT,
    FOREIGN KEY (PublicationID) REFERENCES Publication(PublicationID),
    FOREIGN KEY (StudentID)     REFERENCES Student(StudentID)
);
GO

PRINT 'All 8 tables created successfully!';
GO
