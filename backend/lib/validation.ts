import { z } from 'zod';
export const categories = ['Donor boards', 'ICs & chips', 'Displays', 'Cameras', 'Bulk lots'] as const;
export const conditions = ['Tested working', 'For harvesting', 'For repair'] as const;
export const brands = ['Apple', 'Samsung', 'Xiaomi', 'OPPO', 'Vivo'] as const;
export const boardClasses = ['Grade A (Complete / All ICs)', 'Grade B (Partial Donor / Key ICs)', 'Grade C (Pure Scrap / Refining)'] as const;
export const storageTiers = ['4GB', '8GB', '16GB', '32GB', '64GB', '128GB', '256GB', '512GB', '1024GB (1TB)'] as const;
export const ramTiers = ['512MB', '1GB', '2GB', '3GB', '4GB', '6GB', '8GB', '12GB', '16GB'] as const;
export class MarketError extends Error {
  constructor(public status: number, message: string, public fields?: Record<string, string>) { super(message); }
}
export function parse<T>(schema: z.ZodType<T>, input: unknown): T {
  const result = schema.safeParse(input);
  if (result.success) return result.data;
  throw new MarketError(422, 'Please check the submitted fields.', Object.fromEntries(result.error.issues.map(i => [i.path.join('.'), i.message])));
}
export const listingInput = z.object({
  title: z.string().trim().min(1).max(120), brand: z.enum(brands), model: z.string().trim().min(1).max(100),
  category: z.enum(categories), condition: z.enum(conditions),
  boardClass: z.string().trim().max(100).optional().default('Grade A (Complete / All ICs)'),
  storageGb: z.string().trim().max(30).optional().default('128GB'),
  ramGb: z.string().trim().max(30).optional().default('6GB'),
  icCode: z.string().trim().max(80).optional().default(''),
  description: z.string().trim().min(30).max(4000),
  diagnostics: z.string().trim().min(10).max(2000), price: z.string().regex(/^\d{1,6}(\.\d{1,2})?$/).refine(p => Number(p) >= 1 && Number(p) <= 999999.99),
  quantity: z.number().int().min(0).max(10000), minimumQuantity: z.number().int().min(1).max(10000),
});
export const reservationInput = z.object({ reservationKey: z.string().uuid(), quantity: z.number().int().min(1).max(10000), address: z.string().trim().min(15).max(1000) });
export function priceCentavos(price: string) { const [whole, cents = ''] = price.split('.'); return Number(whole) * 100 + Number(cents.padEnd(2, '0')); }
const trustedOrigins = [
  'http://127.0.0.1:8090', 'http://localhost:8090',
  'http://127.0.0.1:8092', 'http://localhost:8092',
  'http://127.0.0.1:3000', 'http://localhost:3000',
  'http://127.0.0.1:5000', 'http://localhost:5000'
];

export function sameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  const expected = new URL(request.url);
  const host = request.headers.get('host'); if(host) expected.host=host;
  if (origin && origin !== expected.origin && !trustedOrigins.includes(origin)) throw new MarketError(403, 'Cross-origin submission is forbidden.');
}
