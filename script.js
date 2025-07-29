/*
 * Adventurer's Tome – D&D character sheet manager
 *
 * Handles character CRUD operations, dynamic spell/item lists, export/import
 * and service worker registration.  Characters are stored in localStorage.
 */

(() => {
  const charListEl = document.getElementById('charList');
  const importBtn = document.getElementById('importCharBtn');
  const importFileInput = document.getElementById('importFile');
  const newCharBtn = document.getElementById('newCharBtn');
  const saveBtn = document.getElementById('saveCharBtn');
  const exportBtn = document.getElementById('exportCharBtn');
  const deleteBtn = document.getElementById('deleteCharBtn');
  const addSpellBtn = document.getElementById('addSpellBtn');
  const addItemBtn = document.getElementById('addItemBtn');
  const spellsBody = document.getElementById('spellsBody');
  const itemsBody = document.getElementById('itemsBody');

  // Form fields
  const fields = {
    name: document.getElementById('charName'),
    class: document.getElementById('charClass'),
    race: document.getElementById('charRace'),
    level: document.getElementById('charLevel'),
    background: document.getElementById('charBackground'),
    alignment: document.getElementById('charAlignment'),
    stats: {
      str: document.getElementById('statStr'),
      dex: document.getElementById('statDex'),
      con: document.getElementById('statCon'),
      int: document.getElementById('statInt'),
      wis: document.getElementById('statWis'),
      cha: document.getElementById('statCha'),
    },
    hp: document.getElementById('charHP'),
    ac: document.getElementById('charAC'),
    speed: document.getElementById('charSpeed'),
  };

  let characters = {};
  let currentId = null;

  function blankCharacter() {
    return {
      name: 'New Character',
      class: '',
      race: '',
      level: 1,
      background: '',
      alignment: '',
      stats: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
      hp: 0,
      ac: 0,
      speed: 30,
      spells: [],
      inventory: [],
    };
  }

  function loadFromStorage() {
    const stored = localStorage.getItem('dndCharacters');
    if (stored) {
      try {
        characters = JSON.parse(stored);
      } catch (err) {
        console.warn('Could not parse stored characters', err);
        characters = {};
      }
    }
  }

  function saveToStorage() {
    try {
      localStorage.setItem('dndCharacters', JSON.stringify(characters));
    } catch (err) {
      console.warn('Could not save characters', err);
    }
  }

  function renderCharacterList() {
    charListEl.innerHTML = '';
    const ids = Object.keys(characters);
    if (ids.length === 0) {
      const li = document.createElement('li');
      li.textContent = 'No characters yet';
      li.style.fontStyle = 'italic';
      charListEl.appendChild(li);
      return;
    }
    ids.forEach(id => {
      const char = characters[id];
      const li = document.createElement('li');
      li.textContent = char.name || 'Unnamed';
      li.dataset.charId = id;
      if (id === currentId) li.classList.add('selected');
      li.addEventListener('click', () => {
        if (id === currentId) return;
        // Persist current edits before switching
        if (currentId) gatherForm();
        loadCharacter(id);
      });
      charListEl.appendChild(li);
    });
  }

  function loadCharacter(id) {
    currentId = id;
    const char = characters[id];
    // Populate fields
    fields.name.value = char.name || '';
    fields.class.value = char.class || '';
    fields.race.value = char.race || '';
    fields.level.value = char.level || '';
    fields.background.value = char.background || '';
    fields.alignment.value = char.alignment || '';
    fields.stats.str.value = char.stats.str || '';
    fields.stats.dex.value = char.stats.dex || '';
    fields.stats.con.value = char.stats.con || '';
    fields.stats.int.value = char.stats.int || '';
    fields.stats.wis.value = char.stats.wis || '';
    fields.stats.cha.value = char.stats.cha || '';
    fields.hp.value = char.hp || '';
    fields.ac.value = char.ac || '';
    fields.speed.value = char.speed || '';
    // Render spells and inventory
    renderSpells(char.spells);
    renderItems(char.inventory);
    renderCharacterList();
  }

  function renderSpells(spells) {
    spellsBody.innerHTML = '';
    (spells || []).forEach(spell => {
      addSpellRow(spell);
    });
  }

  function renderItems(items) {
    itemsBody.innerHTML = '';
    (items || []).forEach(item => {
      addItemRow(item);
    });
  }

  function addSpellRow(spell = { name: '', level: '', description: '' }) {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><input type="text" class="spell-name" value="${escapeHtml(spell.name)}"></td>
      <td><input type="text" class="spell-level" value="${escapeHtml(spell.level)}"></td>
      <td><textarea class="spell-desc" rows="1">${escapeHtml(spell.description)}</textarea></td>
      <td><button type="button" class="delete-row">×</button></td>
    `;
    row.querySelector('.delete-row').addEventListener('click', () => {
      row.remove();
    });
    spellsBody.appendChild(row);
  }

  function addItemRow(item = { name: '', qty: '', description: '' }) {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><input type="text" class="item-name" value="${escapeHtml(item.name)}"></td>
      <td><input type="text" class="item-qty" value="${escapeHtml(item.qty)}"></td>
      <td><textarea class="item-desc" rows="1">${escapeHtml(item.description)}</textarea></td>
      <td><button type="button" class="delete-row">×</button></td>
    `;
    row.querySelector('.delete-row').addEventListener('click', () => {
      row.remove();
    });
    itemsBody.appendChild(row);
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function gatherForm() {
    if (!currentId) return;
    const char = characters[currentId];
    char.name = fields.name.value.trim() || 'Unnamed';
    char.class = fields.class.value.trim();
    char.race = fields.race.value.trim();
    char.level = parseInt(fields.level.value, 10) || 1;
    char.background = fields.background.value.trim();
    char.alignment = fields.alignment.value.trim();
    char.stats = {
      str: parseInt(fields.stats.str.value, 10) || 0,
      dex: parseInt(fields.stats.dex.value, 10) || 0,
      con: parseInt(fields.stats.con.value, 10) || 0,
      int: parseInt(fields.stats.int.value, 10) || 0,
      wis: parseInt(fields.stats.wis.value, 10) || 0,
      cha: parseInt(fields.stats.cha.value, 10) || 0,
    };
    char.hp = parseInt(fields.hp.value, 10) || 0;
    char.ac = parseInt(fields.ac.value, 10) || 0;
    char.speed = parseInt(fields.speed.value, 10) || 0;
    // Gather spells
    const spellRows = spellsBody.querySelectorAll('tr');
    char.spells = Array.from(spellRows).map(row => ({
      name: row.querySelector('.spell-name').value.trim(),
      level: row.querySelector('.spell-level').value.trim(),
      description: row.querySelector('.spell-desc').value.trim(),
    }));
    // Gather items
    const itemRows = itemsBody.querySelectorAll('tr');
    char.inventory = Array.from(itemRows).map(row => ({
      name: row.querySelector('.item-name').value.trim(),
      qty: row.querySelector('.item-qty').value.trim(),
      description: row.querySelector('.item-desc').value.trim(),
    }));
  }

  function createNewCharacter() {
    // save current before switching
    if (currentId) gatherForm();
    const id = 'char-' + Date.now();
    characters[id] = blankCharacter();
    currentId = id;
    renderCharacterList();
    loadCharacter(id);
  }

  function deleteCharacter() {
    if (!currentId) return;
    const name = characters[currentId].name || 'this character';
    if (!confirm(`Delete ${name}? This cannot be undone.`)) return;
    delete characters[currentId];
    saveToStorage();
    const ids = Object.keys(characters);
    currentId = ids.length ? ids[0] : null;
    if (currentId) loadCharacter(currentId);
    else {
      // Clear form
      document.getElementById('characterForm').reset();
      spellsBody.innerHTML = '';
      itemsBody.innerHTML = '';
      renderCharacterList();
    }
  }

  function exportCharacter() {
    if (!currentId) return;
    gatherForm();
    const char = characters[currentId];
    const json = JSON.stringify(char, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const nameSafe = char.name.replace(/[^a-z0-9\-]/gi, '_').toLowerCase() || 'character';
    a.download = `${nameSafe}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function importCharacter(file) {
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const data = JSON.parse(e.target.result);
        const id = 'char-' + Date.now();
        characters[id] = Object.assign(blankCharacter(), data);
        currentId = id;
        saveToStorage();
        renderCharacterList();
        loadCharacter(id);
      } catch (err) {
        alert('Failed to import character: invalid JSON');
      }
    };
    reader.readAsText(file);
  }

  function init() {
    loadFromStorage();
    // If there are stored characters, load the first one
    const ids = Object.keys(characters);
    if (ids.length) {
      currentId = ids[0];
      loadCharacter(currentId);
    } else {
      currentId = null;
      renderCharacterList();
    }
    // Event listeners
    newCharBtn.addEventListener('click', createNewCharacter);
    saveBtn.addEventListener('click', () => {
      // Gather form inputs into character and persist to storage
      gatherForm();
      saveToStorage();
      // Reload character so list refreshes and selected state remains
      if (currentId) {
        loadCharacter(currentId);
      } else {
        renderCharacterList();
      }
    });
    exportBtn.addEventListener('click', exportCharacter);
    deleteBtn.addEventListener('click', () => {
      deleteCharacter();
    });
    importBtn.addEventListener('click', () => {
      importFileInput.click();
    });
    importFileInput.addEventListener('change', () => {
      const file = importFileInput.files[0];
      if (file) importCharacter(file);
      importFileInput.value = '';
    });
    addSpellBtn.addEventListener('click', () => {
      addSpellRow();
    });
    addItemBtn.addEventListener('click', () => {
      addItemRow();
    });
    // Register service worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('sw.js').catch(err => console.warn('SW registration failed', err));
      });
    }
  }
  // Start once DOM ready
  document.addEventListener('DOMContentLoaded', init);
})();