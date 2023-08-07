import { HttpError } from "../../../utils/HttpError.ts";
import { KEY } from "../constants.ts";
import { Params as Props } from "../engine.ts";
import { engine as passThrough } from "../engines/passThrough/engine.ts";
import { engine as deco } from "../engines/deco/engine.ts";
import { engine as cloudflare } from "../engines/cloudflare/engine.ts";
import { engine as wasm } from "../engines/wasm/engine.ts";

const ENGINES = [
  wasm,
  cloudflare,
  deco,
  passThrough,
];

function assert(expr: unknown, msg = ""): asserts expr {
  if (!expr) {
    throw new HttpError(400, msg);
  }
}

const parseParams = (
  { src, width, height, fit, quality }: Partial<Props>,
): Props => {
  assert(src, "src is required");
  assert(width, "width is required");

  return {
    src,
    width: Number(width),
    height: Number(height),
    quality: Number(quality) || undefined,
    fit: fit === "contain" ? "contain" : "cover",
  };
};

const acceptMediaType = (req: Request) => {
  const accept = req.headers.get("accept");

  if (accept?.includes("image/avif")) {
    return "image/avif";
  }

  if (accept?.includes("image/webp")) {
    return "image/webp";
  }
};

const handler = async (
  props: Props,
  req: Request,
): Promise<Response> => {
  try {
    const preferredMediaType = acceptMediaType(req);
    const params = parseParams(props);
    const engine = ENGINES.find((e) => e.accepts(params.src)) ?? passThrough;

    const response = await engine.resolve(params, preferredMediaType, req);

    response.headers.set("x-img-engine", engine.name);
    response.headers.set("x-cache", "MISS");
    response.headers.set("vary", "Accept");
    response.headers.set(
      "cache-control",
      "public, s-maxage=15552000, max-age=15552000, immutable",
    );

    return response;
  } catch (error) {
    console.error(error);

    return new Response(error.message ?? Deno.inspect(error), {
      status: error instanceof HttpError ? error.status : 500,
      headers: {
        "cache-control": "no-cache, no-store",
        "vary": "Accept",
      },
    });
  }
};

const cachePromise = typeof caches !== "undefined" ? caches.open(KEY) : null;

const loader: typeof handler = async (props, req) => {
  const cache = await cachePromise;

  if (cache === null) {
    return handler(props, req);
  }

  const cached = await cache.match(req);

  if (cached) return cached;

  const response = await handler(props, req);

  if (response.status === 200) {
    const cloned = response.clone();
    cloned.headers.set("x-cache", "HIT");
    cache.put(req, cloned);
  }

  return response;
};

export default loader;
