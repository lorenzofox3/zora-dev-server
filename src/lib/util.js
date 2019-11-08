export const memoize = (fn, map = new Map()) => {
    return function memoized(arg) {
        if (map.has(arg)) {
            return map.get(arg);
        }

        map.set(arg, fn(arg));
        return memoized(arg);
    };
};