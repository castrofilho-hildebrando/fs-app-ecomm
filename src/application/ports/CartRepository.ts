export interface CartRepository {

  findByUserId(
    userId: string
  ): Promise<{
    userId: string;
    items: { productId: string; quantity: number }[];
  } | null>;

  addItem(
    userId: string,
    productId: string,
    quantity: number
  ): Promise<void>;

  removeItem(
    userId: string,
    productId: string
  ): Promise<void>;

  clear(
    userId: string
  ): Promise<void>;
}
