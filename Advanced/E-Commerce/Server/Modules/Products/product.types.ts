//Product

export interface ProductRepo {
  getProducts: () => Promise<Product[]>;
  getProductById: (productId: string) => Promise<Product>;
  getProductsByCategory: (category: string | string[]) => Promise<Product[]>;
  addProduct: (productDetails: productDTO) => Promise<Product>;
  editProduct: (
    productId: string,
    newProductDetails: updateProductDTO
  ) => Promise<Product>;
  deleteProduct: (productId: string) => Promise<void>;
}

export interface ProductServiceInt {
  createProduct: (productDetails: productDTO) => Promise<Product>;
  updateProduct: (
    productId: string,
    newProductDetails: updateProductDTO
  ) => Promise<Product>;
  removeProduct: (productId: string) => Promise<void>;
  getAllProducts: () => Promise<Product[]>;
  getProduct: (productId: string) => Promise<Product>;
  getProductsInCategory: (category: string | string[]) => Promise<Product[]>;
}

export type Product = {
  id: string;
  name: string;
  image_url?: string;
  description: string;
  price: number;
  discount?: number;
  category: string;
};

export type productDTO = Omit<Product, "id">;
export type updateProductDTO = Partial<Product>;
export type deleteProductDTO = Pick<Product, "id">;
