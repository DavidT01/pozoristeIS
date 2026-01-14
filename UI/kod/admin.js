// Podaci za logovanje 
// TODO dodati jos korsnika i sta mogu videti
const users = {
    'admin': { pass: 'admin123', name: 'Petar Petrović', role: 'all' },
    'hr':    { pass: 'hr123',    name: 'Jelena Jović',    role: 'hr' },
    'tech':  { pass: 'tech123',  name: 'Marko Marković',  role: 'tech' },
    'dir': { pass: 'dir123',   name: 'David Davidović', role: 'director' }
};

document.getElementById('login-form').addEventListener('submit', function(e) {
    e.preventDefault(); // Sprečava osvežavanje stranice

    const usernameInput = document.getElementById('username').value;
    const passwordInput = document.getElementById('password').value;
    const errorMsg = document.getElementById('login-error');

   
    if (users[usernameInput] && users[usernameInput].pass === passwordInput) {
        
        // 1. Sakrij Login Ekran
        document.getElementById('login-section').style.display = 'none';
        
        // 2. Prikaži Dashboard (Ovo je ključni momenat)
        document.getElementById('dashboard-container').style.display = 'block';
        document.getElementById('logout-btn').style.display = 'block';

        // 3. Personalizacija
        const user = users[usernameInput];
        document.getElementById('welcome-text').textContent = `Dobrodošli, ${user.name}`;
        //TODO
        // 4. Filtriranje (šta ko sme da vidi) - #PROŠIRIVAĆEMO OVDE KASNIJE
        filterContent(user.role);

    } else {
        // Greška
        errorMsg.style.display = 'block';
       
        document.querySelector('.login-box').style.animation = "shake 0.5s";
        setTimeout(() => {
            document.querySelector('.login-box').style.animation = "none";
        }, 500);
    }
});

function logout() {
   
    document.getElementById('dashboard-container').style.display = 'none';
    document.getElementById('logout-btn').style.display = 'none';
    document.getElementById('login-section').style.display = 'flex';
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
    document.getElementById('login-error').style.display = 'none';
}

function filterContent(role) {
   
    const cardHr = document.getElementById('card-hr');
    const cardFin = document.getElementById('card-finance');
    const cardTech = document.getElementById('card-tech');

    cardHr.style.display = 'block';
    cardFin.style.display = 'block';
    cardTech.style.display = 'block';

    if (role === 'hr') {
        cardFin.style.display = 'none';
        cardTech.style.display = 'none';
    } 
    else if (role === 'tech') {
        cardHr.style.display = 'none';
        cardFin.style.display = 'none';
    }
}