import { useSyncExternalStore } from 'react';
import { defaultPermissionStore } from '@iyulab/enterprise';

/** Bridges the plain external permission store into React via useSyncExternalStore. */
export function usePermission(code: string): boolean {
  return useSyncExternalStore(
    defaultPermissionStore.subscribe,
    () => defaultPermissionStore.has(code),
  );
}
