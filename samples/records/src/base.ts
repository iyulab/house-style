/** Where this sample is served — the guide lives under a subpath, so every link goes through here. */
export const BASE = `${import.meta.env.BASE_URL}samples/records/`;

/** An app path (`records?status=Overdue`, `/storage`) as an address under {@link BASE}. */
export const at = (path = '') => BASE + path.replace(/^\//, '');
