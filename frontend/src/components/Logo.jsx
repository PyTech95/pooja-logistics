export const Logo = ({ size = "md", inverted = false }) => {
  const sizes = {
    sm: { wrap: "h-7", mark: "h-7 w-7", text: "text-base", tag: "text-[8px]" },
    md: { wrap: "h-9", mark: "h-9 w-9", text: "text-lg", tag: "text-[9px]" },
    lg: { wrap: "h-12", mark: "h-12 w-12", text: "text-2xl", tag: "text-[10px]" },
  }[size];
  return (
    <div className={`inline-flex items-center gap-2 ${sizes.wrap}`} data-testid="brand-logo">
      <div className={`${sizes.mark} relative rounded-md grid place-items-center bg-brand text-white font-display font-black overflow-hidden`}>
        <span className="relative z-10 tracking-tighter">RK</span>
        <span className="absolute -right-2 -bottom-2 h-4 w-4 rounded-full bg-flame" />
      </div>
      <div className="leading-none">
        <div className={`font-display font-black tracking-tight ${sizes.text} ${inverted ? "text-white" : "text-foreground"}`}>RK POOJA</div>
        <div className={`label-eyebrow ${sizes.tag} mt-0.5`}>One App · All Rides</div>
      </div>
    </div>
  );
};
