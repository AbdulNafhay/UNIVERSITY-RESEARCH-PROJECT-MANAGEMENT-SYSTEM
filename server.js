// ============================================
// server.js — Backend Server
// Run this with:  node server.js
// ============================================

const express    = require('express');
const cors       = require('cors');
const bodyParser = require('body-parser');
const path       = require('path');
const { sql, connectDB, getPool } = require('./db');

const app  = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname)); // serve all HTML/CSS/JS files

// ── helpers ──────────────────────────────────
const err500 = (res, e) => res.status(500).json({ success: false, message: e.message });

// ── STATS ────────────────────────────────────
app.get('/api/stats', async (req, res) => {
    try {
        const r = await getPool().request().query(`
            SELECT
              (SELECT COUNT(*) FROM Department)                              AS departments,
              (SELECT COUNT(*) FROM Supervisor)                              AS supervisors,
              (SELECT COUNT(*) FROM Student)                                 AS students,
              (SELECT COUNT(*) FROM Project)                                 AS projects,
              (SELECT COUNT(*) FROM Project  WHERE Status='Active')         AS activeProjects,
              (SELECT COUNT(*) FROM Project  WHERE Status='Completed')      AS completedProjects,
              (SELECT COUNT(*) FROM Funding)                                 AS funding,
              (SELECT COUNT(*) FROM Publication)                             AS publications,
              (SELECT ISNULL(SUM(Amount),0) FROM Funding WHERE Status='Active') AS totalFunding
        `);
        res.json({ success: true, data: r.recordset[0] });
    } catch(e){ err500(res,e); }
});

// ── DEPARTMENTS ───────────────────────────────
app.get('/api/departments', async (req, res) => {
    try {
        const r = await getPool().request().query('SELECT * FROM Department ORDER BY DepartmentName');
        res.json({ success: true, data: r.recordset });
    } catch(e){ err500(res,e); }
});

app.post('/api/departments', async (req, res) => {
    const { DepartmentName, DepartmentCode, Faculty, PhoneNumber, Email, Location, EstablishedYear } = req.body;
    try {
        const r = await getPool().request()
            .input('n', sql.VarChar, DepartmentName).input('c', sql.VarChar, DepartmentCode)
            .input('f', sql.VarChar, Faculty).input('p', sql.VarChar, PhoneNumber)
            .input('e', sql.VarChar, Email).input('l', sql.VarChar, Location).input('y', sql.Int, EstablishedYear)
            .query(`INSERT INTO Department(DepartmentName,DepartmentCode,Faculty,PhoneNumber,Email,Location,EstablishedYear)
                    VALUES(@n,@c,@f,@p,@e,@l,@y); SELECT SCOPE_IDENTITY() AS id`);
        res.json({ success: true, id: r.recordset[0].id });
    } catch(e){ err500(res,e); }
});

app.put('/api/departments/:id', async (req, res) => {
    const { DepartmentName, DepartmentCode, Faculty, PhoneNumber, Email, Location, EstablishedYear } = req.body;
    try {
        await getPool().request()
            .input('id',sql.Int,req.params.id).input('n',sql.VarChar,DepartmentName).input('c',sql.VarChar,DepartmentCode)
            .input('f',sql.VarChar,Faculty).input('p',sql.VarChar,PhoneNumber)
            .input('e',sql.VarChar,Email).input('l',sql.VarChar,Location).input('y',sql.Int,EstablishedYear)
            .query('UPDATE Department SET DepartmentName=@n,DepartmentCode=@c,Faculty=@f,PhoneNumber=@p,Email=@e,Location=@l,EstablishedYear=@y WHERE DepartmentID=@id');
        res.json({ success: true });
    } catch(e){ err500(res,e); }
});

app.delete('/api/departments/:id', async (req, res) => {
    try {
        await getPool().request().input('id',sql.Int,req.params.id).query('DELETE FROM Department WHERE DepartmentID=@id');
        res.json({ success: true });
    } catch(e){ err500(res,e); }
});

// ── SUPERVISORS ───────────────────────────────
app.get('/api/supervisors', async (req, res) => {
    const { search, gender, deptId } = req.query;
    try {
        const rq = getPool().request();
        let q = `SELECT S.*,D.DepartmentName FROM Supervisor S LEFT JOIN Department D ON S.DepartmentID=D.DepartmentID WHERE 1=1`;
        if(search){ q+=' AND S.FullName LIKE @s'; rq.input('s',sql.VarChar,`%${search}%`); }
        if(gender){ q+=' AND S.Gender=@g';        rq.input('g',sql.VarChar,gender); }
        if(deptId){ q+=' AND S.DepartmentID=@d';  rq.input('d',sql.Int,deptId); }
        q+=' ORDER BY S.FullName';
        const r = await rq.query(q);
        res.json({ success: true, data: r.recordset });
    } catch(e){ err500(res,e); }
});

app.post('/api/supervisors', async (req, res) => {
    const { FullName,Gender,DateOfBirth,Email,Phone,Designation,Qualification,Specialization,DepartmentID } = req.body;
    try {
        const r = await getPool().request()
            .input('fn',sql.VarChar,FullName).input('ge',sql.VarChar,Gender).input('db',sql.Date,DateOfBirth)
            .input('em',sql.VarChar,Email).input('ph',sql.VarChar,Phone).input('de',sql.VarChar,Designation)
            .input('qu',sql.VarChar,Qualification).input('sp',sql.VarChar,Specialization).input('di',sql.Int,DepartmentID)
            .query(`INSERT INTO Supervisor(FullName,Gender,DateOfBirth,Email,Phone,Designation,Qualification,Specialization,DepartmentID)
                    VALUES(@fn,@ge,@db,@em,@ph,@de,@qu,@sp,@di); SELECT SCOPE_IDENTITY() AS id`);
        res.json({ success: true, id: r.recordset[0].id });
    } catch(e){ err500(res,e); }
});

app.put('/api/supervisors/:id', async (req, res) => {
    const { FullName,Gender,DateOfBirth,Email,Phone,Designation,Qualification,Specialization,DepartmentID } = req.body;
    try {
        await getPool().request()
            .input('id',sql.Int,req.params.id).input('fn',sql.VarChar,FullName).input('ge',sql.VarChar,Gender)
            .input('db',sql.Date,DateOfBirth).input('em',sql.VarChar,Email).input('ph',sql.VarChar,Phone)
            .input('de',sql.VarChar,Designation).input('qu',sql.VarChar,Qualification).input('sp',sql.VarChar,Specialization).input('di',sql.Int,DepartmentID)
            .query('UPDATE Supervisor SET FullName=@fn,Gender=@ge,DateOfBirth=@db,Email=@em,Phone=@ph,Designation=@de,Qualification=@qu,Specialization=@sp,DepartmentID=@di WHERE SupervisorID=@id');
        res.json({ success: true });
    } catch(e){ err500(res,e); }
});

app.delete('/api/supervisors/:id', async (req, res) => {
    try {
        await getPool().request().input('id',sql.Int,req.params.id).query('DELETE FROM Supervisor WHERE SupervisorID=@id');
        res.json({ success: true });
    } catch(e){ err500(res,e); }
});

// ── STUDENTS ──────────────────────────────────
app.get('/api/students', async (req, res) => {
    const { search, gender, deptId, degree, startsWith, minAge, maxAge } = req.query;
    try {
        const rq = getPool().request();
        let q = `SELECT S.*,D.DepartmentName,SV.FullName AS SupervisorName
                 FROM Student S
                 LEFT JOIN Department D  ON S.DepartmentID=D.DepartmentID
                 LEFT JOIN Supervisor SV ON S.SupervisorID=SV.SupervisorID
                 WHERE 1=1`;
        if(search)    { q+=' AND S.FullName LIKE @s';   rq.input('s',  sql.VarChar,`%${search}%`); }
        if(gender)    { q+=' AND S.Gender=@g';          rq.input('g',  sql.VarChar,gender); }
        if(deptId)    { q+=' AND S.DepartmentID=@d';    rq.input('d',  sql.Int,deptId); }
        if(degree)    { q+=' AND S.Degree=@deg';        rq.input('deg',sql.VarChar,degree); }
        if(startsWith){ q+=' AND S.FullName LIKE @sw';  rq.input('sw', sql.VarChar,`${startsWith}%`); }
        if(minAge)    { q+=' AND S.Age>=@mn';           rq.input('mn', sql.Int,minAge); }
        if(maxAge)    { q+=' AND S.Age<=@mx';           rq.input('mx', sql.Int,maxAge); }
        q+=' ORDER BY S.StudentID';
        const r = await rq.query(q);
        res.json({ success: true, data: r.recordset });
    } catch(e){ err500(res,e); }
});

app.post('/api/students', async (req, res) => {
    const { FullName,Gender,DateOfBirth,Age,Email,Phone,Degree,Semester,DepartmentID,SupervisorID } = req.body;
    try {
        const r = await getPool().request()
            .input('fn',sql.VarChar,FullName).input('ge',sql.VarChar,Gender).input('db',sql.Date,DateOfBirth)
            .input('ag',sql.Int,Age).input('em',sql.VarChar,Email).input('ph',sql.VarChar,Phone)
            .input('dg',sql.VarChar,Degree).input('sm',sql.Int,Semester).input('di',sql.Int,DepartmentID).input('si',sql.Int,SupervisorID)
            .query(`INSERT INTO Student(FullName,Gender,DateOfBirth,Age,Email,Phone,Degree,Semester,DepartmentID,SupervisorID)
                    VALUES(@fn,@ge,@db,@ag,@em,@ph,@dg,@sm,@di,@si); SELECT SCOPE_IDENTITY() AS id`);
        res.json({ success: true, id: r.recordset[0].id });
    } catch(e){ err500(res,e); }
});

app.put('/api/students/:id', async (req, res) => {
    const { FullName,Gender,DateOfBirth,Age,Email,Phone,Degree,Semester,DepartmentID,SupervisorID } = req.body;
    try {
        await getPool().request()
            .input('id',sql.Int,req.params.id).input('fn',sql.VarChar,FullName).input('ge',sql.VarChar,Gender)
            .input('db',sql.Date,DateOfBirth).input('ag',sql.Int,Age).input('em',sql.VarChar,Email)
            .input('ph',sql.VarChar,Phone).input('dg',sql.VarChar,Degree).input('sm',sql.Int,Semester)
            .input('di',sql.Int,DepartmentID).input('si',sql.Int,SupervisorID)
            .query('UPDATE Student SET FullName=@fn,Gender=@ge,DateOfBirth=@db,Age=@ag,Email=@em,Phone=@ph,Degree=@dg,Semester=@sm,DepartmentID=@di,SupervisorID=@si WHERE StudentID=@id');
        res.json({ success: true });
    } catch(e){ err500(res,e); }
});

app.delete('/api/students/:id', async (req, res) => {
    try {
        await getPool().request().input('id',sql.Int,req.params.id).query('DELETE FROM Student WHERE StudentID=@id');
        res.json({ success: true });
    } catch(e){ err500(res,e); }
});

// ── PROJECTS ──────────────────────────────────
app.get('/api/projects', async (req, res) => {
    const { search, status, type, deptId } = req.query;
    try {
        const rq = getPool().request();
        let q = `SELECT P.*,D.DepartmentName,SV.FullName AS SupervisorName,
                 ISNULL((SELECT SUM(Amount) FROM Funding F WHERE F.ProjectID=P.ProjectID),0) AS TotalFunding
                 FROM Project P
                 LEFT JOIN Department D  ON P.DepartmentID=D.DepartmentID
                 LEFT JOIN Supervisor SV ON P.SupervisorID=SV.SupervisorID
                 WHERE 1=1`;
        if(search){ q+=' AND P.ProjectTitle LIKE @s'; rq.input('s',sql.VarChar,`%${search}%`); }
        if(status){ q+=' AND P.Status=@st';           rq.input('st',sql.VarChar,status); }
        if(type)  { q+=' AND P.ProjectType=@ty';      rq.input('ty',sql.VarChar,type); }
        if(deptId){ q+=' AND P.DepartmentID=@d';      rq.input('d',sql.Int,deptId); }
        q+=' ORDER BY P.ProjectID DESC';
        const r = await rq.query(q);
        res.json({ success: true, data: r.recordset });
    } catch(e){ err500(res,e); }
});

app.post('/api/projects', async (req, res) => {
    const { ProjectTitle,ProjectType,Description,StartDate,EndDate,Budget,Status,DepartmentID,SupervisorID } = req.body;
    try {
        const r = await getPool().request()
            .input('pt',sql.VarChar,ProjectTitle).input('ty',sql.VarChar,ProjectType).input('de',sql.VarChar,Description)
            .input('sd',sql.Date,StartDate).input('ed',sql.Date,EndDate).input('bu',sql.Decimal(12,2),Budget)
            .input('st',sql.VarChar,Status).input('di',sql.Int,DepartmentID).input('si',sql.Int,SupervisorID)
            .query(`INSERT INTO Project(ProjectTitle,ProjectType,Description,StartDate,EndDate,Budget,Status,DepartmentID,SupervisorID)
                    VALUES(@pt,@ty,@de,@sd,@ed,@bu,@st,@di,@si); SELECT SCOPE_IDENTITY() AS id`);
        res.json({ success: true, id: r.recordset[0].id });
    } catch(e){ err500(res,e); }
});

app.put('/api/projects/:id', async (req, res) => {
    const { ProjectTitle,ProjectType,Description,StartDate,EndDate,Budget,AmountSpent,Status,DepartmentID,SupervisorID } = req.body;
    try {
        await getPool().request()
            .input('id',sql.Int,req.params.id).input('pt',sql.VarChar,ProjectTitle).input('ty',sql.VarChar,ProjectType)
            .input('de',sql.VarChar,Description).input('sd',sql.Date,StartDate).input('ed',sql.Date,EndDate)
            .input('bu',sql.Decimal(12,2),Budget).input('as2',sql.Decimal(12,2),AmountSpent||0)
            .input('st',sql.VarChar,Status).input('di',sql.Int,DepartmentID).input('si',sql.Int,SupervisorID)
            .query('UPDATE Project SET ProjectTitle=@pt,ProjectType=@ty,Description=@de,StartDate=@sd,EndDate=@ed,Budget=@bu,AmountSpent=@as2,Status=@st,DepartmentID=@di,SupervisorID=@si WHERE ProjectID=@id');
        res.json({ success: true });
    } catch(e){ err500(res,e); }
});

app.delete('/api/projects/:id', async (req, res) => {
    try {
        await getPool().request().input('id',sql.Int,req.params.id).query('DELETE FROM Project WHERE ProjectID=@id');
        res.json({ success: true });
    } catch(e){ err500(res,e); }
});

// ── FUNDING ───────────────────────────────────
app.get('/api/funding', async (req, res) => {
    const { projectId, status, type } = req.query;
    try {
        const rq = getPool().request();
        let q = `SELECT F.*,P.ProjectTitle FROM Funding F LEFT JOIN Project P ON F.ProjectID=P.ProjectID WHERE 1=1`;
        if(projectId){ q+=' AND F.ProjectID=@p'; rq.input('p',sql.Int,projectId); }
        if(status)   { q+=' AND F.Status=@st';   rq.input('st',sql.VarChar,status); }
        if(type)     { q+=' AND F.FundingType=@t';rq.input('t',sql.VarChar,type); }
        q+=' ORDER BY F.FundingID DESC';
        const r = await rq.query(q);
        res.json({ success: true, data: r.recordset });
    } catch(e){ err500(res,e); }
});

app.post('/api/funding', async (req, res) => {
    const { FundingSource,FundingType,Amount,GrantDate,ExpiryDate,Status,ProjectID } = req.body;
    try {
        const r = await getPool().request()
            .input('fs',sql.VarChar,FundingSource).input('ft',sql.VarChar,FundingType).input('am',sql.Decimal(12,2),Amount)
            .input('gd',sql.Date,GrantDate).input('ed',sql.Date,ExpiryDate).input('st',sql.VarChar,Status).input('pi',sql.Int,ProjectID)
            .query(`INSERT INTO Funding(FundingSource,FundingType,Amount,GrantDate,ExpiryDate,Status,ProjectID)
                    VALUES(@fs,@ft,@am,@gd,@ed,@st,@pi); SELECT SCOPE_IDENTITY() AS id`);
        res.json({ success: true, id: r.recordset[0].id });
    } catch(e){ err500(res,e); }
});

app.put('/api/funding/:id', async (req, res) => {
    const { FundingSource,FundingType,Amount,GrantDate,ExpiryDate,Status,ProjectID } = req.body;
    try {
        await getPool().request()
            .input('id',sql.Int,req.params.id).input('fs',sql.VarChar,FundingSource).input('ft',sql.VarChar,FundingType)
            .input('am',sql.Decimal(12,2),Amount).input('gd',sql.Date,GrantDate).input('ed',sql.Date,ExpiryDate)
            .input('st',sql.VarChar,Status).input('pi',sql.Int,ProjectID)
            .query('UPDATE Funding SET FundingSource=@fs,FundingType=@ft,Amount=@am,GrantDate=@gd,ExpiryDate=@ed,Status=@st,ProjectID=@pi WHERE FundingID=@id');
        res.json({ success: true });
    } catch(e){ err500(res,e); }
});

app.delete('/api/funding/:id', async (req, res) => {
    try {
        await getPool().request().input('id',sql.Int,req.params.id).query('DELETE FROM Funding WHERE FundingID=@id');
        res.json({ success: true });
    } catch(e){ err500(res,e); }
});

// ── PUBLICATIONS ──────────────────────────────
app.get('/api/publications', async (req, res) => {
    const { search, year, type, projectId } = req.query;
    try {
        const rq = getPool().request();
        let q = `SELECT PB.*,P.ProjectTitle FROM Publication PB LEFT JOIN Project P ON PB.ProjectID=P.ProjectID WHERE 1=1`;
        if(search)   { q+=' AND PB.Title LIKE @s';       rq.input('s',sql.VarChar,`%${search}%`); }
        if(year)     { q+=' AND PB.PublishedYear=@y';    rq.input('y',sql.Int,year); }
        if(type)     { q+=' AND PB.PublicationType=@t';  rq.input('t',sql.VarChar,type); }
        if(projectId){ q+=' AND PB.ProjectID=@p';        rq.input('p',sql.Int,projectId); }
        q+=' ORDER BY PB.PublishedYear DESC';
        const r = await rq.query(q);
        res.json({ success: true, data: r.recordset });
    } catch(e){ err500(res,e); }
});

app.post('/api/publications', async (req, res) => {
    const { Title,PublicationType,JournalName,PublishedYear,ImpactFactor,Citations,DOI,ProjectID } = req.body;
    try {
        const r = await getPool().request()
            .input('ti',sql.VarChar,Title).input('pt',sql.VarChar,PublicationType).input('jn',sql.VarChar,JournalName)
            .input('yr',sql.Int,PublishedYear).input('if2',sql.Decimal(5,2),ImpactFactor||0)
            .input('ci',sql.Int,Citations||0).input('doi',sql.VarChar,DOI).input('pi',sql.Int,ProjectID)
            .query(`INSERT INTO Publication(Title,PublicationType,JournalName,PublishedYear,ImpactFactor,Citations,DOI,ProjectID)
                    VALUES(@ti,@pt,@jn,@yr,@if2,@ci,@doi,@pi); SELECT SCOPE_IDENTITY() AS id`);
        res.json({ success: true, id: r.recordset[0].id });
    } catch(e){ err500(res,e); }
});

app.put('/api/publications/:id', async (req, res) => {
    const { Title,PublicationType,JournalName,PublishedYear,ImpactFactor,Citations,DOI,ProjectID } = req.body;
    try {
        await getPool().request()
            .input('id',sql.Int,req.params.id).input('ti',sql.VarChar,Title).input('pt',sql.VarChar,PublicationType)
            .input('jn',sql.VarChar,JournalName).input('yr',sql.Int,PublishedYear).input('if2',sql.Decimal(5,2),ImpactFactor||0)
            .input('ci',sql.Int,Citations||0).input('doi',sql.VarChar,DOI).input('pi',sql.Int,ProjectID)
            .query('UPDATE Publication SET Title=@ti,PublicationType=@pt,JournalName=@jn,PublishedYear=@yr,ImpactFactor=@if2,Citations=@ci,DOI=@doi,ProjectID=@pi WHERE PublicationID=@id');
        res.json({ success: true });
    } catch(e){ err500(res,e); }
});

app.delete('/api/publications/:id', async (req, res) => {
    try {
        await getPool().request().input('id',sql.Int,req.params.id).query('DELETE FROM Publication WHERE PublicationID=@id');
        res.json({ success: true });
    } catch(e){ err500(res,e); }
});

// ── REPORTS ───────────────────────────────────
app.get('/api/reports/projects-by-status', async (req, res) => {
    try {
        const r = await getPool().request().query('SELECT Status, COUNT(*) AS Total FROM Project GROUP BY Status');
        res.json({ success: true, data: r.recordset });
    } catch(e){ err500(res,e); }
});

app.get('/api/reports/students-by-dept', async (req, res) => {
    try {
        const r = await getPool().request().query(`
            SELECT D.DepartmentName, D.DepartmentCode,
            SUM(CASE WHEN S.Gender='Male'   THEN 1 ELSE 0 END) AS Males,
            SUM(CASE WHEN S.Gender='Female' THEN 1 ELSE 0 END) AS Females,
            COUNT(S.StudentID) AS Total
            FROM Department D LEFT JOIN Student S ON D.DepartmentID=S.DepartmentID
            GROUP BY D.DepartmentName,D.DepartmentCode ORDER BY Total DESC`);
        res.json({ success: true, data: r.recordset });
    } catch(e){ err500(res,e); }
});

app.get('/api/reports/funding-by-type', async (req, res) => {
    try {
        const r = await getPool().request().query('SELECT FundingType, COUNT(*) AS Count, SUM(Amount) AS Total FROM Funding GROUP BY FundingType');
        res.json({ success: true, data: r.recordset });
    } catch(e){ err500(res,e); }
});

app.get('/api/reports/pubs-by-year', async (req, res) => {
    try {
        const r = await getPool().request().query('SELECT PublishedYear, COUNT(*) AS Total FROM Publication WHERE PublishedYear IS NOT NULL GROUP BY PublishedYear ORDER BY PublishedYear DESC');
        res.json({ success: true, data: r.recordset });
    } catch(e){ err500(res,e); }
});

// ── START ─────────────────────────────────────
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`\n🚀 Server running!`);
        console.log(`👉 Open this in your browser: http://localhost:${PORT}/index.html\n`);
    });
});
