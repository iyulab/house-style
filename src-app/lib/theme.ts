import { Theme } from '@iyulab/components/dist/utilities/Theme.js';

/**
 * The reference app renders outside `@iyulab/modern-app`'s `app.load()` (which normally owns
 * `Theme.init()`), so it boots the token system itself — same sequencing the existing guide
 * uses: `Theme.init()` first (appends the base token sheet to `<head>`), then the house preset
 * import deferred until after that resolves (both declare `:root` at equal specificity; the
 * later one in DOM order wins the cascade).
 */
export async function bootTheme(): Promise<void> {
  await Theme.init({
    default: 'light',
    store: {
      type: 'cookie',
      prefix: 'house-style-',
      expires: Date.now() + 30 * 24 * 60 * 60 * 1000,
    },
  });
  await import('@iyulab/enterprise/styles/preset.css');
}
