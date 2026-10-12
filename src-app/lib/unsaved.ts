import { confirmDiscardChanges } from '@iyulab/modern-app';
import { useUnsavedChanges } from '@iyulab/modern-app/react';

/**
 * A form whose unsaved input must not vanish without asking.
 *
 * Registers `dirty` with the shell (`useUnsavedChanges`) — a navigation asks «Discard unsaved changes?», a reload or
 * closing the tab gets the browser's confirmation — and gives the form's own way out the same question:
 * `onHide` for a drawer's cancellable `hide` event (Escape, the close button, the backdrop) and `cancel` for a
 * Cancel button. Clean forms close at once. `close` runs only once the user agreed (or nothing was unsaved).
 *
 * `dirty` should be false while the form is closed — a drawer hidden by setting `open` does not fire `hide`.
 */
export function useDiscardableForm(dirty: boolean, close: () => void) {
  useUnsavedChanges(dirty);
  const cancel = async () => {
    if (!dirty || (await confirmDiscardChanges())) close();
  };
  const onHide = (event: Event) => {
    if (!dirty) {
      close();
      return;
    }
    event.preventDefault();
    void cancel();
  };
  return { onHide, cancel };
}
