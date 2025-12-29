export type ClearCartInput = {
    userId: string;
};

export interface ClearCartUseCase {
    execute(input: ClearCartInput): Promise<void>;
}
