// content.js

let saveButton = null;
let currentSelection = null;
let lastSelectedText = '';
let isSelecting = false;
let isSaveInProgress = false;

// ✅ Create Save button
function createSaveButton() {
  if (saveButton) return;

  saveButton = document.createElement('button');
  saveButton.innerHTML = '💾 Save';
  saveButton.style.position = 'absolute';
  saveButton.style.zIndex = '9999';
  saveButton.style.padding = '6px 12px';
  saveButton.style.border = 'none';
  saveButton.style.borderRadius = '6px';
  saveButton.style.background = '#4CAF50';
  saveButton.style.color = 'white';
  saveButton.style.cursor = 'pointer';
  saveButton.style.fontSize = '14px';
  saveButton.style.display = 'none';
  saveButton.style.boxShadow = '0 2px 6px rgba(0,0,0,0.2)';

  saveButton.addEventListener('click', saveHighlight);
  document.body.appendChild(saveButton);
}

// ✅ Hide button
function hideSaveButton() {
  if (saveButton) {
    saveButton.style.display = 'none';
  }
}

// ✅ Show button near selection
function showSaveButton(x, y) {
  createSaveButton();
  saveButton.style.top = `${y + 20}px`;
  saveButton.style.left = `${x}px`;
  saveButton.style.display = 'block';
  saveButton.innerHTML = '💾 Save';
  saveButton.style.background = '#4CAF50';
}

// ✅ Save highlight
function saveHighlight() {
  if (!currentSelection || isSaveInProgress) {
    console.log('Save blocked: no selection or save in progress');
    return;
  }

  console.log('Starting save process...');
  isSaveInProgress = true;

  const selectionToSave = { ...currentSelection };
  console.log('Saving selection:', selectionToSave);

  chrome.runtime.sendMessage(
    {
      action: 'saveHighlight',
      data: selectionToSave
    },
    (response) => {
      console.log('Save response:', response);

      if (response?.success) {
        saveButton.innerHTML = '✅ Saved!';
        saveButton.style.background = '#4CAF50';

        setTimeout(() => {
          hideSaveButton();
          window.getSelection().removeAllRanges();
          currentSelection = null;
          lastSelectedText = '';
          isSelecting = false;
          isSaveInProgress = false;
          console.log('Save completed successfully');
        }, 1000);
      } else {
        saveButton.innerHTML = '❌ Error';
        saveButton.style.background = '#f44336';

        setTimeout(() => {
          saveButton.innerHTML = '💾 Save';
          saveButton.style.background = '#4CAF50';
          isSaveInProgress = false;
          console.log('Save failed');
        }, 1000);
      }
    }
  );
}

// ✅ Handle text selection
document.addEventListener('mouseup', (e) => {
  const selection = window.getSelection();
  const text = selection.toString().trim();

  if (text && text !== lastSelectedText) {
    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    currentSelection = {
      text,
      pageUrl: window.location.href,
      timestamp: Date.now()
    };

    lastSelectedText = text;
    isSelecting = true;

    showSaveButton(rect.left + window.scrollX, rect.bottom + window.scrollY);
  } else if (!text) {
    hideSaveButton();
    currentSelection = null;
    isSelecting = false;
  }
});

// ✅ Reset when user clicks elsewhere
document.addEventListener('mousedown', (e) => {
  if (saveButton && !saveButton.contains(e.target)) {
    const selection = window.getSelection().toString().trim();
    if (!selection) {
      hideSaveButton();
      currentSelection = null;
      isSelecting = false;
    }
  }
});
