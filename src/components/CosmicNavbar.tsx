import { useEffect, useState } from "react";
import { Link, NavLink as RRNavLink, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, Search, ShoppingBag, User, LogOut, Package, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/lib/cart";
import { cn } from "@/lib/utils";
const logo = "/assets/brand-logo.png";

const LINKS = [
  { label: "Home", to: "/" },
  { label: "Shop", to: "/shop" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
];

const CosmicNavbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [q, setQ] = useState("");
  const loc = useLocation();
  const nav = useNavigate();
  const { user, signOut } = useAuth();
  const count = useCart((s) => s.count());
  const [loggingOut, setLoggingOut] = useState(false);

  const handleSignOut = async () => {
    setLoggingOut(true);
    await signOut();
    setLoggingOut(false);
    nav("/");
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    setOpen(false);
    setSearchOpen(false);
  }, [loc.pathname]);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    nav(`/shop?q=${encodeURIComponent(q)}`);
    setSearchOpen(false);
  };

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-500 bg-background/90 backdrop-blur-xl",
        scrolled ? "py-2 shadow-[0_6px_30px_-18px_rgba(0,0,0,0.35)] border-b border-border" : "py-4 border-b border-transparent"
      )}
    >
      <div className="container flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3 flex-shrink-0 group" aria-label="Astro With Hrishi">
          <img
            src={logo}
            alt="Astro With Hrishi logo"
            className="h-12 sm:h-14 w-auto object-contain transition-transform duration-500 group-hover:scale-105"
          />

        </Link>

        <nav className="hidden lg:flex items-center gap-9">
          {LINKS.map((l) => (
            <RRNavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                cn(
                  "relative text-sm tracking-[0.12em] uppercase transition-colors after:absolute after:-bottom-1.5 after:left-0 after:h-px after:bg-gold after:transition-all after:duration-300",
                  isActive
                    ? "text-foreground after:w-full"
                    : "text-muted-foreground hover:text-foreground after:w-0 hover:after:w-full"
                )
              }
            >
              {l.label}
            </RRNavLink>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-3">
          <button
            onClick={() => setSearchOpen((v) => !v)}
            aria-label="Search products"
            className="h-10 w-10 rounded-full flex items-center justify-center text-foreground hover:text-gold transition-colors"
          >
            <Search className="h-5 w-5" />
          </button>

          <Link
            to="/cart"
            aria-label="Cart"
            className="relative h-10 w-10 rounded-full flex items-center justify-center text-foreground hover:text-gold transition-colors"
          >
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-5 min-w-5 px-1 rounded-full bg-gold text-[10px] font-bold text-foreground flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  aria-label="Account menu"
                  className="h-10 w-10 rounded-full flex items-center justify-center text-foreground hover:text-gold transition-colors"
                >
                  <User className="h-5 w-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-xl">
                <DropdownMenuItem asChild>
                  <Link to="/auth" className="flex items-center gap-2 cursor-pointer">
                    <User className="h-4 w-4" />
                    My Account
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/orders" className="flex items-center gap-2 cursor-pointer">
                    <Package className="h-4 w-4" />
                    My Orders
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/orders" className="flex items-center gap-2 cursor-pointer">
                    <Package className="h-4 w-4" />
                    My Orders
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  disabled={loggingOut}
                  className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="h-4 w-4" />
                  {loggingOut ? "Logging out…" : "Logout"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild size="sm" className="hidden sm:inline-flex bg-gradient-gold text-primary-foreground font-medium tracking-wide rounded-full px-5">
              <Link to="/auth">Login</Link>
            </Button>
          )}

          <button
            className="lg:hidden h-10 w-10 flex items-center justify-center text-foreground"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {searchOpen && (
        <form onSubmit={submitSearch} className="container mt-3 animate-fade-in">
          <div className="flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search bracelets, crystals, remedies..."
              className="flex-1 bg-transparent text-sm outline-none"
            />
          </div>
        </form>
      )}

      {open && (
        <div className="lg:hidden container mt-3">
          <div className="lux-card rounded-2xl p-5 space-y-4">
            {LINKS.map((l) => (
              <Link key={l.to} to={l.to} className="block text-sm uppercase tracking-[0.14em] text-foreground/80 hover:text-gold">
                {l.label}
              </Link>
            ))}
            <Link to="/cart" className="block text-sm uppercase tracking-[0.14em] text-foreground/80 hover:text-gold">
              Cart
            </Link>
            {user ? (
              <>
                <Link to="/auth" className="block text-sm uppercase tracking-[0.14em] text-foreground/80 hover:text-gold">
                  My Account
                </Link>
                <Link to="/orders" className="block text-sm uppercase tracking-[0.14em] text-foreground/80 hover:text-gold">
                  My Orders
                </Link>
                <button
                  onClick={handleSignOut}
                  disabled={loggingOut}
                  className="block text-sm uppercase tracking-[0.14em] text-destructive font-semibold hover:opacity-80"
                >
                  {loggingOut ? "Logging out…" : "Logout"}
                </button>
              </>
            ) : (
              <Link to="/auth" className="block text-sm uppercase tracking-[0.14em] text-gold font-semibold">
                Login / Register
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default CosmicNavbar;
