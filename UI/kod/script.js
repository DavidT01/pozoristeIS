let state = {
    play: null,
    date: null,
    time: null,
    seats: [],
    pricePerSeat: 1000,
    totalPrice: 0
};

const playsData = {
    'Hamlet': {
        roles: ['Hamlet: Dragan Petrović', 'Klaudije: Vojin Ćetković', 'Gertruda: Nataša Ninković', 'Ofelija: Sloboda Mićalović', 'Polonije: Nikola Đuričko', 'Laert: Vuk Kostić', 'Horacije: Nebojša Glogovac']
    },
    'Romeo i Julija': {
        roles: ['Romeo: Miloš Biković', 'Julija: Tamara Dragičević', 'Monah Lavrentije: Miki Manojlović', 'Merkucio: Gordan Kičić', 'Dadilja: Seka Sablić', 'Tibalt: Viktor Savić']
    },
    'Gospođa Ministarka': {
        roles: ['Živka Popović: Gorica Popović', 'Sima Popović: Svetozar Cvetković', 'Čeda Urošević: Gordan Kičić', 'Raka: Petar Benčina', 'Anka: Katarina Žutić', 'Dr Ninković: Tihomir Stanić']
    }
};

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');

    const footer = document.getElementById('main-footer');
    if (screenId === 'screen-repertoire') {
        footer.style.display = 'block';
    } else {
        footer.style.display = 'none';
    }
}

function selectPlay(playName) {
    state.play = playName;
    document.getElementById('selected-play-title').textContent = playName;

    const castList = document.getElementById('cast-list');
    castList.innerHTML = '';
    const roles = playsData[playName]?.roles || [];
    roles.forEach(role => {
        const li = document.createElement('li');
        li.textContent = role;
        li.style.padding = '5px';
        li.style.borderBottom = '1px solid #eee';
        castList.appendChild(li);
    });

    showScreen('screen-dates');
}

function selectDate(date, time) {
    state.date = date;
    state.time = time;
    renderSeats();
    showScreen('screen-seats');
}

function renderSeats() {
    const container = document.getElementById('seating-chart');
    container.innerHTML = '';
    state.seats = [];
    updatePrice();

    for (let i = 1; i <= 40; i++) {
        const seat = document.createElement('div');
        seat.className = 'seat';
        
        if (Math.random() < 0.3) {
            seat.classList.add('occupied');
            seat.title = `Sedište ${i} (Zauzeto)`;
        } else {
            seat.title = `Sedište ${i}`;
            seat.onclick = () => toggleSeat(seat, i);
        }
        
        container.appendChild(seat);
    }
}

function toggleSeat(seatEl, seatNum) {
    if (seatEl.classList.contains('occupied')) return;

    seatEl.classList.toggle('selected');
    
    if (seatEl.classList.contains('selected')) {
        state.seats.push(seatNum);
    } else {
        state.seats = state.seats.filter(n => n !== seatNum);
    }
    
    state.seats.sort((a, b) => a - b);
    updatePrice();
}

function updatePrice() {
    state.totalPrice = state.seats.length * state.pricePerSeat;
    document.getElementById('total-price').textContent = state.totalPrice;
    
    const btn = document.getElementById('btn-to-checkout');
    btn.disabled = state.seats.length === 0;
}

function goToCheckout() {
    document.getElementById('summary-play').textContent = state.play;
    document.getElementById('summary-date').textContent = `${state.date} u ${state.time}`;
    document.getElementById('summary-seats').textContent = state.seats.join(', ');
    document.getElementById('summary-price').textContent = state.totalPrice;
    
    showScreen('screen-checkout');
}

function processPayment(e) {
    e.preventDefault();
    showScreen('screen-success');
}
