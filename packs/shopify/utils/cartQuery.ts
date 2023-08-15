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
          subtotalAmount {
            amount
            currencyCode
          }
        }
      }
    }
    checkoutUrl
    estimatedCost {
      subtotalAmount {
        amount
        currencyCode
      }
      totalAmount {
        amount
        currencyCode
      }
      checkoutChargeAmount{
        amount
        currencyCode
      }
    }
    discountCodes {
      code
      applicable
    }
    discountAllocations{
      discountedAmount {
        amount
        currencyCode
      }
    }
  }`;
