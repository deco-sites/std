import { parseMediaType } from "std/media_types/parse_media_type.ts";
import { HttpError } from "../../../../utils/HttpError.ts";
import { createPool } from "../../../../utils/pool.ts";
import { createWorker } from "../../../../utils/worker.ts";
import type { Engine } from "../../engine.ts";

const SKIP = "??" as const;

const SIGNATURES = {
  "image/png": [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]],
  "image/jpeg": [
    [0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01],
    [0xFF, 0xD8, 0xFF, 0xEE],
    [0xFF, 0xD8, 0xFF, 0xE1, SKIP, SKIP, 0x45, 0x78, 0x69, 0x66, 0x00, 0x00],
    [0xFF, 0xD8, 0xFF, 0xE0],
    [0x00, 0x00, 0x00, 0x0C, 0x6A, 0x50, 0x20, 0x20, 0x0D, 0x0A, 0x87, 0x0A],
    [0xFF, 0x4F, 0xFF, 0x51],
  ],
  "image/webp": [
    [0x52, 0x49, 0x46, 0x46, SKIP, SKIP, SKIP, SKIP, 0x57, 0x45, 0x42, 0x50],
  ],
};

const matches = (buffer: Uint8Array, sequence: Array<number | "??">) => {
  for (let it = 0; it < sequence.length; it++) {
    const i1 = sequence[it];
    const i2 = buffer.at(it);

    if (i1 === SKIP) continue;

    if (i1 != i2) return false;
  }

  return true;
};

const mediaTypeFromFile = (data: Uint8Array) => {
  for (const [format, sigs] of Object.entries(SIGNATURES)) {
    for (const sig of sigs) {
      if (matches(data, sig)) return format;
    }
  }
};

const mediaTypeFromHeader = (headers: Headers) => {
  const contentType = headers.get("Content-Type");
  if (!contentType) return;

  const mediaType = parseMediaType(contentType)[0];
  if (!mediaType.startsWith("image/")) return;

  return mediaType;
};

const fetchImage = async (
  src: string,
  init?: RequestInit | undefined,
) => {
  const response = await fetch(src, init);

  if (!response.ok) {
    throw new HttpError(response.status, Deno.inspect(response));
  }

  const data = await response.arrayBuffer();

  // Use auto detected media type since some servers respond with the wrong
  // media type on the content-type header
  const mediaType = mediaTypeFromFile(new Uint8Array(data)) ||
    mediaTypeFromHeader(response.headers);

  return {
    data,
    mediaType,
  };
};

// deno-lint-ignore no-explicit-any
let pool: null | ReturnType<typeof createPool<any>> = null;
const getWorkerPool = async (size = 4) => {
  if (!pool) {
    pool = createPool(
      await Promise.all(
        new Array(size).fill(true).map(() =>
          createWorker(new URL("./worker.ts", import.meta.url), {
            type: "module",
          })
        ),
      ),
    );
  }

  return pool;
};

export const engine: Engine = {
  name: `wasm`,

  resolve: async (params, prefferedMediaType) => {
    const { fit, width, height, quality, src } = params;

    const image = await fetchImage(src, {
      headers: {
        accept: "image/*",
      },
    });

    const pool = await getWorkerPool();
    const worker = await pool!.acquire();

    try {
      const transformed = await worker.transform(image, {
        fit,
        width,
        height,
        quality,
        mediaType: prefferedMediaType ?? image.mediaType,
      });

      return new Response(transformed.data, {
        status: 200,
        headers: {
          "content-type": transformed.mediaType,
        },
      });
    } finally {
      pool!.release(worker);
    }
  },

  accepts: () => typeof Worker !== "undefined",
};
