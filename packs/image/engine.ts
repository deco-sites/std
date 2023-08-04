export interface Params {
  src: string;
  width: number;
  height?: number;
  fit?: "cover" | "contain";
  quality?: number; // 0 - 100
}

export type Engine = {
  name: string;

  resolve: (
    params: Params,
    preferredMediaType: string | undefined,
    req: Request,
  ) => Response | Promise<Response>;

  accepts: (src: string) => boolean;
};
