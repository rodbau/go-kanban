package main

import (
	"time"
	"fmt"
	"html/template"
	"strings"
	"regexp"
	"encoding/json"
)

// GetCardsForColumn returns all cards that belong to a specific column
func (k *SimpleKanbanModal) GetCardsForColumn(columnID string) []KanbanCard {
	var cards []KanbanCard
	for _, card := range k.Cards {
		if card.ColumnID == columnID {
			cards = append(cards, card)
		}
	}
	return cards
}

// GetCardCount returns the number of cards in a specific column
func (k *SimpleKanbanModal) GetCardCount(columnID string) int {
	count := 0
	for _, card := range k.Cards {
		if card.ColumnID == columnID {
			count++
		}
	}
	return count
}

// GetColumnPoints calculates and returns the total story points for all cards in a column
func (k *SimpleKanbanModal) GetColumnPoints(columnID string) int {
	total := 0
	for _, card := range k.Cards {
		if card.ColumnID == columnID {
			total += card.Points
		}
	}
	return total
}

// GetOrderedColumns returns a sorted copy of columns based on their Order field
func (k *SimpleKanbanModal) GetOrderedColumns() []KanbanColumn {
	columns := make([]KanbanColumn, len(k.Columns))
	copy(columns, k.Columns)
	
	for i := 0; i < len(columns)-1; i++ {
		for j := 0; j < len(columns)-i-1; j++ {
			if columns[j].Order > columns[j+1].Order {
				columns[j], columns[j+1] = columns[j+1], columns[j]
			}
		}
	}
	return columns
}

// IsOverdue checks if a due date has passed
func (k *SimpleKanbanModal) IsOverdue(dueDate *time.Time) bool {
	if dueDate == nil {
		return false
	}
	return dueDate.Before(time.Now())
}

// FormatFileSize formats bytes to human readable format
func (k *SimpleKanbanModal) FormatFileSize(size int64) string {
	const unit = 1024
	if size < unit {
		return fmt.Sprintf("%d B", size)
	}
	div, exp := int64(unit), 0
	for n := size / unit; n >= unit; n /= unit {
		div *= unit
		exp++
	}
	return fmt.Sprintf("%.1f %cB", float64(size)/float64(div), "KMGTPE"[exp])
}

// CountCheckedItems counts the number of checked items in a checklist
func (k *SimpleKanbanModal) CountCheckedItems(checklist []ChecklistItem) int {
	count := 0
	for _, item := range checklist {
		if item.Checked {
			count++
		}
	}
	return count
}

// GetCardDescriptionHTML returns the HTML-safe description for display
// It converts the rich text HTML to a safe template.HTML type
func (k *SimpleKanbanModal) GetCardDescriptionHTML(description string) template.HTML {
	// For card display, we want to strip HTML tags for the preview
	// This creates a plain text preview of the rich content
	return template.HTML(StripHTMLTags(description))
}

// GetCardDescriptionPreview returns a plain text preview of the description
// Limited to a certain number of characters
func (k *SimpleKanbanModal) GetCardDescriptionPreview(description string, maxLength int) string {
	plainText := StripHTMLTags(description)
	if len(plainText) > maxLength {
		return plainText[:maxLength] + "..."
	}
	return plainText
}

// StripHTMLTags removes HTML tags from a string
func StripHTMLTags(html string) string {
	// Remove script elements completely
	re := regexp.MustCompile(`(?i)<script[^>]*>.*?</script>`)
	html = re.ReplaceAllString(html, "")
	
	// Remove style elements completely
	re = regexp.MustCompile(`(?i)<style[^>]*>.*?</style>`)
	html = re.ReplaceAllString(html, "")
	
	// Remove all HTML tags
	re = regexp.MustCompile(`<[^>]+>`)
	html = re.ReplaceAllString(html, " ")
	
	// Replace multiple spaces with single space
	re = regexp.MustCompile(`\s+`)
	html = re.ReplaceAllString(html, " ")
	
	// Trim whitespace
	return strings.TrimSpace(html)
}

// GetRichHTML returns the full HTML content for rich display (in modals)
// This preserves the HTML formatting from the RichEditor
func (k *SimpleKanbanModal) GetRichHTML(content string) template.HTML {
	// Return the HTML as-is for rich display in the modal
	// The RichEditor already sanitizes the content
	return template.HTML(content)
}

// escapeJSString escapes a string for safe use in JavaScript
func escapeJSString(s string) string {
	// Use JSON encoding which handles all escaping properly
	b, _ := json.Marshal(s)
	// Remove the quotes that json.Marshal adds
	result := string(b)
	if len(result) >= 2 {
		result = result[1:len(result)-1]
	}
	return result
}