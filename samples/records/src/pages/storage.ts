import { LitElement, html, type PropertyValues } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { app } from '@iyulab/modern-app';
import { at } from '../base.js';
import { wip } from '../nav.js';
import { CAPACITY, FLOORS, RECORDS, floorPct, rackName } from '../data.js';

function level(count: number): string {
  if (count > CAPACITY) return 'over';
  if (count === 0) return 'empty';
  if (count < CAPACITY / 2) return 'low';
  if (count < CAPACITY * 0.9) return 'mid';
  return 'high';
}

/**
 * Storage map — pick a rack and sector on the floor plan, work with that sector on the right. The plan itself is a
 * domain picture, so the app draws it (a grid of buttons); everything around it is the libraries'.
 */
@customElement('rc-storage')
export class RcStorage extends LitElement {
  protected override createRenderRoot() { return this; }

  /** Open with this record's location selected (`?find=`). */
  @property({ type: String }) find = '';

  @state() private floor = 'L2';
  @state() private rack = 3;
  @state() private shelf = 2;
  @state() private sector = 3;

  protected override willUpdate(changed: PropertyValues<this>) {
    if (changed.has('find') && this.find) this.locate(this.find);
  }

  /** Record ID → location (`floor-rack-shelf-sector`). Says so when the record isn't on a rack. */
  private locate(query: string) {
    const q = query.trim().toUpperCase();
    if (!q) return;
    const r = RECORDS.find((x) => x.id === q || x.id.endsWith(q));
    const m = r?.location.match(/^([A-Z0-9]+)-(\d{3})-(\d)-(\d)$/);
    if (!r) { app.warning(`${query} — no record with that ID.`); return; }
    if (!m) { app.info(`${r.id} is not on a rack — ${r.location || 'no location yet'}.`); return; }
    this.floor = m[1];
    this.rack = Number(m[2]);
    this.shelf = Number(m[3]);
    this.sector = Number(m[4]);
    app.success(`${r.id} · ${r.title} — ${r.location}`);
  }

  private pickFloor(id: string) {
    this.floor = id;
    this.rack = 1;
    this.shelf = 1;
    this.sector = 1;
  }

  override render() {
    const floor = FLOORS.find((f) => f.id === this.floor) ?? FLOORS[0];
    const rack = floor.racks[Math.min(this.rack, floor.racks.length) - 1];
    const current = rack.cells.find((c) => c.shelf === this.shelf && c.sector === this.sector)!;
    const address = `${floor.id}-${String(rack.no).padStart(3, '0')}-${this.shelf}-${this.sector}`;
    const cells = floor.racks.flatMap((r) => r.cells);
    const records = RECORDS.filter((r) => r.location === address);
    const isCurrent = (no: number, shelf: number, sector: number) => no === rack.no && shelf === this.shelf && sector === this.sector;
    return html`
      <div class="hs-page rc-page">
        <u-page-header title="Storage map">
          <u-breadcrumb slot="eyebrow">
            <u-breadcrumb-item>Storage</u-breadcrumb-item>
            <u-breadcrumb-item>Storage map</u-breadcrumb-item>
          </u-breadcrumb>
          <u-input slot="actions" type="search" aria-label="Locate a record by ID" placeholder="Locate by record ID — Enter"
            @search=${(e: CustomEvent<{ query: string }>) => this.locate(e.detail.query)}>
            <u-icon slot="prefix" lib="lucide" name="search"></u-icon>
          </u-input>
          <u-button slot="actions" color="primary" @click=${() => app.navigate(wip('Add rack'))}>Add rack</u-button>
        </u-page-header>

        <div class="rc-rack-bar">
          <u-radio type="button" appearance="soft" orientation="horizontal" aria-label="Floor" .value=${this.floor}
            @change=${(e: Event) => this.pickFloor(String((e.target as HTMLElement & { value?: string }).value))}>
            ${FLOORS.map((f) => html`<u-option value=${f.id}>${f.label} · ${floorPct(f)}%</u-option>`)}
          </u-radio>
          <ul class="rc-legend" aria-label="Legend">
            <li><span data-level="empty"></span>Empty</li>
            <li><span data-level="low"></span>Under 50%</li>
            <li><span data-level="mid"></span>50–90%</li>
            <li><span data-level="high"></span>90% or more</li>
            <li><span data-level="over"></span>Over capacity</li>
          </ul>
        </div>

        <div class="hs-detail__cols">
          <u-card>
            <div slot="header" class="rc-rack-summary">
              <span>Racks <strong class="hs-num">${floor.racks.length}</strong></span>
              <span>Sectors <strong class="hs-num">${cells.length}</strong></span>
              <span>Empty <strong class="hs-num">${cells.filter((c) => c.count === 0).length}</strong></span>
              <span>Over capacity <strong class="hs-num rc-warn">${cells.filter((c) => c.count > CAPACITY).length}</strong></span>
              <span class="hs-muted rc-rack-hint">Columns = sectors 1–4 · rows = shelves 1–5</span>
            </div>
            <div class="rc-rack-grid">
              ${floor.racks.map((r) => html`
                <section class="rc-rack" ?data-current=${r.no === rack.no} aria-label="${rackName(r.no)}, ${r.pct}% used">
                  <header><span class="hs-num">${rackName(r.no)}</span><span class="hs-num hs-muted">${r.pct}%</span></header>
                  <div class="rc-rack-cells">
                    ${r.cells.map((c) => html`
                      <button type="button" data-level=${level(c.count)}
                        ?data-current=${isCurrent(r.no, c.shelf, c.sector)}
                        aria-pressed=${isCurrent(r.no, c.shelf, c.sector)}
                        aria-label="${rackName(r.no)} shelf ${c.shelf} sector ${c.sector} · ${c.count} of ${CAPACITY}"
                        @click=${() => { this.rack = r.no; this.shelf = c.shelf; this.sector = c.sector; }}></button>`)}
                  </div>
                </section>`)}
            </div>
          </u-card>

          <u-card>
            <div slot="header" class="rc-sector-head">
              <span class="hs-muted">${floor.label} · ${rackName(rack.no)} · shelf ${this.shelf}</span>
              <h2 class="rc-code">${address}</h2>
              <div class="rc-usage-label"><span>Records held</span><span class="hs-num"><strong>${current.count}</strong> / ${CAPACITY}</span></div>
              <u-progress-bar value=${Math.min(100, Math.round((current.count / CAPACITY) * 100))}
                status=${current.count > CAPACITY ? 'warning' : 'default'} aria-label="${address} usage"></u-progress-bar>
            </div>
            <dl class="hs-dl">
              <dt>Last shelved</dt><dd>2026-10-22 10:24 · D. Lee</dd>
              <dt>Barcode</dt><dd class="rc-code">SEC-${address}</dd>
            </dl>
            ${records.length
              ? html`
                  <ul class="rc-sector-records" aria-label="Sample records in this sector">
                    ${records.map((r) => html`<li><a class="hs-id" href=${at(`records?q=${r.id}`)}>${r.id}</a><span>${r.title}</span><span class="hs-muted">${r.category}</span></li>`)}
                  </ul>`
              : html`<p class="hs-muted rc-sector-note">The sample data lists no records for this sector (counts only).</p>`}
            <div slot="footer" class="rc-panel-actions">
              <u-button appearance="outlined" @click=${() => app.success(`Sent SEC-${address} to the print queue (sample — no printer).`)}>Print sector barcode</u-button>
              <u-button appearance="outlined" @click=${() => app.navigate(wip('Bulk relocation'))}>Bulk relocation</u-button>
              <u-button color="primary" ?disabled=${current.count >= CAPACITY} @click=${() => app.navigate(wip('Rack intake'))}>
                ${current.count >= CAPACITY ? 'This sector is full' : 'Shelve into this sector'}
              </u-button>
            </div>
          </u-card>
        </div>
      </div>
    `;
  }
}
