import decodeAVIF, {
  init as initDecodeAVIF,
} from "https://esm.sh/@jsquash/avif@1.1.2/decode";
import encodeAVIF, {
  init as initEncodeAVIF,
} from "https://esm.sh/@jsquash/avif@1.1.2/encode";
import decodeJPEG, {
  init as initDecodeJPEG,
} from "https://esm.sh/@jsquash/jpeg@1.2.0/decode";
import encodeJPEG, {
  init as initEncodeJPEG,
} from "https://esm.sh/@jsquash/jpeg@1.2.0/encode";
import decodePNG, {
  init as initDecodePNG,
} from "https://esm.sh/@jsquash/png@2.1.2/decode";
import encodePNG, {
  init as initEncodePNG,
} from "https://esm.sh/@jsquash/png@2.1.2/encode";
import resize from "https://esm.sh/@jsquash/resize@1.0.1";
import decodeWEBP, {
  init as initDecodeWEBP,
} from "https://esm.sh/@jsquash/webp@1.2.0/decode";
import encodeWEBP, {
  init as initEncodeWEBP,
} from "https://esm.sh/@jsquash/webp@1.2.0/encode";
import "./canvas.ts";

if (typeof caches !== "undefined") {
  // @ts-expect-error Necessary for avif encoder not to try loading the multi threaded avif version
  caches.default = {};
}

const fetchWasm = async (url: string) => {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Error while fetching wasm at: ${url}`);
  }

  return new WebAssembly.Module(await response.arrayBuffer());
};

const codecs = [
  [
    initEncodeJPEG,
    "https://esm.sh/@jsquash/jpeg@1.2.0/codec/enc/mozjpeg_enc.wasm",
  ],
  [
    initDecodeJPEG,
    "https://esm.sh/@jsquash/jpeg@1.2.0/codec/dec/mozjpeg_dec.wasm",
  ],
  [
    initDecodePNG,
    "https://esm.sh/@jsquash/png@2.1.2/codec/squoosh_png_bg.wasm",
  ],
  [
    initEncodePNG,
    "https://esm.sh/@jsquash/png@2.1.2/codec/squoosh_png_bg.wasm",
  ],
  [
    initEncodeWEBP,
    "https://esm.sh/@jsquash/webp@1.2.0/codec/enc/webp_enc.wasm",
  ],
  [
    initDecodeWEBP,
    "https://esm.sh/@jsquash/webp@1.2.0/codec/dec/webp_dec.wasm",
  ],
  [
    initDecodeAVIF,
    "https://esm.sh/@jsquash/avif@1.1.2/codec/dec/avif_dec.wasm",
  ],
  [
    initEncodeAVIF,
    "https://esm.sh/@jsquash/avif@1.1.2/codec/enc/avif_enc.wasm",
  ],
] as const;

let initialized = false;
export const getCodecs = async () => {
  if (!initialized) {
    initialized = true;

    try {
      await Promise.all(
        codecs.map(async ([fn, url]) => fn(await fetchWasm(url))),
      );
    } catch {
      initialized = false;
    }
  }

  return {
    "image/jpeg": {
      decode: decodeJPEG,
      encode: encodeJPEG,
    },
    "image/png": {
      decode: decodePNG,
      encode: encodePNG,
    },
    "image/webp": {
      decode: decodeWEBP,
      encode: encodeWEBP,
    },
    "image/avif": {
      decode: decodeAVIF,
      encode: encodeAVIF,
    },
  };
};

export const transforms = {
  resize,
};
