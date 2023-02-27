import type { LoaderFunction } from "$live/std/types.ts";

export interface Props {
  /** @description Complete user/repo format */
  repo: string;
  /** @description Branch */
  branch: string;
  /** @description Path to fetch, or leave blank and add :path route param. */
  path: string;
}

/**
 * @title GitHub Raw Loader
 * @description Grabs data from a GitHub repo
 */
const gitHubRawLoader: LoaderFunction<Props, string> = async (
  _req,
  ctx,
  { repo, branch, path },
) => {
  const pathFromParams = ctx.params.path !== ":path" && ctx.params.path;
  const resultPath = pathFromParams || path;
  const res = await fetch(
    `https://raw.githubusercontent.com/${repo}/${branch}/${resultPath}`,
  ).then((res) => res.text());

  return {
    data: res,
  };
};

export default gitHubRawLoader;
