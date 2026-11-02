import { useEffect, useRef, DependencyList } from 'react';

/**
 * @name useDidUpdate
 * @description - Hook that runs an effect only on updates, not on initial mount
 * @param effect - The effect function to run
 * @param deps - The dependency array
 */
export const useDidUpdate = (
  effect: () => void | (() => void),
  deps?: DependencyList,
) => {
  const isMountedRef = useRef(false);

  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return;
    }

    return effect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
};
