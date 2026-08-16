import { z } from "zod";
import {
  createRazorpayOrder,
  MIN_PAYMENT_PAISE,
  getAdminClient,
  getAuthenticatedUser,
  getConfig,
  json,
  preflight,
  type FunctionEvent,
} from "./_shared/payment.js";
import { CATALOG_PRICES, orderTotalFor, shippingFor } from "./_shared/catalog.js";

const BodySchema = z.object({
  items: z.array(z.object({
    product_id: z.string().min(1).max(80),
    quantity: z.number().int().min(1).max(20),
    variant: z.string().max(120).nullable().optional(),
  })).min(1).max(30),
  full_name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().regex(/^\+?[0-9 ]{10,15}$/),
  address: z.string().trim().min(5).max(500),
  city: z.string().trim().min(2).max(100),
  state: z.string().trim().min(2).max(100),
  pincode: z.string().trim().regex(/^\d{6}$/),
  notes: z.string().trim().max(500).nullable().optional(),
});

export const handler = async (event: FunctionEvent) => {
  const optionsResponse = preflight(event);
  if (optionsResponse) return optionsResponse;
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });

  try {
    const config = getConfig();
    const user = await getAuthenticatedUser(event);
    if (!user) return json(401, { error: "Please sign in to continue." });

    const parsed = BodySchema.safeParse(JSON.parse(event.body ?? "{}"));
    if (!parsed.success) return json(400, { error: "Please check your details and try again." });
    const body = parsed.data;
    const admin = getAdminClient();

    // Validate the catalogue server-side. Browser-provided prices and totals are never accepted.
    // Built-in catalogue items use slug ids; only real uuids can be looked up in the table.
    const isUuid = (value: string) =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
    const productIds = [...new Set(body.items.map((item) => item.product_id))].filter(isUuid);
    let products: { id: string; name: string; price: number; stock: number; active: boolean }[] = [];
    if (productIds.length) {
      const { data, error: productError } = await admin
        .from("products")
        .select("id, name, price, stock, active")
        .in("id", productIds);
      if (productError) throw productError;
      products = (data ?? []) as typeof products;
    }

    const productById = new Map(products.map((product) => [product.id, product]));
    const lineItems: Record<string, unknown>[] = [];
    let catalogueSubtotal = 0;
    for (const item of body.items) {
      const dbProduct = productById.get(item.product_id);
      const builtIn = CATALOG_PRICES[item.product_id];
      if (dbProduct && !dbProduct.active) return json(400, { error: "One of the items is no longer available." });
      if (dbProduct && dbProduct.stock < item.quantity) {
        return json(400, { error: `Not enough stock for ${dbProduct.name}.` });
      }
      const product = dbProduct
        ? { id: dbProduct.id, name: dbProduct.name, price: Number(dbProduct.price) }
        : builtIn
          ? { id: item.product_id, name: builtIn.name, price: builtIn.price }
          : null;
      if (!product) return json(400, { error: "One of the items is no longer available." });
      const unitPrice = Number(product.price);
      catalogueSubtotal += unitPrice * item.quantity;
      lineItems.push({
        product_id: product.id,
        name: product.name,
        price: unitPrice,
        quantity: item.quantity,
        variant: item.variant ?? null,
      });
    }

    const subtotal = Math.round(catalogueSubtotal);
    const orderTotal = orderTotalFor(subtotal);
    const amountPaise = orderTotal * 100;
    if (amountPaise < MIN_PAYMENT_PAISE) return json(400, { error: "Order amount is invalid." });

    const { data: order, error: orderError } = await admin.from("orders").insert({
      user_id: user.id,
      customer_name: body.full_name,
      customer_email: body.email,
      customer_phone: body.phone,
      address: `${body.address}, ${body.city}, ${body.state} - ${body.pincode}`,
      city: body.city,
      state: body.state,
      pincode: body.pincode,
      country: "India",
      items: lineItems,
      subtotal,
      discount: 0,
      shipping: shippingFor(subtotal),
      total: orderTotal,
      notes: body.notes || null,
      status: "PENDING_PAYMENT",
      payment_status: "pending",
      payment_method: "razorpay",
    }).select("id, order_number").single();
    if (orderError || !order) throw orderError ?? new Error("order_insert_failed");

    try {
      const gatewayOrder = await createRazorpayOrder(order.order_number ?? order.id, order.id, user.id, amountPaise);
      if (gatewayOrder.amount !== amountPaise || gatewayOrder.currency !== "INR") {
        throw new Error("razorpay_amount_mismatch");
      }
      const { error: updateError } = await admin
        .from("orders")
        .update({ razorpay_order_id: gatewayOrder.id })
        .eq("id", order.id);
      if (updateError) throw updateError;

      return json(200, {
        key_id: config.razorpayKeyId,
        razorpay_order_id: gatewayOrder.id,
        amount: amountPaise,
        currency: "INR",
        order_id: order.id,
        order_number: order.order_number,
        customer: { name: body.full_name, email: body.email, contact: body.phone },
      });
    } catch (error) {
      await admin.from("orders").update({ status: "PAYMENT_FAILED", payment_status: "failed" }).eq("id", order.id);
      throw error;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown";
    console.error("create_razorpay_order_error", message);
    if (message === "missing_server_configuration") {
      return json(503, { error: "Payment service is not configured." });
    }
    if (message === "invalid_razorpay_key") {
      return json(503, { error: "Payment credentials are invalid." });
    }
    return json(502, { error: "Could not create the payment order. Please try again." });
  }
};