import type { ConfigVNDA } from "../commerce/vnda/types.ts";

function ConfigSection(_: ConfigVNDA) {
  return (
    <div>
      "This is a global setting and not a component. Every change here will
      impact all environments, published/archived/draft"
    </div>
  );
}

export default ConfigSection;
