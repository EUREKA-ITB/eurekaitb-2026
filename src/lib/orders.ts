import fs from "fs";
import path from "path";

const DATA_DIR = path.resolve(process.cwd(), "data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");

export type OrderStatus = "pending" | "paid" | "cancelled";

export type Order = {
  id: string;
  createdAt: string;
  expiresAt: string;
  status: OrderStatus;
  buyer: Record<string, unknown>;
  items: Record<string, unknown>[];
  paymentMethod: string | null;
  qrisUrl?: string | null;
  total?: number;
};

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(ORDERS_FILE)) fs.writeFileSync(ORDERS_FILE, "[]");
}

function readOrders(): Order[] {
  try {
    ensureDataDir();
    const raw = fs.readFileSync(ORDERS_FILE, "utf8");
    return JSON.parse(raw || "[]") as Order[];
  } catch {
    return [];
  }
}

function writeOrders(orders: Order[]) {
  ensureDataDir();
  fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
}

export function cancelExpiredOrders() {
  const orders = readOrders();
  const now = Date.now();
  let changed = false;
  for (const o of orders) {
    if (o.status === "pending" && new Date(o.expiresAt).getTime() <= now) {
      o.status = "cancelled";
      changed = true;
    }
  }
  if (changed) writeOrders(orders);
}

export function createOrder(input: {
  buyer: Record<string, unknown>;
  items: Record<string, unknown>[];
  paymentMethod?: string | null;
  total?: number;
}) {
  const orders = readOrders();
  const id = `ORD-${Date.now()}-${Math.floor(Math.random() * 9000 + 1000)}`;
  const createdAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(); // 4 hours
  const qrisUrl = input.paymentMethod === "qris" ? `https://via.placeholder.com/300x300.png?text=QRIS+${encodeURIComponent(id)}` : null;
  const order: Order = {
    id,
    createdAt,
    expiresAt,
    status: "pending",
    buyer: input.buyer,
    items: input.items,
    paymentMethod: input.paymentMethod || null,
    qrisUrl: qrisUrl || undefined,
    total: input.total,
  };
  orders.push(order);
  writeOrders(orders);
  return order;
}

export function getOrder(id: string) {
  cancelExpiredOrders();
  const orders = readOrders();
  return orders.find((o) => o.id === id) || null;
}

export function markOrderPaid(id: string) {
  const orders = readOrders();
  const o = orders.find((x) => x.id === id);
  if (!o) return null;
  o.status = "paid";
  writeOrders(orders);
  return o;
}
