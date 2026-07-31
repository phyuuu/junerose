export type UpdateProductInfoState = {
  formError?: string;

  fieldErrors?: {
    code?: string[];
    slug?: string[];
    name?: string[];
    description?: string[];
    priceMMK?: string[];
    category?: string[];
    availability?: string[];
    isVisible?: string[];
    variants?: string[];
  };
};