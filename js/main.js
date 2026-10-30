document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // 1. ДАНІ ТОВАРІВ
  // ==========================================
  const productsData = [
    { id: 1, name: "Нурофєн експрес форте капсули м'як. по 400 мг №20", price: 349.00 },
    { id: 2, name: "Вітамін С 500 мг з апельсиновим смаком таблетки №10", price: 21.60 },
    { id: 3, name: "Омега-3 1000 мг капсули №30", price: 253.90 },
    { id: 4, name: "Ібупрофен таблетки, в/о по 200 мг №14", price: 49.90 },
    { id: 5, name: "Нокспрей спрей наз. 0.05 % по 10 мл", price: 134.60 },
    { id: 6, name: "Стрепсілс з медом та лимоном льодяники №24", price: 172.10 },
    { id: 7, name: "Гербіон сироп подорожника по 150 мл", price: 336.20 }
  ];

  // ==========================================
  // 2. СТАН З LOCALSTORAGE ТА БЕЙДЖІ
  // ==========================================
  function getCart() {
    return JSON.parse(localStorage.getItem('pharmacy_cart') || '[]');
  }

  function getFavorites() {
    return JSON.parse(localStorage.getItem('pharmacy_favs') || '[]');
  }

  function updateHeaderBadges() {
    const cart = getCart();
    const favs = getFavorites();

    const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const favCount = favs.length;

    const actionLinks = document.querySelectorAll('.header__actions .action');
    
    // Обране (перша кнопка в панелі)
    if (actionLinks[0]) {
      const favBadge = actionLinks[0].querySelector('.badge');
      if (favBadge) {
        favBadge.textContent = favCount;
        favBadge.style.display = favCount > 0 ? 'grid' : 'none';
      }
    }

    // Кошик (третя кнопка в панелі)
    if (actionLinks[2]) {
      const cartBadge = actionLinks[2].querySelector('.badge');
      if (cartBadge) {
        cartBadge.textContent = cartCount;
        cartBadge.style.display = cartCount > 0 ? 'grid' : 'none';
      }
    }
  }

  updateHeaderBadges();

  // ==========================================
  // 3. ОБРОБКА КАРТОК ТОВАРІВ
  // ==========================================
  const cards = document.querySelectorAll('.product-card');

  cards.forEach((card, index) => {
    const addBtn = card.querySelector('.btn-cart');
    const favCheckbox = card.querySelector('.save input');

    const titleEl = card.querySelector('.product-card__title');
    const priceEl = card.querySelector('.product-card__price');

    const product = {
      id: index + 1,
      name: titleEl ? titleEl.textContent.trim() : `Товар ${index + 1}`,
      price: priceEl ? parseFloat(priceEl.textContent.replace(',', '.').replace(/[^\d.]/g, '')) : 100
    };

    // Чекбокс Обраного
    if (favCheckbox) {
      const favs = getFavorites();
      favCheckbox.checked = favs.includes(product.id);

      favCheckbox.addEventListener('change', (e) => {
        let favs = getFavorites();
        if (e.target.checked) {
          if (!favs.includes(product.id)) favs.push(product.id);
        } else {
          favs = favs.filter(id => id !== product.id);
        }
        localStorage.setItem('pharmacy_favs', JSON.stringify(favs));
        updateHeaderBadges();
      });
    }

    // Кнопка Додати товар
    if (addBtn) {
      addBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        let cart = getCart();
        const existingIndex = cart.findIndex(item => item.id === product.id);

        if (existingIndex > -1) {
          cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + 1;
        } else {
          cart.push({ ...product, quantity: 1 });
        }

        localStorage.setItem('pharmacy_cart', JSON.stringify(cart));
        updateHeaderBadges();

        const originalHTML = addBtn.innerHTML;
        addBtn.innerHTML = '<span class="icon icon--shop"></span>Додано ✓';
        addBtn.style.backgroundColor = '#1F4D3F';
        addBtn.style.color = '#FFFFFF';

        setTimeout(() => {
          addBtn.innerHTML = originalHTML;
          addBtn.style.backgroundColor = '';
          addBtn.style.color = '';
        }, 1500);
      });
    }
  });

  // ==========================================
  // 4. ЖИВИЙ ПОШУК З ПОЗИЦІОНУВАННЯМ
  // ==========================================
  const searchForm = document.querySelector('.search');
  const searchInput = document.querySelector('.search input');

  if (searchForm && searchInput) {
    const dropdown = document.createElement('div');
    dropdown.className = 'search-dropdown';
    dropdown.style.cssText = `
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: #ffffff;
      border: 1px solid var(--color-accent);
      border-radius: 12px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.18);
      z-index: 9999;
      display: none;
      max-height: 260px;
      overflow-y: auto;
      margin-top: 6px;
    `;

    searchForm.appendChild(dropdown);

    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();

      if (query.length < 2) {
        dropdown.style.display = 'none';
        return;
      }

      const matches = productsData.filter(item => item.name.toLowerCase().includes(query));

      if (matches.length > 0) {
        dropdown.innerHTML = matches.map(item => `
          <div class="search-item" style="padding: 10px 16px; border-bottom: 1px solid #f0f0f0; cursor: pointer; display: flex; justify-content: space-between; align-items: center;">
            <span style="font-size: 13px; color: #1A1A1A; font-weight: 500;">${item.name}</span>
            <strong style="color: #1F4D3F; font-size: 13px; white-space: nowrap; margin-left: 10px;">${item.price.toFixed(2)} ₴</strong>
          </div>
        `).join('');

        dropdown.style.display = 'block';

        dropdown.querySelectorAll('.search-item').forEach(el => {
          el.addEventListener('click', () => {
            window.location.href = 'product.html';
          });
        });
      } else {
        dropdown.innerHTML = `<div style="padding: 12px 16px; color: #888; font-size: 13px;">Нічого не знайдено</div>`;
        dropdown.style.display = 'block';
      }
    });

    document.addEventListener('click', (e) => {
      if (!searchForm.contains(e.target)) {
        dropdown.style.display = 'none';
      }
    });
  }
});