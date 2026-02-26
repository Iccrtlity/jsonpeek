const dropZone = document.getElementById('drop-zone');
const jsonInput = document.getElementById('json-input');
const output = document.getElementById('output');
const jsonView = document.getElementById('json-view');
const stats = document.getElementById('stats');
const copyFull = document.getElementById('copy-full');
const expandAll = document.getElementById('expand-all');
const collapseAll = document.getElementById('collapse-all');

let currentJson = null;


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
  if (file && file.type === 'application/json') {
    file.text().then(text => processJson(text));
  }
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
  jsonView.innerHTML = syntaxHighlight(JSON.stringify(obj, null, 2));

  
  const keys = jsonView.querySelectorAll('.key');
  keys.forEach(key => {
    key.addEventListener('click', () => {
      const line = key.parentElement;
      const next = line.nextElementSibling;
      if (next && next.tagName === 'PRE' || next.tagName === 'DIV') {
        next.style.display = next.style.display === 'none' ? 'block' : 'none';
      }
    });
  });

  
  const str = JSON.stringify(obj);
  const lines = str.split('\n').length;
  stats.textContent = `${(str.length / 1024).toFixed(1)} KB • ${lines} lines`;
}

function syntaxHighlight(json) {
  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return json.replace(/"(\\.*?)"(\s*):/g, '<span class="key">$&</span>')
             .replace(/"(.*?)"/g, '<span class="string">"$1"</span>')
             .replace(/\b(true|false)\b/g, '<span class="boolean">$1</span>')
             .replace(/\b(null)\b/g, '<span class="null">$1</span>')
             .replace(/-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?/g, '<span class="number">$&</span>');
}

// Buttons
copyFull.addEventListener('click', () => {
  if (currentJson) navigator.clipboard.writeText(JSON.stringify(currentJson, null, 2));
});

expandAll.addEventListener('click', () => {
  jsonView.querySelectorAll('pre, div').forEach(el => el.style.display = 'block');
});

collapseAll.addEventListener('click', () => {
  jsonView.querySelectorAll('pre, div').forEach(el => el.style.display = 'none');
});