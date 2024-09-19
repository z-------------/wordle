import { useEffect, useState } from "react";

export default function useLocalStorage(key: string): [string | null, (newValue: string) => void] {
  const [value, setValue] = useState(null as string | null);

  useEffect(() => {
    setValue(localStorage.getItem(key));
  }, []);

  return [
    value,
    (newValue: string) => {
      setValue(newValue);
      localStorage.setItem(key, newValue);
    },
  ]
}
