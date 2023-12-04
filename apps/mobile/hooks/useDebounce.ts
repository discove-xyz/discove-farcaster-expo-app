import { useEffect, useState } from "react";

function deepEqual(obj1: unknown, obj2: unknown) {
  if (obj1 === obj2) {
    return true;
  } else if (isObject(obj1) && isObject(obj2)) {
    if (Object.keys(obj1).length !== Object.keys(obj2).length) {
      return false;
    }
    for (var prop in obj1) {
      if (!deepEqual((obj1 as any)[prop], (obj2 as any)[prop])) {
        return false;
      }
    }
    return true;
  }

  // Private
  function isObject(obj: unknown): obj is object {
    if (typeof obj === "object" && obj != null) {
      return true;
    } else {
      return false;
    }
  }
}

export function useDebounce<T>(value: T, delay?: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      // without deepequal it will rerender loop
      if (!deepEqual(debouncedValue, value)) setDebouncedValue(value);
    }, delay || 500);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay, debouncedValue]);

  return debouncedValue;
}
