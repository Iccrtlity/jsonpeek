const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');
const jsonInput = document.getElementById('json-input');
const output = document.getElementById('output');
const jsonView = document.getElementById('json-view');
const stats = document.getElementById('stats');
const copyFull = document.getElementById('copy-full');
const expandAll = document.getElementById('expand-all');
const collapseAll = document.getElementById('collapse-all');

let currentJson = null;

function isJsonFile(file) {
  return file && (file.type === 'application/json' || file.name.toLowerCase().endsWith('.json'));
}

function handleFile(file) {
  if (!file) return;
  if (!isJsonFile(file)) {
    jsonView.innerHTML = '<span style="color:#f85149">Unsupported file type. Please select a .json file.</span>';
    output.classList.remove('hidden');
    return;
  }
  file.text().then(text => processJson(text));
}

dropZone.addEventListener('click', () => {
  fileInput.click();
});

fileInput.addEventListener('change', e => {
  const file = e.target.files[0];
  handleFile(file);
  fileInput.value = '';
});

dropZone.addEventListener('dragover', e => {
  e.preventDefault();
  dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
  dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', e => {
  e.preventDefault();
  dropZone.classList.remove('dragover');
  const file = e.dataTransfer.files[0];
  handleFile(file);
});

jsonInput.addEventListener('input', () => {
  if (jsonInput.value.trim()) processJson(jsonInput.value);
});

function processJson(raw) {
  try {
    const parsed = JSON.parse(raw);
    currentJson = parsed;
    renderJson(parsed);
    output.classList.remove('hidden');
  } catch (err) {
    jsonView.innerHTML = `<span style="color:#f85149">Invalid JSON: ${err.message}</span>`;
    output.classList.remove('hidden');
  }
}

function renderJson(obj) {
  jsonView.innerHTML = '';
  const root = buildNode(obj, true);
  jsonView.appendChild(root.container);

  jsonView.querySelectorAll('[data-collapsible="true"]').forEach(node => {
    node.addEventListener('click', e => {
      e.stopPropagation();
      const isOpen = node.getAttribute('data-open') === 'true';
      const body = node.nextElementSibling;
      if (!body) return;
      node.setAttribute('data-open', (!isOpen).toString());
      node.querySelector('.twisty').textContent = isOpen ? '▶' : '▼';
      body.style.display = isOpen ? 'none' : 'block';
    });
  });

  const pretty = JSON.stringify(obj, null, 2);
  const lines = pretty.split('\n').length;
  stats.textContent = `${(pretty.length / 1024).toFixed(1)} KB • ${lines} lines`;
}

function syntaxHighlight(value) {
  if (value === null) return '<span class="null">null</span>';
  if (typeof value === 'string') {
    return `<span class="string">"${escapeHtml(value)}"</span>`;
  }
  if (typeof value === 'number') return `<span class="number">${value}</span>`;
  if (typeof value === 'boolean') return `<span class="boolean">${value}</span>`;
  return `<span class="string">"${escapeHtml(String(value))}"</span>`;
}

function escapeHtml(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function buildNode(value, isRoot = false) {
  const container = document.createElement('div');
  const isArray = Array.isArray(value);
  const isObject = value && typeof value === 'object' && !isArray;
  const isComplex = isArray || isObject;

  if (!isComplex) {
    container.innerHTML = syntaxHighlight(value);
    return { container, body: null };
  }

  const header = document.createElement('span');
  header.setAttribute('data-collapsible', 'true');
  header.setAttribute('data-open', 'true');
  const twisty = document.createElement('span');
  twisty.className = 'twisty';
  twisty.textContent = '▼';
  const openBracket = document.createElement('span');
  openBracket.textContent = isArray ? '[' : '{';
  header.appendChild(twisty);
  header.appendChild(openBracket);
  container.appendChild(header);

  const body = document.createElement('div');
  body.style.paddingLeft = '16px';
  body.style.display = 'block';

  const entries = isArray ? value.map((v, i) => [i, v]) : Object.entries(value);
  entries.forEach(([key, val], index) => {
    const row = document.createElement('div');
    if (!isArray) {
      const keySpan = document.createElement('span');
      keySpan.className = 'key';
      keySpan.innerHTML = `"${escapeHtml(String(key))}"`;
      row.appendChild(keySpan);
      row.appendChild(document.createTextNode(': '));
    }

    const child = buildNode(val);
    row.appendChild(child.container);
    if (index < entries.length - 1) row.appendChild(document.createTextNode(','));
    body.appendChild(row);
  });

  const footer = document.createElement('div');
  footer.textContent = isArray ? ']' : '}';

  container.appendChild(body);
  container.appendChild(footer);
  if (isRoot) container.style.whiteSpace = 'pre';
  return { container, body };
}

copyFull.addEventListener('click', () => {
  if (!currentJson) return;
  const originalText = copyFull.textContent;
  navigator.clipboard.writeText(JSON.stringify(currentJson, null, 2)).then(() => {
    copyFull.textContent = 'Copied';
    setTimeout(() => {
      copyFull.textContent = originalText;
    }, 1200);
  });
});

expandAll.addEventListener('click', () => {
  jsonView.querySelectorAll('[data-collapsible="true"]').forEach(node => {
    const body = node.nextElementSibling;
    if (!body) return;
    node.setAttribute('data-open', 'true');
    node.querySelector('.twisty').textContent = '▼';
    body.style.display = 'block';
  });
});

collapseAll.addEventListener('click', () => {
  jsonView.querySelectorAll('[data-collapsible="true"]').forEach(node => {
    const body = node.nextElementSibling;
    if (!body) return;
    node.setAttribute('data-open', 'false');
    node.querySelector('.twisty').textContent = '▶';
    body.style.display = 'none';
  });
});