import type { ConfigOCC } from "../commerce/occ/client.ts";

function ConfigSection(_: ConfigOCC) {
  return (
    <div>
      "This is a global setting and not a component. Every change here will
      impact all environments, published/archived/draft"
    </div>
  );
}

export default ConfigSection;
