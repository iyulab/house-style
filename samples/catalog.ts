/**
 * The sample apps — each one a complete line-of-business app of a different kind, built only from the
 * @iyulab libraries and this house style, with made-up data. Other apps read them for how a screen of
 * that kind is laid out.
 *
 * Adding a sample: put it in `samples/<slug>/` with its own `index.html` (the script it loads lives under
 * `samples/<slug>/src/`) and add an entry here. That is the only list — the build takes each entry as an
 * HTML input, the dev server and the deployed 404 page send its deep links to its `index.html`, the guide
 * links it, and the accessibility check visits it.
 *
 * The sample sets its router `basepath` to `${import.meta.env.BASE_URL}samples/<slug>/` and writes its
 * links through that base, since the guide is served under a subpath.
 */
export interface Sample {
  /** Directory name under `samples/` — also the URL segment. */
  slug: string;
  title: string;
  /** One line for the guide's list: what kind of app it is and what to look at. */
  summary: string;
}

export const SAMPLES: Sample[] = [
  {
    slug: 'records',
    title: 'Records Center',
    summary:
      'Physical records custody — a work queue home with KPI tiles, a filtered list whose criteria live in the address, a pick-and-request flow, and a storage map.',
  },
];
