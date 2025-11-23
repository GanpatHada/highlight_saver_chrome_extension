// Background script for handling extension functionality
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'saveHighlight') {
    saveHighlight(request.data)
      .then(() => {
        sendResponse({ success: true });
      })
      .catch((error) => {
        console.error('Error saving highlight:', error);
        sendResponse({ success: false, error: error.message });
      });
    return true; // Keep the message channel open for async response
  }
  
  if (request.action === 'getHighlights') {
    getHighlights()
      .then((highlights) => {
        sendResponse({ success: true, highlights });
      })
      .catch((error) => {
        console.error('Error getting highlights:', error);
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }
  
  if (request.action === 'deleteHighlight') {
    deleteHighlight(request.id)
      .then(() => {
        sendResponse({ success: true });
      })
      .catch((error) => {
        console.error('Error deleting highlight:', error);
        sendResponse({ success: false, error: error.message });
      });
    return true;
  }
});

// Save highlight to storage
async function saveHighlight(highlightData) {
  try {
    const { highlights = [] } = await chrome.storage.local.get(['highlights']);
    
    const newHighlight = {
      id: Date.now().toString(),
      ...highlightData
    };
    
    highlights.unshift(newHighlight); // Add to beginning
    
    // Keep only the last 100 highlights
    if (highlights.length > 100) {
      highlights.splice(100);
    }
    
    await chrome.storage.local.set({ highlights });
    return newHighlight;
  } catch (error) {
    throw new Error('Failed to save highlight');
  }
}

// Get all highlights from storage
async function getHighlights() {
  try {
    const { highlights = [] } = await chrome.storage.local.get(['highlights']);
    return highlights;
  } catch (error) {
    throw new Error('Failed to get highlights');
  }
}

// Delete a highlight from storage
async function deleteHighlight(id) {
  try {
    const { highlights = [] } = await chrome.storage.local.get(['highlights']);
    const filteredHighlights = highlights.filter(h => h.id !== id);
    await chrome.storage.local.set({ highlights: filteredHighlights });
  } catch (error) {
    throw new Error('Failed to delete highlight');
  }
}
