const menu = document.querySelector('.menu');
const navigation = document.querySelector('#navigation');
menu.addEventListener('click', () => {
  const expanded = menu.getAttribute('aria-expanded') === 'true';
  menu.setAttribute('aria-expanded', String(!expanded));
  navigation.classList.toggle('open', !expanded);
});
navigation.addEventListener('click', event => {
  if (event.target.closest('a')) {
    menu.setAttribute('aria-expanded', 'false');
    navigation.classList.remove('open');
  }
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
    menu.setAttribute('aria-expanded', 'false');
    navigation.classList.remove('open');
    menu.focus();
  }
});

// Switch between the two directories; arrow keys follow the tab pattern.
const tabs = [...document.querySelectorAll('[role="tab"]')];
function activateTab(tab) {
  tabs.forEach(item => {
    const selected = item === tab;
    item.setAttribute('aria-selected', String(selected));
    item.tabIndex = selected ? 0 : -1;
    document.getElementById(item.getAttribute('aria-controls')).hidden = !selected;
  });
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => activateTab(tab));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = tabs[(index + 1) % tabs.length];
    if (event.key === 'ArrowLeft') next = tabs[(index + tabs.length - 1) % tabs.length];
    if (event.key === 'Home') next = tabs[0];
    if (event.key === 'End') next = tabs[tabs.length - 1];
    if (next) { event.preventDefault(); activateTab(next); next.focus(); }
  });
});
const officerSearch = document.getElementById('officerSearch');
const districtFilter = document.getElementById('districtFilter');
const groups = [...document.querySelectorAll('.district-group')];
const officerCards = [...document.querySelectorAll('#ustpPanel .officer-card')];
groups.forEach(group => {
  const option = document.createElement('option');
  option.value = group.dataset.district;
  option.textContent = group.dataset.district;
  districtFilter.append(option);
});
function filterOfficers() {
  const query = officerSearch.value.trim().toLocaleLowerCase('ms');
  let visible = 0;
  groups.forEach(group => {
    let groupVisible = 0;
    group.querySelectorAll('.officer-card').forEach(card => {
      const matchesDistrict = !districtFilter.value || group.dataset.district === districtFilter.value;
      const haystack = (group.dataset.district + ' ' + card.textContent).toLocaleLowerCase('ms');
      const matches = matchesDistrict && (!query || haystack.includes(query));
      card.hidden = !matches;
      if (matches) { groupVisible++; visible++; }
    });
    group.hidden = groupVisible === 0;
    group.querySelector('.district-heading b').textContent = groupVisible + ' PKG';
  });
  document.getElementById('officerCount').textContent = visible;
  document.getElementById('officerEmpty').hidden = visible > 0;
}
officerSearch.addEventListener('input', filterOfficers);
districtFilter.addEventListener('change', filterOfficers);
filterOfficers();
// Render future approved SSTP records as text, never as HTML.
const sstpRecords = window.SSTP_CONTENT?.sstpOfficers || [];
const sstpGrid = document.getElementById('sstpGrid');
sstpRecords.forEach(person => {
  const card = document.createElement('article'); card.className = 'officer-card';
  const name = document.createElement('h3'); name.textContent = person.name;
  const role = document.createElement('p'); role.textContent = person.role;
  const unit = document.createElement('p'); unit.textContent = person.unit;
  card.append(name, role, unit);
  const contacts = document.createElement('div'); contacts.className = 'officer-contact';
  if (person.phone && /^[+\d\s()-]+$/.test(person.phone)) {
    const phone = document.createElement('a'); phone.href = 'tel:' + person.phone.replace(/[^+\d]/g, ''); phone.textContent = person.phone; contacts.append(phone);
  }
  if (person.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(person.email)) {
    const email = document.createElement('a'); email.href = 'mailto:' + person.email; email.textContent = person.email; contacts.append(email);
  }
  card.append(contacts); sstpGrid.append(card);
});
document.getElementById('sstpPending').hidden = sstpRecords.length > 0;
