import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ShieldCheck, Truck, Lock, CheckCircle2 } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useCart, type CartItem } from "@/lib/cart";
import { resolveImages } from "@/lib/productImages";
import { deliveryEstimate, inr, shippingFor, gstFor } from "@/lib/shop";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
const logo = "/assets/brand-logo.jpg";

/** Safe payment data returned by the server — never contains any secret. */
type PaySession = {
  key_id: string;
  razorpay_order_id: string;
  amount: number;
  currency: string;
  order_id: string;
  order_number: string | null;
  customer?: { name: string; email: string; contact: string };
};



declare global {
  interface Window {
    Razorpay?: any;
  }
}

const RAZORPAY_SCRIPT = "https://checkout.razorpay.com/v1/checkout.js";

const callPaymentFunction = async <T,>(name: string, body: unknown): Promise<T> => {
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;
  if (!accessToken) throw new Error("Please sign in to continue.");

  const response = await fetch(`/.netlify/functions/${name}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({ error: "Invalid response from payment server." }));
  if (!response.ok) {
    const message = typeof payload?.error === "string" ? payload.error : `Payment request failed (${response.status}).`;
    console.error(`Payment API ${name} failed`, response.status, message);
    throw new Error(message);
  }
  return payload as T;
};

/** Loaded lazily — only when the customer actually starts a payment. */
const loadRazorpay = () =>
  new Promise<void>((resolve, reject) => {
    if (window.Razorpay) return resolve();
    const s = document.createElement("script");
    s.src = RAZORPAY_SCRIPT;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Payment service is temporarily unavailable. Please try again."));
    document.body.appendChild(s);
  });


type FormState = {
  full_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  notes: string;
};

const STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat","Haryana",
  "Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Manipur",
  "Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan","Sikkim","Tamil Nadu","Telangana",
  "Tripura","Uttar Pradesh","Uttarakhand","West Bengal","Delhi","Jammu and Kashmir","Ladakh",
  "Chandigarh","Puducherry","Andaman and Nicobar Islands","Dadra and Nagar Haveli and Daman and Diu","Lakshadweep",
];

const Checkout = () => {
  const nav = useNavigate();
  const loc = useLocation();
  const { user } = useAuth();
  const { items, clear } = useCart();

  const [form, setForm] = useState<FormState>({
    full_name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    notes: "",
  });
  const [processing, setProcessing] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  /** Reused on retry so a failed attempt never creates a duplicate order. */
  const [pendingSession, setPendingSession] = useState<PaySession | null>(null);

  useEffect(() => {
    if (user) {
      setForm((f) => ({
        ...f,
        full_name: f.full_name || "",
        email: user.email || f.email,
        phone: f.phone || "",
      }));
      supabase
        .from("profiles")
        .select("full_name, phone")
        .eq("id", user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            setForm((f) => ({
              ...f,
              full_name: data.full_name || f.full_name,
              phone: data.phone || f.phone,
            }));
          }
        });
    }
  }, [user]);

  const buyNowItems: CartItem[] = useMemo(() => {
    const state = loc.state as { items?: CartItem[] } | null;
    return state?.items ?? [];
  }, [loc.state]);

  const cartItems = items.length > 0 ? items : buyNowItems;

  const subtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = shippingFor(subtotal);
  const gst = gstFor(subtotal);
  const total = subtotal + shipping + gst;

  if (cartItems.length === 0 && !confirmed) {
    return (
      <PageLayout title="Checkout">
        <div className="container max-w-md py-32 text-center">
          <p className="text-cosmic-silver/70 mb-4">Your cart is empty.</p>
          <Button onClick={() => nav("/shop")} className="bg-gradient-gold text-primary-foreground">
            Browse Shop
          </Button>
        </div>
      </PageLayout>
    );
  }

  const validate = () => {
    if (!form.full_name.trim() || form.full_name.trim().length < 2) return "Please enter your full name";
    if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) return "Please enter a valid email";
    if (!form.phone.trim() || form.phone.replace(/\D/g, "").length < 10) return "Please enter a valid 10-digit mobile number";
    if (!form.address.trim() || form.address.trim().length < 5) return "Please enter your full address";
    if (!form.city.trim()) return "Please enter your city";
    if (!form.state.trim()) return "Please select your state";
    if (!form.pincode.trim() || !/^\d{6}$/.test(form.pincode)) return "Please enter a valid 6-digit pincode";
    return null;
  };

  const handlePay = async () => {
    const err = validate();
    if (err) return toast.error(err);
    if (!user) return toast.error("Please sign in to continue.");

    setProcessing(true);

    try {
      // 1. Server creates the order and validates the amount from the database.
      let session = pendingSession;
      if (!session) {
        const data = await callPaymentFunction<PaySession>("create-razorpay-order", {
          items: cartItems.map((i) => ({
            product_id: i.product_id,
            quantity: i.quantity,
            variant: i.variant ?? null,
          })),
          full_name: form.full_name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          city: form.city.trim(),
          state: form.state.trim(),
          pincode: form.pincode.trim(),
          notes: form.notes.trim() || null,
        });
        if (!data.razorpay_order_id || data.amount !== Math.round(total * 100)) {
          throw new Error("The payment server returned an invalid order amount.");
        }
        session = data as PaySession;
        setPendingSession(session);
      }

      // 2. Load the checkout script only now, and open it on user action.
      await loadRazorpay();

      const options = {
        key: session.key_id,
        order_id: session.razorpay_order_id,
        amount: session.amount,
        currency: session.currency,
        name: "Astro With Hrishi",
        description: `Order ${session.order_number ?? ""}`.trim(),
        image: logo,
        prefill: {
          name: session.customer?.name ?? form.full_name,
          email: session.customer?.email ?? form.email,
          contact: session.customer?.contact ?? form.phone,
        },
        theme: { color: "#C9A227" },
        // Only UPI (top apps), Card and Netbanking are offered — Wallet, EMI and Pay Later are switched off.
        method: {
          netbanking: true,
          card: true,
          upi: true,
          wallet: false,
          emi: false,
          paylater: false,
        },
        config: {
          display: {
            hide: [{ method: "wallet" }, { method: "paylater" }, { method: "emi" }],
            blocks: {
              upi: {
                name: "Pay via UPI",
                instruments: [{ method: "upi" }],
              },
              cardsAndBanking: {
                name: "Cards & Net Banking",
                instruments: [{ method: "card" }, { method: "netbanking" }],
              },
            },
            sequence: ["block.upi", "block.cardsAndBanking"],
            preferences: { show_default_blocks: false },
          },
        },
        handler: async (response: any) => {
          // 3. Only the server can mark an order as paid.
          try {
            const v = await callPaymentFunction<{
              status: string;
              order_id: string;
              order_number?: string | null;
              payment_id?: string | null;
            }>("verify-razorpay-payment", {
              order_id: session.order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (v.status !== "paid") throw new Error("Payment was not captured.");

            setOrderId(v.order_id);
            setOrderNumber(v.order_number ?? null);
            setPaymentId(v.payment_id ?? null);
            setPaidAmount(session.amount / 100);
            setPendingSession(null);
            setConfirmed(true);
            clear();
            toast.success("Payment successful! Your order has been placed.");
          } catch (verificationError) {
            console.error("Payment verification failed", verificationError);
            setProcessing(false);
            toast.error("We could not confirm your payment yet. If money was debited, please contact support.");
          }
        },
        modal: {
          ondismiss: () => {
            setProcessing(false);
            toast.error("Payment cancelled. Your cart is saved — try again when ready.");
          },
        },
      };

      const rz = new window.Razorpay(options);
      rz.on("payment.failed", () => {
        setProcessing(false);
        toast.error("Payment failed. Please try again or use a different payment method.");
      });
      rz.open();
    } catch (paymentError) {
      console.error("Payment flow failed", paymentError);
      setProcessing(false);
      toast.error(paymentError instanceof Error ? paymentError.message : "Payment service is temporarily unavailable. Please try again.");
    }
  };


  if (confirmed) {
    return (
      <PageLayout title="Order Confirmed">
        <div className="container max-w-md py-32 text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mx-auto mb-6">
            <div className="h-20 w-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-10 w-10 text-emerald-400" />
            </div>
          </motion.div>
          <h1 className="font-display text-2xl text-gradient-gold mb-2">Order Placed Successfully!</h1>
          <p className="text-cosmic-silver/70 mb-4">Thank you, {form.full_name}.</p>
          <div className="glass-gold rounded-2xl p-4 text-left text-sm space-y-1.5 mb-6">
            <div className="flex justify-between"><span className="text-cosmic-silver/60">Order number</span><span className="text-cosmic-silver">{orderNumber ?? orderId}</span></div>
            <div className="flex justify-between"><span className="text-cosmic-silver/60">Payment status</span><span className="text-emerald-400">Paid</span></div>
            <div className="flex justify-between"><span className="text-cosmic-silver/60">Amount paid</span><span className="text-gold font-semibold">{inr(paidAmount)}</span></div>
            {paymentId && <div className="flex justify-between"><span className="text-cosmic-silver/60">Payment ID</span><span className="text-cosmic-silver/80 text-xs">{paymentId}</span></div>}
            <div className="flex justify-between"><span className="text-cosmic-silver/60">Estimated delivery</span><span className="text-cosmic-silver">{deliveryEstimate()}</span></div>
          </div>
          <p className="text-sm text-cosmic-silver/60 mb-6">
            We've received your payment and will dispatch your order shortly. A confirmation has been sent to your email.
          </p>

          <div className="flex gap-3 justify-center">
            <Button onClick={() => nav("/shop")} className="bg-gradient-gold text-primary-foreground">
              Continue Shopping
            </Button>
            <Button variant="outline" onClick={() => nav("/")} className="border-gold/40 text-gold">
              Back to Home
            </Button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout title="Checkout">
      <div className="container max-w-5xl pt-28 pb-16">
        <button onClick={() => nav(-1)} className="flex items-center gap-2 text-sm text-cosmic-silver/70 hover:text-gold mb-6">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="grid lg:grid-cols-[1fr_400px] gap-6">
          {/* Left: customer details form */}
          <div>
            <h2 className="font-display text-xl text-gradient-gold mb-4">Delivery Details</h2>
            <div className="glass-gold rounded-2xl p-5 space-y-4">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-cosmic-silver/70 mb-1 block">Full Name *</label>
                  <Input value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} className="bg-background/40 border-gold/20" placeholder="Your full name" />
                </div>
                <div>
                  <label className="text-xs text-cosmic-silver/70 mb-1 block">Mobile Number *</label>
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="bg-background/40 border-gold/20" placeholder="10-digit mobile" maxLength={10} />
                </div>
              </div>
              <div>
                <label className="text-xs text-cosmic-silver/70 mb-1 block">Email *</label>
                <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="bg-background/40 border-gold/20" placeholder="your@email.com" />
              </div>
              <div>
                <label className="text-xs text-cosmic-silver/70 mb-1 block">Full Address *</label>
                <Textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="bg-background/40 border-gold/20 min-h-[70px]" placeholder="House no, building, street, area" />
              </div>
              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-cosmic-silver/70 mb-1 block">City *</label>
                  <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="bg-background/40 border-gold/20" placeholder="City" />
                </div>
                <div>
                  <label className="text-xs text-cosmic-silver/70 mb-1 block">State *</label>
                  <select value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="w-full h-10 rounded-md bg-background/40 border border-gold/20 px-3 text-sm text-cosmic-silver">
                    <option value="">Select</option>
                    {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-cosmic-silver/70 mb-1 block">Pincode *</label>
                  <Input value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value })} className="bg-background/40 border-gold/20" placeholder="6-digit" maxLength={6} />
                </div>
              </div>
              <div>
                <label className="text-xs text-cosmic-silver/70 mb-1 block">Order Notes (optional)</label>
                <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="bg-background/40 border-gold/20 min-h-[50px]" placeholder="Any special instructions..." />
              </div>
            </div>

            <div className="flex items-center gap-4 mt-4 text-xs text-cosmic-silver/60">
              <span className="flex items-center gap-1"><Lock className="h-3.5 w-3.5 text-gold" /> Secure Payment</span>
              <span className="flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5 text-gold" /> 100% Authentic</span>
              <span className="flex items-center gap-1"><Truck className="h-3.5 w-3.5 text-gold" /> By {deliveryEstimate()}</span>
            </div>
          </div>

          {/* Right: order summary */}
          <div>
            <h2 className="font-display text-xl text-gradient-gold mb-4">Order Summary</h2>
            <div className="glass-gold rounded-2xl p-5">
              <div className="space-y-3 mb-4 max-h-[300px] overflow-y-auto">
                {cartItems.map((i) => (
                  <div key={i.id} className="flex gap-3">
                    <img src={resolveImages({ image_url: i.image_url } as any)[0]} alt={i.name} className="h-14 w-14 rounded-lg object-cover border border-gold/20" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-cosmic-silver line-clamp-1">{i.name}</div>
                      {i.variant && <div className="text-xs text-cosmic-silver/60">{i.variant}</div>}
                      <div className="text-xs text-cosmic-silver/70 mt-0.5">
                        {inr(i.price)} × {i.quantity}
                      </div>
                    </div>
                    <div className="text-sm text-gold font-semibold whitespace-nowrap">
                      {inr(i.price * i.quantity)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-1.5 text-sm border-t border-gold/20 pt-4">
                <div className="flex justify-between text-cosmic-silver/70"><span>Subtotal</span><span>{inr(subtotal)}</span></div>
                <div className="flex justify-between text-cosmic-silver/70"><span>Shipping</span><span>{shipping === 0 ? "FREE" : inr(shipping)}</span></div>
                <div className="flex justify-between text-cosmic-silver/70"><span>GST (3%)</span><span>{inr(gst)}</span></div>
                <div className="flex justify-between text-base font-bold text-gradient-gold pt-2 border-t border-gold/20">
                  <span>Total</span><span>{inr(total)}</span>
                </div>
              </div>

              <Button
                onClick={handlePay}
                disabled={processing}
                className="w-full mt-5 bg-gradient-gold text-primary-foreground font-semibold h-12 glow-gold"
              >
                {processing ? "Processing..." : `Pay ${inr(total)}`}
              </Button>
              <p className="text-[11px] text-cosmic-silver/50 text-center mt-2">
                100% secure payment · UPI, Cards & Net Banking supported.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default Checkout;
