// The part of an OData query the reference app's lists send — what a real server answers, so the list screen runs the
// same server-paged path a production app does (`createODataSource`): `$filter` (`Key eq 'value'` joined by `and`),
// `$search` (quoted terms, all must match), `$orderby` (`Key asc|desc`, comma-separated), `$count`, `$top`/`$skip`.
// Without parameters it answers the whole set, as before.

type Row = Record<string, unknown>;

export function queryRows<T extends object>(source: T[], url: URL, searchKeys: (keyof T & string)[]): { value: T[]; '@odata.count'?: number } {
  const q = url.searchParams;
  const rows = source as unknown as Row[];
  let out = rows;

  const filter = q.get('$filter');
  if (filter) {
    const clauses = [...filter.matchAll(/(\w+)\s+eq\s+'([^']*)'/g)].map((m) => [m[1], m[2]] as const);
    out = out.filter((row) => clauses.every(([key, value]) => String(row[key]) === value));
  }

  const search = q.get('$search');
  if (search) {
    const terms = [...search.matchAll(/"([^"]*)"/g)].map((m) => m[1].toLowerCase()).filter(Boolean);
    out = out.filter((row) => terms.every((t) => searchKeys.some((k) => String(row[k] ?? '').toLowerCase().includes(t))));
  }

  const orderBy = q.get('$orderby');
  if (orderBy) {
    const criteria = orderBy.split(',').map((s) => s.trim().split(/\s+/)).map(([key, dir]) => ({ key, desc: dir === 'desc' }));
    out = [...out].sort((a, b) => {
      for (const { key, desc } of criteria) {
        const [x, y] = [a[key], b[key]];
        const c = typeof x === 'number' && typeof y === 'number' ? x - y : String(x).localeCompare(String(y));
        if (c !== 0) return desc ? -c : c;
      }
      return 0;
    });
  }

  const count = out.length;
  const skip = Number(q.get('$skip') ?? 0);
  const top = q.get('$top');
  const page = top === null ? out.slice(skip) : out.slice(skip, skip + Number(top));
  const value = page as unknown as T[];
  return q.get('$count') === 'true' ? { value, '@odata.count': count } : { value };
}
