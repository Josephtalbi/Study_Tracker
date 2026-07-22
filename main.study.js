 
        /**
         * LocalStorage State Manager
         */
        const STORAGE_KEY = 'studytracker_app_data_v1';

        const SampleData = {
            subjects: [
                { id: 'sub_1', name: 'Computer Science', color: '#10b981', icon: 'bi-laptop', desc: 'Algorithms, Data Structures & Web Dev' },
                { id: 'sub_2', name: 'Mathematics', color: '#4f46e5', icon: 'bi-calculator', desc: 'Calculus III & Linear Algebra' },
                { id: 'sub_3', name: 'Physics', color: '#f59e0b', icon: 'bi-lightning-charge', desc: 'Electromagnetism & Thermodynamics' },
                { id: 'sub_4', name: 'Literature', color: '#ec4899', icon: 'bi-book', desc: 'Modern European Classics' }
            ],
            sessions: [
                { id: 'ses_1', subjectId: 'sub_1', title: 'Binary Trees & Graph Traversals', date: new Date().toISOString().split('T')[0], startTime: '09:00', endTime: '11:00', duration: 2.0, notes: 'Reviewed DFS and BFS implementations', status: 'Completed' },
                { id: 'ses_2', subjectId: 'sub_2', title: 'Matrix Multiplication & Eigenvalues', date: new Date().toISOString().split('T')[0], startTime: '14:00', endTime: '16:00', duration: 2.0, notes: 'Practiced 3x3 Determinants', status: 'Pending' },
                { id: 'ses_3', subjectId: 'sub_3', title: 'Maxwell Equations Problem Set', date: new Date(Date.now() + 86400000).toISOString().split('T')[0], startTime: '10:00', endTime: '12:30', duration: 2.5, notes: 'Work through textbook chapter 6', status: 'Pending' },
                { id: 'ses_4', subjectId: 'sub_4', title: 'Essay Outline Draft', date: new Date(Date.now() - 86400000).toISOString().split('T')[0], startTime: '15:00', endTime: '17:00', duration: 2.0, notes: 'Finalized thesis paragraph', status: 'Completed' }
            ],
            goals: [
                { id: 'goal_1', title: 'Algorithms Mastery', targetHours: 30, deadline: '2026-08-30', desc: 'Complete 30 hours of problem solving' },
                { id: 'goal_2', title: 'Midterm Math Prep', targetHours: 15, deadline: '2026-08-15', desc: 'Review all linear algebra assignments' }
            ],
            theme: 'light'
        };

        const StorageManager = {
            getData() {
                const raw = localStorage.getItem(STORAGE_KEY);
                if (!raw) {
                    this.saveData(SampleData);
                    return SampleData;
                }
                try {
                    return JSON.parse(raw);
                } catch(e) {
                    return SampleData;
                }
            },
            saveData(data) {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            },
            resetToSampleData() {
                this.saveData(SampleData);
                ToastManager.show('Reset to sample dataset!', 'success');
                App.reloadAllViews();
            },
            clearAllData() {
                const empty = { subjects: [], sessions: [], goals: [], theme: 'light' };
                this.saveData(empty);
                ToastManager.show('All user data cleared!', 'warning');
                App.reloadAllViews();
            },
            exportData() {
                const data = this.getData();
                const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `studytracker-backup-${new Date().toISOString().slice(0,10)}.json`;
                a.click();
                URL.revokeObjectURL(url);
                ToastManager.show('Data exported successfully!', 'info');
            },
            importData(event) {
                const file = event.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const parsed = JSON.parse(e.target.result);
                        if (parsed.subjects && parsed.sessions && parsed.goals) {
                            this.saveData(parsed);
                            ToastManager.show('Data imported successfully!', 'success');
                            App.reloadAllViews();
                        } else {
                            ToastManager.show('Invalid JSON format!', 'danger');
                        }
                    } catch (err) {
                        ToastManager.show('Failed to parse JSON file.', 'danger');
                    }
                };
                reader.readAsText(file);
            }
        };

        const ToastManager = {
            show(message, type = 'info') {
                const toastEl = document.getElementById('appToast');
                const messageEl = document.getElementById('toast-message');
                const iconWrapper = document.getElementById('toast-icon-wrapper');
                const iconEl = document.getElementById('toast-icon');

                messageEl.textContent = message;

                let bgClass = 'bg-primary';
                let iconClass = 'bi-info-circle-fill';

                if (type === 'success') {
                    bgClass = 'bg-success';
                    iconClass = 'bi-check-circle-fill';
                } else if (type === 'warning') {
                    bgClass = 'bg-warning';
                    iconClass = 'bi-exclamation-triangle-fill';
                } else if (type === 'danger') {
                    bgClass = 'bg-danger';
                    iconClass = 'bi-x-circle-fill';
                }

                iconWrapper.className = `p-3 text-white rounded-start d-flex align-items-center justify-content-center ${bgClass}`;
                iconEl.className = `bi ${iconClass} fs-5`;

                const bsToast = new bootstrap.Toast(toastEl);
                bsToast.show();
            }
        };

        const ThemeManager = {
            init() {
                const data = StorageManager.getData();
                this.setTheme(data.theme || 'light');

                document.getElementById('themeToggleSwitch').addEventListener('change', (e) => {
                    const theme = e.target.checked ? 'dark' : 'light';
                    this.setTheme(theme);
                });

                document.getElementById('setting-theme-select').addEventListener('change', (e) => {
                    this.setTheme(e.target.value);
                });
            },
            setTheme(theme) {
                document.documentElement.setAttribute('data-bs-theme', theme);
                document.getElementById('themeToggleSwitch').checked = (theme === 'dark');
                document.getElementById('setting-theme-select').value = theme;

                const data = StorageManager.getData();
                data.theme = theme;
                StorageManager.saveData(data);

                if (StatsManager.charts.week) {
                    StatsManager.renderCharts();
                }
            }
        };

        const SubjectManager = {
            getSubjects() {
                return StorageManager.getData().subjects;
            },
            getSubjectById(id) {
                return this.getSubjects().find(s => s.id === id);
            },
            saveSubject(subject) {
                const data = StorageManager.getData();
                if (subject.id) {
                    const idx = data.subjects.findIndex(s => s.id === subject.id);
                    if (idx !== -1) data.subjects[idx] = subject;
                    ToastManager.show('Subject updated successfully!', 'success');
                } else {
                    subject.id = 'sub_' + Date.now();
                    data.subjects.push(subject);
                    ToastManager.show('New subject added!', 'success');
                }
                StorageManager.saveData(data);
                App.reloadAllViews();
            },
            deleteSubject(id) {
                if (!confirm('Are you sure you want to delete this subject? Associated study sessions will also be deleted.')) return;
                const data = StorageManager.getData();
                data.subjects = data.subjects.filter(s => s.id !== id);
                data.sessions = data.sessions.filter(s => s.subjectId !== id);
                StorageManager.saveData(data);
                ToastManager.show('Subject deleted.', 'warning');
                App.reloadAllViews();
            },
            renderList() {
                const container = document.getElementById('subjects-grid');
                const subjects = this.getSubjects();

                if (subjects.length === 0) {
                    container.innerHTML = `
                        <div class="col-12 text-center py-5 text-muted">
                            <i class="bi bi-journal-x fs-1"></i>
                            <p class="mt-2 mb-0">No subjects added yet. Click "Add Subject" to begin.</p>
                        </div>`;
                    return;
                }

                container.innerHTML = subjects.map(s => `
                    <div class="col-12 col-md-6 col-xl-4">
                        <div class="custom-card p-4 h-100 d-flex flex-column justify-content-between position-relative overflow-hidden">
                            <div style="position: absolute; top:0; left:0; right:0; height: 5px; background-color: ${s.color};"></div>
                            <div>
                                <div class="d-flex justify-content-between align-items-center mb-3">
                                    <div class="d-flex align-items-center">
                                        <div class="rounded-3 p-2 text-white me-3 d-flex align-items-center justify-content-center" style="background-color: ${s.color}; width: 42px; height: 42px;">
                                            <i class="bi ${s.icon || 'bi-book'} fs-5"></i>
                                        </div>
                                        <h5 class="fw-bold mb-0">${s.name}</h5>
                                    </div>
                                    <div class="dropdown">
                                        <button class="btn btn-sm btn-light border-0" data-bs-toggle="dropdown"><i class="bi bi-three-dots-vertical"></i></button>
                                        <ul class="dropdown-menu dropdown-menu-end shadow border-0">
                                            <li><a class="dropdown-item" href="#" onclick="ModalController.openSubjectModal('${s.id}')"><i class="bi bi-pencil me-2"></i>Edit</a></li>
                                            <li><a class="dropdown-item text-danger" href="#" onclick="SubjectManager.deleteSubject('${s.id}')"><i class="bi bi-trash me-2"></i>Delete</a></li>
                                        </ul>
                                    </div>
                                </div>
                                <p class="text-muted fs-7 mb-3">${s.desc || 'No description added.'}</p>
                            </div>
                            <div class="pt-3 border-top d-flex justify-content-between align-items-center">
                                <span class="badge bg-body-tertiary text-body border fw-normal">
                                    ${SessionManager.getSessions().filter(ses => ses.subjectId === s.id).length} Sessions
                                </span>
                                <span class="fw-bold text-primary fs-7">
                                    ${SessionManager.getSessions().filter(ses => ses.subjectId === s.id && ses.status === 'Completed').reduce((acc, curr) => acc + (curr.duration || 0), 0)} Total Hours
                                </span>
                            </div>
                        </div>
                    </div>
                `).join('');
            }
        };

        const SessionManager = {
            getSessions() {
                return StorageManager.getData().sessions;
            },
            calculateDuration(start, end) {
                if (!start || !end) return 0;
                const [h1, m1] = start.split(':').map(Number);
                const [h2, m2] = end.split(':').map(Number);
                let diff = (h2 * 60 + m2) - (h1 * 60 + m1);
                if (diff < 0) diff += 24 * 60; // Midnight wrap
                return parseFloat((diff / 60).toFixed(1));
            },
            saveSession(session) {
                const data = StorageManager.getData();
                session.duration = this.calculateDuration(session.startTime, session.endTime);

                if (session.id) {
                    const idx = data.sessions.findIndex(s => s.id === session.id);
                    if (idx !== -1) data.sessions[idx] = session;
                    ToastManager.show('Study session updated!', 'success');
                } else {
                    session.id = 'ses_' + Date.now();
                    data.sessions.push(session);
                    ToastManager.show('Study session logged!', 'success');
                }
                StorageManager.saveData(data);
                App.reloadAllViews();
            },
            toggleStatus(id) {
                const data = StorageManager.getData();
                const session = data.sessions.find(s => s.id === id);
                if (session) {
                    session.status = session.status === 'Completed' ? 'Pending' : 'Completed';
                    StorageManager.saveData(data);
                    ToastManager.show(`Session marked as ${session.status}!`, 'info');
                    App.reloadAllViews();
                }
            },
            deleteSession(id) {
                if (!confirm('Are you sure you want to delete this study session?')) return;
                const data = StorageManager.getData();
                data.sessions = data.sessions.filter(s => s.id !== id);
                StorageManager.saveData(data);
                ToastManager.show('Session deleted.', 'warning');
                App.reloadAllViews();
            },
            renderTable() {
                const tbody = document.getElementById('sessions-table-body');
                let sessions = this.getSessions();
                const dateFilter = document.getElementById('filter-date').value;
                const subjectFilter = document.getElementById('filter-subject').value;
                const statusFilter = document.getElementById('filter-status').value;
                const searchQuery = document.getElementById('globalSearchInput').value.toLowerCase().trim();

                const todayStr = new Date().toISOString().split('T')[0];
                const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];

                // Filtering
                sessions = sessions.filter(s => {
                    if (subjectFilter !== 'all' && s.subjectId !== subjectFilter) return false;
                    if (statusFilter !== 'all' && s.status !== statusFilter) return false;

                    if (dateFilter === 'today' && s.date !== todayStr) return false;
                    if (dateFilter === 'tomorrow' && s.date !== tomorrowStr) return false;
                    
                    if (dateFilter === 'this-week') {
                        const sDate = new Date(s.date);
                        const now = new Date();
                        const weekDiff = (now - sDate) / (1000 * 60 * 60 * 24);
                        if (weekDiff > 7 || weekDiff < -7) return false;
                    }

                    if (searchQuery) {
                        const subject = SubjectManager.getSubjectById(s.subjectId);
                        const matchTitle = s.title.toLowerCase().includes(searchQuery);
                        const matchSubject = subject && subject.name.toLowerCase().includes(searchQuery);
                        const matchNotes = s.notes && s.notes.toLowerCase().includes(searchQuery);
                        if (!matchTitle && !matchSubject && !matchNotes) return false;
                    }

                    return true;
                });

                if (sessions.length === 0) {
                    tbody.innerHTML = `
                        <tr>
                            <td colspan="7" class="text-center py-5 text-muted">
                                <i class="bi bi-search fs-3"></i>
                                <p class="mt-2 mb-0">No study sessions matching your filter criteria.</p>
                            </td>
                        </tr>`;
                    return;
                }

                tbody.innerHTML = sessions.map(s => {
                    const sub = SubjectManager.getSubjectById(s.subjectId) || { name: 'Unknown', color: '#6c757d' };
                    const isCompleted = s.status === 'Completed';

                    return `
                        <tr>
                            <td>
                                <span class="subject-badge text-white" style="background-color: ${sub.color};">
                                    <i class="bi ${sub.icon || 'bi-book'} me-1"></i> ${sub.name}
                                </span>
                            </td>
                            <td class="fw-semibold">${s.title}</td>
                            <td>${s.date}</td>
                            <td><small class="text-muted"><i class="bi bi-clock me-1"></i>${s.startTime} - ${s.endTime}</small></td>
                            <td class="fw-bold">${s.duration} hrs</td>
                            <td>
                                <button class="btn btn-sm ${isCompleted ? 'btn-success-subtle text-success border-success' : 'btn-warning-subtle text-warning border-warning'} rounded-pill" onclick="SessionManager.toggleStatus('${s.id}')">
                                    <i class="bi ${isCompleted ? 'bi-check-circle-fill' : 'bi-dash-circle'} me-1"></i>${s.status}
                                </button>
                            </td>
                            <td class="text-end">
                                <button class="btn btn-sm btn-light border me-1" onclick="ModalController.openSessionModal('${s.id}')"><i class="bi bi-pencil"></i></button>
                                <button class="btn btn-sm btn-light border text-danger" onclick="SessionManager.deleteSession('${s.id}')"><i class="bi bi-trash"></i></button>
                            </td>
                        </tr>
                    `;
                }).join('');
            }
        };

        const GoalManager = {
            getGoals() {
                return StorageManager.getData().goals;
            },
            saveGoal(goal) {
                const data = StorageManager.getData();
                if (goal.id) {
                    const idx = data.goals.findIndex(g => g.id === goal.id);
                    if (idx !== -1) data.goals[idx] = goal;
                    ToastManager.show('Goal updated!', 'success');
                } else {
                    goal.id = 'goal_' + Date.now();
                    data.goals.push(goal);
                    ToastManager.show('New target goal created!', 'success');
                }
                StorageManager.saveData(data);
                App.reloadAllViews();
            },
            deleteGoal(id) {
                if (!confirm('Are you sure you want to delete this study goal?')) return;
                const data = StorageManager.getData();
                data.goals = data.goals.filter(g => g.id !== id);
                StorageManager.saveData(data);
                ToastManager.show('Goal deleted.', 'warning');
                App.reloadAllViews();
            },
            renderList() {
                const container = document.getElementById('goals-grid');
                const goals = this.getGoals();
                const sessions = SessionManager.getSessions().filter(s => s.status === 'Completed');
                const totalCompletedHours = sessions.reduce((acc, curr) => acc + (curr.duration || 0), 0);

                if (goals.length === 0) {
                    container.innerHTML = `
                        <div class="col-12 text-center py-5 text-muted">
                            <i class="bi bi-trophy fs-1"></i>
                            <p class="mt-2 mb-0">No goals set. Set your first study target now!</p>
                        </div>`;
                    return;
                }

                container.innerHTML = goals.map(g => {
                    // Calculate progress based on total completed session hours vs target hours
                    const percent = Math.min(100, Math.round((totalCompletedHours / g.targetHours) * 100));
                    const isDone = percent >= 100;

                    return `
                        <div class="col-12 col-md-6">
                            <div class="custom-card p-4 h-100 d-flex flex-column justify-content-between">
                                <div>
                                    <div class="d-flex justify-content-between align-items-center mb-2">
                                        <h5 class="fw-bold mb-0">${g.title}</h5>
                                        <div class="dropdown">
                                            <button class="btn btn-sm btn-light border-0" data-bs-toggle="dropdown"><i class="bi bi-three-dots-vertical"></i></button>
                                            <ul class="dropdown-menu dropdown-menu-end shadow border-0">
                                                <li><a class="dropdown-item" href="#" onclick="ModalController.openGoalModal('${g.id}')"><i class="bi bi-pencil me-2"></i>Edit</a></li>
                                                <li><a class="dropdown-item text-danger" href="#" onclick="GoalManager.deleteGoal('${g.id}')"><i class="bi bi-trash me-2"></i>Delete</a></li>
                                            </ul>
                                        </div>
                                    </div>
                                    <p class="text-muted fs-7 mb-3">${g.desc || 'No description set.'}</p>
                                </div>
                                <div>
                                    <div class="d-flex justify-content-between align-items-center mb-2">
                                        <span class="small fw-semibold text-muted">Progress: ${totalCompletedHours} / ${g.targetHours} hours</span>
                                        <span class="small fw-bold ${isDone ? 'text-success' : 'text-primary'}">${percent}%</span>
                                    </div>
                                    <div class="progress mb-3" style="height: 10px;">
                                        <div class="progress-bar ${isDone ? 'bg-success' : 'bg-primary'}" role="progressbar" style="width: ${percent}%;"></div>
                                    </div>
                                    <div class="d-flex justify-content-between align-items-center fs-7 text-muted">
                                        <span><i class="bi bi-calendar-event me-1"></i>Deadline: ${g.deadline}</span>
                                        ${isDone ? '<span class="badge bg-success-subtle text-success fw-bold"><i class="bi bi-check-all me-1"></i>Completed</span>' : ''}
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');
            }
        };

        const CalendarManager = {
            instance: null,
            init() {
                const calendarEl = document.getElementById('calendar-container');
                if (!calendarEl) return;

                this.instance = new FullCalendar.Calendar(calendarEl, {
                    initialView: 'dayGridMonth',
                    headerToolbar: {
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,timeGridWeek,timeGridDay'
                    },
                    editable: true,
                    selectable: true,
                    select: (info) => {
                        ModalController.openSessionModal(null, info.startStr);
                    },
                    eventClick: (info) => {
                        ModalController.openSessionModal(info.event.id);
                    },
                    eventDrop: (info) => {
                        const sessionId = info.event.id;
                        const data = StorageManager.getData();
                        const session = data.sessions.find(s => s.id === sessionId);
                        if (session) {
                            session.date = info.event.startStr.split('T')[0];
                            StorageManager.saveData(data);
                            ToastManager.show('Session rescheduled on calendar!', 'info');
                            App.reloadAllViews();
                        }
                    }
                });

                this.instance.render();
            },
            updateEvents() {
                if (!this.instance) return;
                this.instance.removeAllEvents();
                const sessions = SessionManager.getSessions();

                const events = sessions.map(s => {
                    const sub = SubjectManager.getSubjectById(s.subjectId) || { color: '#4f46e5' };
                    return {
                        id: s.id,
                        title: `${s.title} (${s.duration}h)`,
                        start: `${s.date}T${s.startTime}`,
                        end: `${s.date}T${s.endTime}`,
                        backgroundColor: sub.color,
                        borderColor: sub.color
                    };
                });

                this.instance.addEventSource(events);
            }
        };

        const StatsManager = {
            charts: {},
            renderCharts() {
                const sessions = SessionManager.getSessions();
                const subjects = SubjectManager.getSubjects();

                // 1. Study Hours per Subject Chart
                const subjectLabels = subjects.map(s => s.name);
                const subjectHours = subjects.map(s => {
                    return sessions
                        .filter(ses => ses.subjectId === s.id && ses.status === 'Completed')
                        .reduce((acc, curr) => acc + (curr.duration || 0), 0);
                });
                const subjectColors = subjects.map(s => s.color);

                this.destroyChart('subject');
                const ctxSub = document.getElementById('chart-hours-subject');
                if (ctxSub) {
                    this.charts.subject = new Chart(ctxSub, {
                        type: 'doughnut',
                        data: {
                            labels: subjectLabels,
                            datasets: [{
                                data: subjectHours,
                                backgroundColor: subjectColors
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { position: 'bottom' } }
                        }
                    });
                }

                // 2. Study Hours per Week (Last 7 Days)
                const last7Days = [];
                const hoursPerDay = [];
                for (let i = 6; i >= 0; i--) {
                    const d = new Date();
                    d.setDate(d.getDate() - i);
                    const dStr = d.toISOString().split('T')[0];
                    last7Days.push(d.toLocaleDateString('en-US', { weekday: 'short' }));

                    const dayHrs = sessions
                        .filter(s => s.date === dStr && s.status === 'Completed')
                        .reduce((acc, curr) => acc + (curr.duration || 0), 0);
                    hoursPerDay.push(dayHrs);
                }

                this.destroyChart('week');
                const ctxWeek = document.getElementById('chart-hours-week');
                if (ctxWeek) {
                    this.charts.week = new Chart(ctxWeek, {
                        type: 'bar',
                        data: {
                            labels: last7Days,
                            datasets: [{
                                label: 'Hours Studied',
                                data: hoursPerDay,
                                backgroundColor: '#4f46e5',
                                borderRadius: 6
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: { y: { beginAtZero: true } }
                        }
                    });
                }

                // 3. Completed vs Pending Chart
                const completedCount = sessions.filter(s => s.status === 'Completed').length;
                const pendingCount = sessions.filter(s => s.status === 'Pending').length;

                this.destroyChart('status');
                const ctxStatus = document.getElementById('chart-completed-pending');
                if (ctxStatus) {
                    this.charts.status = new Chart(ctxStatus, {
                        type: 'pie',
                        data: {
                            labels: ['Completed', 'Pending'],
                            datasets: [{
                                data: [completedCount, pendingCount],
                                backgroundColor: ['#10b981', '#f59e0b']
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: { legend: { position: 'bottom' } }
                        }
                    });
                }

                // 4. Monthly Progress Line Chart
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                const currentYear = new Date().getFullYear();
                const monthlyData = new Array(12).fill(0);

                sessions.forEach(s => {
                    if (s.status === 'Completed' && s.date) {
                        const sDate = new Date(s.date);
                        if (sDate.getFullYear() === currentYear) {
                            monthlyData[sDate.getMonth()] += (s.duration || 0);
                        }
                    }
                });

                this.destroyChart('monthly');
                const ctxMonthly = document.getElementById('chart-monthly-progress');
                if (ctxMonthly) {
                    this.charts.monthly = new Chart(ctxMonthly, {
                        type: 'line',
                        data: {
                            labels: months,
                            datasets: [{
                                label: 'Monthly Hours',
                                data: monthlyData,
                                borderColor: '#10b981',
                                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                fill: true,
                                tension: 0.3
                            }]
                        },
                        options: {
                            responsive: true,
                            maintainAspectRatio: false,
                            scales: { y: { beginAtZero: true } }
                        }
                    });
                }
            },
            destroyChart(name) {
                if (this.charts[name]) {
                    this.charts[name].destroy();
                    this.charts[name] = null;
                }
            }
        };

        const ModalController = {
            openSubjectModal(id = null) {
                const modal = new bootstrap.Modal(document.getElementById('subjectModal'));
                const form = document.getElementById('subjectForm');
                form.reset();

                if (id) {
                    const sub = SubjectManager.getSubjectById(id);
                    if (sub) {
                        document.getElementById('subjectModalTitle').textContent = 'Edit Subject';
                        document.getElementById('subject-id').value = sub.id;
                        document.getElementById('subject-name').value = sub.name;
                        document.getElementById('subject-icon').value = sub.icon || 'bi-book';
                        document.getElementById('subject-icon-preview').className = `bi ${sub.icon || 'bi-book'}`;
                        document.getElementById('subject-color').value = sub.color || '#4f46e5';
                        document.getElementById('subject-desc').value = sub.desc || '';
                    }
                } else {
                    document.getElementById('subjectModalTitle').textContent = 'Add Subject';
                    document.getElementById('subject-id').value = '';
                }
                modal.show();
            },
            openSessionModal(id = null, defaultDate = null) {
                const modal = new bootstrap.Modal(document.getElementById('sessionModal'));
                const form = document.getElementById('sessionForm');
                form.reset();

                // Populate subjects dropdown
                const subjectSelect = document.getElementById('session-subject-id');
                const subjects = SubjectManager.getSubjects();
                
                if (subjects.length === 0) {
                    ToastManager.show('Please create a subject first before logging a session!', 'warning');
                    this.openSubjectModal();
                    return;
                }

                subjectSelect.innerHTML = subjects.map(s => `<option value="${s.id}">${s.name}</option>`).join('');

                if (id) {
                    const session = SessionManager.getSessions().find(s => s.id === id);
                    if (session) {
                        document.getElementById('sessionModalTitle').textContent = 'Edit Study Session';
                        document.getElementById('session-id').value = session.id;
                        document.getElementById('session-subject-id').value = session.subjectId;
                        document.getElementById('session-title').value = session.title;
                        document.getElementById('session-date').value = session.date;
                        document.getElementById('session-start-time').value = session.startTime;
                        document.getElementById('session-end-time').value = session.endTime;
                        document.getElementById('session-status').value = session.status;
                        document.getElementById('session-notes').value = session.notes || '';
                    }
                } else {
                    document.getElementById('sessionModalTitle').textContent = 'Log Study Session';
                    document.getElementById('session-id').value = '';
                    document.getElementById('session-date').value = defaultDate || new Date().toISOString().split('T')[0];
                    document.getElementById('session-start-time').value = '10:00';
                    document.getElementById('session-end-time').value = '12:00';
                }
                modal.show();
            },
            openGoalModal(id = null) {
                const modal = new bootstrap.Modal(document.getElementById('goalModal'));
                const form = document.getElementById('goalForm');
                form.reset();

                if (id) {
                    const goal = GoalManager.getGoals().find(g => g.id === id);
                    if (goal) {
                        document.getElementById('goalModalTitle').textContent = 'Edit Study Goal';
                        document.getElementById('goal-id').value = goal.id;
                        document.getElementById('goal-title').value = goal.title;
                        document.getElementById('goal-target').value = goal.targetHours;
                        document.getElementById('goal-deadline').value = goal.deadline;
                        document.getElementById('goal-desc').value = goal.desc || '';
                    }
                } else {
                    document.getElementById('goalModalTitle').textContent = 'Create Study Goal';
                    document.getElementById('goal-id').value = '';
                }
                modal.show();
            }
        };

        const App = {
            init() {
                ThemeManager.init();
                CalendarManager.init();
                this.bindEvents();
                this.reloadAllViews();
            },
            bindEvents() {
                // Navigation Link Clicks
                document.querySelectorAll('.nav-link-custom').forEach(link => {
                    link.addEventListener('click', (e) => {
                        e.preventDefault();
                        const view = link.getAttribute('data-view');
                        this.switchView(view);
                    });
                });

                // Mobile Sidebar Toggle
                document.getElementById('sidebarToggleBtn').addEventListener('click', () => {
                    document.getElementById('sidebar').classList.toggle('show');
                });

                // Color picker dots in Subject Modal
                document.querySelectorAll('.color-dot-picker').forEach(dot => {
                    dot.addEventListener('click', () => {
                        document.querySelectorAll('.color-dot-picker').forEach(d => d.classList.remove('selected'));
                        dot.classList.add('selected');
                        document.getElementById('subject-color').value = dot.getAttribute('data-color');
                    });
                });

                // Subject Icon Preview
                document.getElementById('subject-icon').addEventListener('input', (e) => {
                    document.getElementById('subject-icon-preview').className = `bi ${e.target.value.trim()}`;
                });

                // Form Submissions
                document.getElementById('subjectForm').addEventListener('submit', (e) => {
                    e.preventDefault();
                    const subject = {
                        id: document.getElementById('subject-id').value,
                        name: document.getElementById('subject-name').value.trim(),
                        icon: document.getElementById('subject-icon').value.trim(),
                        color: document.getElementById('subject-color').value,
                        desc: document.getElementById('subject-desc').value.trim()
                    };
                    SubjectManager.saveSubject(subject);
                    bootstrap.Modal.getInstance(document.getElementById('subjectModal')).hide();
                });

                document.getElementById('sessionForm').addEventListener('submit', (e) => {
                    e.preventDefault();
                    const session = {
                        id: document.getElementById('session-id').value,
                        subjectId: document.getElementById('session-subject-id').value,
                        title: document.getElementById('session-title').value.trim(),
                        date: document.getElementById('session-date').value,
                        startTime: document.getElementById('session-start-time').value,
                        endTime: document.getElementById('session-end-time').value,
                        status: document.getElementById('session-status').value,
                        notes: document.getElementById('session-notes').value.trim()
                    };
                    SessionManager.saveSession(session);
                    bootstrap.Modal.getInstance(document.getElementById('sessionModal')).hide();
                });

                document.getElementById('goalForm').addEventListener('submit', (e) => {
                    e.preventDefault();
                    const goal = {
                        id: document.getElementById('goal-id').value,
                        title: document.getElementById('goal-title').value.trim(),
                        targetHours: parseFloat(document.getElementById('goal-target').value),
                        deadline: document.getElementById('goal-deadline').value,
                        desc: document.getElementById('goal-desc').value.trim()
                    };
                    GoalManager.saveGoal(goal);
                    bootstrap.Modal.getInstance(document.getElementById('goalModal')).hide();
                });

                // Filters & Search
                document.getElementById('filter-date').addEventListener('change', () => SessionManager.renderTable());
                document.getElementById('filter-subject').addEventListener('change', () => SessionManager.renderTable());
                document.getElementById('filter-status').addEventListener('change', () => SessionManager.renderTable());
                document.getElementById('reset-filters-btn').addEventListener('click', () => {
                    document.getElementById('filter-date').value = 'all';
                    document.getElementById('filter-subject').value = 'all';
                    document.getElementById('filter-status').value = 'all';
                    SessionManager.renderTable();
                });

                document.getElementById('globalSearchInput').addEventListener('input', () => {
                    SessionManager.renderTable();
                });
            },
            switchView(viewName) {
                document.querySelectorAll('.view-section').forEach(sec => sec.classList.remove('active'));
                document.querySelectorAll('.nav-link-custom').forEach(l => l.classList.remove('active'));

                const targetSec = document.getElementById(`view-${viewName}`);
                const targetLink = document.querySelector(`.nav-link-custom[data-view="${viewName}"]`);

                if (targetSec) targetSec.classList.add('active');
                if (targetLink) targetLink.classList.add('active');

                // Close mobile sidebar after click
                document.getElementById('sidebar').classList.remove('show');

                if (viewName === 'calendar' && CalendarManager.instance) {
                    setTimeout(() => CalendarManager.instance.updateSize(), 100);
                }
            },
            reloadAllViews() {
                this.renderDashboard();
                SubjectManager.renderList();
                SessionManager.renderTable();
                GoalManager.renderList();
                CalendarManager.updateEvents();
                StatsManager.renderCharts();
                this.updateFilterDropdowns();
            },
            updateFilterDropdowns() {
                const select = document.getElementById('filter-subject');
                const subjects = SubjectManager.getSubjects();
                select.innerHTML = '<option value="all">All Subjects</option>' + subjects.map(s => `<option value="${s.id}">${s.name}</option>`).join('');
            },
            renderDashboard() {
                const subjects = SubjectManager.getSubjects();
                const sessions = SessionManager.getSessions();
                const goals = GoalManager.getGoals();

                // Metric Cards
                document.getElementById('dash-total-subjects').textContent = subjects.length;

                const completedSessions = sessions.filter(s => s.status === 'Completed');
                const totalHours = completedSessions.reduce((acc, curr) => acc + (curr.duration || 0), 0);
                
                document.getElementById('dash-total-hours').textContent = `${totalHours}h`;
                document.getElementById('dash-completed-sessions').textContent = completedSessions.length;
                document.getElementById('dash-pending-goals').textContent = goals.length;

                // Sidebar Goal Widget
                const primaryGoal = goals[0];
                if (primaryGoal) {
                    const pct = Math.min(100, Math.round((totalHours / primaryGoal.targetHours) * 100));
                    document.getElementById('sidebar-goal-percent').textContent = `${pct}%`;
                    document.getElementById('sidebar-goal-bar').style.width = `${pct}%`;
                }

                // Today's Schedule
                const todayStr = new Date().toISOString().split('T')[0];
                const todaySessions = sessions.filter(s => s.date === todayStr);
                const scheduleContainer = document.getElementById('dash-today-schedule');

                if (todaySessions.length === 0) {
                    scheduleContainer.innerHTML = `
                        <div class="text-center py-4 text-muted">
                            <i class="bi bi-calendar-check fs-2"></i>
                            <p class="mt-2 mb-0">No study sessions scheduled for today.</p>
                        </div>`;
                } else {
                    scheduleContainer.innerHTML = todaySessions.map(s => {
                        const sub = SubjectManager.getSubjectById(s.subjectId) || { name: 'Subject', color: '#4f46e5' };
                        return `
                            <div class="p-3 rounded-3 border d-flex align-items-center justify-content-between" style="border-left: 4px solid ${sub.color} !important;">
                                <div>
                                    <h6 class="fw-bold mb-1">${s.title}</h6>
                                    <small class="text-muted"><i class="bi bi-clock me-1"></i>${s.startTime} - ${s.endTime} (${s.duration} hrs)</small>
                                </div>
                                <button class="btn btn-sm ${s.status === 'Completed' ? 'btn-success' : 'btn-outline-secondary'} rounded-pill" onclick="SessionManager.toggleStatus('${s.id}')">
                                    <i class="bi bi-check-lg"></i> ${s.status}
                                </button>
                            </div>
                        `;
                    }).join('');
                }

                // Upcoming Sessions
                const upcomingSessions = sessions.filter(s => s.date > todayStr).slice(0, 4);
                const upcomingContainer = document.getElementById('dash-upcoming-list');

                if (upcomingSessions.length === 0) {
                    upcomingContainer.innerHTML = `
                        <div class="text-center py-4 text-muted">
                            <i class="bi bi-clock-history fs-2"></i>
                            <p class="mt-2 mb-0">No upcoming sessions scheduled.</p>
                        </div>`;
                } else {
                    upcomingContainer.innerHTML = upcomingSessions.map(s => {
                        const sub = SubjectManager.getSubjectById(s.subjectId) || { name: 'Subject', color: '#4f46e5' };
                        return `
                            <div class="p-2 px-3 rounded-3 bg-body-tertiary d-flex align-items-center justify-content-between">
                                <div class="d-flex align-items-center">
                                    <span class="badge me-2" style="background-color: ${sub.color};">${sub.name}</span>
                                    <span class="fw-medium text-truncate" style="max-width: 140px;">${s.title}</span>
                                </div>
                                <small class="text-muted fw-semibold">${s.date}</small>
                            </div>
                        `;
                    }).join('');
                }
            }
        };

        // Initialize Application when DOM ready
        window.addEventListener('DOMContentLoaded', () => {
            App.init();
        });
 