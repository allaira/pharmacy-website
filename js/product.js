document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // оновлення бейджів в шапці
  // ==========================================
  function updateHeaderBadges() {
    const cart = JSON.parse(localStorage.getItem('pharmacy_cart') || '[]');
    const favs = JSON.parse(localStorage.getItem('pharmacy_favs') || '[]');

    const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const favCount = favs.length;

    document.querySelectorAll('.header__actions .action, .mobile-nav__item').forEach(link => {
      const text = link.textContent || '';
      if (text.includes('Обране')) {
        let badge = link.querySelector('.badge') || document.createElement('span');
        badge.className = 'badge';
        (link.querySelector('.action__icon') || link).appendChild(badge);
        badge.textContent = favCount;
        badge.style.display = favCount > 0 ? 'grid' : 'none';
      }
      if (text.includes('Кошик')) {
        let badge = link.querySelector('.badge') || document.createElement('span');
        badge.className = 'badge';
        (link.querySelector('.action__icon') || link).appendChild(badge);
        badge.textContent = cartCount;
        badge.style.display = cartCount > 0 ? 'grid' : 'none';
      }
    });
  }

  updateHeaderBadges();

  // ==========================================
  // галерея, карусель
  // ==========================================
  const mainImg = document.querySelector('.gallery__main img');
  const thumbTrack = document.querySelector('.gallery__thumbs-track');
  const dotsContainer = document.querySelector('.gallery__dots');

  const images = [
    { src: 'img/nurofen.png', alt: 'Упаковка Нурофєн' },
    { src: 'img/image 1.png', alt: 'Містить ібупрофен' },
    { src: 'img/image 2.png', alt: 'Швидше ніж таблетки' },
    { src: 'img/image 3.png', alt: 'Знеболення до 8 год' }
  ];

  let currentIndex = 0;

  function updateGallery(index) {
    currentIndex = (index + images.length) % images.length;

    if (mainImg) {
      mainImg.src = images[currentIndex].src;
      mainImg.alt = images[currentIndex].alt;
    }

    const thumbImgs = thumbTrack?.querySelectorAll('img') || [];
    thumbImgs.forEach((img, idx) => {
      const isActive = idx === currentIndex;
      img.classList.toggle('is-active', isActive);
      if (isActive) {
        img.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    });

    const dots = dotsContainer?.querySelectorAll('i') || [];
    dots.forEach((dot, idx) => {
      dot.classList.toggle('is-active', idx === currentIndex);
    });
  }

  thumbTrack?.querySelectorAll('img').forEach((img, idx) => {
    img.addEventListener('click', () => updateGallery(idx));
  });

  dotsContainer?.querySelectorAll('i').forEach((dot, idx) => {
    dot.addEventListener('click', () => updateGallery(idx));
  });

  document.querySelectorAll('.gallery-arrow--prev, .thumb-arrow--prev').forEach(btn => {
    btn.addEventListener('click', () => updateGallery(currentIndex - 1));
  });

  document.querySelectorAll('.gallery-arrow--next, .thumb-arrow--next').forEach(btn => {
    btn.addEventListener('click', () => updateGallery(currentIndex + 1));
  });

  document.addEventListener('keydown', (e) => {
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
    if (e.key === 'ArrowLeft') updateGallery(currentIndex - 1);
    if (e.key === 'ArrowRight') updateGallery(currentIndex + 1);
  });

  // ==========================================
  // 1 активний пункт в меню
  // ==========================================
  const subnavLinks = document.querySelectorAll('.subnav__links a');
  const sections = [
    { id: 'all', el: document.getElementById('all') || document.querySelector('.product-top') },
    { id: 'specs', el: document.getElementById('specs') },
    { id: 'instruction', el: document.getElementById('instruction') },
    { id: 'faq', el: document.getElementById('faq') },
    { id: 'reviews', el: document.getElementById('reviews') }
  ].filter(item => item.el);

  function highlightSingleTabOnScroll() {
    const scrollPos = window.scrollY + 150;
    let currentId = 'all';

    sections.forEach(item => {
      if (scrollPos >= item.el.offsetTop) {
        currentId = item.id;
      }
    });

    subnavLinks.forEach(link => {
      const href = link.getAttribute('href').replace('#', '');
      link.classList.toggle('is-active', href === currentId);
    });
  }

  window.addEventListener('scroll', highlightSingleTabOnScroll);
  highlightSingleTabOnScroll();

  subnavLinks.forEach(link => {
    link.addEventListener('click', function () {
      subnavLinks.forEach(l => l.classList.remove('is-active'));
      this.classList.add('is-active');
    });
  });

  // ==========================================
  // перемикання ціни
  // ==========================================
  document.querySelectorAll('input[name="qty"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      const priceText = e.target.value === '10' ? '174,50 ₴' : '349,00 ₴';
      document.querySelectorAll('.buy-box__price, .subnav__mini strong, .floating-buy__price').forEach(el => {
        el.textContent = priceText;
      });
    });
  });

  // ==========================================
  // додавання обраного в кошик
  // ==========================================
  const favCheckbox = document.querySelector('.product-main__save input');
  if (favCheckbox) {
    let favs = JSON.parse(localStorage.getItem('pharmacy_favs') || '[]');
    favCheckbox.checked = favs.includes(1);
    favCheckbox.addEventListener('change', (e) => {
      let currentFavs = JSON.parse(localStorage.getItem('pharmacy_favs') || '[]');
      if (e.target.checked) {
        if (!currentFavs.includes(1)) currentFavs.push(1);
      } else {
        currentFavs = currentFavs.filter(id => id !== 1);
      }
      localStorage.setItem('pharmacy_favs', JSON.stringify(currentFavs));
      updateHeaderBadges();
    });
  }

  document.querySelectorAll('.btn-buy, .subnav__cta').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const selectedQty = document.querySelector('input[name="qty"]:checked')?.value || '20';
      const priceVal = selectedQty === '10' ? 174.50 : 349.00;

      const product = { id: 1, name: `Нурофєн експрес форте (${selectedQty} шт)`, price: priceVal, quantity: 1 };
      let cart = JSON.parse(localStorage.getItem('pharmacy_cart') || '[]');
      const idx = cart.findIndex(i => i.id === product.id && i.name === product.name);
      if (idx > -1) cart[idx].quantity += 1;
      else cart.push(product);

      localStorage.setItem('pharmacy_cart', JSON.stringify(cart));
      updateHeaderBadges();

      const orig = btn.innerHTML;
      btn.innerHTML = '<span class="icon icon--shop"></span>Додано ✓';
      btn.style.backgroundColor = '#1F4D3F';
      setTimeout(() => {
        btn.innerHTML = orig;
        btn.style.backgroundColor = '';
      }, 1500);
    });
  });

  // ==========================================
  // вибір зірок, перерахування відгуків
  // ==========================================
  const starsPicker = document.getElementById('js-stars-picker');
  const ratingInput = document.getElementById('review-rating-val');

  if (starsPicker && ratingInput) {
    const starSpans = starsPicker.querySelectorAll('span');

    function setPickerValue(val) {
      ratingInput.value = val;
      starSpans.forEach(s => {
        const spanVal = parseInt(s.dataset.val, 10);
        s.classList.toggle('active', spanVal <= val);
      });
    }

    starSpans.forEach(star => {
      star.addEventListener('click', () => {
        setPickerValue(parseInt(star.dataset.val, 10));
      });

      star.addEventListener('mouseenter', () => {
        const hoverVal = parseInt(star.dataset.val, 10);
        starSpans.forEach(s => {
          s.classList.toggle('hover', parseInt(s.dataset.val, 10) <= hoverVal);
        });
      });
    });

    starsPicker.addEventListener('mouseleave', () => {
      starSpans.forEach(s => s.classList.remove('hover'));
    });
  }

  let savedReviews = JSON.parse(localStorage.getItem('pharmacy_product_reviews') || '[]');

  const reviewForm = document.getElementById('js-review-form');
  const reviewsList = document.getElementById('js-reviews-list');
  const countElem = document.getElementById('js-reviews-count');
  const avgElem = document.getElementById('js-reviews-avg');
  const topCountElem = document.getElementById('js-top-reviews-count');
  const topStarsElem = document.getElementById('js-top-stars');

  function getReviewPlural(n) {
    const abs = Math.abs(n) % 100;
    const n1 = abs % 10;
    if (abs > 10 && abs < 20) return `${n} відгуків`;
    if (n1 > 1 && n1 < 5) return `${n} відгуки`;
    if (n1 === 1) return `${n} відгук`;
    return `${n} відгуків`;
  }

  function renderReviewsAndStats() {
    if (!reviewsList) return;
    reviewsList.innerHTML = '';

    const count = savedReviews.length;
    let avg = 0;

    if (count > 0) {
      const sum = savedReviews.reduce((acc, r) => acc + (r.rating || 5), 0);
      avg = (sum / count).toFixed(1);
    }

    if (countElem) countElem.textContent = count;
    if (avgElem) avgElem.textContent = avg;
    if (topCountElem) topCountElem.textContent = getReviewPlural(count);

    if (topStarsElem) {
      topStarsElem.style.setProperty('--rating', avg);
      topStarsElem.setAttribute('aria-label', `Рейтинг ${avg} з 5`);
    }

    savedReviews.forEach(r => {
      const card = document.createElement('div');
      card.className = 'review-card';
      const starStr = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
      card.innerHTML = `
        <div class="review-card__header">
          <strong class="review-card__author">${r.author}</strong>
          <span class="review-card__stars">${starStr}</span>
        </div>
        <p class="review-card__text">${r.text}</p>
      `;
      reviewsList.appendChild(card);
    });
  }

  renderReviewsAndStats();

  if (reviewForm) {
    reviewForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const author = document.getElementById('review-author').value.trim();
      const text = document.getElementById('review-text').value.trim();
      const rating = parseInt(ratingInput?.value || 5, 10);

      if (!author || !text) return;

      const newReview = { author, text, rating, date: new Date().toISOString() };
      savedReviews.unshift(newReview);
      localStorage.setItem('pharmacy_product_reviews', JSON.stringify(savedReviews));

      renderReviewsAndStats();
      reviewForm.reset();

      if (starsPicker) {
        starsPicker.querySelectorAll('span').forEach((s, idx) => {
          s.classList.toggle('active', idx < 5);
        });
        if (ratingInput) ratingInput.value = 5;
      }
    });
  }
});