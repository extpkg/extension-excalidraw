import { useState, useEffect, type Dispatch, type SetStateAction } from "react";

const useLocalStorageState = <S>(
  key: string,
  initialState: S | (() => S),
): [S, Dispatch<SetStateAction<S>>] => {
  const [state, setState] = useState<S>(() => {
    const storedValue = localStorage.getItem(key);
    return storedValue !== null ? JSON.parse(storedValue) : initialState;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState];
};

export default useLocalStorageState;
