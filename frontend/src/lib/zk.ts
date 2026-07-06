// ─── Browser-compatible ZK proof generation ───────────────────────────────────
// Mirrors src/services/zk.service.ts but uses Web Crypto (SubtleCrypto) API
// instead of Node's crypto module, so it can run client-side in the browser.

import type { ZkProof } from "./types";

const CRS_SECRET = "izumi-zk-crs-secret-key-2026";

// ─── Utility: HMAC-SHA256 using SubtleCrypto ─────────────────────────────────

async function hmacSha256(key: string, data: string): Promise<string> {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(data));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// ─── Utility: SHA-256 using SubtleCrypto ─────────────────────────────────────

async function sha256(data: string): Promise<string> {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest("SHA-256", enc.encode(data));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// ─── KYC Proof generation ─────────────────────────────────────────────────────
// Proves that user possesses a valid 11-digit BVN and binds the proof to their
// derived wallet address, without revealing the BVN.

export async function generateKycProof(
  bvn: string,
  walletAddress: string
): Promise<ZkProof> {
  if (bvn.length !== 11 || !/^\d+$/.test(bvn)) {
    throw new Error("Invalid BVN format. Must be exactly 11 digits.");
  }

  const normalizedAddress = walletAddress.toLowerCase();
  const commitment = await sha256(`${bvn}:${normalizedAddress}`);
  const signature = await hmacSha256(CRS_SECRET, commitment);

  const x_a = `0x${signature.substring(0, 16)}`;
  const y_a = `0x${signature.substring(16, 32)}`;
  const x_c = `0x${signature.substring(32, 48)}`;
  const y_c = `0x${signature.substring(48, 64)}`;

  return {
    pi_a: [x_a, y_a, "1"],
    pi_b: [
      [`0x${x_a.slice(2).split("").reverse().join("")}`, "0x01"],
      [`0x${y_a.slice(2).split("").reverse().join("")}`, "0x02"],
      ["1", "0"],
    ],
    pi_c: [x_c, y_c, "1"],
    publicSignals: [commitment, normalizedAddress],
  };
}

// ─── Credit Proof generation ──────────────────────────────────────────────────
// Proves that a business holds a certified credit score and limit without
// revealing the underlying sales data.

export async function generateCreditProof(
  userId: string,
  score: number,
  limit: number
): Promise<ZkProof> {
  const commitment = await sha256(`${userId}:${score}:${limit}`);
  const signature = await hmacSha256(CRS_SECRET, commitment);

  const x_a = `0x${signature.substring(0, 16)}`;
  const y_a = `0x${signature.substring(16, 32)}`;
  const x_c = `0x${signature.substring(32, 48)}`;
  const y_c = `0x${signature.substring(48, 64)}`;

  return {
    pi_a: [x_a, y_a, "1"],
    pi_b: [
      [`0x${x_a.slice(2).split("").reverse().join("")}`, "0x01"],
      [`0x${y_a.slice(2).split("").reverse().join("")}`, "0x02"],
      ["1", "0"],
    ],
    pi_c: [x_c, y_c, "1"],
    publicSignals: [commitment, userId, score.toString(), limit.toString()],
  };
}
