/* North Star Bakery — Touchstone 4: favorites and form validation */
const STORAGE_KEYS = { favorites: 'northStarFavorites', requestType: 'northStarRequestType' };
const PRODUCTS = [
  { id: 'signature-loaf', name: 'Signature Loaf', category: 'Bread' },
  { id: 'morning-pastry', name: 'Morning Pastry', category: 'Pastry' },
  { id: 'celebration-cake', name: 'Celebration Cake', category: 'Cake' }
];

function loadFavorites() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.favorites) || '[]');
    return Array.isArray(saved) ? saved.filter(id => PRODUCTS.some(product => product.id === id)) : [];
  } catch (error) { return []; }
}
function saveFavorites(favorites) {
  try { localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(favorites)); } catch (error) { /* storage may be blocked */ }
}
function renderFavorites(favorites) {
  const summary = document.getElementById('favorite-summary');
  if (!summary) return;
  const names = PRODUCTS.filter(product => favorites.includes(product.id)).map(product => product.name);
  summary.textContent = names.length ? `Saved favorites (${names.length}): ${names.join(', ')}.` : 'No favorites saved yet.';
  document.querySelectorAll('[data-favorite-id]').forEach(box => {
    box.checked = favorites.includes(box.dataset.favoriteId);
  });
}
function setupFavorites() {
  const container = document.getElementById('favorite-options');
  if (!container) return;
  let favorites = loadFavorites();
  PRODUCTS.forEach(product => {
    const label = document.createElement('label');
    label.className = 'favorite-choice';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.dataset.favoriteId = product.id;
    checkbox.checked = favorites.includes(product.id);
    checkbox.addEventListener('change', () => {
      favorites = checkbox.checked ? [...favorites, product.id] : favorites.filter(id => id !== product.id);
      saveFavorites(favorites);
      renderFavorites(favorites);
    });
    label.append(checkbox, document.createTextNode(` ${product.name} (${product.category})`));
    container.append(label);
  });
  document.getElementById('clear-favorites').addEventListener('click', () => {
    favorites = [];
    saveFavorites(favorites);
    renderFavorites(favorites);
  });
  renderFavorites(favorites);
}
function setFieldError(field, message) {
  const error = document.getElementById(`${field.id}-error`);
  if (error) error.textContent = message;
  field.setAttribute('aria-invalid', message ? 'true' : 'false');
  if (message) field.setAttribute('aria-describedby', `${field.id}-error`);
  else field.removeAttribute('aria-describedby');
  return !message;
}
function validateField(field, form) {
  const value = field.value.trim();
  let message = '';
  if (field.id === 'customer-name' && value.length < 2) message = 'Please enter your name (at least 2 characters).';
  if (field.id === 'customer-email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) message = 'Enter a valid email address, like name@example.com.';
  if (field.id === 'request-type' && !value) message = 'Please choose a request type.';
  if (field.id === 'item-details' && value.length < 10) message = 'Please add at least 10 characters about your request.';
  if (field.id === 'pickup-date' && form.elements.request_type.value === 'preorder') {
    const today = new Date();
    const localToday = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
    if (!value) message = 'Choose a pickup date for your preorder.';
    else if (value < localToday) message = 'Choose today or a future pickup date.';
  }
  return setFieldError(field, message);
}
function setupForm() {
  const form = document.getElementById('preorder-form');
  if (!form) return;
  const fields = ['customer-name','customer-email','request-type','pickup-date','item-details'].map(id => document.getElementById(id));
  const requestType = document.getElementById('request-type');
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.requestType);
    if (stored === 'preorder' || stored === 'question') requestType.value = stored;
  } catch (error) { /* storage may be blocked */ }
  requestType.addEventListener('change', () => {
    try { localStorage.setItem(STORAGE_KEYS.requestType, requestType.value); } catch (error) { /* storage may be blocked */ }
    validateField(document.getElementById('pickup-date'), form);
  });
  fields.forEach(field => {
    field.addEventListener('input', () => validateField(field, form));
    field.addEventListener('change', () => validateField(field, form));
  });
  form.addEventListener('submit', event => {
    event.preventDefault(); // demonstration only; no server exists
    const valid = fields.map(field => validateField(field, form)).every(Boolean);
    const status = document.getElementById('form-status');
    status.textContent = valid
      ? 'Your request looks ready! This demonstration does not send it to the bakery.'
      : 'Please correct the highlighted fields before continuing.';
    if (!valid) fields.find(field => field.getAttribute('aria-invalid') === 'true').focus();
  });
}
document.addEventListener('DOMContentLoaded', () => { setupFavorites(); setupForm(); });
