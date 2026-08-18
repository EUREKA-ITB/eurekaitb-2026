export type Category = "Kaos" | "Totebag" | "Aksesoris";

export type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  stock: number;
  category: Category;
};

// In-memory demo dataset. For production replace with DB persistence.
const PRODUCTS: Product[] = [
  { id: "p1", name: "Kaos EUREKA 2026", price: 999999, image: "https://via.placeholder.com/400x300?text=Kaos+EUREKA+2026", stock: 5, category: "Kaos" },
  { id: "p2", name: "Totebag Minimal", price: 999999, image: "https://via.placeholder.com/400x300?text=Totebag", stock: 3, category: "Totebag" },
  { id: "p3", name: "Pin EUREKA", price: 999999, image: "https://via.placeholder.com/400x300?text=Pin", stock: 10, category: "Aksesoris" },
  { id: "p4", name: "Kaos Limited", price: 999999, image: "https://via.placeholder.com/400x300?text=Kaos+Limited", stock: 2, category: "Kaos" },
  { id: "p5", name: "Tote Retro", price: 999999, image: "https://via.placeholder.com/400x300?text=Totebag+Retro", stock: 7, category: "Totebag" },
];

export function getProducts() {
  // return a shallow copy to avoid accidental mutation
  return PRODUCTS.map((p) => ({ ...p }));
}

export function updateStock(id: string, stock: number) {
  const idx = PRODUCTS.findIndex((p) => p.id === id);
  if (idx === -1) return null;
  PRODUCTS[idx].stock = stock;
  return { ...PRODUCTS[idx] };
}
