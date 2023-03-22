import { RequestProxy } from "../../utils/request.proxy.ts";
import { ProductGetResultVNDA, VNDARequest } from "../../types.ts";

interface ProductGetParams {
  id?: string;
}

const ProductGet: VNDARequest<
  ProductGetResultVNDA,
  ProductGetParams
> = (fetcher) => {
  return (params) => {
    const endpoint = `products/${params.id}`;
    return fetcher(endpoint);
  };
};

export default RequestProxy(ProductGet);
