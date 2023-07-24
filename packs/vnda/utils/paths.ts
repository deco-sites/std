import { Account } from "../accounts/vnda.ts";

const PATHS = [
  "/carrinho",
  "/carrinho/adicionar",
  "/carrinho/quantidade/atualizar",
  "/carrinho/produtos-sugeridos/relacionados-carrinho",
  "/carrinho/remover",
  "/cep",
  "/cupom/ajax",
] as const;

type Paths = (typeof PATHS)[number];

export const paths = ({ internalDomain: base }: Account) => {
  if (!base) {
    throw new Error(
      "Missing `internalDomain` configuration. Open your deco admin and fill the VNDA account block",
    );
  }

  return PATHS.reduce(
    (acc, path) => {
      acc[path] = new URL(path, base).href;

      return acc;
    },
    {} as Record<Paths, string>,
  );
};
