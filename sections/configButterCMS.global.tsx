import { ConfigButterCMS } from "../commerce/butterCMS/client.ts";

function ConfigSection(_: ConfigButterCMS) {
  return (
    <div>
      "This is a global setting and not a component. Every change here will
      impact all environments, published/archived/draft"
    </div>
  );
}

export default ConfigSection;
