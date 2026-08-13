/** Subtle luxury backdrop: soft golden light washes on a clean white canvas. */
const StarField = () => (
  <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 bg-background">
    <div className="absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-gradient-radial" />
    <div className="absolute top-1/3 -right-52 h-[560px] w-[560px] rounded-full bg-gradient-radial" />
    <div className="absolute bottom-0 left-1/3 h-[420px] w-[420px] rounded-full bg-gradient-radial" />
  </div>
);

export default StarField;
