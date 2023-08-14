export const CART_QUERY = `{
    id
    lines(first: 100) {
      nodes {
        id
        quantity
        merchandise {
          ...on ProductVariant {
            title
            image {
              url
              altText
            }
            product {
              title
            }
            id
          }
        }
        estimatedCost {
          totalAmount {
            amount
            currencyCode
          }
        }
      }
    }
    checkoutUrl
    estimatedCost {
      totalAmount {
        amount
        currencyCode
      }
    }
  }`;
