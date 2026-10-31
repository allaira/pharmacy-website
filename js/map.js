document.addEventListener('DOMContentLoaded', () => {
    const mapContainer = document.getElementById('map-container');
    if (!mapContainer) return;

    // Динамічний розрахунок чи відкрита аптека зараз
    function checkIsOpen(ph) {
    if (ph.is24_7) return true;

    const now = new Date();
    const day = now.getDay(); // 0 - Неділя, 1-5 - Пн-Пт, 6 - Субота
    const currentMins = now.getHours() * 60 + now.getMinutes();

    const isWeekend = (day === 0 || day === 6);
    const schedule = (isWeekend && ph.weekendHours) ? ph.weekendHours : ph.weekdayHours;

    if (!schedule) return false;

    const [startH, startM] = schedule.start.split(':').map(Number);
    const [endH, endM] = schedule.end.split(':').map(Number);

    const startMins = startH * 60 + startM;
    const endMins = endH * 60 + endM;

    return currentMins >= startMins && currentMins < endMins;
    }

    // Обробка кліку на вибір міста
    const cityEditBtn = document.querySelector('.city-edit');
    if (cityEditBtn) {
    cityEditBtn.addEventListener('click', (e) => {
        e.preventDefault();
        alert('Наразі мережа аптек працює лише у м. Київ.');
    });
    }

    // кастомний маркер
    const pharmacyIcon = L.divIcon({
    className: 'custom-pharmacy-marker',
    html: `
        <svg width="36" height="46" viewBox="0 0 36 46" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0px 4px 8px rgba(8, 76, 66, 0.35));">
        <path d="M18 0C8.05887 0 0 8.05887 0 18C0 29.5 18 46 18 46C18 46 36 29.5 36 18C36 8.05887 27.9411 0 18 0Z" fill="#084C42"/>
        <rect x="15" y="10" width="6" height="16" rx="2" fill="#FFFFFF"/>
        <rect x="10" y="15" width="16" height="6" rx="2" fill="#FFFFFF"/>
        </svg>
    `,
    iconSize: [36, 46],
    iconAnchor: [18, 46],
    popupAnchor: [0, -44]
    });

    // Масив з точними прапорцями генераторів з твого HTML
    const pharmacies = [
    {
        coords: [50.4475, 30.5218],
        name: "Аптека Neo - Хрещатик",
        addr: "вул. Хрещатик, 24, м. Київ",
        hours: "Пн-Нд 08:00 - 22:00",
        weekdayHours: { start: "08:00", end: "22:00" },
        hasGenerator: true
    },
    {
        coords: [50.3780, 30.4635],
        name: "Аптека Neo - Глушкова",
        addr: "просп. Академіка Глушкова, 13Б, м. Київ",
        hours: "Цілодобово (24/7)",
        is24_7: true,
        hasGenerator: true
    },
    {
        coords: [50.3952, 30.6358],
        name: "Аптека Neo - Мишуги",
        addr: "вул. Олександра Мишуги, 4, м. Київ",
        hours: "Пн-Пт 08:00 - 21:00, Сб-Нд 09:00 - 20:00",
        weekdayHours: { start: "08:00", end: "21:00" },
        weekendHours: { start: "09:00", end: "20:00" },
        hasGenerator: false
    },
    {
        coords: [50.4678, 30.5125],
        name: "Аптека Neo - Нижній Вал",
        addr: "вул. Нижній Вал, 15, м. Київ",
        hours: "Пн-Нд 09:00 - 21:00",
        weekdayHours: { start: "09:00", end: "21:00" },
        hasGenerator: false
    },
    {
        coords: [50.5085, 30.4982],
        name: "Аптека Neo - ТЦ Dream",
        addr: "просп. Оболонський, 1Б (ТЦ Dream), м. Київ",
        hours: "Пн-Нд 09:00 - 21:30",
        weekdayHours: { start: "09:00", end: "21:30" },
        hasGenerator: false
    },
    {
        coords: [50.4215, 30.4658],
        name: "Аптека Neo - Повітряних Сил",
        addr: "просп. Повітряних Сил, 50, м. Київ",
        hours: "Пн-Нд 07:30 - 21:00",
        weekdayHours: { start: "07:30", end: "21:00" },
        hasGenerator: true
    }
    ];

    // ВираховуємоisOpen для кожної аптеки
    pharmacies.forEach(ph => {
    ph.isOpen = checkIsOpen(ph);
    });

    // ініціалізація карти
    const map = L.map('map-container').setView([50.4450, 30.5200], 11);

    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    const markers = [];

    // 4. Додаємо кастомні маркери
    pharmacies.forEach((ph) => {
    const marker = L.marker(ph.coords, { icon: pharmacyIcon }).addTo(map);

    marker.bindPopup(`
        <div style="font-family: inherit; padding: 4px; line-height: 1.4;">
        <strong style="color: #084C42; font-size: 14px;">${ph.name}</strong><br>
        <span style="font-size: 12px; color: #333;">${ph.addr}</span><br>
        <small style="color: #149E82; font-weight: 600;">${ph.hours}</small><br>
        <span style="font-size: 11px; font-weight: bold; color: ${ph.isOpen ? '#084C42' : '#d9534f'};">
            ${ph.isOpen ? '● Відкрито зараз' : '○ Зачинено'}
        </span>
        </div>
    `);

    markers.push(marker);
    });

    const viewMapRadio = document.getElementById('view-map');
    if (viewMapRadio) {
    viewMapRadio.addEventListener('change', () => {
        if (viewMapRadio.checked) {
        setTimeout(() => {
            map.invalidateSize();
        }, 100);
        }
    });
    }

    // клік по плашці аптеки
    const pharmacyCards = document.querySelectorAll('.ph-card');
    const radioViewMap = document.getElementById('view-map');

    pharmacyCards.forEach((card, index) => {
    card.style.cursor = 'pointer';

    card.addEventListener('click', () => {
        const target = pharmacies[index];
        if (target) {
        // Перемикаємо мобільний режим на карту
        if (radioViewMap) {
            radioViewMap.checked = true;
        }

        // Плавний скрол
        mapContainer.scrollIntoView({ behavior: 'smooth', block: 'center' });
        map.flyTo(target.coords, 16, { duration: 1.2 });

        // Оновлюємо розмір карти після перемикання на мобільному
        setTimeout(() => { map.invalidateSize(); }, 250);

        markers[index].openPopup();
        }
    });
    });

    // Пошук та фільтри під твій точний HTML
    const searchInput = document.querySelector('.finder__search input');
    const chips = document.querySelectorAll('.finder__chips .chip');
    const filterOpenBtn = chips[0];
    const filterGenBtn = chips[1];
    const countSpan = document.querySelector('.finder__count span');

    let filterOpenOnly = false;
    let filterGenOnly = false;

    function updatePharmaciesView() {
    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    let visibleCount = 0;

    pharmacies.forEach((ph, index) => {
        const matchesSearch = ph.addr.toLowerCase().includes(query) || ph.name.toLowerCase().includes(query);
        const matchesOpen = !filterOpenOnly || ph.isOpen;
        const matchesGen = !filterGenOnly || ph.hasGenerator;

        const isVisible = matchesSearch && matchesOpen && matchesGen;

        if (pharmacyCards[index]) {
        pharmacyCards[index].style.display = isVisible ? '' : 'none';
        }

        if (markers[index]) {
        if (isVisible) {
            markers[index].addTo(map);
            visibleCount++;
        } else {
            map.removeLayer(markers[index]);
        }
        }
    });

    // Оновлюємо лічильник аптек
    if (countSpan) {
        countSpan.textContent = `${visibleCount} аптек${visibleCount === 1 ? 'а' : (visibleCount >= 2 && visibleCount <= 4 ? 'и' : '')}`;
    }
    }

    if (searchInput) {
    searchInput.addEventListener('input', updatePharmaciesView);
    }

    if (filterOpenBtn) {
    filterOpenBtn.addEventListener('click', (e) => {
        e.preventDefault();
        filterOpenOnly = !filterOpenOnly;
        filterOpenBtn.classList.toggle('active', filterOpenOnly);
        updatePharmaciesView();
    });
    }

    if (filterGenBtn) {
    filterGenBtn.addEventListener('click', (e) => {
        e.preventDefault();
        filterGenOnly = !filterGenOnly;
        filterGenBtn.classList.toggle('active', filterGenOnly);
        updatePharmaciesView();
    });
    }

    updatePharmaciesView();
});