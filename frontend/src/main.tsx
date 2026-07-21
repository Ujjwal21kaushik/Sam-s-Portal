import { useEffect, useState, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LayoutDashboard, Users, GraduationCap, Building2, BookOpen, ClipboardList, CalendarDays, LogOut, Plus, Search, CheckCircle, Clock, Pencil, Trash2, ChevronDown, Shield, LogIn, Menu, X, ArrowRight, Award, Bell, ShieldCheck, Mail, Phone, MapPin, ArrowLeft, FlaskConical, ExternalLink, Book, Filter, Camera, Maximize2, HelpCircle, Send, Sparkles, CheckCircle2, User as UserIcon } from 'lucide-react';
import './styles.css';
import heroImage from './assets/images/gla_university_campus_hero_1784644580488.jpg';

type User = { name: string; email: string; role: string };
type Item = Record<string, any> & { id: number };

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api' });
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

type PublicFaculty = { id: string; name: string; designation: string; department: string; email: string; phone: string; specialization: string; subjects: string[]; avatarUrl: string; isHod?: boolean };
type PublicDepartment = { code: string; name: string; description: string; hodId: string; labs: string[]; intake: number; established: number };
type PublicNotice = { id: string; title: string; content: string; date: string; category: 'General' | 'Examination' | 'Placement' | 'Departmental'; postedBy: string; departmentCode?: string };

const publicFaculties: PublicFaculty[] = [
  { id: 'FAC001', name: 'Dr. Anand Singh Jalal', designation: 'Professor & Head of Department', department: 'CEA', email: 'anand.jalal@gla.ac.in', phone: '+91 9412345678', specialization: 'Computer Vision, Image Processing & Web Technologies', subjects: ['Web Technologies', 'Advanced Computer Graphics'], avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200', isHod: true },
  { id: 'FAC002', name: 'Dr. Dilip Kumar Sharma', designation: 'Professor & Dean (Academics)', department: 'CSE', email: 'dilip.sharma@gla.ac.in', phone: '+91 9411223344', specialization: 'Software Engineering & Database Systems', subjects: ['Database Management Systems', 'Software Engineering'], avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200', isHod: true },
  { id: 'FAC003', name: 'Dr. Diwakar Bhardwaj', designation: 'Associate Professor', department: 'CSE', email: 'diwakar.bhardwaj@gla.ac.in', phone: '+91 9512341234', specialization: 'Data Structures & Analysis of Algorithms', subjects: ['Design & Analysis of Algorithms', 'Data Structures'], avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=200' },
  { id: 'FAC004', name: 'Dr. Ashish Sharma', designation: 'Professor', department: 'ECE', email: 'ashish.sharma@gla.ac.in', phone: '+91 9612345678', specialization: 'Network Security & Cryptography', subjects: ['Cryptography & Network Security', 'Computer Networks'], avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200', isHod: true },
  { id: 'FAC005', name: 'Dr. Manoj Kumar', designation: 'Professor', department: 'ME', email: 'manoj.kumar@gla.ac.in', phone: '+91 9712345678', specialization: 'Cloud Computing & Distributed Systems', subjects: ['Cloud Computing', 'Operating Systems'], avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200', isHod: true },
  { id: 'FAC006', name: 'Dr. Charul Bhatnagar', designation: 'Associate Professor', department: 'CSE', email: 'charul.bhatnagar@gla.ac.in', phone: '+91 9812345678', specialization: 'Artificial Intelligence & Machine Learning', subjects: ['Artificial Intelligence', 'Machine Learning'], avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200' }
];

const publicDepartments: PublicDepartment[] = [
  { code: 'CEA', name: 'Computer Engineering & Applications', description: 'Premium engineering education in software development, web engineering, systems architecture, and mobile computing.', hodId: 'FAC001', labs: ['Advanced Computing Lab', 'Web Technology Lab', 'Cloud & IoT Lab', 'Graphics & Vision Lab'], intake: 480, established: 1998 },
  { code: 'CSE', name: 'Computer Science & Engineering', description: 'Fundamental computation, machine learning, artificial intelligence, cybersecurity, databases, and distributed network engineering.', hodId: 'FAC002', labs: ['AI & ML Research Lab', 'Network Security Lab', 'DBMS Lab', 'Programming Paradigm Lab'], intake: 600, established: 2002 },
  { code: 'ECE', name: 'Electronics & Communication Engineering', description: 'Microprocessors, signal processing, VLSI design, wireless networks, and embedded electronic systems.', hodId: 'FAC004', labs: ['VLSI Lab', 'Digital Signal Processing Lab', 'Embedded Systems Lab', 'Communication Systems Lab'], intake: 180, established: 1998 },
  { code: 'ME', name: 'Mechanical Engineering', description: 'Thermodynamics, robotics, machine design, CAD/CAM automation, and advanced materials engineering.', hodId: 'FAC005', labs: ['Thermal Engineering Lab', 'Robotics Lab', 'Automobile Engineering Lab', 'Machine Shop'], intake: 120, established: 1999 }
];

const publicNotices: PublicNotice[] = [
  { id: 'N001', title: 'Mid Semester Examination Schedule (Fall Semester)', content: 'Mid Semester Examinations will begin from 15 August 2026. Detailed schedules, seating charts, and exam guidelines are available on department notice boards.', date: '2026-07-20', category: 'Examination', postedBy: 'Dr. Dilip Kumar Sharma' },
  { id: 'N002', title: 'Vocational/Summer Internship Report Submission Deadline', content: 'Students of CSE, CEA, and CSIT must submit final internship reports with certificates by 31 July 2026.', date: '2026-07-18', category: 'Departmental', postedBy: 'Dr. Anand Singh Jalal', departmentCode: 'CEA' },
  { id: 'N003', title: 'Placement Drive Alert: TCS Digital Drive', content: 'TCS is conducting a pool campus recruitment drive for CS/IT/ECE branches with CGPA above 7.0 and no active backlogs.', date: '2026-07-15', category: 'Placement', postedBy: 'Administration' },
  { id: 'N004', title: 'New Batch Orientation & Program Commencement', content: 'The incoming batch orientation will commence from 1 August 2026 in the central auditorium. Regular classes begin from 3 August 2026.', date: '2026-07-10', category: 'General', postedBy: 'Administration' }
];

function Nav() {
  const [open, setOpen] = useState(false);
  const links = [['/', 'Home'], ['/departments', 'Departments'], ['/faculty', 'Faculty'], ['/admissions', 'Admissions'], ['/gallery', 'Gallery'], ['/notices', 'Notice Board']];
  return <header className="gla-nav"><Link className="gla-brand" to="/"><span><Shield size={22} /></span><b>GLA UNIVERSITY<small>College Management Portal</small></b></Link><button className="gla-menu" onClick={() => setOpen(!open)} title="Menu">{open ? <X /> : <Menu />}</button><nav className={open ? 'open' : ''}>{links.map(([to, label]) => <Link key={to} to={to} onClick={() => setOpen(false)}>{label}</Link>)}<Link className="gla-login-link" to="/login" onClick={() => setOpen(false)}><LogIn size={16} />Portal Login</Link></nav></header>;
}

function PageShell({ children }: { children: ReactNode }) {
  return <><Nav /><main className="gla-site">{children}</main><SiteFooter /></>;
}

function HomePage() {
  const stats = [{ label: 'Total Students', value: '10,000+', icon: Users, desc: 'Across diverse disciplines' }, { label: 'Faculty Members', value: '500+', icon: GraduationCap, desc: 'Distinguished scholars and experts' }, { label: 'Academic Depts', value: '12+', icon: Building2, desc: 'Engineering, management and more' }, { label: 'Placement Rate', value: '95%', icon: Award, desc: 'Consistent campus placements' }];
  return <PageShell><section className="gla-ticker">
  <b>
    <Bell size={14} />
    Latest
  </b>
  <div className="cover">
    <div className="gla-ticker-content">
      {publicNotices.map((n) => (
        <span key={n.id}>
          {n.title} ({new Date(n.date).toLocaleDateString()}) - {n.postedBy}
        </span>
      ))}
    </div>
  </div>
</section>
<section className="gla-hero"><img src={heroImage} alt="GLA University Campus" /><div><p className="gla-kicker"><ShieldCheck size={16} />Accredited with NAAC A+ Grade</p><h1>GLA <span>UNIVERSITY</span></h1><p>Empowering minds, building futures. Discover a dynamic educational ecosystem designed for academic excellence and transparent campus management.</p><div className="gla-actions"><Link className="gla-primary" to="/departments">Explore Departments <ArrowRight size={18} /></Link><Link className="gla-secondary" to="/login">Portal Login</Link></div></div></section><section className="gla-stats">{stats.map(stat => { const Icon = stat.icon; return <article key={stat.label}><Icon /><div><b>{stat.value}</b><span>{stat.label}</span><small>{stat.desc}</small></div></article>; })}</section><section className="gla-home-grid"><article className="gla-card wide"><p className="gla-eyebrow">Academic Portal</p><h2>Centralized Academic & Administrative Management</h2><p>GLA University College Management Portal streamlines operations across departments and supports specialized views for administrators, faculty members, and students.</p><p>From student records and examination alerts to campus placement details, the portal minimizes manual paperwork and promotes transparency.</p><Link to="/admissions">View Admissions <ArrowRight size={16} /></Link></article><article className="gla-card dark"><h3><BookOpen size={20} />Recent Notices</h3>{publicNotices.slice(0, 3).map(n => <Link to="/notices" key={n.id} className="gla-mini-notice"><small>{n.category}</small><b>{n.title}</b><span>{new Date(n.date).toLocaleDateString()}</span></Link>)}</article></section></PageShell>;
}

function DepartmentsPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const dept = publicDepartments.find(d => d.code === selected);
  if (dept) {
    const hod = publicFaculties.find(f => f.id === dept.hodId);
    const faculty = publicFaculties.filter(f => f.department === dept.code);
    const notices = publicNotices.filter(n => n.departmentCode === dept.code);
    return <PageShell><section className="gla-container"><button className="gla-back" onClick={() => setSelected(null)}><ArrowLeft size={18} />Back to Departments</button><div className="gla-dept-hero"><p className="gla-eyebrow">Department Profile ({dept.code})</p><h1>{dept.name}</h1><p>{dept.description}</p><div><span><Users size={16} />Annual Intake: {dept.intake}</span><span><CalendarDays size={16} />Established: {dept.established}</span></div></div>{hod && <article className="gla-card gla-profile"><img src={hod.avatarUrl} alt={hod.name} /><div><p className="gla-eyebrow">Head of Department</p><h2>{hod.name}</h2><strong>{hod.designation}</strong><p>{hod.specialization}</p><span><Mail size={15} />{hod.email}</span><span><Phone size={15} />{hod.phone}</span></div></article>}<div className="gla-split"><article className="gla-card"><h2>Department Faculty Members</h2><div className="gla-person-list">{faculty.map(f => <div key={f.id}><img src={f.avatarUrl} alt={f.name} /><span><b>{f.name}</b><small>{f.designation}</small></span></div>)}</div></article><aside className="gla-card"><h2>State-of-the-Art Labs</h2>{dept.labs.map(lab => <p className="gla-lab" key={lab}><FlaskConical size={18} />{lab}</p>)}{notices.map(n => <div className="gla-mini-notice light" key={n.id}><small>{new Date(n.date).toLocaleDateString()}</small><b>{n.title}</b></div>)}</aside></div></section></PageShell>;
  }
  return <PageShell><section className="gla-container"><div className="gla-page-head"><p className="gla-eyebrow">GLA Academic Hub</p><h1>Explore Academic Departments</h1><p>Each department at GLA University brings strong laboratories, research focus, and experienced faculty guidance.</p></div><div className="gla-dept-grid">{publicDepartments.map(d => { const hod = publicFaculties.find(f => f.id === d.hodId); return <article className="gla-card dept" key={d.code} onClick={() => setSelected(d.code)}><div><small>{d.code}</small><span>Est. {d.established}</span></div><h2>{d.name}</h2><p>{d.description}</p><footer><b>HOD: {hod?.name || 'N/A'}</b><em>View Details <ExternalLink size={14} /></em></footer></article>; })}</div></section></PageShell>;
}

function FacultyPage() {
  const [q, setQ] = useState(''), [dept, setDept] = useState('ALL');
  const faculties = publicFaculties.filter(f => (dept === 'ALL' || f.department === dept) && (f.name + f.specialization + f.subjects.join(' ')).toLowerCase().includes(q.toLowerCase()));
  return <PageShell><section className="gla-container"><div className="gla-page-head"><p className="gla-eyebrow">GLA Intellectual Pillars</p><h1>Respective Subject Faculties</h1><p>Meet the subject experts and research leaders guiding students across GLA University departments.</p></div><div className="gla-toolbar"><label><Search size={18} /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search faculties by name, subject, specialization..." /></label><div><Filter size={18} />{['ALL', 'CEA', 'CSE', 'ECE', 'ME'].map(x => <button className={dept === x ? 'active' : ''} key={x} onClick={() => setDept(x)}>{x === 'ALL' ? 'All Departments' : x}</button>)}</div></div><div className="gla-faculty-grid">{faculties.map(f => <article className="gla-card faculty" key={f.id}><div><img src={f.avatarUrl} alt={f.name} /><span><h2>{f.name}</h2><strong>{f.designation}</strong><small>Dept: {f.department}</small></span></div><p><b>Specialization:</b> {f.specialization}</p><p><Book size={15} /> {f.subjects.join(', ')}</p><footer><span><Mail size={14} />{f.email}</span><span><Phone size={14} />{f.phone}</span></footer></article>)}</div></section></PageShell>;
}

function AdmissionsPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', program: 'B.Tech CSE', qualification: '', message: '' }), [done, setDone] = useState(false);
  const programs = ['B.Tech CSE / CEA', 'B.Tech Electronics & Communication', 'M.Tech Computer Engineering', 'Ph.D. Computer Sciences'];
  return <PageShell><section className="gla-container"><div className="gla-page-head"><p className="gla-eyebrow">GLA Admissions 2026</p><h1>Join GLA University Mathura</h1><p>Explore engineering programs, world-class labs, and campus placement support.</p></div><div className="gla-admission-layout"><div><article className="gla-card"><h2><ClipboardList size={20} />Available Engineering Programs</h2>{programs.map((p, i) => <div className="gla-program" key={p}><b>{p}</b><span>{i < 2 ? '4 Years (8 Semesters)' : i === 2 ? '2 Years (4 Semesters)' : '3-5 Years'}</span><p>{i === 0 ? 'Software engineering, web technologies, artificial intelligence, and cybersecurity.' : i === 1 ? 'VLSI design, embedded systems, IoT, microwave and wireless systems.' : i === 2 ? 'Advanced machine learning, distributed databases, and cloud cryptography.' : 'Research in computer vision, deep learning, and advanced computing.'}</p></div>)}</article><article className="gla-card dark"><h2><HelpCircle size={20} />Frequently Asked Questions</h2><p><b>What is GLAET?</b> GLAET is the GLA University Online Entrance Test for registered candidates.</p><p><b>Are scholarships available?</b> Merit scholarships are available based on 10+2 scores or JEE Mains percentile.</p></article></div><article className="gla-card enquiry"><h2><Sparkles size={20} />Admission Enquiry</h2>{done ? <div className="gla-success"><CheckCircle2 size={48} /><h3>Enquiry Submitted</h3><p>Thank you, {form.name}. Our admissions counselor will call you shortly on {form.phone}.</p><button onClick={() => setDone(false)}>Submit Another Enquiry</button></div> : <form onSubmit={e => { e.preventDefault(); setDone(true); }}><label>Student Full Name<input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></label><label>Email Address<input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></label><label>Mobile Number<input required value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></label><label>Desired Program<select value={form.program} onChange={e => setForm({ ...form, program: e.target.value })}>{programs.map(p => <option key={p}>{p}</option>)}</select></label><label>Latest Qualification / Marks<input required value={form.qualification} onChange={e => setForm({ ...form, qualification: e.target.value })} /></label><label>Additional Message<textarea rows={3} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} /></label><button><Send size={16} />Submit Enquiry Form</button></form>}</article></div></section></PageShell>;
}

function GalleryPage() {
  const [active, setActive] = useState<number | null>(null);
  const images = ['Central Academic Block', 'State-of-the-Art Labs', 'Central Library Hall', 'Annual Convocation Ceremony', 'Student Innovation Hub', 'Lush Green Pathways'].map((title, i) => ({ title, url: ['https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1673901824701-143e79e862a1?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?auto=format&fit=crop&q=80&w=800'  , 'https://plus.unsplash.com/premium_photo-1723485672935-0da44f14070c?q=80&w=1157&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?auto=format&fit=crop&q=80&w=800', 'https://images.unsplash.com/photo-1659431241835-af54904e56a2?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D?auto=format&fit=crop&q=80&w=800'][i], desc: 'Campus infrastructure and student life at GLA University.' }));
  return <PageShell><section className="gla-container"><div className="gla-page-head"><p className="gla-eyebrow">Campus Gallery</p><h1>Explore Moments & Infrastructure</h1><p>Take a visual tour around GLA University's campus, academic spaces, and student life.</p></div><div className="gla-gallery">{images.map((img, i) => <article className="gla-card" key={img.title}><div><img src={img.url} alt={img.title} /><button onClick={() => setActive(i)} title="Expand View"><Maximize2 size={18} /></button></div><h2><Camera size={17} />{img.title}</h2><p>{img.desc}</p></article>)}</div>{active !== null && <div className="gla-lightbox"><button onClick={() => setActive(null)}><X /></button><figure><img src={images[active].url} alt={images[active].title} /><figcaption><b>{images[active].title}</b><span>{images[active].desc}</span></figcaption></figure></div>}</section></PageShell>;
}

function NoticesPage() {
  const [q, setQ] = useState(''), [cat, setCat] = useState('ALL');
  const notices = publicNotices.filter(n => (cat === 'ALL' || n.category === cat) && (n.title + n.content + n.postedBy).toLowerCase().includes(q.toLowerCase()));
  return <PageShell><section className="gla-container"><div className="gla-page-head"><p className="gla-eyebrow">GLA Official Bulletins</p><h1>University Notice Board</h1><p>Stay informed with exam, registration, placement, and departmental notifications.</p></div><div className="gla-toolbar"><label><Search size={18} /><input value={q} onChange={e => setQ(e.target.value)} placeholder="Search notices by keyword, author..." /></label><div><Filter size={18} />{['ALL', 'General', 'Examination', 'Placement', 'Departmental'].map(x => <button className={cat === x ? 'active' : ''} key={x} onClick={() => setCat(x)}>{x === 'ALL' ? 'All' : x}</button>)}</div></div><div className="gla-notice-stack">{notices.map(n => <article className={'gla-card notice ' + n.category.toLowerCase()} key={n.id}><div><span>{n.category}</span>{n.departmentCode && <small>Dept: {n.departmentCode}</small>}<em><CalendarDays size={14} />{new Date(n.date).toLocaleDateString()} <UserIcon size={14} />{n.postedBy}</em></div><h2>{n.title}</h2><p>{n.content}</p></article>)}</div></section></PageShell>;
}

function Public({ page = 'home' }: { page?: string }) {
  if (page === 'departments') return <DepartmentsPage />;
  if (page === 'faculty') return <FacultyPage />;
  if (page === 'admissions') return <AdmissionsPage />;
  if (page === 'gallery') return <GalleryPage />;
  if (page === 'notices') return <NoticesPage />;
  return <HomePage />;
}

function SiteFooter() {
  return <footer className="gla-footer"><div><b><Shield size={18} />GLA UNIVERSITY</b><p>Established under UP Act State Private University, GLA is Mathura's premier educational beacon with robust digital governance platforms.</p></div><div><h4>Academic Resources</h4><Link to="/departments">Academic Departments</Link><Link to="/faculty">Respective Subject Faculty</Link><Link to="/notices">Bulletins & Active Notices</Link></div><div><h4>University Address</h4><p><MapPin size={15} />17km Stone, NH-2, Mathura-Delhi Road, P.O. Chaumuhan, Mathura, Uttar Pradesh 281406</p><p><Phone size={15} />+91-5662-250900 / 250909</p><p><Mail size={15} />admission@gla.ac.in</p></div><small>© {new Date().getFullYear()} GLA University, Mathura. All Rights Reserved.</small></footer>;
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
  return <div className="login gla-login"><form onSubmit={login}><b>GLA <span>University</span></b><h1>Welcome back</h1><p>Sign in to your college portal.</p>{error && <div className="error">{error}</div>}<label>Email<input type="email" value={email} onChange={e => setEmail(e.target.value)} /></label><label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} /></label><button>Sign in</button><Link to="/">Back to website</Link></form></div>;
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
    return <div className="shell portal-shell"><aside><Link className="brand" to="/app/dashboard"><Shield size={22} />GLA<span>University</span></Link><p className="role">{user!.role} portal</p>{list.map(n => { const I = icons[n]; return <Link key={n} to={'/app/' + n}><I size={18} />{n}</Link>; })}<button className="logout" onClick={() => { localStorage.removeItem('token'); setUser(null); go('/login'); }}><LogOut size={18} />Logout</button></aside><main className="content"><header><Link className="portal-home-link" to="/">Website</Link><div><b>{user!.name}</b><span>{user!.email}</span></div></header><Routes><Route path="dashboard" element={<Dashboard user={user!} />} /><Route path="leave" element={<Leaves user={user!} />} /><Route path="leaves" element={<Leaves user={user!} />} />{list.filter(x => !['dashboard', 'leave', 'leaves'].includes(x)).map(n => <Route key={n} path={n} element={user!.role === 'faculty' && n === 'attendance' ? <FacultyAttendance /> : user!.role === 'admin' && (n === 'marks' || n === 'attendance') ? <AdminAcademic kind={n as 'marks' | 'attendance'} /> : <Records kind={n} user={user!} />} />)}<Route path="*" element={<Navigate to="dashboard" />} /></Routes></main></div>;
  }
  return <Routes><Route path="/" element={<Public />} /><Route path="/about" element={<Public />} /><Route path="/departments" element={<Public page="departments" />} /><Route path="/faculty" element={<Public page="faculty" />} /><Route path="/admissions" element={<Public page="admissions" />} /><Route path="/gallery" element={<Public page="gallery" />} /><Route path="/notices" element={<Public page="notices" />} /><Route path="/login" element={user ? <Navigate to="/app/dashboard" /> : <Login setUser={setUser} />} /><Route path="/app/*" element={!authReady ? <div className="loading">Loading your portal...</div> : user ? <Shell /> : <Navigate to="/login" />} /></Routes>;
}

createRoot(document.getElementById('root')!).render(<BrowserRouter><App /></BrowserRouter>);
