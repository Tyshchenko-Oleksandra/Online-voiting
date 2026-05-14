document.addEventListener('DOMContentLoaded', function () {
  initBurgerMenu();
  initPollFilters();

  initRegistration();
  initLogin();
  initCreatePetition();
  initVerifyPetition();
  initUpdatePetition();
  initDeletePetition();
  initSearchAnswer();
  loadPetitions();
  initPollDetails();
});

function initBurgerMenu() {
  const burgerButton = document.getElementById('burgerButton');
  const mainNav = document.getElementById('mainNav');
  if (!burgerButton || !mainNav) return;

  burgerButton.addEventListener('click', () => mainNav.classList.toggle('open'));
}

function initPollFilters() {
  const searchInput = document.getElementById('pollSearch');
  const statusFilter = document.getElementById('statusFilter');
  const pollGrid = document.getElementById('pollGrid');
  if (!searchInput || !statusFilter || !pollGrid) return;

  function filterCards() {
    const searchValue = searchInput.value.trim().toLowerCase();
    const statusValue = statusFilter.value;
    const cards = Array.from(pollGrid.querySelectorAll('.poll-card'));

    cards.forEach(card => {
      const title = (card.dataset.title || '').toLowerCase();
      const status = card.dataset.status || '';
      const matchesSearch = title.includes(searchValue);
      const matchesStatus = statusValue === 'all' || status === statusValue;
      card.style.display = (matchesSearch && matchesStatus) ? '' : 'none';
    });
  }

  searchInput.addEventListener('input', filterCards);
  statusFilter.addEventListener('change', filterCards);
}

function initRegistration() {
  const registerForm = document.getElementById('registerForm');
  if (!registerForm) return;

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorBanner = document.getElementById('error-message');

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login: username, password: password })
      });

      const result = await response.json();

      if (result.success) {
        showToast('Акаунт створено!');
        setTimeout(() => window.location.href = '/', 1000);
      } else {
        if (errorBanner) {
          errorBanner.textContent = result.message || 'Помилка реєстрації';
          errorBanner.style.display = 'block';
        }
        showToast(result.message);
      }
    } catch (err) {
      console.error('Помилка реєстрації:', err);
      showToast('Не вдалося з\'єднатися з сервером');
    }
  });
}

function initLogin() {
  const loginForm = document.getElementById('loginForm');
  if (!loginForm) return;

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorBanner = document.getElementById('error-message');

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login: username, password })
      });

      const result = await response.json();

      if (result.success) {
        showToast('Успішний вхід!');
        setTimeout(() => window.location.href = '/', 800);
      } else {
        if (errorBanner) {
          errorBanner.textContent = result.message || 'Помилка входу';
          errorBanner.style.display = 'block';
        }
        showToast(result.message);
      }
    } catch (err) {
      console.error('Помилка login:', err);
      showToast('Сервер недоступний');
    }
  });
}

function initCreatePetition() {
  const form = document.getElementById('createPetitionForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('petitionName')?.value?.trim();
    const text = document.getElementById('petitionText')?.value?.trim();
    const options = Array.from(document.querySelectorAll('input[name="options[]"]'))
      .map(el => el.value.trim())
      .filter(Boolean);

    if (!name || !text) {
      showToast('Заповніть всі поля');
      return;
    }

    if (options.length < 2) {
      showToast('Мінімум 2 варіанти відповіді');
      return;
    }

    try {
      const res = await fetch('/api/petition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, text, options })
      });

      const result = await res.json();
      showToast(result.message);

      if (result.success) {
        setTimeout(() => window.location.href = '/', 1000);
      }
    } catch (err) {
      console.error('Помилка створення петиції:', err);
      showToast('Сервер недоступний');
    }
  });
}

function initVerifyPetition() {
  document.querySelectorAll('.btn-verify').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      if (!id) return;

      try {
        const res = await fetch(`/api/petition/${id}/verify`, { method: 'PATCH' });
        const result = await res.json();
        showToast(result.message);

        if (result.success) {
          btn.closest('.poll-card')?.classList.add('verified');
          btn.disabled = true;
        }
      } catch (err) {
        console.error('Помилка верифікації:', err);
        showToast('Сервер недоступний');
      }
    });
  });
}

function initUpdatePetition() {
  const form = document.getElementById('updatePetitionForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = form.dataset.petitionId;
    const name = document.getElementById('editPetitionName')?.value?.trim();
    const text = document.getElementById('editPetitionText')?.value?.trim();

    if (!name || !text) {
      showToast('Заповніть всі поля');
      return;
    }

    try {
      const res = await fetch(`/api/petition/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, text })
      });

      const result = await res.json();
      showToast(result.message);

      if (result.success) {
        setTimeout(() => window.location.href = '/', 1000);
      }
    } catch (err) {
      console.error('Помилка оновлення:', err);
      showToast('Сервер недоступний');
    }
  });
}

function initDeletePetition() {
  document.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      if (!id) return;
      if (!confirm('Видалити петицію?')) return;

      try {
        const res = await fetch(`/api/petition/${id}`, { method: 'DELETE' });
        const result = await res.json();
        showToast(result.message);

        if (result.success) {
          btn.closest('.poll-card')?.remove();
        }
      } catch (err) {
        console.error('Помилка видалення:', err);
        showToast('Сервер недоступний');
      }
    });
  });
}

function initSearchAnswer() {
  const searchBtn = document.getElementById('searchAnswerBtn');
  const searchInput = document.getElementById('searchAnswerInput');
  const resultBox = document.getElementById('searchAnswerResult');
  if (!searchBtn || !searchInput) return;

  searchBtn.addEventListener('click', async () => {
    const name = searchInput.value.trim();
    if (!name) {
      showToast('Введіть назву для пошуку');
      return;
    }

    try {
      const res = await fetch(`/api/answer?name=${encodeURIComponent(name)}`);
      const result = await res.json();

      if (result.success && resultBox) {
        resultBox.innerHTML = `
          <p>ID: ${result.answer.id}</p>
          <p>Назва: ${result.answer.name}</p>
        `;
      } else {
        showToast(result.message || 'Не знайдено');
      }
    } catch (err) {
      console.error('Помилка пошуку:', err);
      showToast('Сервер недоступний');
    }
  });
}

async function loadPetitions() {
  try {
    const res = await fetch('/api/petitions');
    const result = await res.json();

    const pollGrid = document.getElementById('pollGrid');
    if (!pollGrid) return;

    if (!result.success) {
      showToast(result.message);
      return;
    }

    if (result.petitions.length === 0) {
      pollGrid.innerHTML = `
        <div class="empty-box">
          <h3>Поки що голосувань немає</h3>
          <p>Створіть перше голосування в адмін панелі.</p>
          <a href="/admin/polls/new" class="btn btn-primary">Створити</a>
        </div>
      `;
      return;
    }

    pollGrid.innerHTML = '';

    result.petitions.forEach(petition => {
      const card = document.createElement('article');
      card.className = 'poll-card';
      card.dataset.title = petition.name.toLowerCase();
      card.dataset.status = 'active';

      card.innerHTML = `
        <div class="poll-card__top">
          <span class="badge badge-active">Активне</span>
        </div>
        <h3 class="poll-card__title">${petition.name}</h3>
        <p class="poll-card__description">${petition.text}</p>
        <div class="poll-card__actions">
          <a href="/polls/${petition.id}" class="btn btn-primary btn-sm">Проголосувати</a>
          <a href="/polls/${petition.id}/results" class="btn btn-secondary btn-sm">Результати</a>
        </div>
      `;

      pollGrid.appendChild(card);
    });

  } catch (err) {
    console.error('Помилка завантаження петицій:', err);
    showToast('Сервер недоступний');
  }
}

// ─── ДЕТАЛІ ГОЛОСУВАННЯ ──────────────────────────────────────────────────────

async function initPollDetails() {
  const pollId = window.location.pathname.split('/').filter(Boolean)[1];
  if (!pollId) return;

  try {
    const res = await fetch(`/api/petition/${pollId}`);
    const result = await res.json();

    if (!result.success) {
      showToast(result.message || 'Помилка завантаження');
      return;
    }

    const { petition, alreadyVoted, isAuth } = result;

    document.getElementById('pollTitle').textContent       = petition.name;
    document.getElementById('pollDescription').textContent = petition.text;
    document.getElementById('resultsLink').href            = `/polls/${pollId}/results`;

    if (alreadyVoted) {
      show('bannerVoted');
      show('resultsAction');
    } else if (petition.status !== 1) {
      show('bannerClosed');
      show('resultsAction');
    } else if (!isAuth) {
      show('bannerAuth');
    } else {
      renderOptions(petition.answers);
      show('voteSection');
      initVoteSubmit(pollId);
    }

  } catch (err) {
    console.error('Помилка завантаження голосування:', err);
    showToast('Сервер недоступний');
  }
}

function renderOptions(answers = []) {
  const list = document.getElementById('candidateList');
  if (!list) return;
  list.innerHTML = '';

  answers.forEach(answer => {
    const label = document.createElement('label');
    label.className = 'candidate-card';
    label.htmlFor = `option-${answer.answerId}`;
    label.innerHTML = `
      <input 
        type="radio" 
        id="option-${answer.answerId}"
        name="optionIndex" 
        value="${answer.answerId}" 
        class="candidate-radio" 
      />
      <div class="candidate-card__content">
        <div class="candidate-card__top">
          <h3>${answer.name}</h3>
        </div>
      </div>
    `;

    label.addEventListener('click', () => {
      document.querySelectorAll('.candidate-card').forEach(c => c.classList.remove('selected'));
      label.classList.add('selected');
    });

    list.appendChild(label);
  });
}

function initVoteSubmit(pollId) {
  const btn = document.getElementById('submitVoteBtn');
  if (!btn) return;

  btn.addEventListener('click', async () => {
    const selected = document.querySelector('input[name="optionIndex"]:checked');

    if (!selected) {
      showToast('Оберіть варіант відповіді');
      return;
    }

    try {
      const res = await fetch(`/api/petition/${pollId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answerId: selected.value })
      });

      const result = await res.json();
      showToast(result.message);

      if (result.success) {
        setTimeout(() => window.location.href = `/polls/${pollId}/results`, 1000);
      }
    } catch (err) {
      console.error('Помилка голосування:', err);
      showToast('Сервер недоступний');
    }
  });
}

function show(id) {
  const el = document.getElementById(id);
  if (el) el.style.display = '';
}




function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2200);
}