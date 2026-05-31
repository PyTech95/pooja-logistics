import { MapPin } from "lucide-react";

const LOGO_URL =
  "https://customer-assets.emergentagent.com/job_pooja-logistics/artifacts/8rufbbur_image.png";

/**
 * Logo
 * - variant="lockup" (default): CSS brand mark + wordmark beside (best for headers)
 * - variant="mark": only the square brand mark
 * - variant="full": the complete uploaded logo image at given height (best for hero/splash)
 */
export const Logo = ({ size = "md", inverted = false, variant = "lockup" }) => {
  if (variant === "full") {
    const h = { xs: "h-16", sm: "h-28", md: "h-40", lg: "h-56", xl: "h-72" }[size] || "h-40";
    return (
      <img
        src={LOGO_URL}
        alt="RK POOJA — One App. All Rides."
        className={`${h} w-auto object-contain`}
        data-testid="brand-logo-full"
      />
    );
  }

  const sizes = {
    sm: { mark: "h-9 w-9 text-[15px]",  pin: "h-3 w-3",  text: "text-base", tag: "text-[8px]" },
    md: { mark: "h-11 w-11 text-[19px]", pin: "h-3.5 w-3.5", text: "text-lg",   tag: "text-[9px]" },
    lg: { mark: "h-16 w-16 text-[28px]", pin: "h-5 w-5",  text: "text-2xl",  tag: "text-[10px]" },
  }[size] || { mark: "h-11 w-11 text-[19px]", pin: "h-3.5 w-3.5", text: "text-lg", tag: "text-[9px]" };

  const Mark = (
    <div className={`${sizes.mark} relative shrink-0 rounded-xl bg-brand grid place-items-center font-display font-black text-white shadow-sm`} aria-hidden>
      <span className="leading-none tracking-[-0.08em]">RK</span>
      <MapPin className={`${sizes.pin} absolute -top-1 -right-1 text-flame fill-flame`} strokeWidth={2.5} />
    </div>
  );

  if (variant === "mark") return Mark;

  return (
    <div className="inline-flex items-center gap-2.5" data-testid="brand-logo">
      {Mark}
      <div className="leading-none">
        <div
          className={`font-display font-black tracking-tight ${sizes.text} ${
            inverted ? "text-white" : "text-foreground"
          }`}
        >
          RK POOJA
        </div>
        <div className={`label-eyebrow ${sizes.tag} mt-0.5`}>One App · All Rides</div>
      </div>
    </div>
  );
};
