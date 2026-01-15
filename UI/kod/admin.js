// --- 1. KORISNICI I ULOGE ---
const users = {
    'admin': { pass: 'admin123', name: 'Petar Petrović', role: 'admin' },    // Vidi sve + briše
    'dir':{ pass: 'dir123',name: 'Janko Janković',  role: 'director' }, // Prijavljuje kvar, ne popravlja
    'tech':  { pass: 'tech123',  name: 'Marko Marković',  role: 'tech' },     // Popravlja kvarove
    'fin':   { pass: 'fin123',   name: 'Ana Anić',        role: 'finance' }   // Vidi pare i ljude (plate)
};

// Podaci (Dodali smo plate za finansijera)
const defaultData = {
    employees: [
        { name: 'Miloš Biković', role: 'Glumac', salary: 80000 },
        { name: 'Tamara Dragičević', role: 'Glumica', salary: 75000 }
    ],
    techIssues: [
        { item: 'Mikrofon 2', issue: 'Prekida kabl', status: 'open' }
    ],
    plays: [
        { title: 'Radovan III', date: '2023-11-25', tickets: 200, price: 1000 }
    ]
};

// --- INIT ---
window.onload = function() {
    const savedUser = localStorage.getItem('currentUser');
    if (!localStorage.getItem('appData')) {
        localStorage.setItem('appData', JSON.stringify(defaultData));
    }
    if (savedUser) {
        initializeDashboard(JSON.parse(savedUser));
    }
};

// --- LOGOVANJE ---
document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const usernameInput = document.getElementById('username').value;
    const passwordInput = document.getElementById('password').value;
    
    if (users[usernameInput] && users[usernameInput].pass === passwordInput) {
        const user = users[usernameInput];
        localStorage.setItem('currentUser', JSON.stringify(user));
        initializeDashboard(user);
    } else {
        const errorMsg = document.getElementById('login-error');
        errorMsg.style.display = 'block';
    }
});

function logout() {
    localStorage.removeItem('currentUser');
    location.reload();
}

function clearSystemData() {
    if(confirm("Brisanje svih podataka?")) {
        localStorage.clear();
        location.reload();
    }
}

// --- DASHBOARD LOGIKA ---

function initializeDashboard(user) {
    document.getElementById('login-section').style.display = 'none';
    document.getElementById('dashboard-container').style.display = 'block';
    document.getElementById('logout-btn').style.display = 'block';
    document.getElementById('welcome-text').textContent = `Korisnik: ${user.name}`;
    document.getElementById('role-display').textContent = user.role.toUpperCase();

    renderAllData(); // Prvo učitaj podatke
    applyPermissions(user.role); // Onda sakrij šta ne smeju da vide
}

function getAppData() { return JSON.parse(localStorage.getItem('appData')) || defaultData; }
function saveAppData(data) { localStorage.setItem('appData', JSON.stringify(data)); renderAllData(); }
function getCurrentUser() { return JSON.parse(localStorage.getItem('currentUser')); }

function renderAllData() {
    const data = getAppData();
    const user = getCurrentUser(); // Moramo znati ko je ulogovan dok crtamo listu

    // 1. ZAPOSLENI (HR/Finansije vide plate, ostali ne)
    const hrList = document.getElementById('hr-list');
    document.getElementById('hr-stats').textContent = data.employees.length;
    
    hrList.innerHTML = data.employees.map((emp, i) => {
        // Samo Finansijer i Admin vide platu
        const showSalary = (user.role === 'finance' || user.role === 'admin');
        const salaryInfo = showSalary ? `<span style="color:green; font-weight:bold;">${emp.salary} RSD</span>` : '';
        const deleteBtn = (user.role === 'admin') ? `<i class="fas fa-trash btn-delete" onclick="deleteItem('employees', ${i})"></i>` : '';

        return `<div class="data-item">
                    <div>${emp.name} <small>(${emp.role})</small></div>
                    <div>${salaryInfo} ${deleteBtn}</div>
                </div>`;
    }).join('');

    // 2. TEHNIKA (Složena logika za Reditelja vs Tech)
    const techList = document.getElementById('tech-list');
    techList.innerHTML = data.techIssues.map((iss, i) => {
        const statusColor = iss.status === 'open' ? 'red' : 'green';
        const statusText = iss.status === 'open' ? 'OTVORENO' : 'REŠENO';
        
        // KO SME DA KLIKNE DA POPRAVI? Samo Tech i Admin.
        const canFix = (user.role === 'tech' || user.role === 'admin');
        const clickAction = canFix ? `onclick="toggleTechStatus(${i})"` : ''; 
        const cursorStyle = canFix ? 'cursor:pointer' : 'cursor:not-allowed; opacity:0.7';

        return `<div class="data-item">
                    <div><b>${iss.item}</b>: ${iss.issue}</div>
                    <div>
                        <span style="color:${statusColor}; font-weight:bold; font-size:0.8rem; margin-right:10px; ${cursorStyle}" 
                             ${clickAction}>[${statusText}]</span>
                         ${(user.role === 'admin') ? `<i class="fas fa-trash btn-delete" onclick="deleteItem('techIssues', ${i})"></i>` : ''}
                    </div>
                </div>`;
    }).join('');

    // 3. REPERTOAR (Finansije)
    const repList = document.getElementById('rep-list');
    let totalIncome = 0;
    
    repList.innerHTML = data.plays.map((play, i) => {
        const income = play.tickets * play.price;
        totalIncome += income;
        
        // Ko vidi zaradu? Admin i Finansijer.
        const showMoney = (user.role === 'admin' || user.role === 'finance');
        const moneyInfo = showMoney ? `<small>${income} rsd</small>` : '';

        return `<div class="data-item">
                    <div><b>${play.title}</b> <br><small>${play.date}</small></div>
                    <div style="text-align:right;">
                        ${play.tickets} prodato <br>
                        ${moneyInfo}
                        ${(user.role === 'admin') ? `<i class="fas fa-trash btn-delete" onclick="deleteItem('plays', ${i})"></i>` : ''}
                    </div>
                </div>`;
    }).join('');

    // Update ukupnog prihoda (samo ako je vidljivo)
    document.getElementById('fin-total').textContent = totalIncome.toLocaleString() + " RSD";
}

// --- DOZVOLE (SAKRIVANJE KARTICA) ---

function applyPermissions(role) {
    const cHR = document.getElementById('card-hr');
    const cFin = document.getElementById('card-finance');
    const cTech = document.getElementById('card-tech');
    const cRep = document.getElementById('card-repertoire');
    const btnAddPlay = document.querySelector('#rep-actions button');

    // Resetuj sve na vidljivo
    cHR.style.display = 'flex';
    cFin.style.display = 'flex';
    cTech.style.display = 'flex';
    cRep.style.display = 'flex';
    if(btnAddPlay) btnAddPlay.style.display = 'inline-block';

    // 1. FINANSIJER (Vidi pare i ljude, NE vidi tehniku)
    if (role === 'finance') {
        cTech.style.display = 'none'; // Finansijera ne zanima pokvaren kabl
        if(btnAddPlay) btnAddPlay.style.display = 'none'; // Ne zakazuje predstave
    } 
    // 2. REDITELJ (Vidi Repertoar i Tehniku da prijavi, NE vidi pare ni ljude)
    else if (role === 'director') {
        cFin.style.display = 'none'; // Ne vidi budžet
        cHR.style.display = 'none';  // Ne vidi plate glumaca
        // Reditelj vidi Tehniku, ali u renderAllData smo mu zabranili da klikće "Rešeno"
    }
    // 3. TECH (Vidi Tehniku, NE vidi pare ni ljude)
    else if (role === 'tech') {
        cFin.style.display = 'none';
        cHR.style.display = 'none';
        if(btnAddPlay) btnAddPlay.style.display = 'none';
    }
}

// --- AKCIJE ---

function toggleTechStatus(index) {
    // Ova funkcija se poziva samo ako user ima dozvolu (provera je u renderAllData)
    const data = getAppData();
    data.techIssues[index].status = data.techIssues[index].status === 'open' ? 'fixed' : 'open';
    saveAppData(data);
}

function deleteItem(type, index) {
    if(confirm("Obriši stavku?")) {
        const data = getAppData();
        data[type].splice(index, 1);
        saveAppData(data);
    }
}

// --- MODALI (OSTALO ISTO) ---
const modalOverlay = document.getElementById('modal-overlay');
const modalTitle = document.getElementById('modal-title');
const modalBody = document.getElementById('modal-body');

function closeModal() { modalOverlay.style.display = 'none'; }

function openModal(type) {
    modalOverlay.style.display = 'flex';
    modalBody.innerHTML = '';

    if (type === 'addEmployee') {
        modalTitle.textContent = "Novi zaposleni";
        modalBody.innerHTML = `
            <input type="text" id="inp-emp-name" placeholder="Ime i prezime">
            <input type="text" id="inp-emp-role" placeholder="Pozicija">
            <input type="number" id="inp-emp-sal" placeholder="Plata (RSD)">
            <button class="btn-submit" onclick="submitEmployee()">Sačuvaj</button>
        `;
    } else if (type === 'addTechIssue') {
        modalTitle.textContent = "Prijava kvara";
        modalBody.innerHTML = `
            <input type="text" id="inp-tech-item" placeholder="Naziv opreme">
            <input type="text" id="inp-tech-issue" placeholder="Opis kvara">
            <button class="btn-submit" onclick="submitTech()">Prijavi</button>
        `;
    } else if (type === 'addPlay') {
        modalTitle.textContent = "Nova predstava";
        modalBody.innerHTML = `
            <input type="text" id="inp-play-title" placeholder="Naziv predstave">
            <input type="date" id="inp-play-date">
            <input type="number" id="inp-play-tix" placeholder="Prodato karata">
            <input type="number" id="inp-play-price" placeholder="Cena karte (RSD)">
            <button class="btn-submit" onclick="submitPlay()">Zakaži</button>
        `;
    }
}

function submitEmployee() {
    const name = document.getElementById('inp-emp-name').value;
    const role = document.getElementById('inp-emp-role').value;
    const salary = document.getElementById('inp-emp-sal').value;
    if(name && role) {
        const data = getAppData();
        data.employees.push({ name, role, salary: salary || 0 });
        saveAppData(data); closeModal();
    }
}

function submitTech() {
    const item = document.getElementById('inp-tech-item').value;
    const issue = document.getElementById('inp-tech-issue').value;
    if(item && issue) {
        const data = getAppData();
        data.techIssues.push({ item, issue, status: 'open' });
        saveAppData(data); closeModal();
    }
}

function submitPlay() {
    const title = document.getElementById('inp-play-title').value;
    const date = document.getElementById('inp-play-date').value;
    const tickets = Number(document.getElementById('inp-play-tix').value);
    const price = Number(document.getElementById('inp-play-price').value);
    if(title && date) {
        const data = getAppData();
        data.plays.push({ title, date, tickets, price });
        data.plays.sort((a,b) => new Date(a.date) - new Date(b.date));
        saveAppData(data); closeModal();
    }
}