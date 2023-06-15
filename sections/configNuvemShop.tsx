import type { ConfigNuvemShop } from "../commerce/nuvemShop/types.ts";

function ConfigSection(_: ConfigNuvemShop) {
  return (
    <div>
      "This is a global setting and not a component. Every change here will
      impact all environments, published/archived/draft"
    </div>
  );
}

export default ConfigSection;
