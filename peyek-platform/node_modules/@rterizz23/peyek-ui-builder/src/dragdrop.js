/**
 * Drag and Drop Manager for P.E.Y.E.K Builder
 */
export class DragDropManager {
    constructor(builder) {
        this.builder = builder;
        this.draggedType = null;
    }

    initDraggable(element, type) {
        element.setAttribute('draggable', 'true');
        element.addEventListener('dragstart', (e) => this.handleDragStart(e, type));
        element.addEventListener('dragend', (e) => this.handleDragEnd(e));
    }

    initDropzone(element) {
        element.addEventListener('dragover', (e) => this.handleDragOver(e));
        element.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        element.addEventListener('drop', (e) => this.handleDrop(e));
    }

    handleDragStart(e, type) {
        this.draggedType = type;
        e.dataTransfer.effectAllowed = 'copy';
        e.target.style.opacity = '0.5';
    }

    handleDragEnd(e) {
        e.target.style.opacity = '1';
        this.draggedType = null;
    }

    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        if (e.target.classList.contains('peyek-dropzone') || e.target.closest('.peyek-dropzone')) {
            const dropzone = e.target.classList.contains('peyek-dropzone') ? e.target : e.target.closest('.peyek-dropzone');
            dropzone.classList.add('peyek-drag-over');
        }
    }

    handleDragLeave(e) {
        if (e.target.classList.contains('peyek-dropzone')) {
            e.target.classList.remove('peyek-drag-over');
        }
    }

    handleDrop(e) {
        e.preventDefault();

        let dropzone = e.target;
        if (!dropzone.classList.contains('peyek-dropzone')) {
            dropzone = dropzone.closest('.peyek-dropzone');
        }

        if (dropzone) {
            dropzone.classList.remove('peyek-drag-over');
            if (this.draggedType) {
                this.builder.addComponent(this.draggedType, dropzone);
            }
        }
    }
}
