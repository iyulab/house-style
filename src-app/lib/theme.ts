import { Theme } from '@iyulab/components/dist/utilities/Theme.js';
import '@iyulab/enterprise/styles/preset.css';

/**
 * The reference app renders outside `@iyulab/modern-app`'s `app.load()` (which normally owns
 * `Theme.init()`), so it boots the token system itself.
 *
 * The house preset is a plain static import, the way its own header documents it. That used to
 * be impossible here: `Theme.init()` appended the base token sheet at the end of `<head>`, so a
 * statically imported sheet — which the bundler puts in earlier — lost the cascade to it at equal
 * specificity, and the house values silently never applied. Since @iyulab/components 1.44.0 the
 * base sheet is inserted ahead of the document's other styles, which is where a layer named
 * "defaults" belongs, so the documented usage works and the deferred import that worked around
 * it is gone.
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
}
