/**
 * Simple Rich Text Editor for Kanban Board
 * A lightweight rich text editor implemented purely in JavaScript
 */

(function() {
    'use strict';
    
    let currentComponentId = null;
    let editorContent = '';
    
    /**
     * Initialize the rich editor when the modal opens
     */
    window.initRichEditor = function(componentId) {
        currentComponentId = componentId;
        
        // Wait a bit for DOM to be ready
        setTimeout(() => {
            const container = document.getElementById('rich-editor-container');
            if (!container) return;
            
            // Create the editor HTML
            container.innerHTML = `
                <div class="simple-rich-editor">
                    <div class="editor-toolbar">
                        <button type="button" class="editor-btn" onclick="formatText('bold')" title="Bold">
                            <b>B</b>
                        </button>
                        <button type="button" class="editor-btn" onclick="formatText('italic')" title="Italic">
                            <i>I</i>
                        </button>
                        <button type="button" class="editor-btn" onclick="formatText('underline')" title="Underline">
                            <u>U</u>
                        </button>
                        <button type="button" class="editor-btn" onclick="formatText('strikethrough')" title="Strikethrough">
                            <s>S</s>
                        </button>
                        <span class="editor-separator"></span>
                        <button type="button" class="editor-btn" onclick="formatText('h1')" title="Heading 1">
                            H1
                        </button>
                        <button type="button" class="editor-btn" onclick="formatText('h2')" title="Heading 2">
                            H2
                        </button>
                        <button type="button" class="editor-btn" onclick="formatText('h3')" title="Heading 3">
                            H3
                        </button>
                        <span class="editor-separator"></span>
                        <button type="button" class="editor-btn" onclick="formatText('ul')" title="Bullet List">
                            •
                        </button>
                        <button type="button" class="editor-btn" onclick="formatText('ol')" title="Numbered List">
                            1.
                        </button>
                        <button type="button" class="editor-btn" onclick="formatText('blockquote')" title="Quote">
                            "
                        </button>
                        <span class="editor-separator"></span>
                        <button type="button" class="editor-btn" onclick="formatText('link')" title="Insert Link">
                            🔗
                        </button>
                        <button type="button" class="editor-btn" onclick="formatText('clear')" title="Clear Formatting">
                            ✕
                        </button>
                    </div>
                    <div class="editor-content" 
                         id="rich-editor-content"
                         contenteditable="true"
                         oninput="updateEditorContent()"
                         onpaste="handlePaste(event)">
                    </div>
                </div>
            `;
            
            // Add styles if not already present
            if (!document.getElementById('rich-editor-styles')) {
                const style = document.createElement('style');
                style.id = 'rich-editor-styles';
                style.innerHTML = `
                    .simple-rich-editor {
                        border: 1px solid #ddd;
                        border-radius: 8px;
                        overflow: hidden;
                        background: white;
                    }
                    .editor-toolbar {
                        display: flex;
                        gap: 0.5rem;
                        padding: 0.75rem;
                        background: #f5f5f5;
                        border-bottom: 1px solid #ddd;
                        flex-wrap: wrap;
                    }
                    .editor-btn {
                        padding: 0.5rem;
                        background: white;
                        border: 1px solid #ddd;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 1rem;
                        min-width: 32px;
                        transition: all 0.2s;
                    }
                    .editor-btn:hover {
                        background: #e0e0e0;
                    }
                    .editor-btn:active {
                        background: #d0d0d0;
                    }
                    .editor-separator {
                        width: 1px;
                        background: #ccc;
                        margin: 0 0.5rem;
                    }
                    .editor-content {
                        min-height: 200px;
                        max-height: 400px;
                        overflow-y: auto;
                        padding: 1rem;
                        outline: none;
                        font-family: -apple-system, sans-serif;
                        line-height: 1.6;
                    }
                    .editor-content:focus {
                        background: #fafafa;
                    }
                    .editor-content h1 {
                        font-size: 2rem;
                        margin: 1rem 0;
                    }
                    .editor-content h2 {
                        font-size: 1.5rem;
                        margin: 0.75rem 0;
                    }
                    .editor-content h3 {
                        font-size: 1.25rem;
                        margin: 0.5rem 0;
                    }
                    .editor-content ul, .editor-content ol {
                        margin-left: 1.5rem;
                    }
                    .editor-content blockquote {
                        border-left: 4px solid #ddd;
                        margin: 1rem 0;
                        padding-left: 1rem;
                        color: #666;
                    }
                    .editor-content a {
                        color: #3498db;
                        text-decoration: underline;
                    }
                    .editor-content:empty:before {
                        content: "Enter description...";
                        color: #aaa;
                    }
                `;
                document.head.appendChild(style);
            }
            
            // Set initial content
            const editorDiv = document.getElementById('rich-editor-content');
            if (editorDiv && editorContent) {
                editorDiv.innerHTML = editorContent;
            }
            
            // Focus the editor
            if (editorDiv) {
                editorDiv.focus();
            }
        }, 50);
    };
    
    /**
     * Format selected text
     */
    window.formatText = function(command) {
        const editor = document.getElementById('rich-editor-content');
        if (!editor) return;
        
        // Focus the editor first
        editor.focus();
        
        switch(command) {
            case 'bold':
                document.execCommand('bold', false, null);
                break;
            case 'italic':
                document.execCommand('italic', false, null);
                break;
            case 'underline':
                document.execCommand('underline', false, null);
                break;
            case 'strikethrough':
                document.execCommand('strikeThrough', false, null);
                break;
            case 'h1':
                document.execCommand('formatBlock', false, '<h1>');
                break;
            case 'h2':
                document.execCommand('formatBlock', false, '<h2>');
                break;
            case 'h3':
                document.execCommand('formatBlock', false, '<h3>');
                break;
            case 'ul':
                document.execCommand('insertUnorderedList', false, null);
                break;
            case 'ol':
                document.execCommand('insertOrderedList', false, null);
                break;
            case 'blockquote':
                document.execCommand('formatBlock', false, '<blockquote>');
                break;
            case 'link':
                const url = prompt('Enter URL:');
                if (url) {
                    document.execCommand('createLink', false, url);
                }
                break;
            case 'clear':
                document.execCommand('removeFormat', false, null);
                break;
        }
        
        // Update content after formatting
        updateEditorContent();
    };
    
    /**
     * Update editor content and send to server
     */
    window.updateEditorContent = function() {
        const editor = document.getElementById('rich-editor-content');
        if (!editor || !currentComponentId) return;
        
        editorContent = editor.innerHTML;
        
        // Send to server
        if (window.send_event) {
            send_event(currentComponentId, 'UpdateFormField', JSON.stringify({
                field: 'card_desc',
                value: editorContent
            }));
        }
    };
    
    /**
     * Handle paste events to clean up formatting
     */
    window.handlePaste = function(e) {
        e.preventDefault();
        
        let text = '';
        if (e.clipboardData) {
            // Try to get HTML first, then fall back to plain text
            text = e.clipboardData.getData('text/html') || 
                   e.clipboardData.getData('text/plain');
        } else if (window.clipboardData) {
            text = window.clipboardData.getData('Text');
        }
        
        // Insert the content
        if (document.queryCommandSupported('insertHTML')) {
            document.execCommand('insertHTML', false, text);
        } else {
            // Fallback for browsers that don't support insertHTML
            const selection = window.getSelection();
            if (selection.rangeCount) {
                const range = selection.getRangeAt(0);
                range.deleteContents();
                const div = document.createElement('div');
                div.innerHTML = text;
                const frag = document.createDocumentFragment();
                let node, lastNode;
                while ((node = div.firstChild)) {
                    lastNode = frag.appendChild(node);
                }
                range.insertNode(frag);
                if (lastNode) {
                    range = range.cloneRange();
                    range.setStartAfter(lastNode);
                    range.collapse(true);
                    selection.removeAllRanges();
                    selection.addRange(range);
                }
            }
        }
        
        updateEditorContent();
    };
    
    /**
     * Set editor content from external source
     */
    window.setRichEditorContent = function(content) {
        editorContent = content || '';
        const editor = document.getElementById('rich-editor-content');
        if (editor) {
            editor.innerHTML = editorContent;
        }
    };
    
    /**
     * Clear editor content
     */
    window.clearRichEditor = function() {
        editorContent = '';
        const editor = document.getElementById('rich-editor-content');
        if (editor) {
            editor.innerHTML = '';
        }
    };
    
    /**
     * Get plain text from HTML
     */
    window.stripHtml = function(html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    };
    
    console.log('Simple Rich Editor loaded and ready');
})();