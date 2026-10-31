document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // групування товарів у кошику
  // ==========================================
    function getCart() {
    const raw = JSON.parse(localStorage.getItem('pharmacy_cart') || '[]');
    if (raw.length === 0) {
        return [{ id: 1, name: "Нурофєн експрес форте, капсули м'які по 400 мг, 20 шт", price: 349.00, quantity: 1, art: "184278" }];
    }

    // Групування дублікатів в 1 об'єкт з сумарною кількістю
    const map = new Map();
    raw.forEach(item => {
        const key = item.id || item.name;
        if (map.has(key)) {
        map.get(key).quantity += (item.quantity || 1);
        } else {
        map.set(key, { ...item, quantity: item.quantity || 1, art: item.art || "184278" });
        }
    });

    return Array.from(map.values());
    }

    function saveCart(cart) {
    localStorage.setItem('pharmacy_cart', JSON.stringify(cart));
    }

    const sumItemsElem = document.getElementById('js-sum-items');
    const sumTotalElem = document.getElementById('js-sum-total');
    const summaryContainer = document.getElementById('js-summary-items-container');
    const modalListContainer = document.getElementById('js-modal-items-list');

    function updateTotals() {
    const cart = getCart();
    const itemsTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const selectedDelivery = document.querySelector('input[name="delivery"]:checked');
    const deliveryCost = parseFloat(selectedDelivery?.value || '0');

    if (sumItemsElem) sumItemsElem.textContent = `${itemsTotal.toFixed(2).replace('.', ',')} ₴`;
    if (sumTotalElem) sumTotalElem.textContent = `${(itemsTotal + deliveryCost).toFixed(2).replace('.', ',')} ₴`;
    }

    function renderCart() {
    const cart = getCart();

    if (summaryContainer) {
        summaryContainer.innerHTML = cart.map(item => `
        <div class="summary__item">
            <img src="img/nurofen.png" alt="${item.name}">
            <div>
            <strong>${item.name}</strong>
            <small>${item.quantity} упаковка (-и)</small>
            </div>
        </div>
        `).join('');
    }

    if (modalListContainer) {
        modalListContainer.innerHTML = cart.map((item, idx) => `
        <div class="figma-cart-card">
            <img src="img/nurofen.png" alt="${item.name}" class="figma-cart-card__img">
            <div class="figma-cart-card__body">
            <h3 class="figma-cart-card__title">${item.name}</h3>
            <div class="figma-cart-card__art">Арт. ${item.art}</div>
            <div class="figma-qty-control">
                <button type="button" class="figma-qty-btn" data-action="minus" data-index="${idx}">−</button>
                <span class="figma-qty-val">${item.quantity}</span>
                <button type="button" class="figma-qty-btn" data-action="plus" data-index="${idx}">+</button>
            </div>
            </div>
            <button type="button" class="figma-cart-card__delete" data-action="delete" data-index="${idx}" title="Видалити">🗑</button>
        </div>
        `).join('');
    }

    updateTotals();
    }

    renderCart();

    // Зміна кількості або видалення в модалці
    if (modalListContainer) {
    modalListContainer.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;

        const idx = parseInt(btn.dataset.index, 10);
        let cart = getCart();
        if (!cart[idx]) return;

        if (btn.dataset.action === 'plus') {
        cart[idx].quantity += 1;
        } else if (btn.dataset.action === 'minus') {
        if (cart[idx].quantity > 1) {
            cart[idx].quantity -= 1;
        }
        } else if (btn.dataset.action === 'delete') {
        cart.splice(idx, 1);
        }

        saveCart(cart);
        renderCart();
    });
    }

    // ==========================================
    // фіксація контактних даних
    // ==========================================
    const lockBtn = document.getElementById('js-lock-contact-btn');
    const unlockBtn = document.getElementById('js-unlock-contact-btn');
    const formInner = document.getElementById('js-contact-form-inner');
    const savedInner = document.getElementById('js-contact-saved');

    if (lockBtn) {
    lockBtn.addEventListener('click', () => {
        const phone = document.getElementById('checkout-phone').value.trim();
        const fname = document.getElementById('checkout-fname').value.trim();
        const lname = document.getElementById('checkout-lname').value.trim();
        const email = document.getElementById('checkout-email').value.trim();

        if (!phone || !fname || !lname) {
        alert("Будь ласка, заповніть обов'язкові поля: Телефон, Ім'я та Прізвище");
        return;
        }

      // Автоматичне обмеження та фільтрація поля телефону
        const phoneInput = document.getElementById('checkout-phone');

        if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
            // Залишаємо тільки цифри
            let value = e.target.value.replace(/\D/g, '');
            
            // Обрізаємо до 9 цифр (щоб разом із 380 було рівно 12 цифр)
            if (value.length > 9) {
            value = value.slice(0, 9);
            }
            
            e.target.value = value;
        });
        }

        // При фіксації контактних даних перевіряємо, щоб було введено рівно 9 цифр
        const lockBtn = document.getElementById('js-lock-contact-btn');
        if (lockBtn) {
        lockBtn.addEventListener('click', () => {
            const phone = phoneInput ? phoneInput.value.trim() : '';
            const fname = document.getElementById('checkout-fname').value.trim();
            const lname = document.getElementById('checkout-lname').value.trim();

            if (phone.length !== 9) {
            alert("Номер телефону повинен містити рівно 9 цифр після +380 (наприклад: 671234567)");
            if (phoneInput) phoneInput.focus();
            return;
            }

            if (!fname || !lname) {
            alert("Будь ласка, заповніть ім'я та прізвище");
            return;
            }

            document.getElementById('js-saved-fullname').textContent = `${fname} ${lname}`;
            document.getElementById('js-saved-phone').textContent = `+380 ${phone}`;
            document.getElementById('js-saved-email').textContent = document.getElementById('checkout-email').value.trim() || '';

            document.getElementById('js-contact-form-inner').classList.add('hidden');
            document.getElementById('js-contact-saved').classList.remove('hidden');
        });
        }

        document.getElementById('js-saved-fullname').textContent = `${fname} ${lname}`;
        document.getElementById('js-saved-phone').textContent = `+380 ${phone}`;
        document.getElementById('js-saved-email').textContent = email || '';

        formInner.classList.add('hidden');
        savedInner.classList.remove('hidden');
    });
    }

    if (unlockBtn) {
    unlockBtn.addEventListener('click', () => {
        savedInner.classList.add('hidden');
        formInner.classList.remove('hidden');
    });
    }

    // ==========================================
    // поля доставки
    // ==========================================
    const deliveryFieldsBox = document.getElementById('js-delivery-fields');
    const deliveryRadios = document.querySelectorAll('input[name="delivery"]');

    function updateDeliveryFields() {
    const selected = document.querySelector('input[name="delivery"]:checked');
    if (!selected || !deliveryFieldsBox) return;

    const type = selected.dataset.type;

    if (type === 'pharmacy') {
        deliveryFieldsBox.innerHTML = `
        <label>Оберіть аптеку для самовивозу:</label>
        <select>
            <option>м. Київ, просп. Академіка Глушкова, 4г (В наявності)</option>
            <option>м. Київ, вул. Хрещатик, 22 (В наявності)</option>
            <option>м. Житомир, вул. Велика Бердичівська, 6 (В наявності)</option>
        </select>
        `;
    } else if (type === 'post') {
        deliveryFieldsBox.innerHTML = `
        <label>Номер відділення або поштомату:</label>
        <input type="text" placeholder="Введіть № відділення / поштомату..." required>
        `;
    } else if (type === 'courier') {
        deliveryFieldsBox.innerHTML = `
        <label>Адреса доставки кур'єром:</label>
        <input type="text" placeholder="Вулиця, будинок, квартира" required style="margin-bottom:8px;">
        `;
    }

    updateTotals();
    }

    deliveryRadios.forEach(r => r.addEventListener('change', updateDeliveryFields));
    updateDeliveryFields();

    // ==========================================
    // поля оплати карткою
    // ==========================================
    const cardPayFields = document.getElementById('js-card-payment-fields');
    const paymentRadios = document.querySelectorAll('input[name="payment"]');

    paymentRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
        if (cardPayFields) {
        cardPayFields.classList.toggle('hidden', e.target.value !== 'card');
        }
    });
    });



    const selectedCityBtn = document.getElementById('js-selected-city');
    document.querySelectorAll('.city-chip').forEach(btn => {
    btn.addEventListener('click', () => {
    const city = btn.dataset.city;
    if (selectedCityBtn) selectedCityBtn.textContent = `${city} ▾`;
    window.location.hash = '';
    });
    });

    const cityInput = document.getElementById('city-input');
    const cityResults = document.getElementById('js-city-results');

    const citiesList = [
    'Київ', 'Житомир', 'Львів', 'Одеса', 'Харків', 'Дніпро', 'Луцьк', 'Полтава',
    'Запоріжжя', 'Вінниця', 'Івано-Франківськ', 'Миколаїв', 'Черкаси', 'Чернігів',
    'Суми', 'Рівне', 'Тернопіль', 'Хмельницький', 'Ужгород', 'Кривий Ріг'
    ];

    if (cityInput && cityResults) {
    cityInput.addEventListener('input', () => {
    const query = cityInput.value.trim().toLowerCase();

    if (!query) {
        cityResults.classList.remove('is-active');
        cityResults.innerHTML = '';
        return;
    }

    const matches = citiesList.filter(city => city.toLowerCase().includes(query));

    if (matches.length > 0) {
        cityResults.innerHTML = matches.map(city => 
        `<div class="city-search-item" data-city="${city}">${city}</div>`
        ).join('');
    } else {
        cityResults.innerHTML = `<div class="city-search-item" style="color:#888; cursor:default;">Місто не знайдено</div>`;
    }

    cityResults.classList.add('is-active');
    });

    cityResults.addEventListener('click', (e) => {
    const item = e.target.closest('.city-search-item');
    if (item && item.dataset.city) {
        const cityName = item.dataset.city;
        if (selectedCityBtn) selectedCityBtn.textContent = `${cityName} ▾`;
        cityInput.value = '';
        cityResults.classList.remove('is-active');
        window.location.hash = ''; // Закриваємо модалку
    }
    });

    // Закриття списку при кліку поза ним
    document.addEventListener('click', (e) => {
    if (!e.target.closest('.city__search')) {
        cityResults.classList.remove('is-active');
    }
    });
    }

    // Відправка всієї форми
    const form = document.getElementById('js-checkout-form');
    if (form) {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        alert('Замовлення успішно оформлено!');
        localStorage.removeItem('pharmacy_cart');
        window.location.href = 'index.html';
    });
    }
});