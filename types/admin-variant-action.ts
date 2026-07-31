export type AddProductVariantState = {
  formError?: string;

  fieldErrors?: {
    sizeId?: string[];
    colorId?: string[];
    quantity?: string[];
  };
};
