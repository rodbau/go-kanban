/**
 * RichEditor Helper for Kanban Board
 * 
 * This script ensures the Rich Text Editor functionality persists
 * across WebSocket updates in the LiveView framework.
 */

(function() {
    'use strict';
    
    // Store the last known content to preserve it across updates
    let lastEditorContent = '';
    
    /**
     * Initialize or re-initialize the rich editor after DOM updates
     */
    function initRichEditor() {
        // Find all contenteditable elements (from the RichEditor component)
        const editors = document.querySelectorAll('.editor-content[contenteditable="true"]');
        
        editors.forEach(editor => {
            // Restore focus state if editor was focused before update
            const hadFocus = document.activeElement === editor;
            
            // Restore content if it was lost during update
            if (editor.innerHTML === '' && lastEditorContent) {
                editor.innerHTML = lastEditorContent;
            }
            
            // Re-attach event listeners if needed
            if (!editor.hasAttribute('data-listeners-attached')) {
                // Mark as having listeners to avoid duplicate attachments
                editor.setAttribute('data-listeners-attached', 'true');
                
                // Store content on every change
                editor.addEventListener('input', function() {
                    lastEditorContent = this.innerHTML;
                });
                
                // Handle paste events to clean up formatting
                editor.addEventListener('paste', function(e) {
                    e.preventDefault();
                    
                    // Get plain text from clipboard
                    let text = '';
                    if (e.clipboardData) {
                        text = e.clipboardData.getData('text/html') || 
                               e.clipboardData.getData('text/plain');
                    } else if (window.clipboardData) {
                        text = window.clipboardData.getData('Text');
                    }
                    
                    // Insert the cleaned content
                    if (document.queryCommandSupported('insertHTML')) {
                        document.execCommand('insertHTML', false, text);
                    } else {
                        document.execCommand('paste', false, text);
                    }
                });
                
                // Restore focus if needed
                if (hadFocus) {
                    editor.focus();
                }
            }
        });
    }
    
    /**
     * Clear stored content when modal is closed
     */
    function clearEditorContent() {
        lastEditorContent = '';
    }
    
    /**
     * Set editor content programmatically
     */
    function setEditorContent(content) {
        lastEditorContent = content || '';
        const editors = document.querySelectorAll('.editor-content[contenteditable="true"]');
        editors.forEach(editor => {
            editor.innerHTML = lastEditorContent;
        });
    }
    
    // Expose functions globally for use by other scripts
    window.richEditorHelper = {
        init: initRichEditor,
        clear: clearEditorContent,
        setContent: setEditorContent
    };
    
    // Initialize on page load
    document.addEventListener('DOMContentLoaded', initRichEditor);
    
    // Re-initialize after WebSocket updates
    // Listen for custom event that might be triggered after updates
    document.addEventListener('liveview-updated', initRichEditor);
    
    // Use MutationObserver as fallback to detect DOM changes
    const observer = new MutationObserver(function(mutations) {
        // Check if any mutation affected the modal or editor areas
        const shouldReinit = mutations.some(mutation => {
            const target = mutation.target;
            return target.classList && (
                target.classList.contains('modal-container') ||
                target.classList.contains('tab-content') ||
                target.id === 'rich_editor'
            );
        });
        
        if (shouldReinit) {
            setTimeout(initRichEditor, 10); // Small delay to ensure DOM is ready
        }
    });
    
    // Start observing the document body for changes
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'id']
    });
    
    console.log('RichEditor helper loaded and ready');
})();