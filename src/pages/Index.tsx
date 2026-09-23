import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Check, ChevronLeft, ChevronRight, Heart, Menu, RotateCcw, Search, ShoppingBag, SlidersHorizontal, Sparkles } from "lucide-react";
import navySuit from "@/assets/suit-navy.jpg";
import charcoalSuit from "@/assets/suit-charcoal.jpg";
import greenSuit from "@/assets/suit-green.jpg";
import brownSuit from "@/assets/suit-brown.jpg";
import { defaultConfig, fabrics, optionPrice, steps, type StepId, type SuitConfig } from "@/lib/configurator";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "atelier-suit-configuration";
const suitImages = { navy: navySuit, charcoal: charcoalSuit, green: greenSuit, brown: brownSuit };

const optionGroups: Record<Exclude<StepId, "fabric">, { title: string; key: keyof SuitConfig; options: string[] }[]> = {
  jacket: [
    { title: "Cut", key: "fit", options: ["Slim", "Tailored", "Classic"] },
    { title: "Jacket style", key: "buttons", options: ["One button", "Two button", "Three button", "Double breasted"] },
    { title: "Lapel", key: "lapel", options: ["Notch", "Peak", "Shawl"] },
    { title: "Lapel width", key: "lapelWidth", options: ["Narrow", "Classic", "Wide"] },
    { title: "Pockets", key: "pockets", options: ["Flap", "Jetted", "Patch", "Ticket pocket"] },
    { title: "Back vents", key: "vents", options: ["No vent", "Single", "Double"] },
  ],
  trousers: [
    { title: "Cut", key: "trouserFit", options: ["Slim", "Tailored", "Classic"] },
    { title: "Front", key: "pleats", options: ["Flat front", "Single pleat", "Double pleat"] },
    { title: "Hem", key: "cuffs", options: ["Plain hem", "Turn-up cuff"] },
    { title: "Break", key: "break", options: ["No break", "Slight break", "Full break"] },
  ],
  waistcoat: [
    { title: "Waistcoat", key: "waistcoat", options: ["No waistcoat", "Single-breasted", "Double-breasted"] },
  ],
  details: [
    { title: "Jacket lining", key: "lining", options: ["Burgundy paisley", "Midnight satin", "Copper geometric", "Ivory twill"] },
    { title: "Sleeve buttons", key: "workingCuffs", options: ["Standard cuffs", "Working buttonholes"] },
  ],
};

const OptionMark = ({ label, type }: { label: string; type: string }) => (
  <span className={cn("option-mark", type === "lapel" && "option-lapel", type === "pockets" && "option-pocket", type === "buttons" && "option-buttons") }>
    <span />
    <small>{label.split(" ")[0]}</small>
  </span>
);

const Index = () => {
  const [step, setStep] = useState<StepId>("fabric");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All fabrics");
  const [saved, setSaved] = useState(false);
  const [config, setConfig] = useState<SuitConfig>(() => {
    try {
      return { ...defaultConfig, ...JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}") };
    } catch {
      return defaultConfig;
    }
  });

  useEffect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(config)), [config]);

  const selectedFabric = fabrics.find((fabric) => fabric.id === config.fabric) ?? fabrics[0];
  const stepIndex = steps.findIndex((item) => item.id === step);
  const total = useMemo(() => {
    const additions = Object.values(config).reduce((sum, value) => sum + (optionPrice[value] ?? 0), 0);
    return 449 + selectedFabric.price + additions;
  }, [config, selectedFabric]);
  const visibleFabrics = fabrics.filter((fabric) => {
    const matchesSearch = `${fabric.name} ${fabric.mill} ${fabric.color}`.toLowerCase().includes(search.toLowerCase());
    return matchesSearch && (category === "All fabrics" || fabric.category === category);
  });

  const update = (key: keyof SuitConfig, value: string) => setConfig((current) => ({ ...current, [key]: value }));
  const move = (direction: number) => setStep(steps[Math.max(0, Math.min(steps.length - 1, stepIndex + direction))].id);

  const ConfigurationSummary = () => (
    <div className="space-y-5">
      <div>
        <p className="eyebrow">Your design</p>
        <h2 className="mt-1 font-display text-3xl">The Signature Suit</h2>
        <p className="mt-1 text-sm text-muted-foreground">Hand-finished and made to your measurements.</p>
      </div>
      <div className="summary-list">
        <div><span>Fabric</span><strong>{selectedFabric.name}</strong></div>
        <div><span>Jacket</span><strong>{config.buttons}, {config.lapel.toLowerCase()} lapel</strong></div>
        <div><span>Trousers</span><strong>{config.trouserFit}, {config.pleats.toLowerCase()}</strong></div>
        <div><span>Waistcoat</span><strong>{config.waistcoat}</strong></div>
      </div>
      <div className="flex items-end justify-between border-t border-border pt-5">
        <div><p className="text-xs uppercase text-muted-foreground">Made-to-measure total</p><p className="font-display text-4xl">€{total}</p></div>
        <p className="text-right text-xs text-muted-foreground">VAT included<br/>Free delivery</p>
      </div>
      <Button className="h-12 w-full" onClick={() => setSaved(true)}>{saved ? <><Check /> Design saved</> : <><ShoppingBag /> Save configuration</>}</Button>
      <p className="text-center text-xs text-muted-foreground">Your design is saved on this device.</p>
    </div>
  );

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="topbar">
        <div className="flex items-center gap-3"><Menu className="h-5 w-5"/><span className="brand">ATELIER / FORM</span></div>
        <p className="hidden text-xs uppercase text-muted-foreground md:block">Made-to-measure · Crafted for you</p>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" aria-label="Reset design" title="Reset design" onClick={() => setConfig(defaultConfig)}><RotateCcw /></Button>
          <Button variant="ghost" size="icon" aria-label="Save favorite" title="Save favorite" onClick={() => setSaved((value) => !value)}><Heart className={saved ? "fill-primary text-primary" : ""}/></Button>
          <Sheet><SheetTrigger asChild><Button variant="ghost" size="icon" className="xl:hidden" aria-label="View order summary"><ShoppingBag /></Button></SheetTrigger><SheetContent><SheetHeader><SheetTitle className="sr-only">Order summary</SheetTitle></SheetHeader><div className="mt-8"><ConfigurationSummary /></div></SheetContent></Sheet>
        </div>
      </header>

      <nav className="stepbar" aria-label="Suit configuration steps">
        {steps.map((item, index) => (
          <Button key={item.id} variant="ghost" onClick={() => setStep(item.id)} className={cn("step-button", step === item.id && "active")}>
            <span>{String(index + 1).padStart(2, "0")}</span>{item.short}
          </Button>
        ))}
      </nav>

      <div className="config-grid">
        <aside className="options-panel">
          <div className="panel-heading">
            <p className="eyebrow">Step {stepIndex + 1} of {steps.length}</p>
            <h1 className="font-display text-3xl">{steps[stepIndex].label}</h1>
          </div>

          {step === "fabric" ? (
            <div className="px-5 pb-28 pt-5">
              <div className="relative"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/><Input className="pl-9" placeholder="Search by color, weave or mill" value={search} onChange={(event) => setSearch(event.target.value)}/></div>
              <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
                {["All fabrics", "Essential", "Performance", "Premium"].map((item) => <Button key={item} variant={category === item ? "default" : "outline"} size="sm" onClick={() => setCategory(item)}>{item}</Button>)}
              </div>
              <div className="mt-5 grid grid-cols-2 gap-x-3 gap-y-5">
                {visibleFabrics.map((fabric) => (
                  <Button key={fabric.id} variant="ghost" className={cn("fabric-card", config.fabric === fabric.id && "selected")} onClick={() => update("fabric", fabric.id)}>
                    <span className={cn("fabric-swatch", fabric.texture)}>{config.fabric === fabric.id && <Check className="h-5 w-5"/>}</span>
                    <span className="w-full text-left"><strong>{fabric.name}</strong><small>{fabric.mill} · {fabric.category}</small><small>{fabric.price ? `+€${fabric.price}` : "Included"}</small></span>
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-8 px-5 pb-28 pt-6">
              {optionGroups[step].map((group) => (
                <fieldset key={group.key}>
                  <legend className="mb-3 text-sm font-semibold">{group.title}</legend>
                  <div className="grid grid-cols-2 gap-2">
                    {group.options.map((option) => (
                      <Button key={option} variant="outline" className={cn("option-card", config[group.key] === option && "selected")} onClick={() => update(group.key, option)}>
                        <OptionMark label={option} type={group.key}/><span>{option}</span>{optionPrice[option] ? <small>+€{optionPrice[option]}</small> : null}
                      </Button>
                    ))}
                  </div>
                </fieldset>
              ))}
              {step === "details" && <div><label htmlFor="monogram" className="mb-2 block text-sm font-semibold">Inside monogram <span className="font-normal text-muted-foreground">(+€12)</span></label><Input id="monogram" maxLength={20} placeholder="Your initials or name" value={config.monogram} onChange={(event) => update("monogram", event.target.value)}/></div>}
            </div>
          )}

          <div className="panel-nav">
            <Button variant="outline" size="icon" onClick={() => move(-1)} disabled={stepIndex === 0} aria-label="Previous step"><ChevronLeft /></Button>
            <div className="h-1 flex-1 overflow-hidden bg-secondary"><div className="h-full bg-primary transition-all" style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}/></div>
            <Button onClick={() => stepIndex === steps.length - 1 ? setSaved(true) : move(1)}>{stepIndex === steps.length - 1 ? "Finish design" : "Next"}<ChevronRight /></Button>
          </div>
        </aside>

        <section className="preview-stage">
          <div className="preview-label"><Sparkles/><span>Live preview</span></div>
          <img key={selectedFabric.image} src={suitImages[selectedFabric.image]} alt={`${selectedFabric.color} custom two-piece suit`} width={1024} height={1280} className="suit-image"/>
          {config.waistcoat !== "No waistcoat" && <div className="waistcoat-indicator"><Check/> {config.waistcoat} waistcoat included</div>}
          <div className="preview-caption"><span className={cn("mini-swatch", selectedFabric.texture)}/><div><strong>{selectedFabric.name}</strong><small>{selectedFabric.color} · 100% wool</small></div></div>
        </section>

        <aside className="summary-panel"><ConfigurationSummary /></aside>
      </div>
    </main>
  );
};

export default Index;
