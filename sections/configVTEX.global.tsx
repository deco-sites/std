import type { ConfigVTEX } from "../commerce/vtex/client.ts";

function ConfigSection(_: ConfigVTEX) {
  return (
    <div>
      "This is a global setting and not a component. Every change here will
      impact all environments, published/archived/draft"
    </div>
  );
}

export default ConfigSection;
