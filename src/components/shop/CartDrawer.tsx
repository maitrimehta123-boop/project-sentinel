import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { handleImageError } from "@/lib/productImages";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const CartDrawer = ({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) => {
  const nav = useNavigate();
  const { items, setQty, remove, total, clear } = useCart();
  const subtotal = total();
  const shipping = subtotal > 999 || subtotal === 0 ? 0 : 79;
  const gst = Math.round(subtotal * 0.03);
  const grand = subtotal + shipping + gst;

  const checkout = () => {
    onOpenChange(false);
    nav("/checkout");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md bg-card/95 backdrop-blur-xl border-l-gold/30 flex flex-col p-0">
        <SheetHeader className="p-6 border-b border-gold/20">
          <SheetTitle className="font-display text-2xl text-gradient-gold flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-gold" /> Your Cosmic Cart
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
            <div className="h-20 w-20 rounded-full bg-gold/10 flex items-center justify-center mb-4">
              <ShoppingBag className="h-8 w-8 text-gold" />
            </div>
            <p className="text-cosmic-silver/70 mb-2">Your cart is empty</p>
            <p className="text-xs text-cosmic-silver/50">Add some sacred items to begin your journey</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              <AnimatePresence>
                {items.map((i) => (
                  <motion.div
                    key={i.id}
                    layout
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 40 }}
                    className="flex gap-3 p-3 rounded-xl glass-gold"
                  >
                    {i.image_url && <img src={i.image_url} alt={i.name} onError={handleImageError} className="h-16 w-16 rounded-lg object-cover" />}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-cosmic-silver line-clamp-1">{i.name}</div>
                      <div className="text-xs text-gold mt-0.5">₹{i.price.toLocaleString("en-IN")}</div>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center border border-gold/30 rounded-full">
                          <button onClick={() => setQty(i.id, i.quantity - 1)} className="h-6 w-6 flex items-center justify-center text-gold">
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-6 text-center text-xs">{i.quantity}</span>
                          <button onClick={() => setQty(i.id, i.quantity + 1)} className="h-6 w-6 flex items-center justify-center text-gold">
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <button onClick={() => remove(i.id)} className="ml-auto text-cosmic-silver/50 hover:text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="border-t border-gold/20 p-4 space-y-3">
              <div className="space-y-1 text-sm">
                <div className="flex justify-between text-cosmic-silver/70"><span>Subtotal</span><span>₹{subtotal.toLocaleString("en-IN")}</span></div>
                <div className="flex justify-between text-cosmic-silver/70"><span>Shipping</span><span>{shipping === 0 ? "FREE" : `₹${shipping}`}</span></div>
                <div className="flex justify-between text-cosmic-silver/70"><span>GST (3%)</span><span>₹{gst}</span></div>
                <div className="flex justify-between text-base font-bold text-gradient-gold pt-2 border-t border-gold/20">
                  <span>Total</span><span>₹{grand.toLocaleString("en-IN")}</span>
                </div>
              </div>
              <Button onClick={checkout} className="w-full bg-gradient-gold text-primary-foreground font-semibold h-11 glow-gold">
                Checkout via WhatsApp <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <button onClick={clear} className="w-full text-xs text-cosmic-silver/50 hover:text-destructive">Clear cart</button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
