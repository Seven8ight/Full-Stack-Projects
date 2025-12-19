import {
  type productDTO,
  type Product,
  type ProductRepo,
  type ProductServiceInt,
  type updateProductDTO,
} from "./product.types.js";

export class ProductService implements ProductServiceInt {
  constructor(private productRepo: ProductRepo) {}

  async createProduct(productDetails: productDTO): Promise<Product> {
    if (
      !productDetails.name ||
      !productDetails.category ||
      productDetails.price === undefined
    ) {
      throw new Error(
        "Incomplete details: name, category, and price are required"
      );
    }
    if (typeof productDetails.price !== "number" || productDetails.price < 0) {
      throw new Error("Price must be a non-negative number");
    }
    if (productDetails.description && productDetails.description.length === 0) {
      throw new Error("Description cannot be empty if provided");
    }

    const existingProducts = await this.productRepo.getProducts();

    if (existingProducts.some((p) => p.name === productDetails.name)) {
      throw new Error("Product name must be unique");
    }

    const normalizedDetails = {
      ...productDetails,
      name: productDetails.name.trim(),
      category: productDetails.category.toLowerCase(),
      description: productDetails.description?.trim() ?? null,
    };

    return await this.productRepo.addProduct(normalizedDetails);
  }

  async updateProduct(
    productId: string,
    newProductDetails: updateProductDTO
  ): Promise<Product> {
    if (!productId) {
      throw new Error("Product ID must be provided");
    }

    for (const [key, value] of Object.entries(newProductDetails)) {
      if (["name", "category", "description", "image_url"].includes(key)) {
        if (typeof value === "string" && value.trim().length === 0) {
          throw new Error(`Field ${key} cannot be empty`);
        }
      } else if (key === "price") {
        if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
          throw new Error("Price must be a non-negative number");
        }
      } else if (key === "discount") {
        if (typeof value !== "number" || value < 0 || value > 100) {
          throw new Error("Discount must be a number between 0 and 100");
        }
      }
    }

    await this.productRepo.getProductById(productId); // Will throw if not found

    return await this.productRepo.editProduct(productId, newProductDetails);
  }

  async removeProduct(productId: string): Promise<void> {
    if (!productId) {
      throw new Error("Remove Product: Product ID must be provided");
    }

    await this.productRepo.getProductById(productId);

    await this.productRepo.deleteProduct(productId);
  }

  async getAllProducts(): Promise<Product[]> {
    const products = await this.productRepo.getProducts();

    return products.map((p) => ({
      ...p,
      finalPrice: p.price * (1 - (p.discount ?? 0) / 100),
    }));
  }

  async getProduct(productId: string): Promise<Product> {
    const product = await this.productRepo.getProductById(productId);

    return {
      ...product,
      price: product.price * (1 - (product.discount ?? 0) / 100),
    };
  }

  async getProductsInCategory(category: string | string[]): Promise<Product[]> {
    if (!category) {
      throw new Error("Category must be provided");
    }
    const products = await this.productRepo.getProductsByCategory(category);

    return products.sort((a, b) => b.price - a.price);
  }
}
