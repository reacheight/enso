import { useCallback, useEffect, useState } from '../lib/teact/teact';

import type { Workspace } from '../types';

export function useStorage() {
  const [savedWorkspaces, setSavedWorkspaces] = useLocalStorage<Workspace[]>({
    key: "workspaces",
    initValue: [],
  });
  const [
    currentWorkspaceId,
    setCurrentWorkspaceId,
  ] = useLocalStorage<string>({
    key: "currentWorkspaceId",
    initValue: "0",
  });

  return {
    savedWorkspaces,
    setSavedWorkspaces,
    currentWorkspaceId,
    setCurrentWorkspaceId,
  };
}

type UseLocalStorageProps<T> = {
  key: string;
  initValue: T;
};

export function useLocalStorage<T>({ key, initValue }: UseLocalStorageProps<T>):
[value: T, setValue: (val: T) => void] {
  const eventName = `update_storage_${key}`;

  const getStoredValue: () => (T | undefined) = useCallback(() => {
    const value = localStorage.getItem(key);
    if (value !== null) {
      try {
        return JSON.parse(value);
      } catch (e) {
        console.error((e as Error).message);
      }
    }
    return undefined;
  }, [key]);

  const writeValue: (value: T) => void = useCallback((value) => {
    const stringifiedValue = JSON.stringify(value);
    if (localStorage.getItem(key) !== stringifiedValue) {
      localStorage.setItem(key, stringifiedValue);
      window.dispatchEvent(new Event(eventName));
    }
  }, [eventName, key]);

  const restoreValue: () => T = useCallback(() => {
    const storedValue = getStoredValue();
    if (storedValue !== undefined) {
      return storedValue;
    } else {
      writeValue(initValue);
      return initValue;
    }
  }, [getStoredValue, writeValue, initValue]);

  const [state, setState] = useState<T>(restoreValue());

  useEffect(() => {
    const listenStorageChange = () => {
      setState(restoreValue());
    };
    window.addEventListener(eventName, listenStorageChange);
    return () => window.removeEventListener(eventName, listenStorageChange);
  }, [eventName, restoreValue]);

  const setStateSafe = (value: T) => {
    try {
      writeValue(value);
    } catch (e) {
      console.error((e as Error).message);
    }
  };

  return [state, setStateSafe];
}
