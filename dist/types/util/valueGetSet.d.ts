/**
 * Util for wrapping object property getter/setter
 *
 * @param parent
 * @param property
 * @returns
 */
export declare const valueGetSet: <T>(parent: any, property: string) => ValueGetSet<T>;
export declare type ValueGetSet<T> = [() => T | undefined, (value: T) => void];
