"use client";

import { useEffect, useRef, useState } from "react";

type ResourceState<T> = {
  key: string;
  data: T | null;
  loading: boolean;
  error: string | null;
};

export function useOsResource<T>(resourceKey: string, loader: () => Promise<T>) {
  const loaderRef = useRef(loader);
  const [state, setState] = useState<ResourceState<T>>({
    key: resourceKey,
    data: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    loaderRef.current = loader;
  }, [loader]);

  useEffect(() => {
    let cancelled = false;

    loaderRef.current()
      .then((data) => {
        if (cancelled) {
          return;
        }

        setState({
          key: resourceKey,
          data,
          loading: false,
          error: null
        });
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return;
        }

        setState({
          key: resourceKey,
          data: null,
          loading: false,
          error: error instanceof Error ? error.message : "Unable to load content."
        });
      });

    return () => {
      cancelled = true;
    };
  }, [resourceKey]);

  const isCurrent = state.key === resourceKey;

  return {
    data: isCurrent ? state.data : null,
    loading: isCurrent ? state.loading : true,
    error: isCurrent ? state.error : null
  };
}
