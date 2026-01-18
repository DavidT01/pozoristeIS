// --- 1. PODACI I KORISNICI ---
const users = {
    'a': { pass: 'a', name: 'Petar Petrović', role: 'admin' },
    'r': { pass: 'r', name: 'Janko Janković', role: 'reditelj' },
    't': { pass: 't', name: 'Marko Marković', role: 'tech' }, 
    'f': { pass: 'f', name: 'Ana Anić',       role: 'finance' },
    'g': { pass: 'g', name: 'Goran Glumić',   role: 'actor' }
};

const defaultData = {
    employees: [
        { name: 'Miloš Biković', jmbg: '0101988710001', email: 'milos.bikovic@pozoriste.rs', role: 'Glumac', salary: 80000 },
        { name: 'Tamara Dragičević', jmbg: '1212989710002', email: 'tamara.dragicevic@pozoriste.rs', role: 'Glumica', salary: 75000 }
    ],
    techRequests: [
        { id: 1, item: 'Mikrofon', priority: 'Visok', cost: 5000, status: 'Čeka finansije', solver: null }
    ],
    // Dodat budžet za predstavu (assignedBudget)
    plays: [
        { title: 'Radovan III', type: 'Izvedba', date: '2026-01-25T20:00', price: 1000, tickets: 100, assignedBudget: 500000 }
    ],
    auditions: [
        { id: 1, role: 'Romeo', play: 'Romeo i Julija', desc: 'Mladi glumac', candidates: [] }
    ]
};

// V13
const STORAGE_KEY = 'pozoriste_fixed_v13';
let currentUser = null;

// --- 2. LOGIN ---
function checkLogin() {
    const u = document.getElementById('username').value;
    const p = document.getElementById('password').value;
    
    if (users[u] && users[u].pass === p) {
        currentUser = users[u];
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('dashboard').style.display = 'block';
        document.getElementById('user-name').innerText = currentUser.name + ' (' + currentUser.role + ')';
        document.getElementById('logout-btn').style.display = 'block';
        loadDashboard();
    } else {
        document.getElementById('login-error').style.display = 'block';
    }
}
function logout() { location.reload(); }

// --- 3. DATABASE ---
function getAppData() {
    const s = localStorage.getItem(STORAGE_KEY);
    return s ? JSON.parse(s) : defaultData;
}
function saveAppData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    loadDashboard();
}

// --- 4. RENDER ---
function loadDashboard() {
    const data = getAppData();
    const role = currentUser.role;

    // A) AUDICIJE (Reditelj + Glumac)
    const audCard = document.getElementById('card-auditions');
    if (role === 'reditelj' || role === 'actor') {
        audCard.style.display = 'block';
        document.getElementById('btn-add-audition').style.display = (role === 'reditelj') ? 'block' : 'none';

        let html = '';
        if(data.auditions) {
            data.auditions.forEach((aud, index) => {
                let extra = '';
                if(role === 'reditelj') {
                    const list = (aud.candidates && aud.candidates.length) ? aud.candidates.join(', ') : 'Nema prijava';
                    extra = `<div class="candidates-box"><strong>Kandidati:</strong> ${list}</div>`;
                }
                if(role === 'actor') {
                    if(aud.candidates && aud.candidates.includes(currentUser.name)) {
                        extra = '<span class="applied-badge"><i class="fas fa-check"></i> Prijavljeni ste</span>';
                    } else {
                        extra = `<button class="btn-action btn-primary" onclick="applyForAudition(${index})">Prijavi se</button>`;
                    }
                }
                html += `<div class="audition-item"><b>${aud.role}</b> (${aud.play})<br>${aud.desc}<br>${extra}</div>`;
            });
        }
        document.getElementById('audition-list').innerHTML = html || 'Nema audicija.';
    } else {
        audCard.style.display = 'none';
    }

    // B) ZAPOSLENI (Admin + Finansije)
    const empCard = document.getElementById('card-employees');
    const empActions = document.getElementById('emp-actions');
    
    // Admin i Finansije vide listu
    if (role === 'admin' || role === 'finance') {
        empCard.style.display = 'block';
        // Samo Admin vidi dugme za dodavanje
        empActions.style.display = (role === 'admin') ? 'block' : 'none';
        
        let html = '';
        data.employees.forEach((e, i) => {
            // Samo Admin vidi brisanje
            const del = (role==='admin') ? `<i class="fas fa-trash" style="cursor:pointer; color:red; float:right;" onclick="delEmp(${i})"></i>` : '';
            
            // Finansije vide platu
            let salaryInfo = '';
            if (role === 'finance') {
                salaryInfo = `<br><span style="color:#27ae60; font-weight:bold;">Plata: ${e.salary.toLocaleString()} RSD</span>`;
            }

            html += `
            <div style="border-bottom:1px solid #eee; padding:8px;">
                <div style="font-size:1rem; font-weight:bold;">${e.name} ${del}</div>
                <div style="font-size:0.85rem; color:#555;">
                    ${e.role} | ${e.email || 'Nema email'} | JMBG: ${e.jmbg || '/'}
                    ${salaryInfo}
                </div>
            </div>`;
        });
        document.getElementById('emp-list').innerHTML = html;
    } else {
        empCard.style.display = 'none';
    }

    // C) FINANSIJE (Fin + Reditelj - ALI RAZLIČIT POGLED)
    const finCard = document.getElementById('card-finance');
    const finStats = document.getElementById('fin-stats');
    const finApproval = document.getElementById('fin-approval-container');
    const finApprovalList = document.getElementById('fin-approval-list');

    if (role === 'finance' || role === 'reditelj') {
        finCard.style.display = 'block';
        
        // C1: POGLED ZA FINANSIJE (SVE)
        if (role === 'finance') {
            document.getElementById('fin-title').innerHTML = '<i class="fas fa-chart-line"></i> Finansije (Glavni panel)';
            
            const income = data.plays.reduce((s,p) => s + (p.price||0)*(p.tickets||0), 0);
            const approvedTechCost = data.techRequests.reduce((s,t) => {
                return (t.status === 'Odobreno' || t.status === 'Rešeno') ? s + (t.cost||0) : s;
            }, 0);
            const salaries = data.employees.reduce((s,e) => s+(e.salary||0),0);
            const expense = salaries + approvedTechCost;
            
            finStats.innerHTML = `
                <div style="padding:10px; background:#f4f6f7; border-radius:4px;">
                    <div>Ukupni Prihodi: <b>${income} RSD</b></div>
                    <div>Ukupni Rashodi: <b>${expense} RSD</b> (Plate + Oprema)</div>
                    <div style="margin-top:5px; border-top:1px solid #ccc; pt-2; color:${(income-expense)>=0?'green':'red'}">
                        Saldo: <b>${income-expense} RSD</b>
                    </div>
                </div>
            `;

            // Odobravanje za Finansije
            let pendingHtml = '';
            let count = 0;
            data.techRequests.forEach((req, idx) => {
                if(req.status === 'Čeka finansije') {
                    count++;
                    pendingHtml += `
                    <div class="approval-item">
                        <div><b>${req.item}</b> (${req.cost} RSD)</div>
                        <div>
                            <button class="btn-approve" onclick="approveCost(${idx})">✓</button>
                            <button class="btn-reject" onclick="rejectCost(${idx})">✗</button>
                        </div>
                    </div>`;
                }
            });
            
            if(count > 0) {
                finApproval.style.display = 'block';
                finApprovalList.innerHTML = pendingHtml;
            } else {
                finApproval.style.display = 'none';
            }
        
        // C2: POGLED ZA REDITELJA (SAMO BUDŽET PREDSTAVE)
        } else if (role === 'reditelj') {
            document.getElementById('fin-title').innerHTML = '<i class="fas fa-wallet"></i> Budžet Produkcije';
            finApproval.style.display = 'none'; // Reditelj ne odobrava tech opremu ovde

            let html = '';
            data.plays.forEach(p => {
                const assigned = p.assignedBudget || 0;
                // Izračunaj koliko je potrošeno za ovu predstavu ako imamo taj podatak (ovde simuliramo)
                // Realno bi tech request trebao da ima play ID. Ovde ćemo prikazati samo dodeljeni budžet.
                html += `
                <div class="budget-box">
                    <strong>${p.title}</strong> (${p.type})<br>
                    Dodeljen budžet: <b>${assigned.toLocaleString()} RSD</b><br>
                    <small>Zahtevi za opremu idu preko Tehničke službe.</small>
                </div>`;
            });
            finStats.innerHTML = html || 'Nema aktivnih produkcija.';
        }

    } else {
        finCard.style.display = 'none';
    }

    // D) TECH (Svi)
    let techHtml = '';
    data.techRequests.forEach((t, i) => {
        let color = '#777';
        if(t.status === 'Čeka finansije') color = 'orange';
        if(t.status === 'Odobreno') color = 'blue';
        if(t.status === 'Rešeno') color = 'green';
        if(t.status === 'Odbijeno') color = 'red';

        const canResolve = (role === 'tech' && (t.status === 'Otvoreno' || t.status === 'Odobreno'));
        const costLabel = t.cost > 0 ? `(${t.cost} RSD)` : '';
        const solverInfo = t.solver ? `<span style="font-size:0.8rem; color:green;">(Rešio: ${t.solver})</span>` : '';

        techHtml += `<div style="border-bottom:1px solid #eee; padding:8px; display:flex; justify-content:space-between; align-items:center;">
            <div>
                <b>${t.item}</b> <small>${costLabel}</small> <br>
                Prioritet: <b>${t.priority}</b> | Status: <span style="color:${color}; font-weight:bold;">${t.status}</span>
                ${solverInfo}
            </div>
            <div>
                 ${canResolve ? `<button class="btn-action" style="font-size:0.8rem;" onclick="resolveIssue(${i})">Reši</button>` : ''}
            </div>
        </div>`;
    });
    document.getElementById('tech-list').innerHTML = techHtml || 'Nema zahteva.';

    // E) REPERTOAR
    document.getElementById('rep-actions').style.display = (role==='admin'||role==='reditelj') ? 'block':'none';
    let repHtml = '';
    data.plays.sort((a,b)=>new Date(a.date)-new Date(b.date)).forEach(p => {
        const budgetInfo = (role === 'admin' || role === 'finance') ? `<br><small>Budžet: ${p.assignedBudget || 0}</small>` : '';
        repHtml += `<div style="padding:5px; border-bottom:1px solid #eee;">
            <b>${p.title}</b> (${p.type}) <br> 
            <small>${new Date(p.date).toLocaleString('sr-RS')}</small>
            ${budgetInfo}
        </div>`;
    });
    document.getElementById('rep-list').innerHTML = repHtml;
}

// --- 5. AKCIJE ---

function generateEmail() {
    const name = document.getElementById('inp-emp-firstname').value.toLowerCase().trim();
    const surname = document.getElementById('inp-emp-lastname').value.toLowerCase().trim();
    if(name && surname) {
        document.getElementById('auto-email-display').innerText = `${name}.${surname}@pozoriste.rs`;
    } else {
        document.getElementById('auto-email-display').innerText = '...';
    }
}

function submitEmployee() {
    const fname = document.getElementById('inp-emp-firstname').value;
    const lname = document.getElementById('inp-emp-lastname').value;
    const role = document.getElementById('inp-emp-role').value;
    const sal = document.getElementById('inp-emp-sal').value;
    const jmbg = document.getElementById('inp-emp-jmbg').value;
    
    if(fname && lname && role) {
        const d = getAppData();
        const fullName = fname + ' ' + lname;
        const email = `${fname.toLowerCase()}.${lname.toLowerCase()}@pozoriste.rs`;
        
        d.employees.push({
            name: fullName, 
            role: role, 
            salary: Number(sal)||0,
            jmbg: jmbg,
            email: email
        });
        saveAppData(d); closeModal();
        document.getElementById('inp-emp-firstname').value = '';
        document.getElementById('inp-emp-lastname').value = '';
        document.getElementById('inp-emp-jmbg').value = '';
    }
}

function submitTech() {
    const item = document.getElementById('inp-tech-item').value;
    const cost = Number(document.getElementById('inp-tech-cost').value) || 0;
    const prio = document.getElementById('inp-tech-prio').value;
    
    if(item) {
        const d = getAppData();
        const status = cost > 0 ? 'Čeka finansije' : 'Otvoreno';
        d.techRequests.push({ id: Date.now(), item, cost, priority: prio, status: status, solver: null });
        saveAppData(d); closeModal();
        document.getElementById('inp-tech-item').value = '';
        document.getElementById('inp-tech-cost').value = '0';
    }
}

function approveCost(index) {
    if(confirm("Odobravate?")) { const d = getAppData(); d.techRequests[index].status = 'Odobreno'; saveAppData(d); }
}
function rejectCost(index) {
    if(confirm("Odbijate?")) { const d = getAppData(); d.techRequests[index].status = 'Odbijeno'; saveAppData(d); }
}
function resolveIssue(index) {
    const d = getAppData(); d.techRequests[index].status = 'Rešeno'; d.techRequests[index].solver = currentUser.name; saveAppData(d);
}

function submitAudition() {
    const r = document.getElementById('inp-aud-role').value;
    const p = document.getElementById('inp-aud-play').value;
    const d = document.getElementById('inp-aud-desc').value;
    if(r && p) {
        const data = getAppData();
        if(!data.auditions) data.auditions=[];
        data.auditions.push({ id:Date.now(), role:r, play:p, desc:d, candidates:[] });
        saveAppData(data); closeModal();
    }
}
function applyForAudition(i) {
    if(confirm("Prijava?")) { const d = getAppData(); d.auditions[i].candidates.push(currentUser.name); saveAppData(d); }
}
function submitPlay() {
    const t = document.getElementById('inp-play-title').value;
    const type = document.getElementById('inp-play-type').value;
    const dt = document.getElementById('inp-play-date').value;
    const p = document.getElementById('inp-play-price').value;
    const budget = document.getElementById('inp-play-budget').value;
    
    if(t && dt) {
        const d = getAppData();
        d.plays.push({
            title:t, type, date:dt, 
            price:Number(p)||0, 
            tickets:100, 
            assignedBudget: Number(budget)||0 
        });
        saveAppData(d); closeModal();
    }
}
function delEmp(i) { if(confirm('Brisanje?')) { const d=getAppData(); d.employees.splice(i,1); saveAppData(d); } }

function openModal(id) { document.getElementById('modal-overlay').style.display='flex'; document.getElementById('modal-'+id).style.display='block'; }
function closeModal() { document.getElementById('modal-overlay').style.display='none'; document.querySelectorAll('.modal-content > div').forEach(d=>d.style.display='none'); }
window.onclick = function(e) { if(e.target == document.getElementById('modal-overlay')) closeModal(); }