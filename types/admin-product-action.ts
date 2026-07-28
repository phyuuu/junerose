export type UpdateProductInfoState = {
  fieldErrors?: {
    name?: string[];
    description?: string[];
    priceMMK?: string[];
    category?: string[];
    availability?: string[];
    isVisible?: string[];
  };
  formError?: string;
};