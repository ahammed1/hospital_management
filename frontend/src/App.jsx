import './App.css';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Activity, Bell, Building2, CalendarDays, Check, ChevronDown, ChevronLeft,
  ChevronRight, CircleHelp, Clock3, FileText, HeartPulse, LayoutDashboard,
  LogOut, Menu, Plus, Search, Settings, ShieldCheck, Stethoscope, Users,
  UserRound, X, ArrowUpRight, ClipboardList, Pill, LoaderCircle
} from 'lucide-react';
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts';
import api from './services/api';

const navItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'appointments', label: 'Appointments', icon: CalendarDays },
  { id: 'doctors', label: 'Doctors', icon: Stethoscope },
  { id: 'patients', label: 'Patients', icon: Users },
  { id: 'departments', label: 'Departments', icon: Building2 },
  { id: 'records', label: 'Medical records', icon: FileText },
  { id: 'prescriptions', label: 'Prescriptions', icon: Pill }
];

const demoChart = [
  { day: 'Mon', visits: 18 }, { day: 'Tue', visits: 27 }, { day: 'Wed', visits: 22 },
  { day: 'Thu', visits: 35 }, { day: 'Fri', visits: 30 }, { day: 'Sat', visits: 42 },
  { day: 'Sun', visits: 32 }
];

function initials(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase() || 'MC';
}
function dateLabel(date) {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(date));
}
function timeLabel(date) {
  if (!date) return '—';
  return new Intl.DateTimeFormat('en', { hour: 'numeric', minute: '2-digit' }).format(new Date(date));
}
function friendlyError(error) {
  return error.response?.data?.message || (error.code === 'ERR_NETWORK'
    ? 'Cannot reach the API. Start the backend and check MongoDB Atlas configuration.'
    : 'Something went wrong. Please try again.');
}

function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const update = e => setForm({ ...form, [e.target.name]: e.target.value });

  async function submit(e) {
    e.preventDefault(); setBusy(true); setError('');
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const { data } = await api.post(endpoint, form);
      localStorage.setItem('medicore_token', data.token);
      localStorage.setItem('medicore_user', JSON.stringify(data.user));
      onLogin(data.user);
    } catch (err) { setError(friendlyError(err)); }
    finally { setBusy(false); }
  }

  return <main className="auth-shell">
    <section className="auth-visual">
      <div className="brand brand-light"><span className="brand-mark"><HeartPulse size={23}/></span><span>MediCore<span className="brand-dot">.</span></span></div>
      <div className="visual-copy">
        <span className="eyebrow"><span className="live-dot"/> SMARTER CARE, CONNECTED</span>
        <h1>Better care<br/>starts <em>here.</em></h1>
        <p>One calm, connected space for the people who make healthcare happen.</p>
        <div className="visual-metric"><div className="metric-icon"><ShieldCheck size={20}/></div><div><strong>Care you can count on</strong><span>Secure, coordinated, patient-first.</span></div></div>
      </div>
      <div className="visual-bottom"><span>Built around better outcomes.</span><span>01 / 04</span></div>
      <div className="visual-orb orb-one"/><div className="visual-orb orb-two"/>
    </section>
    <section className="auth-form-wrap">
      <div className="auth-top"><span className="muted">Healthcare management, reimagined</span><span className="secure-label"><ShieldCheck size={15}/> Secure access</span></div>
      <form className="auth-form" onSubmit={submit}>
        <div className="form-heading"><span className="form-kicker">{mode === 'login' ? 'WELCOME BACK' : 'GET STARTED'}</span><h2>{mode === 'login' ? 'Sign in to MediCore' : 'Create your account'}</h2><p>{mode === 'login' ? 'Enter your details to access your workspace.' : 'Patient registration is open. Staff accounts are created by an administrator.'}</p></div>
        {mode === 'register' && <label>Full name<input name="name" value={form.name} onChange={update} placeholder="e.g. Ahammed Yaseen" autoComplete="name" required/></label>}
        <label>Email address<div className="input-icon"><UserRound size={17}/><input type="email" name="email" value={form.email} onChange={update} placeholder="you@hospital.com" autoComplete="email" required/></div></label>
        {mode === 'register' && <label>Phone number <span className="optional">Optional</span><input name="phone" value={form.phone} onChange={update} placeholder="+91 98765 43210" autoComplete="tel"/></label>}
        <label>Password<input type="password" name="password" value={form.password} onChange={update} placeholder={mode === 'register' ? 'At least 12 characters' : 'Enter your password'} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} minLength={mode === 'register' ? 12 : 1} required/></label>
        {error && <div className="alert-error">{error}</div>}
        <button className="primary-btn auth-submit" disabled={busy}>{busy ? <LoaderCircle className="spin" size={18}/> : null}{mode === 'login' ? 'Sign in securely' : 'Create patient account'}<ArrowUpRight size={18}/></button>
        <div className="auth-switch">{mode === 'login' ? "New to MediCore?" : 'Already have an account?'} <button type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>{mode === 'login' ? 'Create an account' : 'Sign in'}</button></div>
      </form>
      <div className="auth-footer"><span>© 2026 MediCore Health Systems</span><span><ShieldCheck size={14}/> Privacy-first by design</span></div>
    </section>
  </main>;
}

function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('medicore_user') || 'null'); } catch { return null; }
  });
  const [page, setPage] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [stats, setStats] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [records, setRecords] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [modal, setModal] = useState('');
  const [form, setForm] = useState({});
  const [formError, setFormError] = useState('');

  const role = user?.role || 'patient';
  const visibleNav = useMemo(() => navItems.filter(item => {
    if (item.id === 'patients' && role === 'patient') return false;
    if (item.id === 'departments' && !['admin', 'doctor', 'receptionist'].includes(role)) return false;
    if (item.id === 'doctors' && role === 'patient') return true;
    if (['records', 'prescriptions'].includes(item.id) && role === 'receptionist') return false;
    return true;
  }), [role]);

  const loadData = useCallback(async () => {
    if (!user) return;
    setBusy(true);
    try {
      const results = await Promise.allSettled([
        api.get('/dashboard'), api.get('/appointments'), api.get('/doctors'),
        ['admin', 'doctor', 'receptionist'].includes(role) ? api.get('/patients') : Promise.resolve({ data: [] }),
        api.get('/departments'), ['admin', 'doctor', 'patient'].includes(role) ? api.get('/medical-records') : Promise.resolve({ data: [] }),
        ['admin', 'doctor', 'patient'].includes(role) ? api.get('/prescriptions') : Promise.resolve({ data: [] })
      ]);
      const failedRequests = results.filter(result => result.status === 'rejected');
      if (failedRequests.length) {
        const sessionExpired = failedRequests.some(result => result.reason?.response?.status === 401);
        if (sessionExpired) {
          localStorage.removeItem('medicore_token');
          localStorage.removeItem('medicore_user');
          setUser(null);
          setPage('overview');
          setNotice('Your session has expired. Please sign in again.');
          return;
        }
        setNotice(friendlyError(failedRequests[0].reason));
      }

      const take = (i, setter, fallback) => results[i].status === 'fulfilled' ? setter(fallback ? fallback(results[i].value.data) : results[i].value.data) : setter([]);
      take(0, setStats, data => data.stats || []);
      take(1, setAppointments);
      take(2, setDoctors);
      take(3, setPatients);
      take(4, setDepartments);
      take(5, setRecords);
      take(6, setPrescriptions);
    } finally { setBusy(false); }
  }, [user, role]);

  useEffect(() => { loadData(); }, [loadData]);

  function logout() {
    localStorage.removeItem('medicore_token'); localStorage.removeItem('medicore_user');
    setUser(null); setPage('overview');
  }
  function openModal(type) { setForm({}); setFormError(''); setModal(type); }
  async function saveForm(e) {
    e.preventDefault(); setFormError('');
    try {
      if (modal === 'department') await api.post('/departments', form);
      if (modal === 'doctor') await api.post('/doctors', form);
      if (modal === 'appointment') {
        const start = new Date(form.startAt);
        const end = new Date(start.getTime() + Number(form.duration || 30) * 60000);
        await api.post('/appointments', { doctorId: form.doctorId, patientId: form.patientId, startAt: start.toISOString(), endAt: end.toISOString(), reason: form.reason });
      }
      if (modal === 'patient') await api.post('/patients', form);
      setModal(''); setNotice('Changes saved successfully.'); await loadData();
      window.setTimeout(() => setNotice(''), 3500);
    } catch (err) { setFormError(friendlyError(err)); }
  }
  async function updateStatus(id, status) {
    try { await api.patch(`/appointments/${id}/status`, { status }); await loadData(); setNotice('Appointment status updated.'); }
    catch (err) { setNotice(friendlyError(err)); }
    window.setTimeout(() => setNotice(''), 3500);
  }

  if (!user) return <AuthScreen onLogin={setUser}/>;

  const filteredAppointments = appointments.filter(a => {
    const text = `${a.patient?.name || ''} ${a.doctor?.user?.name || ''} ${a.reason || ''} ${a.status || ''}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });
  const pageTitle = page === 'settings' ? 'Settings' : (visibleNav.find(item => item.id === page)?.label || 'Overview');

  return <div className="app-shell">
    {sidebarOpen && <button aria-label="Close navigation" className="mobile-scrim" onClick={() => setSidebarOpen(false)}/>}
    <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <div className="brand"><span className="brand-mark"><HeartPulse size={23}/></span><span>MediCore<span className="brand-dot">.</span></span></div>
      <div className="workspace-label">WORKSPACE <span>•</span></div>
      <nav className="side-nav">
        {visibleNav.map(item => <button key={item.id} className={`nav-item ${page === item.id ? 'active' : ''}`} onClick={() => { setPage(item.id); setSidebarOpen(false); }}><item.icon size={18}/><span>{item.label}</span>{item.id === 'appointments' && appointments.filter(a => ['scheduled','confirmed'].includes(a.status)).length > 0 && <span className="nav-count">{appointments.filter(a => ['scheduled','confirmed'].includes(a.status)).length}</span>}</button>)}
      </nav>
      <div className="sidebar-spacer"/>
      <div className="sidebar-help"><div className="help-icon"><CircleHelp size={18}/></div><strong>Need a hand?</strong><p>Our care support team is here for you.</p><button onClick={() => setNotice('For this academic demo, contact your project administrator.')}>Get support <ArrowUpRight size={14}/></button></div>
      <button className="nav-item settings-nav" onClick={() => { setPage('settings'); setSidebarOpen(false); }}><Settings size={18}/><span>Settings</span></button>
      <div className="sidebar-profile"><div className="avatar">{initials(user.name)}</div><div className="profile-text"><strong>{user.name}</strong><span>{role.charAt(0).toUpperCase() + role.slice(1)}</span></div><button className="icon-btn" aria-label="Sign out" onClick={logout}><LogOut size={17}/></button></div>
    </aside>

    <main className="main-panel">
      <header className="topbar">
        <div className="topbar-left"><button className="icon-btn mobile-menu" onClick={() => setSidebarOpen(true)} aria-label="Open menu"><Menu size={21}/></button><div className="breadcrumbs"><span>Workspace</span><ChevronRight size={14}/><strong>{pageTitle}</strong></div></div>
        <div className="topbar-right"><div className="search-box"><Search size={17}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search this workspace…"/></div><button className="icon-btn notification-btn" title="Notifications" onClick={() => setNotice('You’re all caught up.')}><Bell size={18}/><i/></button><div className="top-avatar">{initials(user.name)}</div></div>
      </header>

      <div className="page-content">
        <div className="page-heading"><div><div className="date-kicker">{new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date()).toUpperCase()}</div><h1>{page === 'overview' ? <>Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user.name.split(' ')[0]} <span className="wave">✦</span></> : pageTitle}</h1><p>{page === 'overview' ? 'Here’s what’s happening across your care workspace today.' : `Manage and review ${pageTitle.toLowerCase()} in your MediCore workspace.`}</p></div><div className="heading-actions"><button className="secondary-btn" onClick={loadData}><Activity size={16}/> Refresh</button>{(['admin','receptionist'].includes(role) && page === 'patients') && <button className="primary-btn" onClick={() => openModal('patient')}><Plus size={17}/> Add patient</button>}{role === 'admin' && page === 'doctors' && <button className="primary-btn" onClick={() => openModal('doctor')}><Plus size={17}/> Add doctor</button>}{role === 'admin' && page === 'departments' && <button className="primary-btn" onClick={() => openModal('department')}><Plus size={17}/> Add department</button>}{['admin','receptionist','patient'].includes(role) && page === 'appointments' && <button className="primary-btn" onClick={() => openModal('appointment')}><Plus size={17}/> Book appointment</button>}</div></div>

        {notice && <div className="toast"><Check size={17}/><span>{notice}</span><button onClick={() => setNotice('')}><X size={16}/></button></div>}
        {busy && <div className="loading-line"><span/></div>}

        {page === 'overview' && <Overview stats={stats} appointments={appointments} user={user} setPage={setPage} openModal={openModal} role={role}/>}
        {page === 'appointments' && <Appointments appointments={filteredAppointments} role={role} updateStatus={updateStatus} openModal={openModal}/>}
        {page === 'doctors' && <Doctors doctors={doctors} role={role} openModal={openModal}/>}
        {page === 'patients' && <Patients patients={patients} role={role}/>}
        {page === 'departments' && <Departments departments={departments} role={role} openModal={openModal}/>}
        {page === 'records' && <Records records={records}/>}
        {page === 'prescriptions' && <Prescriptions prescriptions={prescriptions}/>}
        {page === 'settings' && <SettingsPage user={user} role={role} />}
      </div>
      <footer className="main-footer"><span>© 2026 MediCore Health Systems</span><span><span className="footer-dot"/> All systems operational</span></footer>
    </main>

    {modal && <Modal type={modal} form={form} setForm={setForm} onClose={() => setModal('')} onSubmit={saveForm} error={formError} doctors={doctors} patients={patients} departments={departments} role={role}/>}
  </div>;
}


function SettingsPage({ user, role }) {
  const [emailAlerts, setEmailAlerts] = useState(() => localStorage.getItem('medicore_email_alerts') !== 'false');
  const [appointmentAlerts, setAppointmentAlerts] = useState(() => localStorage.getItem('medicore_appointment_alerts') !== 'false');
  const [saved, setSaved] = useState(false);

  function savePreferences() {
    localStorage.setItem('medicore_email_alerts', String(emailAlerts));
    localStorage.setItem('medicore_appointment_alerts', String(appointmentAlerts));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2500);
  }

  return <div className="settings-page">
    <section className="panel settings-card">
      <div className="panel-header"><div><h3>Account information</h3><p>Your MediCore sign-in profile</p></div><span className="settings-status"><ShieldCheck size={15}/> Account active</span></div>
      <div className="settings-profile"><div className="settings-avatar">{initials(user?.name)}</div><div><strong>{user?.name || 'MediCore user'}</strong><span>{role.charAt(0).toUpperCase() + role.slice(1)} account</span></div></div>
      <div className="settings-details">
        <div><span>Full name</span><strong>{user?.name || '—'}</strong></div>
        <div><span>Email address</span><strong>{user?.email || '—'}</strong></div>
        <div><span>Account role</span><strong>{role.charAt(0).toUpperCase() + role.slice(1)}</strong></div>
      </div>
      <p className="settings-hint">For account changes or password resets, contact your MediCore administrator. Profile editing is not enabled yet.</p>
    </section>
    <section className="panel settings-card">
      <div className="panel-header"><div><h3>Notifications</h3><p>Choose which reminders this browser should remember</p></div><Bell size={19}/></div>
      <label className="settings-option"><span><strong>Email notifications</strong><small>Preference for account and service updates</small></span><input type="checkbox" checked={emailAlerts} onChange={e => setEmailAlerts(e.target.checked)} /></label>
      <label className="settings-option"><span><strong>Appointment reminders</strong><small>Preference for upcoming appointment alerts</small></span><input type="checkbox" checked={appointmentAlerts} onChange={e => setAppointmentAlerts(e.target.checked)} /></label>
      <p className="settings-hint">These preferences are saved in this browser. They do not send emails or push notifications yet.</p>
      <div className="settings-actions">{saved && <span className="settings-saved"><Check size={15}/> Preferences saved</span>}<button className="primary-btn" onClick={savePreferences}>Save preferences</button></div>
    </section>
    <section className="panel settings-card settings-security">
      <div className="settings-security-icon"><ShieldCheck size={20}/></div><div><h3>Security & privacy</h3><p>Your session is protected by MediCore authentication. Sign out when using a shared computer.</p></div>
    </section>
  </div>;
}

function Overview({ stats, appointments, user, setPage, openModal, role }) {
  const next = appointments.filter(a => new Date(a.startAt) >= new Date() && ['scheduled','confirmed'].includes(a.status)).slice(0, 5);
  const fallbackStats = role === 'patient'
    ? [{ label: 'My upcoming visits', value: next.length, icon: 'calendar' }, { label: 'Medical records', value: '—', icon: 'file' }, { label: 'Prescriptions', value: '—', icon: 'pill' }]
    : role === 'doctor'
      ? [{ label: 'Upcoming appointments', value: next.length, icon: 'calendar' }, { label: 'Assigned visits', value: appointments.length, icon: 'users' }]
      : [{ label: 'Registered patients', value: '—', icon: 'users' }, { label: 'Available doctors', value: '—', icon: 'doctor' }, { label: 'Departments', value: '—', icon: 'building' }, { label: 'Upcoming appointments', value: next.length, icon: 'calendar' }];
  const shownStats = stats.length ? stats : fallbackStats;
  const statIcons = [Users, Stethoscope, Building2, CalendarDays];
  return <div className="overview-grid">
    <section className="welcome-banner"><div className="welcome-copy"><span className="banner-tag"><span/> YOUR CARE, IN SYNC</span><h2>Every detail.<br/><em>Better connected.</em></h2><p>Keep your day moving with a clearer view of care, people, and priorities.</p><button className="banner-btn" onClick={() => setPage('appointments')}>View appointments <ArrowUpRight size={16}/></button></div><div className="banner-art"><div className="art-ring ring-a"/><div className="art-ring ring-b"/><div className="art-cross"><span/><i/></div><div className="art-pill pill-a"><Activity size={17}/><span>Care insights</span></div><div className="art-pill pill-b"><HeartPulse size={17}/><span>Patient first</span></div><div className="art-number">MC<span>.</span></div></div></section>
    <section className="stats-grid">{shownStats.map((stat, i) => { const Icon = statIcons[i % statIcons.length]; return <div className="stat-card" key={stat.label}><div className={`stat-icon stat-${i % 4}`}><Icon size={19}/></div><span className="stat-label">{stat.label}</span><div className="stat-bottom"><strong>{stat.value}</strong><span className="stat-trend"><ArrowUpRight size={14}/></span></div><div className="stat-foot">Live workspace data</div></div>; })}</section>
    <section className="panel activity-panel"><div className="panel-header"><div><h3>Patient activity</h3><p>A snapshot of the week</p></div><button className="period-btn">This week <ChevronDown size={14}/></button></div><div className="chart-legend"><span/><strong>Visits</strong><small>Weekly activity overview</small></div><div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={demoChart} margin={{ top: 10, right: 8, left: -22, bottom: 0 }}><defs><linearGradient id="visitFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#2d8c78" stopOpacity={0.2}/><stop offset="95%" stopColor="#2d8c78" stopOpacity={0}/></linearGradient></defs><CartesianGrid stroke="#edf0f4" vertical={false}/><XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#8993a3', fontSize: 11 }}/><YAxis axisLine={false} tickLine={false} tick={{ fill: '#8993a3', fontSize: 11 }}/><Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e9edf2', fontSize: 12 }}/><Area type="monotone" dataKey="visits" stroke="#2d8c78" strokeWidth={2.5} fill="url(#visitFill)" activeDot={{ r: 5, fill: '#2d8c78', stroke: '#fff', strokeWidth: 2 }}/></AreaChart></ResponsiveContainer></div><div className="chart-note"><span><i/> Trend visualization</span><span>Demo sample until analytics is connected</span></div></section>
    <section className="panel upcoming-panel"><div className="panel-header"><div><h3>Upcoming appointments</h3><p>Your next scheduled visits</p></div><button className="text-btn" onClick={() => setPage('appointments')}>View all <ArrowUpRight size={15}/></button></div>{next.length ? <div className="upcoming-list">{next.map((a, i) => <div className="upcoming-item" key={a._id}><div className={`appointment-date date-${i % 4}`}><strong>{new Date(a.startAt).getDate()}</strong><span>{new Intl.DateTimeFormat('en', { month: 'short' }).format(new Date(a.startAt))}</span></div><div className="upcoming-details"><strong>{role === 'patient' ? `Dr. ${a.doctor?.user?.name || 'Doctor'}` : a.patient?.name || 'Patient'}</strong><span>{a.doctor?.specialization || a.department?.name || 'Consultation'}</span></div><div className="upcoming-time"><Clock3 size={13}/>{timeLabel(a.startAt)}</div></div>)}</div> : <div className="empty-state compact"><div className="empty-icon"><CalendarDays size={22}/></div><strong>No upcoming appointments</strong><p>New scheduled visits will appear here.</p><button className="text-btn" onClick={() => openModal('appointment')}>Book a visit <ArrowUpRight size={14}/></button></div>}<div className="upcoming-foot"><span><span className="status-dot"/> Schedule synced</span><button onClick={() => setPage('appointments')}>Open calendar <ChevronRight size={14}/></button></div></section>
    <section className="care-note"><div className="care-note-icon"><HeartPulse size={20}/></div><div><strong>Good care is a team effort.</strong><p>Keep patient details up to date and document every visit clearly.</p></div><button onClick={() => setPage('records')} aria-label="View records"><ArrowUpRight size={18}/></button></section>
  </div>;
}

function Empty({ icon: Icon = ClipboardList, title, detail }) {
  return <div className="empty-state"><div className="empty-icon"><Icon size={24}/></div><strong>{title}</strong><p>{detail}</p></div>;
}
function TableWrap({ children }) { return <div className="table-scroll"><table>{children}</table></div>; }

function Appointments({ appointments, role, updateStatus, openModal }) {
  return <section className="panel data-panel"><div className="panel-header"><div><h3>Appointment schedule</h3><p>{appointments.length} appointments matching your view</p></div>{['admin','receptionist','patient'].includes(role) && <button className="primary-btn small" onClick={() => openModal('appointment')}><Plus size={15}/> New appointment</button>}</div>
    {appointments.length ? <TableWrap><thead><tr><th>Patient</th><th>Doctor</th><th>Date & time</th><th>Reason</th><th>Status</th>{['admin','doctor','receptionist'].includes(role) && <th>Actions</th>}</tr></thead><tbody>{appointments.map(a => <tr key={a._id}><td><div className="person-cell"><div className="table-avatar">{initials(a.patient?.name)}</div><strong>{a.patient?.name || 'Patient'}</strong></div></td><td>{a.doctor?.user?.name || 'Doctor'}<small className="sub-cell">{a.doctor?.specialization || ''}</small></td><td>{dateLabel(a.startAt)}<small className="sub-cell">{timeLabel(a.startAt)} – {timeLabel(a.endAt)}</small></td><td className="reason-cell">{a.reason || 'General consultation'}</td><td><span className={`status status-${a.status}`}>{a.status}</span></td>{['admin','doctor','receptionist'].includes(role) && <td><select className="status-select" value={a.status} onChange={e => updateStatus(a._id, e.target.value)} aria-label="Update status"><option value="scheduled">Scheduled</option><option value="confirmed">Confirmed</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option><option value="no-show">No-show</option></select></td>}</tr>)}</tbody></TableWrap> : <Empty icon={CalendarDays} title="No appointments found" detail="When appointments are booked, they'll appear here."/>}
  </section>;
}
function Doctors({ doctors, role, openModal }) {
  return <section className="panel data-panel"><div className="panel-header"><div><h3>Care team</h3><p>{doctors.length} doctor profiles</p></div>{role === 'admin' && <button className="primary-btn small" onClick={() => openModal('doctor')}><Plus size={15}/> Add doctor</button>}</div>{doctors.length ? <div className="doctor-grid">{doctors.map(d => <article className="doctor-card" key={d._id}><div className="doctor-card-top"><div className="doctor-avatar">{initials(d.user?.name)}</div><span className={`availability ${d.isAvailable ? 'available' : 'unavailable'}`}><i/>{d.isAvailable ? 'Available' : 'Unavailable'}</span></div><h4>{d.user?.name || 'Doctor'}</h4><p>{d.specialization}</p><div className="doctor-meta"><span><Building2 size={14}/>{d.department?.name || 'General'}</span><span><Users size={14}/>{d.user?.email || '—'}</span></div><div className="doctor-card-bottom"><span>Consultation fee</span><strong>{Number(d.consultationFee || 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })}</strong></div></article>)}</div> : <Empty icon={Stethoscope} title="No doctors added yet" detail="Doctor profiles added by an administrator will appear here."/>}</section>;
}
function Patients({ patients, role }) {
  return <section className="panel data-panel"><div className="panel-header"><div><h3>Patient directory</h3><p>Patient profiles and contact details</p></div><span className="count-chip">{patients.length} patients</span></div>{patients.length ? <TableWrap><thead><tr><th>Patient</th><th>Email</th><th>Phone</th><th>Registered</th><th>Profile</th></tr></thead><tbody>{patients.map(p => <tr key={p._id || p.id}><td><div className="person-cell"><div className="table-avatar">{initials(p.name)}</div><strong>{p.name}</strong></div></td><td>{p.email}</td><td>{p.phone || '—'}</td><td>{dateLabel(p.createdAt)}</td><td><span className="status status-confirmed">Active</span></td></tr>)}</tbody></TableWrap> : <Empty icon={Users} title="No patient records yet" detail="Registered patients will appear in this directory."/>}</section>;
}
function Departments({ departments, role, openModal }) {
  return <section className="panel data-panel"><div className="panel-header"><div><h3>Departments</h3><p>Care specialties and hospital units</p></div>{role === 'admin' && <button className="primary-btn small" onClick={() => openModal('department')}><Plus size={15}/> Add department</button>}</div>{departments.length ? <div className="department-grid">{departments.map((d, i) => <article className="department-card" key={d._id}><div className={`department-icon dep-${i % 4}`}><Building2 size={21}/></div><div><h4>{d.name}</h4><p>{d.description || 'Dedicated care and clinical support.'}</p><span><Activity size={13}/>{d.location || 'Hospital campus'}</span></div><span className="department-arrow"><ArrowUpRight size={17}/></span></article>)}</div> : <Empty icon={Building2} title="No departments yet" detail="Create departments to organize doctors and services."/>}</section>;
}
function Records({ records }) {
  return <section className="panel data-panel"><div className="panel-header"><div><h3>Medical records</h3><p>Clinical notes and diagnosis history</p></div><span className="count-chip">{records.length} records</span></div>{records.length ? <TableWrap><thead><tr><th>Patient</th><th>Diagnosis</th><th>Symptoms</th><th>Doctor</th><th>Recorded</th></tr></thead><tbody>{records.map(r => <tr key={r._id}><td>{r.patient?.name || 'Patient'}</td><td className="reason-cell">{r.diagnosis}</td><td>{r.symptoms || '—'}</td><td>{r.doctor?.user?.name || 'Doctor'}</td><td>{dateLabel(r.recordedAt)}</td></tr>)}</tbody></TableWrap> : <Empty icon={FileText} title="No medical records" detail="Authorized clinical records will appear here once created."/>}</section>;
}
function Prescriptions({ prescriptions }) {
  return <section className="panel data-panel"><div className="panel-header"><div><h3>Prescriptions</h3><p>Medication plans issued by the care team</p></div><span className="count-chip">{prescriptions.length} prescriptions</span></div>{prescriptions.length ? <div className="prescription-list">{prescriptions.map(p => <article className="prescription-card" key={p._id}><div className="prescription-top"><div className="prescription-icon"><Pill size={20}/></div><div><h4>{p.patient?.name || 'Patient'}</h4><p>Issued {dateLabel(p.issuedAt)} · Dr. {p.doctor?.user?.name || 'Care team'}</p></div><span className="status status-confirmed">Issued</span></div><div className="medicine-list">{p.items?.map((item, i) => <div className="medicine-row" key={`${item.medicine}-${i}`}><strong>{item.medicine}</strong><span>{item.dosage}</span><span>{item.frequency}</span><span>{item.duration}</span></div>)}</div>{p.notes && <p className="prescription-notes">{p.notes}</p>}</article>)}</div> : <Empty icon={Pill} title="No prescriptions yet" detail="Issued prescriptions will be available here."/>}</section>;
}

function Modal({ type, form, setForm, onClose, onSubmit, error, doctors, patients, departments, role }) {
  const titles = { department: 'Add department', doctor: 'Add doctor profile', appointment: 'Book an appointment', patient: 'Register a patient' };
  const update = e => setForm({ ...form, [e.target.name]: e.target.value });
  const field = (label, name, placeholder, opts = {}) => <label>{label}<input name={name} value={form[name] || ''} onChange={update} placeholder={placeholder} required={opts.required !== false} type={opts.type || 'text'} min={opts.min} step={opts.step}/></label>;
  return <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}><form className="modal-card" onSubmit={onSubmit}><div className="modal-heading"><div><span className="form-kicker">MEDICORE WORKSPACE</span><h2>{titles[type]}</h2></div><button type="button" className="icon-btn" onClick={onClose}><X size={19}/></button></div>
    <div className="modal-fields">
      {type === 'department' && <>{field('Department name', 'name', 'e.g. Cardiology')}{field('Description', 'description', 'What this department specializes in', { required: false })}{field('Location', 'location', 'e.g. East wing · Floor 2', { required: false })}</>}
      {type === 'doctor' && <>{field('Full name', 'name', 'Dr. Full Name')}{field('Email', 'email', 'doctor@hospital.com', { type: 'email' })}{field('Temporary password', 'password', 'At least 12 characters')}{field('Specialization', 'specialization', 'e.g. Cardiology')}{field('License number', 'licenseNumber', 'Professional registration ID', { required: false })}<label>Department<select name="department" value={form.department || ''} onChange={update}><option value="">Select department</option>{departments.map(d => <option value={d._id} key={d._id}>{d.name}</option>)}</select></label>{field('Consultation fee (₹)', 'consultationFee', '500', { type: 'number', min: 0, step: '1' })}</>}
      {type === 'patient' && <>{field('Full name', 'name', 'Patient full name')}{field('Email', 'email', 'patient@example.com', { type: 'email' })}{field('Temporary password', 'password', 'At least 12 characters')}{field('Phone', 'phone', 'Phone number', { required: false })}</>}
      {type === 'appointment' && <><label>Doctor<select name="doctorId" value={form.doctorId || ''} onChange={update} required><option value="">Select doctor</option>{doctors.map(d => <option value={d._id} key={d._id}>{d.user?.name} · {d.specialization}</option>)}</select></label>{role !== 'patient' && <label>Patient<select name="patientId" value={form.patientId || ''} onChange={update} required><option value="">Select patient</option>{patients.map(p => <option value={p._id || p.id} key={p._id || p.id}>{p.name} · {p.email}</option>)}</select></label>}{field('Start date & time', 'startAt', '', { type: 'datetime-local' })}<label>Duration<select name="duration" value={form.duration || '30'} onChange={update}><option value="15">15 minutes</option><option value="30">30 minutes</option><option value="45">45 minutes</option><option value="60">60 minutes</option></select></label>{field('Reason for visit', 'reason', 'Brief reason for appointment', { required: false })}</>}
    </div>
    {error && <div className="alert-error">{error}</div>}<div className="modal-actions"><button type="button" className="secondary-btn" onClick={onClose}>Cancel</button><button className="primary-btn" type="submit"><Check size={16}/> Save changes</button></div>
  </form></div>;
}

export default App;
