import { Deferred, deferred } from "std/async/deferred.ts";

export const createPool = <T>(resources: T[]) => {
  const taken = new Set<number>();
  const free = new Set<number>(resources.map((_, i) => i));

  const waiting: Deferred<T>[] = [];

  return {
    acquire: () => {
      if (free.size === 0) {
        const p = deferred<T>();
        waiting.push(p);

        return p;
      }

      const index = free.values().next().value;

      taken.add(index);
      free.delete(index);

      return resources[index];
    },

    release: (resource: T) => {
      const index = resources.findIndex((r) => r === resource);

      if (index < 0) return false;

      if (waiting.length > 0) {
        const [p] = waiting.splice(0, 1);

        p.resolve(resource);

        return true;
      }

      free.add(index);
      taken.delete(index);

      return true;
    },
  };
};
