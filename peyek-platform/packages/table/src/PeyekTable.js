/**
 * @rterizz23/peyek-table
 * PeyekTable — Sortable, searchable, paginated data table
 *
 * Usage:
 *   import { PeyekTable } from '@rterizz23/peyek-table';
 *   const table = new PeyekTable('#myDiv', {
 *     columns: [{ key: 'name', label: 'Name' }, { key: 'email', label: 'Email' }],
 *     data: [{ name: 'Alice', email: 'alice@example.com' }],
 *     pageSize: 10,
 *   });
 */
export class PeyekTable {
    #container;
    #columns;
    #data;
    #filtered;
    #sortKey = null;
    #sortDir = 'asc';
    #page = 1;
    #pageSize;
    #searchTerm = '';

    constructor(selector, { columns = [], data = [], pageSize = 10 } = {}) {
        this.#container = typeof selector === 'string' ? document.querySelector(selector) : selector;
        if (!this.#container) throw new Error(`[PeyekTable] Container not found: ${selector}`);
        this.#columns = columns;
        this.#data = [...data];
        this.#filtered = [...data];
        this.#pageSize = pageSize;
        this.#injectStyles();
        this.#render();
    }

    /** Replace data and re-render */
    setData(data) {
        this.#data = [...data];
        this.#search(this.#searchTerm);
    }

    #injectStyles() {
        if (document.getElementById('peyek-table-styles')) return;
        const s = document.createElement('style');
        s.id = 'peyek-table-styles';
        s.textContent = `
            .peyek-table-wrap { font-family: Outfit, sans-serif; color: #f8fafc; }
            .peyek-table-toolbar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; gap: 12px; flex-wrap: wrap; }
            .peyek-table-search {
                padding: 8px 14px; border-radius: 8px;
                background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
                color: #f8fafc; font-size: 14px; outline: none; width: 240px; font-family: inherit;
            }
            .peyek-table-search::placeholder { color: #64748b; }
            .peyek-table-count { color: #64748b; font-size: 13px; }
            table.peyek-table { width: 100%; border-collapse: collapse; font-size: 14px; }
            table.peyek-table th, table.peyek-table td { padding: 12px 16px; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.06); }
            table.peyek-table th { color: #94a3b8; font-weight: 600; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; cursor: pointer; user-select: none; white-space: nowrap; }
            table.peyek-table th:hover { color: #f8fafc; }
            table.peyek-table th .sort-icon { margin-left: 4px; opacity: 0.4; }
            table.peyek-table th.sorted .sort-icon { opacity: 1; color: #6366f1; }
            table.peyek-table tbody tr:hover td { background: rgba(255,255,255,0.02); }
            .peyek-table-pagination { display: flex; gap: 6px; justify-content: center; align-items: center; margin-top: 16px; flex-wrap: wrap; }
            .peyek-table-pagination button {
                padding: 6px 12px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1);
                background: rgba(255,255,255,0.04); color: #f8fafc; cursor: pointer; font-size: 13px;
                transition: all 0.2s; font-family: inherit;
            }
            .peyek-table-pagination button:hover { background: rgba(99,102,241,0.2); border-color: rgba(99,102,241,0.4); }
            .peyek-table-pagination button.active { background: #6366f1; border-color: #6366f1; }
            .peyek-table-pagination button:disabled { opacity: 0.3; cursor: not-allowed; }
            .peyek-table-empty { padding: 40px; text-align: center; color: #64748b; }
        `;
        document.head.appendChild(s);
    }

    #search(term) {
        this.#searchTerm = term;
        this.#filtered = this.#data.filter((row) =>
            this.#columns.some((col) =>
                String(row[col.key] ?? '').toLowerCase().includes(term.toLowerCase())
            )
        );
        this.#page = 1;
        this.#render();
    }

    #sort(key) {
        if (this.#sortKey === key) {
            this.#sortDir = this.#sortDir === 'asc' ? 'desc' : 'asc';
        } else {
            this.#sortKey = key;
            this.#sortDir = 'asc';
        }
        this.#filtered.sort((a, b) => {
            const av = a[key] ?? '', bv = b[key] ?? '';
            return this.#sortDir === 'asc'
                ? String(av).localeCompare(String(bv), undefined, { numeric: true })
                : String(bv).localeCompare(String(av), undefined, { numeric: true });
        });
        this.#render();
    }

    #render() {
        const total = this.#filtered.length;
        const totalPages = Math.max(1, Math.ceil(total / this.#pageSize));
        this.#page = Math.min(this.#page, totalPages);
        const start = (this.#page - 1) * this.#pageSize;
        const rows = this.#filtered.slice(start, start + this.#pageSize);

        this.#container.innerHTML = `
        <div class="peyek-table-wrap">
            <div class="peyek-table-toolbar">
                <input class="peyek-table-search" placeholder="Search..." value="${this.#searchTerm}" />
                <span class="peyek-table-count">${total} row${total !== 1 ? 's' : ''}</span>
            </div>
            <table class="peyek-table">
                <thead><tr>${this.#columns.map((col) => `
                    <th class="${this.#sortKey === col.key ? 'sorted' : ''}" data-key="${col.key}">
                        ${col.label} <span class="sort-icon">${this.#sortKey === col.key ? (this.#sortDir === 'asc' ? '↑' : '↓') : '↕'}</span>
                    </th>
                `).join('')}</tr></thead>
                <tbody>${rows.length ? rows.map((row) => `<tr>${this.#columns.map((col) => `<td>${row[col.key] ?? ''}</td>`).join('')}</tr>`).join('') : `<tr><td colspan="${this.#columns.length}" class="peyek-table-empty">No data found.</td></tr>`}</tbody>
            </table>
            <div class="peyek-table-pagination">
                <button data-pg="prev" ${this.#page <= 1 ? 'disabled' : ''}>‹ Prev</button>
                ${Array.from({ length: totalPages }, (_, i) => `<button data-pg="${i + 1}" class="${this.#page === i + 1 ? 'active' : ''}">${i + 1}</button>`).join('')}
                <button data-pg="next" ${this.#page >= totalPages ? 'disabled' : ''}>Next ›</button>
            </div>
        </div>`;

        // Events
        this.#container.querySelector('.peyek-table-search').addEventListener('input', (e) => this.#search(e.target.value));
        this.#container.querySelectorAll('th[data-key]').forEach((th) => th.addEventListener('click', () => this.#sort(th.dataset.key)));
        this.#container.querySelectorAll('[data-pg]').forEach((btn) => {
            btn.addEventListener('click', () => {
                const pg = btn.dataset.pg;
                if (pg === 'prev') this.#page--;
                else if (pg === 'next') this.#page++;
                else this.#page = +pg;
                this.#render();
            });
        });
    }
}
