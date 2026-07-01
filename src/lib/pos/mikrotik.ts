/**
 * Mikrotik hotspot status.
 *
 * NOTE: This is currently a MOCK. A Mikrotik router is normally reachable only
 * on the local network, so the real integration will call the RouterOS REST API
 * (e.g. GET https://<router-ip>/rest/ip/hotspot/active) from a device on the
 * same network. To wire it up later, replace the body of `fetchMikrotikStatus`
 * with a real fetch and map the response to `MikrotikStatus`.
 */

export interface MikrotikActiveUser {
  name: string;
  address: string;
  uptime: string;
}

export interface MikrotikStatus {
  /** Whether the data is real or simulated. */
  mock: boolean;
  activeUsers: number;
  users: MikrotikActiveUser[];
  fetchedAt: string; // ISO
}

const NAMES = [
  "PG-7K4M9Q",
  "PG-A2X8P1",
  "PG-M9Q3RT",
  "PG-B4K7N2",
  "PG-C8V5W3",
  "PG-H6J2L9",
  "PG-D3F8G1",
  "PG-K5N7P4",
];

function randomUptime(): string {
  const h = Math.floor(Math.random() * 5);
  const m = Math.floor(Math.random() * 60);
  return `${h}h${m}m`;
}

function randomIp(i: number): string {
  return `10.5.50.${20 + i}`;
}

/** Fetch current hotspot status. Currently returns simulated data. */
export async function fetchMikrotikStatus(): Promise<MikrotikStatus> {
  // Simulate small network latency.
  await new Promise((r) => setTimeout(r, 350));

  const count = 3 + Math.floor(Math.random() * 6); // 3–8 active users
  const users: MikrotikActiveUser[] = Array.from({ length: count }, (_, i) => ({
    name: NAMES[i % NAMES.length],
    address: randomIp(i),
    uptime: randomUptime(),
  }));

  return {
    mock: true,
    activeUsers: count,
    users,
    fetchedAt: new Date().toISOString(),
  };
}
