import type { ConfigYourViews } from "../commerce/yourViews/client.ts";

function ConfigSection(_: ConfigYourViews) {
  return (
    <div>
      "This is a global setting and not a component. Every change here will
      impact all environments, published/archived/draft"
    </div>
  );
}

export default ConfigSection;
