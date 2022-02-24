/**
 * Util for wrapping object property getter/setter
 *
 * @param parent
 * @param property
 * @returns
 */
export const valueGetSet = (parent, property) => {
    return [
        () => {
            return parent[property];
        },
        (value) => {
            parent[property] = value;
        },
    ];
};
//# sourceMappingURL=valueGetSet.js.map