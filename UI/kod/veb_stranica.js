let state = {
    play: null,
    date: null,
    time: null,
    seats: [],
    totalPrice: 0
};

const SEAT_CONFIG = {
    rows: 5,
    colsPerGroup: 4, // 4 left, 4 right
    vipRows: 2,
    vipPrice: 1500,
    regularPrice: 1000
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
    document.getElementById('seats-screen-title').textContent = `${state.play} - ${date} ${time}`;
    renderSeats();
    showScreen('screen-seats');
}

function getSeatPrice(seatNum) {
    const seatsPerRow = SEAT_CONFIG.colsPerGroup * 2;
    const row = Math.ceil(seatNum / seatsPerRow);
    return row <= SEAT_CONFIG.vipRows ? SEAT_CONFIG.vipPrice : SEAT_CONFIG.regularPrice;
}

function renderSeats() {
    const container = document.getElementById('seating-chart');
    container.innerHTML = '';
    state.seats = [];
    updatePrice();

    const leftGroup = document.createElement('div');
    leftGroup.className = 'seat-group';
    
    const rightGroup = document.createElement('div');
    rightGroup.className = 'seat-group';

    const totalSeats = SEAT_CONFIG.rows * SEAT_CONFIG.colsPerGroup * 2; // 40

    for (let i = 1; i <= totalSeats; i++) {
        const price = getSeatPrice(i);
        const isVip = price === SEAT_CONFIG.vipPrice;

        const seat = document.createElement('div');
        seat.className = `seat ${isVip ? 'vip' : ''}`;
        seat.dataset.number = i;
        seat.dataset.price = price;
        
        if (Math.random() < 0.3) {
            seat.classList.add('occupied');
            seat.title = `Sedište ${i} (${isVip ? 'VIP' : 'Regular'}) - Zauzeto`;
        } else {
            seat.title = `Sedište ${i} (${isVip ? 'VIP' : 'Regular'}, ${price} RSD)`;
            seat.onclick = () => toggleSeat(seat, i);
        }
        
        // Determine whether to add to left or right group
        // Row 1: 1-4 Left, 5-8 Right
        // Row 2: 9-12 Left, 13-16 Right
        // Formula: (i-1) % 8 < 4 ? Left : Right
        const seatsPerRow = SEAT_CONFIG.colsPerGroup * 2;
        const posInRow = (i - 1) % seatsPerRow;
        
        if (posInRow < SEAT_CONFIG.colsPerGroup) {
            leftGroup.appendChild(seat);
        } else {
            rightGroup.appendChild(seat);
        }
    }

    container.appendChild(leftGroup);
    container.appendChild(rightGroup);
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
    state.totalPrice = state.seats.reduce((sum, seatNum) => sum + getSeatPrice(seatNum), 0);
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
    const emailInput = document.getElementById('input-email');
    const email = emailInput ? emailInput.value : '';
    const emailSpan = document.getElementById('success-email');
    if (emailSpan) emailSpan.textContent = email;
    showScreen('screen-success');
}
