export const valueGetSet = <T>(parent: any, property: string): ValueGetSet<T> => {
  return [
    (): T | undefined => {
      return parent[property];
    },
    (value: T): void => {
      parent[property] = value;
    },
  ];
};

export type ValueGetSet<T> = [() => T | undefined, (value: T) => void];
