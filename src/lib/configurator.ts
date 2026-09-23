export type StepId = "fabric" | "jacket" | "trousers" | "waistcoat" | "details";

export interface Fabric {
  id: string;
  name: string;
  mill: string;
  color: string;
  category: "Essential" | "Performance" | "Premium";
  price: number;
  image: "navy" | "charcoal" | "green" | "brown";
  texture: string;
}

export interface SuitConfig {
  fabric: string;
  fit: string;
  buttons: string;
  lapel: string;
  lapelWidth: string;
  pockets: string;
  vents: string;
  trouserFit: string;
  pleats: string;
  cuffs: string;
  break: string;
  waistcoat: string;
  lining: string;
  monogram: string;
  workingCuffs: string;
}

export const steps: { id: StepId; label: string; short: string }[] = [
  { id: "fabric", label: "Choose your fabric", short: "Fabric" },
  { id: "jacket", label: "Design your jacket", short: "Jacket" },
  { id: "trousers", label: "Shape your trousers", short: "Trousers" },
  { id: "waistcoat", label: "Add a waistcoat", short: "Waistcoat" },
  { id: "details", label: "Finishing details", short: "Details" },
];

export const fabrics: Fabric[] = [
  { id: "midnight", name: "Midnight Twill", mill: "Vitale Barberis", color: "Midnight navy", category: "Essential", price: 0, image: "navy", texture: "fabric-navy" },
  { id: "charcoal", name: "City Charcoal", mill: "Reda", color: "Charcoal", category: "Essential", price: 0, image: "charcoal", texture: "fabric-charcoal" },
  { id: "ink", name: "Ink Birdseye", mill: "Marzotto", color: "Ink blue", category: "Performance", price: 45, image: "navy", texture: "fabric-ink" },
  { id: "forest", name: "Forest Flannel", mill: "Lanificio Nova", color: "Forest green", category: "Premium", price: 85, image: "green", texture: "fabric-green" },
  { id: "tobacco", name: "Tobacco Herringbone", mill: "Drago", color: "Tobacco", category: "Premium", price: 95, image: "brown", texture: "fabric-brown" },
  { id: "steel", name: "Steel Sharkskin", mill: "Reda", color: "Steel grey", category: "Performance", price: 55, image: "charcoal", texture: "fabric-steel" },
  { id: "royal", name: "Royal S120", mill: "Vitale Barberis", color: "Royal navy", category: "Premium", price: 110, image: "navy", texture: "fabric-royal" },
  { id: "moss", name: "Moss Cavalry Twill", mill: "Moon", color: "Moss green", category: "Performance", price: 65, image: "green", texture: "fabric-moss" },
];

export const defaultConfig: SuitConfig = {
  fabric: "midnight",
  fit: "Tailored",
  buttons: "Two button",
  lapel: "Notch",
  lapelWidth: "Classic",
  pockets: "Flap",
  vents: "Double",
  trouserFit: "Tailored",
  pleats: "Flat front",
  cuffs: "Plain hem",
  break: "Slight break",
  waistcoat: "No waistcoat",
  lining: "Burgundy paisley",
  monogram: "",
  workingCuffs: "Standard cuffs",
};

export const optionPrice: Record<string, number> = {
  "Double breasted": 30,
  Shawl: 20,
  Patch: 10,
  "Ticket pocket": 15,
  "Turn-up cuff": 10,
  "Single-breasted": 95,
  "Double-breasted": 125,
  "Working buttonholes": 15,
  "Custom monogram": 12,
};