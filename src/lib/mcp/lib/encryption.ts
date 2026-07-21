// AES-GCM helpers for monetary values stored at rest in financial_particulars.
// Mirrors supabase/functions/_shared/encryption.ts but reads env lazily so this
// module is safe to evaluate at build-time / cold-start.

const ENC_PREFIX = "enc:v1:";
let cachedKey: CryptoKey | null = null;

async function getKey(): Promise<CryptoKey> {
  if (cachedKey) return cachedKey;
  const raw = (globalThis as any).process?.env?.AMOUNT_ENCRYPTION_KEY ?? "";
  if (!raw) throw new Error("AMOUNT_ENCRYPTION_KEY is not configured");
  const material = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(raw));
  cachedKey = await crypto.subtle.importKey("raw", material, { name: "AES-GCM" }, false, [
    "encrypt",
    "decrypt",
  ]);
  return cachedKey;
}

function toB64(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

function fromB64(b64: string): Uint8Array {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export async function encryptNumber(value: number): Promise<string> {
  const key = await getKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      new TextEncoder().encode(String(value)),
    ),
  );
  return `${ENC_PREFIX}${toB64(iv)}:${toB64(ct)}`;
}

export async function decryptNumber(
  stored: string | number | null | undefined,
): Promise<number> {
  if (stored === null || stored === undefined || stored === "") return 0;
  if (typeof stored === "number") return stored;
  if (!stored.startsWith(ENC_PREFIX)) {
    const n = Number(stored);
    return Number.isFinite(n) ? n : 0;
  }
  const [, , ivB64, ctB64] = stored.split(":");
  if (!ivB64 || !ctB64) return 0;
  try {
    const key = await getKey();
    const iv = fromB64(ivB64);
    const ct = fromB64(ctB64);
    const pt = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv as BufferSource },
      key,
      ct as BufferSource,
    );
    const n = Number(new TextDecoder().decode(pt));
    return Number.isFinite(n) ? n : 0;
  } catch {
    return 0;
  }
}

export async function decryptRecord<T extends Record<string, any>>(row: T): Promise<T> {
  const fields = ["amount", "cash", "investment", "current_value"] as const;
  for (const f of fields) {
    if (f in row) (row as any)[f] = await decryptNumber(row[f]);
  }
  return row;
}
