import type { ConfigShopify } from "../commerce/shopify/client.ts";

function ConfigSection(_: ConfigShopify) {
  return (
    <div>
      "This is a global setting and not a component. Every change here will
      impact all environments, published/archived/draft"
    </div>
  );
}

export default ConfigSection;
