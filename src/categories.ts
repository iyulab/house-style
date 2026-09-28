/**
 * The guide's categories and the three tiers they are read in — one list that drives the routes,
 * the sidebar and the landing page's map, so none of the three can name a page the others lack.
 *
 * Tiers follow the order design-system documentation is usually read in: the foundations every
 * screen draws on, the patterns built from them, then whole screens.
 */
export const TIERS = ['Foundations', 'Patterns', 'Screens'] as const;
export type Tier = (typeof TIERS)[number];

export interface Category {
  path: string;
  tier: Tier;
  label: string;
  icon: string;
  /** One line for the landing page — what a reader comes to this page for. */
  summary: string;
}

export const CATEGORIES: readonly Category[] = [
  { path: 'identity', tier: 'Foundations', label: 'Visual identity & tokens', icon: 'identity', summary: 'Colour, type, spacing and radius — the tokens every screen reads, and which colour means what.' },
  { path: 'layout', tier: 'Foundations', label: 'Layout & viewport', icon: 'layout', summary: 'The app shell, content width and breakpoints.' },
  { path: 'voice-a11y', tier: 'Foundations', label: 'Voice, tone & accessibility', icon: 'message', summary: 'How labels, messages and errors are worded, and the accessibility floor.' },
  { path: 'deployment', tier: 'Foundations', label: 'Deployment & network', icon: 'code', summary: 'What the packages load from outside your origin, and how to keep it inside a closed network.' },
  { path: 'depth', tier: 'Patterns', label: 'Component depth', icon: 'layers', summary: 'Buttons, fields and the rest — which variant for which job.' },
  { path: 'data-patterns', tier: 'Patterns', label: 'Data patterns', icon: 'table', summary: 'Lists, search, master›detail, empty states — each with its source to copy.' },
  { path: 'feedback', tier: 'Patterns', label: 'Feedback & motion', icon: 'pulse', summary: 'Toasts, confirmations, progress and motion.' },
  { path: 'flows', tier: 'Screens', label: 'User flows', icon: 'flow', summary: 'Sign-in, wizards and cancellation, walked end to end.' },
];
