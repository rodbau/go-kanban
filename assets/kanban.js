let openTab = (evt, tabId) => {
  const contents = document.querySelectorAll(".tab-content");
  contents.forEach((c) => c.classList.remove("active"));

  const buttons = document.querySelectorAll(".tab-button");
  buttons.forEach((b) => b.classList.remove("active"));

  document.getElementById(tabId).classList.add("active");
  evt.currentTarget.classList.add("active");
  
  // Initialize RichEditor if we're switching to the Description tab
  if (tabId === 'tab2' && window.initRichEditor) {
    // Get the component ID from the modal
    const modal = document.querySelector('.modal-container');
    if (modal) {
      const componentId = modal.getAttribute('data-component-id') || 'kanban_board';
      setTimeout(() => initRichEditor(componentId), 50);
    }
  }
};

function initializeColumnDragDrop() {
  const container = document.getElementById("columns-container");
  if (!container) {
    console.log("[DRAG] No columns-container found, retrying...");
    // Retry after a short delay
    setTimeout(arguments.callee, 100);
    return;
  }

  // Get component ID from a data attribute
  const componentId =
    container.getAttribute("data-component-id") || "kanban_board";

  // Use global state to maintain drag information
  window.__columnDragState = {
    draggedColumn: null,
    draggedIndex: -1,
  };

  console.log(
    "[DRAG] Re-initializing column drag & drop with component ID:",
    componentId
  );

  // Remove all existing event listeners by cloning the container
  const newContainer = container.cloneNode(true);
  container.parentNode.replaceChild(newContainer, container);
  const freshContainer = document.getElementById("columns-container");

  // Add event listeners to column headers
  function initColumnDragDrop() {
    const headers = freshContainer.querySelectorAll(
      '.column-header[draggable="true"]'
    );
    console.log("[DRAG] Found", headers.length, "draggable column headers");

    if (headers.length === 0) {
      console.log("[DRAG] No headers found yet, retrying...");
      setTimeout(initColumnDragDrop, 100);
      return;
    }

    headers.forEach((header) => {
      // Get the parent column element
      const column = header.parentElement;

      header.addEventListener("dragstart", function (e) {
        const columnIndex = parseInt(column.dataset.columnIndex);
        console.log("[DRAG] Drag started on column", columnIndex);
        window.__columnDragState.draggedColumn = column;
        window.__columnDragState.draggedIndex = columnIndex;
        column.classList.add("dragging");
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", columnIndex.toString());

        // Stop propagation to prevent card dragging
        e.stopPropagation();
      });

      header.addEventListener("dragend", function (e) {
        console.log("[DRAG] Drag ended");
        if (column) column.classList.remove("dragging");
        // Remove drag over effects from all columns
        freshContainer.querySelectorAll(".column").forEach((col) => {
          col.classList.remove("drag-over-column");
        });
        // Reset drag state
        window.__columnDragState.draggedColumn = null;
        window.__columnDragState.draggedIndex = -1;
      });
    });

    // Add dragover and drop events to all columns (not just headers)
    const columns = freshContainer.querySelectorAll(".column");
    columns.forEach((column) => {
      column.addEventListener("dragover", function (e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        if (this !== window.__columnDragState.draggedColumn) {
          // Remove from all others first
          columns.forEach((col) => {
            if (col !== this) col.classList.remove("drag-over-column");
          });
          this.classList.add("drag-over-column");
        }
      });

      column.addEventListener("dragleave", function (e) {
        // Only remove if we're actually leaving the column
        if (!this.contains(e.relatedTarget)) {
          this.classList.remove("drag-over-column");
        }
      });

      column.addEventListener("drop", function (e) {
        e.preventDefault();
        e.stopPropagation();
        this.classList.remove("drag-over-column");

        const draggedColumn = window.__columnDragState.draggedColumn;
        const draggedIndex = window.__columnDragState.draggedIndex;

        if (this !== draggedColumn && draggedColumn) {
          const targetIndex = parseInt(this.dataset.columnIndex);
          console.log(
            "[DRAG] Dropping column",
            draggedIndex,
            "on",
            targetIndex
          );

          // Send reorder event
          console.log(
            "[DRAG] Sending reorder event to component:",
            componentId
          );
          if (typeof send_event === "function") {
            send_event(
              componentId,
              "ReorderColumns",
              JSON.stringify({
                sourceIndex: draggedIndex,
                targetIndex: targetIndex,
              })
            );

            // Important: Re-initialize after a short delay to handle DOM updates
            console.log("[DRAG] Scheduling re-initialization after reorder...");
            // Don't call initColumnDragDrop here as it will be called by the server after update
          } else {
            console.error("[DRAG] send_event function not found!");
          }
        }

        // Reset drag state
        window.__columnDragState.draggedColumn = null;
        window.__columnDragState.draggedIndex = -1;
      });
    });

    console.log("[DRAG] Event listeners attached successfully");
  }

  // Initialize with a small delay
  initColumnDragDrop();

  console.log("[DRAG] Column drag & drop initialization complete");
}


// Detectar cuando paso por elementos con clase column-header
document.querySelectorAll('.column-header').forEach(el => {
  el.addEventListener('mouseenter', () => initializeColumnDragDrop(el));
});