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
// Render directory fields as text.
const sstpRecords = window.SSTP_CONTENT?.sstpOfficers || [];
const sstpGrid = document.getElementById('sstpGrid');
sstpRecords.forEach(person => {
  const card = document.createElement('article'); card.className = 'officer-card';
  const name = document.createElement('h3'); name.textContent = person.name;
  const grade = document.createElement('span'); grade.className = 'officer-grade'; grade.textContent = person.grade ? 'Gred ' + person.grade : '';
  card.append(name, grade);
  const contacts = document.createElement('div'); contacts.className = 'officer-contact';
  if (person.phone && /^[+\d\s()-]+$/.test(person.phone)) {
    const phone = document.createElement('a'); phone.href = 'tel:' + person.phone.replace(/[^+\d]/g, '').replace(/^0/, '+60'); phone.textContent = person.phone; contacts.append(phone);
  }
  if (person.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(person.email)) {
    const email = document.createElement('a'); email.href = 'mailto:' + person.email; email.textContent = person.email; contacts.append(email);
  }
  card.append(contacts); sstpGrid.append(card);
});
document.getElementById('sstpPending').hidden = sstpRecords.length > 0;

const sstpSearch = document.getElementById('sstpSearch');
sstpSearch.addEventListener('input', () => {
  const query = sstpSearch.value.trim().toLocaleLowerCase('ms');
  let count = 0;
  sstpGrid.querySelectorAll('.officer-card').forEach(card => {
    card.hidden = !card.textContent.toLocaleLowerCase('ms').includes(query);
    if (!card.hidden) count++;
  });
  document.getElementById('sstpCount').textContent = count;
  document.getElementById('sstpEmpty').hidden = count > 0;
});
