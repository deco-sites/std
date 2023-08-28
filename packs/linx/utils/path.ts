import { Account } from "../accounts/linx.ts";

export const paths = ({ account }: Account) => {
  const base = `https://${account}.core.dcg.com.br/web-api/v1`;
  const href = (path: string) => new URL(path, base).href;

  return {
    catalog: {
      brandList: {
        brandID: (brandID: number) =>
          href(`/Catalog/Products/Brand/${brandID}`),
      },
      categoryList: {
        categoryID: (categoryID: number, catalogID: number) =>
          href(`/Catalog/Products/Brand/${categoryID}?catalogID=${catalogID}`),
      },
      datasourceList: {
        datasourceID: (datasourceID: number) =>
          href(`/Catalog/Products/Datasource/${datasourceID}`),
      },
      searchList: {
        term: (term: string) => href(`/Catalog/Products/Search/${term}`),
      },
      productDetail: {
        productID: (productID: number) =>
          href(`/Catalog/Products/Get/${productID}`),
      },
    },
    profile: {
      orderList: href(`/Profile/AccountOrder/List`),
      orderDetail: href(`/Profile/AccountOrder/Get`),
      login: href(`/Profile/Account/Login`),
      register: href(`/Profile/Account/Register`),
      logout: href(`/Profile/Account/Logout`),
      accountUpdate: href(`/Profile/Account/Update`),
      changePassword: href(`/Profile/Account/ChangePassword`),
      isAuth: href(`/Profile/Account/IsAuthenticated`),
      adressList: href(`/Profile/AccountAddress/List`),
      adressDetail: href(`/Profile/AccountAddress/Get`),
      adressUpdate: href(`/Profile/AccountAddress/Save`),
      adressDelete: href(`/Profile/AccountAddress/Delete`),
      adressForm: href(`/Profile/AccountAddress/GetForm`),
      gift: href(`/Profile/AccountGiftCertificate/List`),
    },
    shopping: {
      deliveryList: href(`/Shopping/Delivery/Get`),
      getPrice: href(`/Shopping/Price/Get`),
      getPriceB2B: href(`/Shopping/PriceMatrix/Get`),
      reviewsList: href(`/Shopping/Review/GetReviewers`),
      reviewDetail: {
        reviewID: (reviewID: string) =>
          href(`/Shopping/Review/Get/${reviewID}`),
      },
      basketDetail: href(`/Shopping/Basket/Get`),
      addProduct: href(`/Shopping/Basket/AddProduct`),
      redirectCheckout: href(`/Shopping/Basket/CheckoutRedirect`),
      removeBasketItem: href(`/Shopping/Basket/RemoveBasketItem`),
      updateBasketItem: href(`/Shopping/Basket/UpdateBasketItem`),
      clearBasket: href(`/Shopping/Basket/RemoveAll`),
      addCupom: href(`/Shopping/Basket/AddCoupon`),
      removeCupom: href(`/Shopping/Basket/RemoveCoupon`),
      setCep: href(`/Shopping/Basket/SetPostalCode`),
      setDelivery: href(`/Shopping/Basket/SetDeliveryOption`),
      addMetadata: href(`/Shopping/Basket/AddCustomMetadata`),
      removeMetadata: href(`/Shopping/Basket/RemoveCustomMetadata`),
      addAdditional: href(`/Shopping/Basket/AddAdditionalProduct`),
      removeAdditional: href(`/Shopping/Basket/RemoveAdditionalProduct`),
    },
  };
};
