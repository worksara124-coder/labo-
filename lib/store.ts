import "server-only";
import { promises as fs } from "fs";
import path from "path";
import type { Booking } from "./booking";

// Stockage simple dans un fichier JSON (parfait en local ou sur un serveur Node/VPS).
// Sur Vercel (système de fichiers en lecture seule), remplacer par une base : Supabase, Neon, Vercel KV…
const FILE = path.join(process.cwd(), "data", "bookings.json");

let queue: Promise<unknown> = Promise.resolve();

export async function readBookings(): Promise<Booking[]> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8")) as Booking[];
  } catch {
    return [];
  }
}

/** Exécute une modification en série pour éviter deux réservations simultanées sur le même créneau. */
export function mutate<T>(fn: (all: Booking[]) => Promise<{ data: Booking[]; result: T }> | { data: Booking[]; result: T }) {
  const run = queue.then(async () => {
    const all = await readBookings();
    const { data, result } = await fn(all);
    await fs.mkdir(path.dirname(FILE), { recursive: true });
    await fs.writeFile(FILE, JSON.stringify(data, null, 2));
    return result;
  });
  queue = run.catch(() => undefined);
  return run;
}
