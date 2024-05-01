// deno-lint-ignore-file no-explicit-any
import {
  ImportMapBuilder,
  ImportMapResolver,
} from "deco/engine/importmap/builder.ts";
import { initLoader, parsePath } from "deco/engine/schema/parser.ts";
import { join, toFileUrl } from "std/path/mod.ts";

const visit = (program: any, visitor: Record<string, (node: any) => void>) => {
  for (const value of Object.values(program)) {
    const nodeType = (value as any)?.type;

    if (nodeType in visitor) {
      visitor[nodeType](value);
    }

    if (value && typeof value === "object") {
      visit(value, visitor);
    }
  }
};

const importsFrom = async (path: string): Promise<string[]> => {
  const program = await parsePath(path);

  if (!program) {
    return [];
  }

  const imports = new Set<string>();

  visit(program, {
    // Resovles static "import from" statements
    ImportDeclaration: (node: any) => {
      const specifier = node.source.value;

      if (typeof specifier === "string") {
        imports.add(specifier);
      }
    },
    // Resolves dynamic "import()" statements
    CallExpression: (node: any) => {
      if (node.callee?.type !== "Import") {
        return;
      }

      const arg0 = node.arguments?.[0]?.expression;
      if (arg0.type !== "StringLiteral") {
        console.warn([
          `Invalid import statement`,
          `TailwindCSS will not load classes from dependencies of ${path}`,
          "To fix this issue, make sure you are following the patterns:",
          `  Statically evaluated imports WORK`,
          `      import("path/to/file")`,
          `      lazy(() => import("path/to/file"))`,
          `  Dinamically evaluated imports FAIL`,
          `      import(\`path/to/file\`)`,
          `      lazy((variable) => import(\`path/to/file/\${variable}\`))`,
          "",
        ].join("\n"));

        return;
      }

      imports.add(arg0.value);
    },
  });

  return [...imports.values()];
};

const resolveRecursively = async (
  path: string,
  context: string,
  loader: (specifier: string) => Promise<string | undefined>,
  importMapResolver: ImportMapResolver,
  cache: Map<string, string>,
) => {
  const resolvedPath = importMapResolver.resolve(path, context);

  if (!resolvedPath?.endsWith(".tsx") || cache.has(resolvedPath)) {
    return;
  }

  const [content, imports] = await Promise.all([
    loader(resolvedPath),
    importsFrom(resolvedPath),
  ]);

  if (!content) {
    return;
  }

  cache.set(resolvedPath, content);

  await Promise.all(imports.map((imp) =>
    resolveRecursively(
      imp,
      resolvedPath,
      loader,
      importMapResolver,
      cache,
    )
  ));
};

const readImportMap = async () => {
  const [import_map, deno_json] = await Promise.all([
    Deno.readTextFile("./import_map.json").then(JSON.parse).catch(() => null),
    Deno.readTextFile("./deno.json").then(JSON.parse).catch(() => null),
  ]);

  return {
    imports: {
      ...import_map?.imports,
      ...deno_json?.imports,
    },
    scopes: {
      ...import_map?.scopes,
      ...deno_json?.scopes,
    },
  };
};

export const resolveDeps = async (
  entries: string[],
  cache: Map<string, string>,
) => {
  const importMap = await readImportMap();
  const loader = initLoader();

  const importMapResolver = ImportMapBuilder.new().mergeWith(
    importMap,
    toFileUrl(join(Deno.cwd(), "/")).href,
  );

  for (const entry of entries) {
    await resolveRecursively(
      entry,
      Deno.cwd(),
      loader,
      importMapResolver,
      cache,
    );
  }
};
