export type LynkPackageCode = "plus_30d" | "plus_12m" | "plus_lifetime";

export type LynkProduct = {
  code: LynkPackageCode;
  amount: number;
  canonicalTitle: string;
  checkoutUrl: string;
  itemUuids: readonly string[];
};

export const LYNK_PRODUCTS: readonly LynkProduct[] = [
  {
    code: "plus_30d",
    amount: 19000,
    canonicalTitle: "TutorLog Plus — 30 Hari",
    checkoutUrl: "https://lynk.id/tutorlog/q51pn0rykvq9",
    itemUuids: [],
  },
  {
    code: "plus_12m",
    amount: 149000,
    canonicalTitle: "TutorLog Plus — 12 Bulan",
    checkoutUrl: "https://lynk.id/tutorlog/gjvmgkznjqd6",
    itemUuids: [],
  },
  {
    code: "plus_lifetime",
    amount: 249000,
    canonicalTitle: "TutorLog Plus — Selamanya, bayar sekali di awal",
    checkoutUrl: "https://lynk.id/tutorlog/65p8z7ewqj8r",
    itemUuids: [],
  },
];

export function findLynkProductByUuid(uuid: string): LynkProduct | undefined {
  return LYNK_PRODUCTS.find((product) => product.itemUuids.includes(uuid));
}

export function findLynkProductByTitle(title: string): LynkProduct | undefined {
  return LYNK_PRODUCTS.find((product) => product.canonicalTitle === title);
}
