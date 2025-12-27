const focusableSelector = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
let activeModal = null;
let lastFocusedTrigger = null;

const lockScroll = () => document.body.classList.add('is-locked');
const unlockScroll = () => document.body.classList.remove('is-locked');

const updateYear = () => {
  const currentYear = new Date().getFullYear();
  document.querySelectorAll('[data-current-year]').forEach((target) => {
    target.textContent = currentYear;
  });
};

const initMobileNav = () => {
  const toggle = document.querySelector('[data-mobile-toggle]');
  const drawer = document.querySelector('[data-mobile-drawer]');

  if (!toggle || !drawer) {
    return;
  }

  drawer.setAttribute('aria-hidden', 'true');

  const closeDrawer = () => {
    drawer.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('drawer-open');
  };

  const openDrawer = () => {
    drawer.classList.add('open');
    toggle.setAttribute('aria-expanded', 'true');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('drawer-open');
  };

  toggle.addEventListener('click', () => {
    if (drawer.classList.contains('open')) {
      closeDrawer();
    } else {
      openDrawer();
    }
  });

  drawer.querySelectorAll('a, button').forEach((element) => {
    element.addEventListener('click', closeDrawer);
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 960 && drawer.classList.contains('open')) {
      closeDrawer();
    }
  });
};

const trapFocus = (event) => {
  if (!activeModal || event.key !== 'Tab') {
    return;
  }

  const focusable = Array.from(activeModal.querySelectorAll(focusableSelector));
  if (focusable.length === 0) {
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
};

const closeActiveModal = () => {
  if (!activeModal) {
    return;
  }

  activeModal.classList.remove('active');
  activeModal.setAttribute('aria-hidden', 'true');
  activeModal.setAttribute('hidden', '');
  document.removeEventListener('keydown', trapFocus, true);
  document.removeEventListener('keydown', handleEscape, true);
  activeModal.removeEventListener('pointerdown', handleBackdropClick);
  unlockScroll();

  if (lastFocusedTrigger && typeof lastFocusedTrigger.focus === 'function') {
    lastFocusedTrigger.focus();
  }

  activeModal = null;
  lastFocusedTrigger = null;
};

const handleEscape = (event) => {
  if (event.key === 'Escape') {
    event.preventDefault();
    closeActiveModal();
  }
};

const handleBackdropClick = (event) => {
  if (event.target === activeModal) {
    closeActiveModal();
  }
};

const openModal = (modal, trigger) => {
  if (!modal) {
    return;
  }

  activeModal = modal;
  lastFocusedTrigger = trigger || document.activeElement;

  modal.classList.add('active');
  modal.removeAttribute('hidden');
  modal.setAttribute('aria-hidden', 'false');
  lockScroll();

  const focusable = Array.from(modal.querySelectorAll(focusableSelector));
  if (focusable.length) {
    focusable[0].focus();
  }

  modal.addEventListener('pointerdown', handleBackdropClick);
  document.addEventListener('keydown', trapFocus, true);
  document.addEventListener('keydown', handleEscape, true);
};

const initModals = () => {
  document.querySelectorAll('[data-modal]').forEach((modal) => {
    modal.setAttribute('hidden', '');
    modal.setAttribute('aria-hidden', 'true');

    modal.querySelectorAll('[data-modal-close]').forEach((closeButton) => {
      closeButton.addEventListener('click', () => closeActiveModal());
    });
  });

  document.querySelectorAll('[data-modal-target]').forEach((trigger) => {
    const targetSelector = trigger.getAttribute('data-modal-target');
    if (!targetSelector) {
      return;
    }

    const modal = document.querySelector(targetSelector);
    if (!modal) {
      return;
    }

    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      openModal(modal, trigger);
    });
  });
};

document.addEventListener('DOMContentLoaded', () => {
  updateYear();
  initMobileNav();
  initModals();
});

window.zuriLabs = {
  closeModal: closeActiveModal,
};
