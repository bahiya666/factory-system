export const ALL_DEPARTMENTS = [
  'WOOD',
  'FOAM',
  'MATERIALS',
  'UPHOLSTERY',
  'PACKAGING',
  'DELIVERY',
  'INVENTORY',
] as const;

export const DEPARTMENTS = ALL_DEPARTMENTS as readonly string[];

export type Department = (typeof ALL_DEPARTMENTS)[number];
