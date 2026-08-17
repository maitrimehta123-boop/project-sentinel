import { AlertTriangle, RotateCcw, ShoppingCart } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { inr } from "@/lib/shop";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reference: string | null;
  reason: string | null;
  amount: number;
  onRetry: () => void;
  onBackToCart: () => void;
};

/** Shown when a payment attempt fails, is cancelled, or cannot be verified. */
const PaymentFailedDialog = ({ open, onOpenChange, reference, reason, amount, onRetry, onBackToCart }: Props) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-md w-[95vw] glass-gold border-gold/30">
      <div className="text-center pt-2">
        <div className="h-14 w-14 rounded-full bg-red-500/15 flex items-center justify-center mx-auto mb-3">
          <AlertTriangle className="h-7 w-7 text-red-400" />
        </div>
        <h2 className="font-display text-xl text-cosmic-silver">Payment Failed</h2>
        <p className="text-sm text-cosmic-silver/70 mt-1">Your order has not been confirmed and you have not been charged for a failed attempt.</p>
      </div>

      <div className="rounded-xl border border-gold/20 p-3 text-sm space-y-1.5 mt-2">
        <div className="flex justify-between gap-3"><span className="text-cosmic-silver/60">Order reference</span><span className="text-cosmic-silver text-right">{reference ?? "—"}</span></div>
        <div className="flex justify-between gap-3"><span className="text-cosmic-silver/60">Amount</span><span className="text-gold font-semibold">{inr(amount)}</span></div>
        {reason && <div className="flex justify-between gap-3"><span className="text-cosmic-silver/60">Reason</span><span className="text-cosmic-silver/80 text-right">{reason}</span></div>}
      </div>

      <div className="grid sm:grid-cols-2 gap-2 mt-2">
        <Button onClick={onBackToCart} variant="outline" className="border-gold/30 text-cosmic-silver">
          <ShoppingCart className="h-4 w-4 mr-2" /> Back to Cart
        </Button>
        <Button onClick={onRetry} className="bg-gradient-gold text-primary-foreground font-semibold">
          <RotateCcw className="h-4 w-4 mr-2" /> Retry Payment
        </Button>
      </div>
    </DialogContent>
  </Dialog>
);

export default PaymentFailedDialog;
