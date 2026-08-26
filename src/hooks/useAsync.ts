"use client";

import { useEffect, useState, useCallback, useRef, type DependencyList } from "react";

export interface UseAsyncOptions<T> {
  /**
   * Whether to execute the async function immediately on mount / dependency change.
   * Default: true
   */
  immediate?: boolean;
  /**
   * Initial data value before the async function completes.
   */
  initialData?: T;
  /**
   * Optional callback when the async operation succeeds.
   */
  onSuccess?: (data: T) => void;
  /**
   * Optional callback when the async operation fails.
   */
  onError?: (error: Error) => void;
}

export interface UseAsyncReturn<T, Args extends unknown[] = unknown[]> {
  data: T | undefined;
  loading: boolean;
  error: Error | null;
  execute: (...args: Args) => Promise<T | undefined>;
  setData: React.Dispatch<React.SetStateAction<T | undefined>>;
  reset: () => void;
}

/**
 * Hook to run an async operation when the page / component loads on the client side.
 * Tracks `data`, `loading`, and `error` states, and provides an `execute` function for manual triggers.
 *
 * @example
 * ```tsx
 * const { data: events, loading, error, execute: reloadEvents } = useAsync(async () => {
 *   return await getEvents();
 * }, []);
 * ```
 */
export function useAsync<T, Args extends unknown[] = unknown[]>(
  asyncFunction: (...args: Args) => Promise<T>,
  deps: DependencyList = [],
  options: UseAsyncOptions<T> = {}
): UseAsyncReturn<T, Args> {
  const { immediate = true, initialData, onSuccess, onError } = options;

  const [data, setData] = useState<T | undefined>(initialData);
  const [loading, setLoading] = useState<boolean>(immediate);
  const [error, setError] = useState<Error | null>(null);

  const asyncFunctionRef = useRef(asyncFunction);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    asyncFunctionRef.current = asyncFunction;
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const execute = useCallback(
    async (...args: Args): Promise<T | undefined> => {
      // Abort previous in-flight request if any
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const controller = new AbortController();
      abortControllerRef.current = controller;

      setLoading(true);
      setError(null);

      try {
        const result = await asyncFunctionRef.current(...args);
        if (!controller.signal.aborted) {
          setData(result);
          setLoading(false);
          onSuccessRef.current?.(result);
          return result;
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          const formattedError = err instanceof Error ? err : new Error(String(err));
          setError(formattedError);
          setLoading(false);
          onErrorRef.current?.(formattedError);
        }
      }
      return undefined;
    },
    []
  );

  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setData(initialData);
    setLoading(false);
    setError(null);
  }, [initialData]);

  useEffect(() => {
    if (!immediate) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    let isSubscribed = true;

    const run = async () => {
      try {
        const result = await asyncFunctionRef.current(...([] as unknown as Args));
        if (isSubscribed && !controller.signal.aborted) {
          setData(result);
          setLoading(false);
          onSuccessRef.current?.(result);
        }
      } catch (err) {
        if (isSubscribed && !controller.signal.aborted) {
          const formattedError = err instanceof Error ? err : new Error(String(err));
          setError(formattedError);
          setLoading(false);
          onErrorRef.current?.(formattedError);
        }
      }
    };

    run();

    return () => {
      isSubscribed = false;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return {
    data,
    loading,
    error,
    execute,
    setData,
    reset,
  };
}

/**
 * Async version of `useEffect` for client-side execution.
 * Provides `isMounted` callback and `AbortSignal` for safe async handling and cleanup.
 *
 * @example
 * ```tsx
 * useAsyncEffect(async (isMounted, signal) => {
 *   const result = await fetchEvents({ signal });
 *   if (isMounted()) {
 *     setEvents(result);
 *   }
 * }, []);
 * ```
 */
export function useAsyncEffect(
  effect: (isMounted: () => boolean, signal: AbortSignal) => Promise<void | (() => void)>,
  deps: DependencyList = []
): void {
  const effectRef = useRef(effect);

  useEffect(() => {
    effectRef.current = effect;
  });

  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();
    let cleanupFn: (() => void) | void;

    const runEffect = async () => {
      try {
        const cleanup = await effectRef.current(() => mounted, controller.signal);
        if (mounted && typeof cleanup === "function") {
          cleanupFn = cleanup;
        }
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error("useAsyncEffect error:", err);
        }
      }
    };

    runEffect();

    return () => {
      mounted = false;
      controller.abort();
      if (typeof cleanupFn === "function") {
        cleanupFn();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/**
 * Shortcut hook to run an async function once when the component mounts on the client side.
 *
 * @example
 * ```tsx
 * useMountAsync(async (isMounted) => {
 *   const data = await loadInitialData();
 *   if (isMounted()) {
 *     // update state
 *   }
 * });
 * ```
 */
export function useMountAsync(
  asyncCallback: (isMounted: () => boolean, signal: AbortSignal) => Promise<void | (() => void)>
): void {
  useAsyncEffect(asyncCallback, []);
}

export default useAsync;
