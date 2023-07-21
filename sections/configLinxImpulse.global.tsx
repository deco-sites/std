import type { Account } from "deco-sites/std/packs/linxImpulse/accounts/linxImpulse.ts";

function ConfigSection(_: Account) {
  return (
    <div>
      "This is a global setting and not a component. Every change here will
      impact all environments, published/archived/draft"
    </div>
  );
}

export default ConfigSection;
