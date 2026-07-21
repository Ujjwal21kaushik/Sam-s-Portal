import { useEffect, useState, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LayoutDashboard, Users, GraduationCap, Building2, BookOpen, ClipboardList, CalendarDays, LogOut, Plus, Search, CheckCircle, Clock, Pencil, Trash2, ChevronDown } from 'lucide-react';
import './styles.css';

type User = { name: string; email: string; role: string };
type Item = Record<string, any> & { id: number };

const api = axios.create({ baseURL: 'http://localhost:8000/api' });
api.interceptors.request.use(config => {
  const token = localStorage.token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const adminNav = ['dashboard', 'students', 'faculty', 'departments', 'courses', 'subjects', 'attendance', 'marks', 'leaves', 'notices', 'events', 'companies', 'placements'];
const studentNav = ['dashboard', 'attendance', 'marks', 'leave', 'notices', 'events', 'companies', 'placements'];
const facultyNav = ['dashboard', 'attendance', 'notices', 'events', 'companies', 'placements'];
const icons: any = { dashboard: LayoutDashboard, students: Users, faculty: GraduationCap, departments: Building2, courses: BookOpen, subjects: ClipboardList, attendance: CheckCircle, marks: ClipboardList, leaves: Clock, leave: Clock, notices: ClipboardList, events: CalendarDays, companies: Building2, placements: GraduationCap };
const fields: Record<string, string[]> = {
  students: ['roll_number', 'name', 'email', 'phone', 'gender', 'semester', 'year', 'attendance_percent', 'department_id'],
  faculty: ['name', 'email', 'phone', 'designation', 'department_id'],
  departments: ['name', 'code', 'hod', 'description'],
  courses: ['name', 'duration', 'credits', 'department_id'],
  subjects: ['name', 'code', 'credits', 'semester', 'department_id'],
  notices: ['title', 'content', 'pinned'],
  events: ['title', 'description', 'event_date', 'venue'],
  companies: ['name', 'industry'],
  placements: ['company_id', 'role', 'package_lpa', 'eligibility'],
  marks: ['student_id', 'subject', 'semester', 'internal', 'practical', 'external'],
  attendance: ['student_id', 'subject', 'attendance_date', 'status']
};

function Nav() {
  return <header className="public-nav"><Link className="public-brand" to="/"><b>Campus<span>Hub</span></b><small>College of Technology</small></Link><nav><Link to="/about">About</Link><Link to="/departments">Departments</Link><Link to="/admissions">Admissions</Link><Link className="button" to="/login">Portal Login</Link></nav></header>;
}

function Public({ page = 'home' }: { page?: string }) {
  const departments = ['Computer Science', 'Information Technology', 'Electronics', 'Mechanical', 'Civil', 'Business', 'Mathematics', 'Humanities'];
  const stats = [['100+', 'Students'], ['15', 'Faculty'], ['8', 'Departments'], ['90%', 'Placement rate']];
  const process = ['Register online', 'Submit academic documents', 'Attend counselling', 'Confirm admission'];
  if (page === 'about') return <><Nav /><main className="site-page"><section className="site-hero compact"><p className="eyebrow">ABOUT CAMPUSHUB</p><h1>A modern college built around mentoring, discipline and employability.</h1><p>CampusHub combines rigorous academics with practical labs, faculty guidance, placement readiness and a transparent digital portal for students, teachers and administrators.</p></section><section className="site-band two-col"><div><p className="eyebrow">OUR PURPOSE</p><h2>Education that is structured, personal and industry-aware.</h2><p>We focus on strong fundamentals, weekly progress, real attendance accountability and continuous assessment so every learner knows where they stand.</p></div><div className="feature-list"><article><CheckCircle /><span>Faculty-led class advisory</span></article><article><CheckCircle /><span>Semester-wise marks tracking</span></article><article><CheckCircle /><span>Placement and company updates</span></article><article><CheckCircle /><span>Transparent attendance records</span></article></div></section></main><SiteFooter /></>;
  if (page === 'departments') return <><Nav /><main className="site-page"><section className="site-hero compact"><p className="eyebrow">ACADEMIC DEPARTMENTS</p><h1>Programmes designed for strong careers and deeper learning.</h1><p>Each department brings classroom teaching, practical exposure, mentoring and project work together in one academic path.</p></section><section className="site-band"><div className="pro-grid">{departments.map((x, i) => <article key={x}><Building2 /><h3>{x}</h3><p>{i < 5 ? 'Engineering-focused curriculum with labs, projects and placement preparation.' : 'Foundation and applied learning for communication, analysis and leadership.'}</p><span>{i % 2 ? 'Undergraduate programmes' : 'Core academic department'}</span></article>)}</div></section></main><SiteFooter /></>;
  if (page === 'admissions') return <><Nav /><main className="site-page"><section className="site-hero admissions"><div><p className="eyebrow">ADMISSIONS 2026</p><h1>Start your application with clear steps and real support.</h1><p>Apply for undergraduate and postgraduate programmes. Our admissions team reviews eligibility, documents and counselling preferences before seat confirmation.</p><Link className="button light" to="/login">Open portal</Link></div></section><section className="site-band"><div className="process-grid">{process.map((x, i) => <article key={x}><b>{String(i + 1).padStart(2, '0')}</b><h3>{x}</h3><p>{['Create your candidate profile and select a programme.', 'Upload marksheets, identity proof and contact details.', 'Meet the academic team and review programme fit.', 'Complete fee formalities and receive your student ID.'][i]}</p></article>)}</div></section></main><SiteFooter /></>;
  return <><Nav /><main className="landing professional"><section className="site-hero home"><div><p className="eyebrow">WELCOME TO CAMPUSHUB COLLEGE</p><h1>Learn with structure. Grow with mentorship. Graduate career-ready.</h1><p>A professional college management ecosystem for students, faculty and administrators, built around academics, attendance, marks, leaves and placements.</p><div className="hero-actions"><Link className="button light" to="/login">Open portal</Link><Link className="ghost-link" to="/admissions">Admissions 2026</Link></div></div><div className="hero-panel"><strong>26+</strong><span>Years of academic excellence</span><p>Weekly timetable, attendance, marks and placement updates in one connected portal.</p></div></section><section className="public-stats">{stats.map(x => <article key={x[1]}><b>{x[0]}</b><span>{x[1]}</span></article>)}</section><section className="site-band"><div className="section-head"><p className="eyebrow">ACADEMIC EXPERIENCE</p><h2>Everything a campus needs to run clearly.</h2></div><div className="pro-grid"><article><Users /><h3>Student Portal</h3><p>Attendance percentage, timetable, marks, leave requests and class adviser details.</p></article><article><GraduationCap /><h3>Faculty Portal</h3><p>Assigned students, current-day attendance marking and weekly teaching schedule.</p></article><article><ClipboardList /><h3>Admin Control</h3><p>Manage students, teachers, departments, courses, marks, attendance and approvals.</p></article></div></section></main><SiteFooter /></>;
}

function SiteFooter() {
  return <footer className="site-footer"><b>Campus<span>Hub</span></b><p>2026 CampusHub College - Learn. Lead. Transform.</p></footer>;
}

function Login({ setUser }: { setUser: (x: User) => void }) {
  const [email, setEmail] = useState('admin@campus.edu'), [password, setPassword] = useState('Admin@123'), [error, setError] = useState('');
  const go = useNavigate();
  async function login(e: any) {
    e.preventDefault();
    try {
      const r = await api.post('/auth/login', { email, password });
      localStorage.token = r.data.access_token;
      const me = (await api.get('/auth/me')).data;
      setUser(me);
      go('/app/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Login failed');
    }
  }
  return <div className="login"><form onSubmit={login}><b>Campus<span>Hub</span></b><h1>Welcome back</h1><p>Sign in to your college portal.</p>{error && <div className="error">{error}</div>}<label>Email<input type="email" value={email} onChange={e => setEmail(e.target.value)} /></label><label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} /></label><button>Sign in</button><Link to="/">Back to website</Link></form></div>;
}

function Timetable({ items, attendanceRows = [], onClassSelect, selectedSubject }: { items: any[]; attendanceRows?: any[]; onClassSelect?: (subject: string) => void; selectedSubject?: string }) {
  const statusFor = (dateValue: string, subject: string) => attendanceRows.find(r => r.date === dateValue && r.subject === subject)?.status;
  const today = new Date().toISOString().slice(0, 10);
  return <section className="table-card timetable"><h2>Current week timetable</h2>{items?.map(x => <div className="day week-row" key={x.day}><div><b>{x.day}</b><small>{x.date}</small></div>{x.classes.map((c: any) => { const status = statusFor(x.date, c.subject); const isToday = x.date === today; return <button type="button" key={c.time + c.subject} className={selectedSubject === c.subject && isToday ? 'class-slot selected' : 'class-slot'} disabled={!onClassSelect || !isToday} onClick={() => onClassSelect?.(c.subject)}><span>{c.time}</span><b>{c.subject}</b><small>{c.room}</small>{status && <em className={'status-pill ' + String(status).toLowerCase()}>{status}</em>}</button>; })}</div>)}</section>;
}

function DayWiseAttendance({ rows }: { rows: any[] }) {
  if (!rows?.length) return <section className="table-card day-attendance"><h2>Day-wise attendance</h2><p className="empty">No attendance marked yet.</p></section>;
  return <section className="table-card day-attendance"><h2>Day-wise attendance</h2><div className="attendance-days">{rows.slice(0, 10).map((r, i) => <article key={r.id || i}><div><b>{r.day || '-'}</b><span>{r.date} - {r.subject}</span></div><span className={'status-pill ' + String(r.status).toLowerCase()}>{r.status}</span><strong>{r.percentage}</strong></article>)}</div></section>;
}

function Dashboard({ user }: { user: User }) {
  const [data, setData] = useState<any>();
  useEffect(() => { api.get(user.role === 'student' ? '/portal/student' : user.role === 'faculty' ? '/portal/faculty' : '/dashboard/stats').then(r => setData(r.data)); }, [user.role]);
  if (!data) return <div className="loading">Loading your portal...</div>;
  if (user.role === 'student') {
    const cards = [['Semester', data.student.semester], ['Marks', data.marks?.length || 0], ['Attendance', `${data.student.attendance_percent || 0}%`], ['Leave requests', data.leaves?.length || 0]];
    return <div className="page"><div className="page-heading"><div><p className="eyebrow">STUDENT PORTAL</p><h1>Welcome, {data.student.name}</h1><p>{data.student.roll_number} - Year {data.student.year} - Class adviser: <b>{data.adviser}</b></p></div></div><div className="cards">{cards.map(x => <article className="card" key={x[0]}><span>{x[0]}</span><b>{x[1]}</b><small>Your academic record</small></article>)}</div><Timetable items={data.timetable} attendanceRows={data.attendance} /><section className="table-card"><h2>Semester marks</h2><Table data={data.marks} /></section><section className="table-card"><h2>Attendance register</h2><Table data={data.attendance} /></section></div>;
  }
  if (user.role === 'faculty') {
    const cards = [['Assigned students', data.students?.length || 0], ['Adviser class', data.adviser_class], ['Weekly days', data.timetable?.length || 0], ['Portal role', 'Faculty']];
    return <div className="page"><div className="page-heading"><div><p className="eyebrow">FACULTY PORTAL</p><h1>{data.faculty.name}</h1><p>{data.faculty.designation} - Class adviser: {data.adviser_class}</p></div></div><div className="cards">{cards.map(x => <article className="card" key={x[0]}><span>{x[0]}</span><b>{x[1]}</b><small>Faculty dashboard</small></article>)}</div><Timetable items={data.timetable} /><section className="table-card"><h2>Students assigned to you</h2><Table data={data.students} /></section></div>;
  }
  const cards = [['Students', data.students], ['Faculty', data.faculty], ['Departments', data.departments], ['Courses', data.courses], ['Placements', data.placements], ['Notices', data.notices], ['Events', data.events], ['Attendance', `${data.attendance}%`]];
  return <div className="page"><div className="page-heading"><div><p className="eyebrow">ADMIN PORTAL</p><h1>College overview</h1><p>Manage academic records, approvals, notices, placements and attendance.</p></div></div><div className="cards">{cards.map(x => <article className="card" key={x[0]}><span>{x[0]}</span><b>{x[1]}</b><small>Live portal summary</small></article>)}</div><section className="chart table-card"><h2>Admin quick actions</h2><p>Use the sidebar to manage students, faculty, departments, courses, marks, attendance, leaves, notices, events, companies and placements.</p></section></div>;
}

function Table({ data, actions }: { data: any[]; actions?: (row: any) => ReactNode }) {
  if (!data?.length) return <p className="empty">No records available.</p>;
  const keys = Object.keys(data[0]).filter(x => x !== 'id');
  return <div className="scroll"><table><thead><tr>{keys.map(x => <th key={x}>{x.replace(/_/g, ' ')}</th>)}{actions && <th className="actions-col">Actions</th>}</tr></thead><tbody>{data.map((r, i) => <tr key={r.id || i}>{keys.map(k => <td key={k}>{String(r[k] ?? '-')}</td>)}{actions && <td className="actions-cell">{actions(r)}</td>}</tr>)}</tbody></table></div>;
}

function AdminAcademic({ kind }: { kind: 'marks' | 'attendance' }) {
  const [data, setData] = useState<Item[]>([]), [q, setQ] = useState(''), [open, setOpen] = useState<number | null>(1), [show, setShow] = useState(false), [editing, setEditing] = useState<Item | null>(null), [form, setForm] = useState<any>({});
  const title = kind === 'marks' ? 'Marks' : 'Attendance';
  const load = () => api.get('/' + kind, { params: { q } }).then(r => setData(r.data));
  useEffect(() => { load(); }, [kind]);
  const filtered = data.filter(x => !q || JSON.stringify(x).toLowerCase().includes(q.toLowerCase()));
  const groups = Object.values(filtered.reduce((acc: any, row: any) => { const id = Number(row.student_id); if (!acc[id]) acc[id] = { student_id: id, student: row.student, rows: [] }; acc[id].rows.push(row); return acc; }, {})).sort((a: any, b: any) => a.student_id - b.student_id) as any[];
  function clean(payload: any) {
    const p = { ...payload };
    for (const k in p) {
      if (!fields[kind].includes(k)) delete p[k];
      else if (p[k] === '') delete p[k];
      else if (['student_id', 'semester'].includes(k)) p[k] = +p[k];
      else if (['internal', 'practical', 'external'].includes(k)) p[k] = +p[k];
    }
    return p;
  }
  function save(e: any) {
    e.preventDefault();
    const p = clean(form);
    const req = editing ? api.put('/' + kind + '/' + editing.id, p) : api.post('/' + kind, p);
    req.then(() => { setShow(false); setEditing(null); setForm({}); load(); }).catch(err => alert(err.response?.data?.detail || 'Unable to save'));
  }
  function startEdit(row: Item) { setEditing(row); setForm(kind === 'attendance' ? { ...row, attendance_date: row.date } : row); setShow(true); }
  const detailKeys = kind === 'marks' ? ['subject', 'semester', 'internal', 'practical', 'external'] : ['day', 'subject', 'date', 'status', 'percentage'];
  return <div className="page"><div className="page-heading"><div><p className="eyebrow">ADMIN PORTAL</p><h1>{title}</h1><p>Student-wise view. Open a student to update subject records.</p></div><button onClick={() => { setEditing(null); setForm({}); setShow(true); }}><Plus size={17} /> Add record</button></div><section className="table-card grouped-card"><div className="table-tools"><div className="search"><Search size={17} /><input value={q} placeholder={'Search ' + kind} onChange={e => setQ(e.target.value)} /></div><button className="secondary" onClick={load}>Refresh</button></div>{groups.map(g => <article className="student-group" key={g.student_id}><button className="group-head" onClick={() => setOpen(open === g.student_id ? null : g.student_id)}><div><b>{g.student}</b><span>Student ID: {g.student_id} - {g.rows.length} {kind === 'marks' ? 'subjects' : 'attendance records'}</span></div><ChevronDown className={open === g.student_id ? 'rotate' : ''} size={20} /></button>{open === g.student_id && <div className="group-body"><table><thead><tr>{detailKeys.map(k => <th key={k}>{k.replace(/_/g, ' ')}</th>)}<th className="actions-col">Actions</th></tr></thead><tbody>{g.rows.map((row: Item) => <tr key={row.id}>{detailKeys.map(k => <td key={k}>{String(row[k] ?? '-')}</td>)}<td className="actions-cell"><button className="icon-btn" title="Edit" onClick={() => startEdit(row)}><Pencil size={16} /></button></td></tr>)}</tbody></table></div>}</article>)}</section>{show && <div className="modal"><form onSubmit={save}><h2>{editing ? 'Edit' : 'Add'} {title.slice(0, -1)}</h2>{fields[kind].map(f => <label key={f}>{f.replace(/_/g, ' ')}<input required type={f.includes('date') ? 'date' : 'text'} value={form[f] ?? ''} onChange={e => setForm({ ...form, [f]: e.target.value })} /></label>)}<div className="modal-actions"><button className="secondary" type="button" onClick={() => { setShow(false); setEditing(null); }}>Cancel</button><button>Save</button></div></form></div>}</div>;
}

function Records({ kind, user }: { kind: string; user: User }) {
  const [data, setData] = useState<Item[]>([]), [q, setQ] = useState(''), [show, setShow] = useState(false), [editing, setEditing] = useState<Item | null>(null), [form, setForm] = useState<any>({});
  const title = kind[0].toUpperCase() + kind.slice(1);
  const load = () => api.get('/' + kind, { params: { q } }).then(r => setData(r.data));
  useEffect(() => { load(); }, [kind]);
  function clean(payload: any) {
    const p = { ...payload };
    for (const k in p) {
      if (!fields[kind].includes(k)) delete p[k];
      else if (p[k] === '') delete p[k];
      else if (['student_id', 'semester', 'year', 'credits', 'department_id', 'company_id'].includes(k)) p[k] = +p[k];
      else if (k === 'attendance_percent') p[k] = +p[k];
      else if (['internal', 'practical', 'external', 'package_lpa'].includes(k)) p[k] = +p[k];
    }
    return p;
  }
  function save(e: any) {
    e.preventDefault();
    const p = clean(form);
    const req = editing ? api.put('/' + kind + '/' + editing.id, p) : api.post('/' + kind, p);
    req.then(() => { setShow(false); setEditing(null); setForm({}); load(); }).catch(err => alert(err.response?.data?.detail || 'Unable to save'));
  }
  function startEdit(row: Item) { setEditing(row); setForm(kind === 'attendance' ? { ...row, attendance_date: row.date } : row); setShow(true); }
  const canAdd = user.role === 'admin' || (user.role === 'faculty' && kind === 'attendance');
  const canUpdate = user.role === 'admin';
  const canDelete = user.role === 'admin' && kind !== 'marks' && kind !== 'attendance';
  const actionButtons = (row: Item) => <div className="row-actions">{canUpdate && <button className="icon-btn" title="Edit" onClick={() => startEdit(row)}><Pencil size={16} /></button>}{canDelete && <button className="icon-btn danger" title="Delete" onClick={() => confirm('Delete this record?') && api.delete('/' + kind + '/' + row.id).then(load)}><Trash2 size={16} /></button>}</div>;
  return <div className="page"><div className="page-heading"><div><p className="eyebrow">{user.role} PORTAL</p><h1>{title}</h1>{kind === 'students' && user.role === 'admin' && <p>Update attendance percentage from the edit icon.</p>}{user.role !== 'admin' && ['notices', 'events', 'companies', 'placements'].includes(kind) && <p>View only section.</p>}</div>{canAdd && <button onClick={() => { setEditing(null); setForm({}); setShow(true); }}><Plus size={17} /> Add record</button>}</div><div className="table-card"><div className="table-tools"><div className="search"><Search size={17} /><input value={q} placeholder={'Search ' + kind} onChange={e => setQ(e.target.value)} onKeyDown={e => e.key === 'Enter' && load()} /></div><button className="secondary" onClick={load}>Search</button></div><Table data={data} actions={(canUpdate || canDelete) ? actionButtons : undefined} /></div>{show && <div className="modal"><form onSubmit={save}><h2>{editing ? 'Edit' : 'Add'} {title.slice(0, -1)}</h2>{fields[kind].map(f => <label key={f}>{f.replace(/_/g, ' ')}<input required={!['phone', 'gender', 'department_id', 'company_id', 'description', 'venue', 'eligibility'].includes(f)} type={f.includes('date') ? 'date' : f === 'email' ? 'email' : 'text'} value={form[f] ?? ''} onChange={e => setForm({ ...form, [f]: e.target.value })} /></label>)}<div className="modal-actions"><button className="secondary" type="button" onClick={() => { setShow(false); setEditing(null); }}>Cancel</button><button>Save</button></div></form></div>}</div>;
}

function FacultyAttendance() {
  const [data, setData] = useState<any>(), [rows, setRows] = useState<any[]>([]), [subject, setSubject] = useState('');
  const today = new Date().toISOString().slice(0, 10);
  const load = () => Promise.all([api.get('/portal/faculty'), api.get('/attendance')]).then(([portal, attendance]) => { setData(portal.data); setRows(attendance.data); const todayRow = portal.data.timetable.find((x: any) => x.date === today); if (!subject && todayRow?.classes?.[0]) setSubject(todayRow.classes[0].subject); });
  useEffect(() => { load(); }, []);
  const todayClasses = data?.timetable?.find((x: any) => x.date === today)?.classes || [];
  const statusFor = (studentId: number) => rows.find(r => r.student_id === studentId && r.date === today && r.subject === subject)?.status || 'Not marked';
  function mark(studentId: number, status: string) {
    api.post('/attendance', { student_id: studentId, subject, attendance_date: today, status }).then(load).catch(err => alert(err.response?.data?.detail || 'Unable to mark attendance'));
  }
  if (!data) return <div className="loading">Loading assigned students...</div>;
  return <div className="page"><div className="page-heading"><div><p className="eyebrow">FACULTY PORTAL</p><h1>Attendance</h1><p>Mark attendance from today's timetable only. Previous/future days are visible but locked for faculty.</p></div></div><Timetable items={data.timetable} attendanceRows={rows} onClassSelect={setSubject} selectedSubject={subject} /><section className="table-card"><div className="attendance-toolbar"><label>Today's class<select value={subject} onChange={e => setSubject(e.target.value)}>{todayClasses.map((x: any) => <option key={x.time + x.subject} value={x.subject}>{x.time} - {x.subject}</option>)}</select></label><span>{new Date(today).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}</span></div><div className="scroll"><table><thead><tr><th>Roll number</th><th>Student</th><th>Semester</th><th>Selected subject</th><th>Status</th><th>Attendance</th><th>Action</th></tr></thead><tbody>{data.students.map((s: any) => { const st = statusFor(s.id); return <tr key={s.id}><td>{s.roll_number}</td><td>{s.name}</td><td>{s.semester}</td><td>{subject || 'No class today'}</td><td><span className={'status-pill ' + String(st).toLowerCase().replace(' ', '-')}>{st}</span></td><td>{s.attendance_percent || 0}%</td><td><div className="row-actions present-absent"><button className={st === 'Present' ? 'present-btn active' : 'present-btn'} disabled={!subject} onClick={() => mark(s.id, 'Present')}>Present</button><button className={st === 'Absent' ? 'absent-btn active' : 'absent-btn'} disabled={!subject} onClick={() => mark(s.id, 'Absent')}>Absent</button></div></td></tr>; })}</tbody></table></div></section></div>;
}

function Leaves({ user }: { user: User }) {
  const [data, setData] = useState<any[]>([]), [form, setForm] = useState<any>({});
  const load = () => api.get(user.role === 'student' ? '/portal/student' : '/leaves').then(r => setData(user.role === 'student' ? r.data.leaves : r.data));
  useEffect(() => { load(); }, [user.role]);
  if (user.role === 'student') return <div className="page"><div className="page-heading"><h1>Leave request</h1></div><div className="table-card leave-form"><form onSubmit={e => { e.preventDefault(); api.post('/leaves', form).then(() => { setForm({}); load(); }); }}><label>Reason<input required value={form.reason || ''} onChange={e => setForm({ ...form, reason: e.target.value })} /></label><label>From<input required type="date" onChange={e => setForm({ ...form, from_date: e.target.value })} /></label><label>To<input required type="date" onChange={e => setForm({ ...form, to_date: e.target.value })} /></label><button>Submit leave</button></form></div><section className="table-card"><h2>My requests</h2><Table data={data} /></section></div>;
  return <div className="page"><div className="page-heading"><h1>Leave approvals</h1></div><section className="table-card"><Table data={data} />{data.filter(x => x.status === 'Pending').map(x => <button key={x.id} onClick={() => api.put('/leaves/' + x.id + '/approve').then(load)}>Approve #{x.id}</button>)}</section></div>;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(!localStorage.token);
  useEffect(() => {
    if (!localStorage.token) return;
    api.get('/auth/me').then(r => setUser(r.data)).catch(() => localStorage.removeItem('token')).finally(() => setAuthReady(true));
  }, []);
  function Shell() {
    const go = useNavigate();
    const list = user!.role === 'admin' ? adminNav : user!.role === 'student' ? studentNav : facultyNav;
    return <div className="shell"><aside><Link className="brand" to="/app/dashboard">Campus<span>Hub</span></Link><p className="role">{user!.role} portal</p>{list.map(n => { const I = icons[n]; return <Link key={n} to={'/app/' + n}><I size={18} />{n}</Link>; })}<button className="logout" onClick={() => { localStorage.removeItem('token'); setUser(null); go('/login'); }}><LogOut size={18} />Logout</button></aside><main className="content"><header><div><b>{user!.name}</b><span>{user!.email}</span></div></header><Routes><Route path="dashboard" element={<Dashboard user={user!} />} /><Route path="leave" element={<Leaves user={user!} />} /><Route path="leaves" element={<Leaves user={user!} />} />{list.filter(x => !['dashboard', 'leave', 'leaves'].includes(x)).map(n => <Route key={n} path={n} element={user!.role === 'faculty' && n === 'attendance' ? <FacultyAttendance /> : user!.role === 'admin' && (n === 'marks' || n === 'attendance') ? <AdminAcademic kind={n as 'marks' | 'attendance'} /> : <Records kind={n} user={user!} />} />)}<Route path="*" element={<Navigate to="dashboard" />} /></Routes></main></div>;
  }
  return <Routes><Route path="/" element={<Public />} /><Route path="/about" element={<Public page="about" />} /><Route path="/departments" element={<Public page="departments" />} /><Route path="/admissions" element={<Public page="admissions" />} /><Route path="/login" element={user ? <Navigate to="/app/dashboard" /> : <Login setUser={setUser} />} /><Route path="/app/*" element={!authReady ? <div className="loading">Loading your portal...</div> : user ? <Shell /> : <Navigate to="/login" />} /></Routes>;
}

createRoot(document.getElementById('root')!).render(<BrowserRouter><App /></BrowserRouter>);
