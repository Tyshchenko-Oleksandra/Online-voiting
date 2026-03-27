document.addEventListener('DOMContentLoaded', function () {
  initBurgerMenu();
  initPollFilters();
  initAddCandidateField();
  initCopyButtons();
  initDeleteConfirmation();
  initVoteValidation();
});

function initBurgerMenu() {
  const burgerButton = document.getElementById('burgerButton');
  const mainNav = document.getElementById('mainNav');

  if (!burgerButton || !mainNav) return;

  burgerButton.addEventListener('click', function () {
    mainNav.classList.toggle('open');
  });
}

function initPollFilters() {
  const searchInput = document.getElementById('pollSearch');
  const statusFilter = document.getElementById('statusFilter');
  const pollGrid = document.getElementById('pollGrid');
  const noResultsMessage = document.getElementById('noResultsMessage');

  if (!searchInput || !statusFilter || !pollGrid) return;

  const cards = Array.from(pollGrid.querySelectorAll('.poll-card'));

  function filterCards() {
    const searchValue = searchInput.value.trim().toLowerCase();
    const statusValue = statusFilter.value;
    let visibleCount = 0;

    cards.forEach(function (card) {
      const title = (card.dataset.title || '').toLowerCase();
      const status = card.dataset.status || '';

      const matchesSearch = title.includes(searchValue);
      const matchesStatus = statusValue === 'all' || status === statusValue;

      const shouldShow = matchesSearch && matchesStatus;

      card.style.display = shouldShow ? '' : 'none';

      if (shouldShow) {
        visibleCount++;
      }
    });

    if (noResultsMessage) {
      noResultsMessage.classList.toggle('hidden', visibleCount !== 0);
    }
  }

  searchInput.addEventListener('input', filterCards);
  statusFilter.addEventListener('change', filterCards);
}

function initAddCandidateField() {
  const addButton = document.getElementById('addCandidateBtn');
  const candidateFields = document.getElementById('candidateFields');

  if (!candidateFields) return;

  if (addButton) {
    addButton.addEventListener('click', function () {
      const wrapper = document.createElement('div');
      wrapper.className = 'candidate-field';

      wrapper.innerHTML = `
        <input
          type="text"
          name="candidates[]"
          class="input"
          placeholder="Ім’я кандидата"
          required
        />
        <button type="button" class="remove-candidate-btn">✕</button>
      `;

      candidateFields.appendChild(wrapper);
      bindRemoveCandidateButtons();
    });
  }

  bindRemoveCandidateButtons();
}

function bindRemoveCandidateButtons() {
  const buttons = document.querySelectorAll('.remove-candidate-btn');

  buttons.forEach(function (button) {
    button.onclick = function () {
      const allFields = document.querySelectorAll('.candidate-field');

      if (allFields.length <= 2) {
        showToast('Має залишитися хоча б 2 кандидати');
        return;
      }

      const parent = button.parentElement;
      if (parent) {
        parent.remove();
      }
    };
  });
}

function initCopyButtons() {
  const copyButtons = document.querySelectorAll('.copy-btn');

  copyButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      const text = button.dataset.copyText;

      if (!text) return;

      navigator.clipboard.writeText(text)
        .then(function () {
          showToast('URL скопійовано');
        })
        .catch(function () {
          showToast('Не вдалося скопіювати URL');
        });
    });
  });
}

function initDeleteConfirmation() {
  const deleteForms = document.querySelectorAll('.delete-form');

  deleteForms.forEach(function (form) {
    form.addEventListener('submit', function (event) {
      const confirmed = confirm('Точно видалити це голосування?');

      if (!confirmed) {
        event.preventDefault();
      }
    });
  });
}

function initVoteValidation() {
  const voteForm = document.getElementById('voteForm');

  if (!voteForm) return;

  voteForm.addEventListener('submit', function (event) {
    const checked = voteForm.querySelector('input[name="candidateId"]:checked');

    if (!checked) {
      event.preventDefault();
      showToast('Оберіть кандидата перед голосуванням');
    }
  });
}

function showToast(message) {
  const toast = document.getElementById('toast');

  if (!toast) return;

  toast.textContent = message;
  toast.classList.add('show');

  clearTimeout(toast._timer);

  toast._timer = setTimeout(function () {
    toast.classList.remove('show');
  }, 2200);
}