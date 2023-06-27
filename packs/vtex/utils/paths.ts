import { Account } from "../accounts/vtex.ts";
import { CrossSellingType } from "../types.ts";

export const paths = ({ account }: Account) => {
  const base = `https://${account}.vtexcommercestable.com.br`;
  const href = (path: string) => new URL(path, base).href;

  return {
    "event-api": {
      v1: {
        account: {
          event: href(`https://sp.vtex.com/event-api/v1/${account}/event`),
        },
      },
    },
    "no-cache": {
      "Newsletter.aspx": `${href(`/no-cache/Newsletter.aspx`)}`,
      "AviseMe.aspx": `${href("/no-cache/AviseMe.aspx")}`,
    },
    api: {
      catalog_system: {
        pub: {
          portal: {
            pagetype: {
              term: (term: string) =>
                href(`/api/catalog_system/pub/portal/pagetype/${term}`),
            },
          },
          facets: {
            search: {
              term: (term: string) =>
                href(`/api/catalog_system/pub/facets/search/${term}`),
            },
          },
          products: {
            crossselling: {
              type: (type: CrossSellingType) => ({
                productId: (productId: string) =>
                  href(
                    `/api/catalog_system/pub/products/crossselling/${type}/${productId}`,
                  ),
              }),
            },
            search: {
              toString: () => href(`/api/catalog_system/pub/products/search`),
              term: (term: string) =>
                href(`/api/catalog_system/pub/products/search/${term}`),
            },
          },
          category: {
            tree: {
              level: (level: number) =>
                href(`/api/catalog_system/pub/category/tree/${level}`),
            },
          },
        },
      },
      io: {
        _v: {
          api: {
            "intelligent-search": {
              search_suggestions: href(
                `/api/io/_v/api/intelligent-search/search_suggestions`,
              ),
              top_searches: href(
                `/api/io/_v/api/intelligent-search/top_searches`,
              ),
              product_search: {
                facets: (facets: string) =>
                  href(
                    `/api/io/_v/api/intelligent-search/product_search/${facets}`,
                  ),
              },
              facets: {
                facets: (facets: string) =>
                  href(`/api/io/_v/api/intelligent-search/facets/${facets}`),
              },
            },
          },
          private: {
            graphql: {
              v1: href(`/api/io/_v/private/graphql/v1`),
            },
          },
        },
      },
      checkout: {
        changeToAnonymousUser: {
          orderFormId: (orderFormId: string) =>
            href(`/api/checkout/changeToAnonymousUser/${orderFormId}`),
        },
        pub: {
          orderForms: {
            simulation: href(`/api/checkout/pub/orderForms/simulation`),
          },
          orderForm: {
            toString: () => href(`/api/checkout/pub/orderForm`),
            orderFormId: (orderFormId: string) => ({
              installments: href(
                `/api/checkout/pub/orderForm/${orderFormId}/installments`,
              ),
              profile: href(
                `/api/checkout/pub/orderForm/${orderFormId}/profile`,
              ),
              coupons: href(
                `/api/checkout/pub/orderForm/${orderFormId}/coupons`,
              ),
              attachments: {
                attachment: (attachment: string) =>
                  href(
                    `/api/checkout/pub/orderForm/${orderFormId}/attachments/${attachment}`,
                  ),
              },
              items: {
                toString: () =>
                  href(
                    `/api/checkout/pub/orderForm/${orderFormId}/items`,
                  ),
                update: href(
                  `/api/checkout/pub/orderForm/${orderFormId}/items/update`,
                ),
                removeAll: href(
                  `/api/checkout/pub/orderForm/${orderFormId}/items/removeAll`,
                ),
                index: (index: number) => ({
                  price: href(
                    `/api/checkout/pub/orderForm/${orderFormId}/items/${index}/price`,
                  ),
                  attachments: {
                    attachment: (attachment: string) =>
                      href(
                        `/api/checkout/pub/orderForm/${orderFormId}/items/${index}/attachments/${attachment}`,
                      ),
                  },
                }),
              },
            }),
          },
        },
      },
    },
  };
};
