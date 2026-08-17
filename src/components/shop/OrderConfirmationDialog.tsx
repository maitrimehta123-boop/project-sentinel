import { CheckCircle2, Download, Printer, ShoppingBag, Truck } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { inr, deliveryEstimate } from "@/lib/shop";
import { downloadReceipt, printReceipt, type ReceiptData } from "@/lib/receipt";

type Props = {
  open: boolean;
  data: ReceiptData;
  onContinue: () => void;
  onTrack?: () => void;
};

/** Shown only after the server has verified the payment as captured/paid. */
const OrderConfirmationDialog = ({ open, data, onContinue, onTrack }: Props) => (
  <Dialog open={open}>
    <DialogContent
      hideClose
      className="max-w-lg w-[95vw] max-h-[92vh] overflow-y-auto glass-gold border-gold/30 p-0"
    >
      <div className="text-center px-5 pt-6 pb-4 border-b border-gold/20">
        <div className="h-16 w-16 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-3">
          <CheckCircle2 className="h-9 w-9 text-emerald-400" />
        </div>
        <h2 className="font-display text-xl sm:text-2xl text-gradient-gold">🎉 Order Confirmed Successfully!</h2>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2 text-xs text-emerald-400">
          <span>✓ Payment Successful</span>
          <span>✓ Order Confirmed</span>
        </div>
      </div>

      <div className="px-5 py-4 space-y-4 text-sm">
        <div className="space-y-3">
          {data.items.map((item, index) => (
            <div key={`${item.name}-${index}`} className="flex gap-3">
              <img src={item.image} alt={item.name} className="h-14 w-14 rounded-lg object-cover border border-gold/20" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-cosmic-silver line-clamp-2">{item.name}</div>
                {item.variant && <div className="text-xs text-cosmic-silver/60">{item.variant}</div>}
                <div className="text-xs text-cosmic-silver/70">{inr(item.price)} × {item.quantity}</div>
              </div>
              <div className="text-gold font-semibold whitespace-nowrap">{inr(item.price * item.quantity)}</div>
            </div>
          ))}
        </div>

        <div className="border-t border-gold/20 pt-3 space-y-1.5">
          <div className="flex justify-between text-cosmic-silver/70"><span>Subtotal</span><span>{inr(data.subtotal)}</span></div>
          {data.discount > 0 && (
            <div className="flex justify-between text-cosmic-silver/70"><span>Discount</span><span>- {inr(data.discount)}</span></div>
          )}
          <div className="flex justify-between text-cosmic-silver/70"><span>Shipping</span><span>{data.shipping === 0 ? "FREE" : inr(data.shipping)}</span></div>
          <div className="flex justify-between text-cosmic-silver/70"><span>GST (3%)</span><span>{inr(data.gst)}</span></div>
          <div className="flex justify-between text-base font-bold text-gradient-gold pt-2 border-t border-gold/20">
            <span>TOTAL PAID</span><span>{inr(data.total)}</span>
          </div>
        </div>

        <div className="border-t border-gold/20 pt-3 space-y-1 text-xs text-cosmic-silver/70">
          <div className="flex justify-between gap-3"><span>Order ID</span><span className="text-cosmic-silver text-right">{data.order_number ?? data.order_id}</span></div>
          <div className="flex justify-between gap-3"><span>Razorpay Payment ID</span><span className="text-cosmic-silver text-right break-all">{data.payment_id ?? "—"}</span></div>
          <div className="flex justify-between gap-3"><span>Payment date &amp; time</span><span className="text-cosmic-silver text-right">{new Date(data.paid_at).toLocaleString("en-IN")}</span></div>
          <div className="flex justify-between gap-3"><span>Payment status</span><span className="text-emerald-400 font-semibold">{data.payment_status}</span></div>
          <div className="flex justify-between gap-3"><span>Estimated delivery</span><span className="text-cosmic-silver">{deliveryEstimate()}</span></div>
        </div>

        <div className="border-t border-gold/20 pt-3 text-xs text-cosmic-silver/70 space-y-0.5">
          <div className="text-cosmic-silver font-semibold">{data.customer_name}</div>
          <div>{data.customer_phone} · {data.customer_email}</div>
          <div>{data.address}</div>
          <div>{[data.city, data.state, data.pincode].filter(Boolean).join(", ")}, India</div>
        </div>
      </div>

      <div className="px-5 pb-5 grid sm:grid-cols-2 gap-2">
        <Button onClick={() => printReceipt(data)} variant="outline" className="border-gold/30 text-cosmic-silver">
          <Printer className="h-4 w-4 mr-2" /> Print Receipt
        </Button>
        <Button onClick={() => downloadReceipt(data)} variant="outline" className="border-gold/30 text-cosmic-silver">
          <Download className="h-4 w-4 mr-2" /> Download Receipt
        </Button>
        {onTrack && (
          <Button onClick={onTrack} variant="outline" className="border-gold/30 text-cosmic-silver">
            <Truck className="h-4 w-4 mr-2" /> Track Order
          </Button>
        )}
        <Button onClick={onContinue} className="bg-gradient-gold text-primary-foreground font-semibold">
          <ShoppingBag className="h-4 w-4 mr-2" /> Continue Shopping
        </Button>
      </div>
    </DialogContent>
  </Dialog>
);

export default OrderConfirmationDialog;
