// deno-lint-ignore-file no-explicit-any
import { Deferred, deferred } from "std/async/deferred.ts";

/**
 * Deco labs: 🐁🐁🐁
 *
 * This module is heavily inspired by Google's comlink:
 * https://github.com/GoogleChromeLabs/comlink
 *
 * This script exposes any other file via web worker with an enjoyable
 * functions/promises interface. No more nasty postMessages!
 */

// @ts-expect-error https://stackoverflow.com/questions/7931182/reliably-detect-if-the-script-is-executing-in-a-web-worker
const IS_WORKER = typeof WorkerGlobalScope !== "undefined" &&
  // @ts-expect-error https://stackoverflow.com/questions/7931182/reliably-detect-if-the-script-is-executing-in-a-web-worker
  self instanceof WorkerGlobalScope;

type WorkerEvent = {
  type: "setup";
  payload: string;
} | {
  type: "invoke";
  payload: {
    fn: string;
    args: any[];
    id: string;
  };
};

type MasterEvent = {
  type: "setup:fulfill";
  payload: string[];
} | {
  type: "setup:reject";
  payload: string;
} | {
  type: "invoke:fulfill";
  payload: {
    id: string;
    return: unknown;
  };
} | {
  type: "invoke:reject";
  payload: {
    id: string;
    reason: string;
  };
};

export const createWorker = (
  url: URL,
  options?: WorkerOptions | undefined,
): Promise<any> => {
  const setup = deferred();
  const worker = new Worker(new URL(import.meta.url), options);
  const invokes = new Map<string, Deferred<unknown>>([]);

  worker.postMessage({ type: "setup", payload: url.href });

  worker.addEventListener("message", (event: MessageEvent<MasterEvent>) => {
    const { type, payload } = event.data;

    switch (type) {
      case "setup:fulfill": {
        const mod = payload.reduce((acc, curr) => {
          acc[curr] = (...args: any[]) => {
            const run = deferred<void>();
            const id = crypto.randomUUID();

            invokes.set(id, run);

            worker.postMessage({
              type: "invoke",
              payload: {
                fn: curr,
                args,
                id,
              },
            });

            return run;
          };

          return acc;
        }, {} as Record<string, any>);

        // Use using/Symbol.dispose once Deno accepts TypeScript 5.2
        mod.dispose = () => worker.terminate();

        setup.resolve(mod);

        return;
      }
      case "setup:reject": {
        setup.reject(payload);

        return;
      }
      case "invoke:fulfill": {
        const { id, return: response } = payload;

        invokes.get(id)?.resolve(response);
        invokes.delete(id);

        return;
      }
      case "invoke:reject": {
        const { id, reason } = payload;

        invokes.get(id)?.reject(reason);
        invokes.delete(id);

        return;
      }
    }
  });

  return setup;
};

if (IS_WORKER) {
  let mod: Record<string, any> = {};

  addEventListener("message", async (event: MessageEvent<WorkerEvent>) => {
    const { type, payload } = event.data;

    switch (type) {
      case "invoke": {
        const { fn, args, id } = payload;

        if (typeof mod[fn] !== "function") {
          throw new Error(`function ${fn} not exported by worker`);
        }

        try {
          const response = await mod[fn](...args);

          self.postMessage({
            type: "invoke:fulfill",
            payload: { id, return: response },
          });
        } catch (error) {
          self.postMessage({
            type: "invoke:reject",
            payload: { id, reason: Deno.inspect(error) },
          });
        }

        return;
      }
      case "setup": {
        try {
          mod = await import(payload);

          self.postMessage({
            type: "setup:fulfill",
            payload: Object.keys(mod),
          });
        } catch (error) {
          self.postMessage({
            type: "setup:reject",
            payload: Deno.inspect(error),
          });
        }

        return;
      }
    }
  });
}
