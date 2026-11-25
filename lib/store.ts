import "server-only";
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { revalidateTag, unstable_cache } from "next/cache";
import { neon } from "@neondatabase/serverless";
import type { Destination, Proposal, StaffUser, Store } from "@/lib/types";

const storePath = path.join(process.cwd(), "data", "store.json");

const initialDestinations: Destination[] = [
  {
    id: "cape-town",
    name: "Cape Town",
    country: "South Africa",
    heroImage:
      "https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=1400&q=85",
    gallery: [],
    summary: "Coastal elegance, mountain scenery and a city rich in culture.",
    highlights: [
      "Table Mountain & the Cableway",
      "Cape Peninsula & Cape Point",
      "V&A Waterfront and city bowl",
      "Winelands day trip",
    ],
    visaNotes:
      "Travelers should check current South African entry requirements before departure. Passports should be valid for at least 30 days beyond the intended stay and have two blank pages.",
    defaultItinerary: [
      {
        day: 1,
        title: "Arrival & Atlantic Seaboard",
        description:
          "Meet your private driver and settle in. Enjoy a relaxed orientation along Camps Bay and the Sea Point promenade.",
      },
      {
        day: 2,
        title: "Table Mountain & the City",
        description:
          "Ride the cableway (weather permitting), then discover the Company's Garden, Bo-Kaap and the V&A Waterfront.",
      },
      {
        day: 3,
        title: "Cape Peninsula",
        description:
          "Follow the scenic coast via Chapman's Peak, Cape Point Nature Reserve and the penguins at Boulders Beach.",
      },
    ],
    accommodations: [
      {
        name: "The Marly Boutique Hotel",
        rating: 5,
        description: "Design-led beachfront suites in Camps Bay.",
        image:
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=700&q=80",
      },
      {
        name: "The Cape Milner",
        rating: 4,
        description: "A welcoming city retreat below Table Mountain.",
        image:
          "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=700&q=80",
      },
    ],
  },
  {
    id: "victoria-falls",
    name: "Victoria Falls",
    country: "Zimbabwe",
    heroImage:
      "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=1400&q=85",
    gallery: [],
    summary: "A front-row seat to one of the world's most spectacular natural wonders.",
    highlights: [
      "Guided rainforest and falls walk",
      "Sunset Zambezi River cruise",
      "Local village and craft experiences",
      "Optional scenic helicopter flight",
    ],
    visaNotes:
      "Visa requirements vary by nationality. Check official guidance before travel. Yellow fever documentation may be requested if arriving from an at-risk country.",
    defaultItinerary: [
      {
        day: 1,
        title: "Welcome to Victoria Falls",
        description:
          "Transfer to your lodge and enjoy an unhurried afternoon. Join a sunset cruise on the Zambezi River.",
      },
      {
        day: 2,
        title: "The Smoke That Thunders",
        description:
          "Explore the falls with a local guide along rainforest paths and viewpoints. Afternoon at leisure.",
      },
      {
        day: 3,
        title: "A Taste of Local Life",
        description:
          "Choose an optional cultural village visit or a scenic flight before your onward transfer.",
      },
    ],
    accommodations: [
      {
        name: "Ilala Lodge Hotel",
        rating: 4,
        description: "Elegant rooms just a short walk from the falls.",
        image:
          "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=700&q=80",
      },
    ],
  },
  {
    id: "zanzibar",
    name: "Zanzibar",
    country: "Tanzania",
    heroImage:
      "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1400&q=85",
    gallery: [],
    summary: "Island days, Indian Ocean blues and the storied lanes of Stone Town.",
    highlights: [
      "Stone Town heritage walk",
      "Spice farm experience",
      "Dhow sailing and sandbanks",
      "North coast beaches",
    ],
    visaNotes:
      "Most visitors require a visa for Tanzania. Check eligibility and apply via the official immigration portal. Zanzibar also requires mandatory inbound travel insurance; verify current rules before departure.",
    defaultItinerary: [
      {
        day: 1,
        title: "Stone Town Arrival",
        description:
          "Settle into your boutique stay and wander the UNESCO-listed lanes with a local guide.",
      },
      {
        day: 2,
        title: "Spice Island",
        description:
          "Visit a working spice farm, then travel north to your beachfront resort for a sunset swim.",
      },
      {
        day: 3,
        title: "Ocean at Your Pace",
        description:
          "Sail on a traditional dhow, snorkel on a coral reef or enjoy an easy day beside the water.",
      },
    ],
    accommodations: [
      {
        name: "Zuri Zanzibar",
        rating: 5,
        description: "Thoughtful bungalow living on a pristine north-coast beach.",
        image:
          "https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=700&q=80",
      },
      {
        name: "Emerson Spice",
        rating: 4,
        description: "A characterful rooftop hideaway in historic Stone Town.",
        image:
          "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=700&q=80",
      },
    ],
  },
  {
    id: "kumabirira-lodge",
    name: "Kumabirira Lodge",
    country: "Zimbabwe",
    heroImage:
      "https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?auto=format&fit=crop&w=1400&q=85",
    gallery: [],
    summary:
      "A relaxed lodge stay in Zimbabwe, thoughtfully tailored to the pace and interests of each traveler.",
    highlights: [
      "A restful lodge-based stay",
      "Time to enjoy the surrounding landscape",
      "Locally inspired dining",
      "Optional excursions arranged to suit your plans",
    ],
    visaNotes:
      "Entry requirements vary by nationality. Check current Zimbabwe visa and passport requirements with official sources before travel.",
    defaultItinerary: [
      {
        day: 1,
        title: "Arrival at the Lodge",
        description:
          "Transfer to Kumabirira Lodge, settle in and enjoy a relaxed first evening.",
      },
      {
        day: 2,
        title: "A Day at Your Own Pace",
        description:
          "Enjoy time at the lodge or arrange local experiences to suit your interests.",
      },
      {
        day: 3,
        title: "Leisure & Departure",
        description:
          "Enjoy a leisurely breakfast before your onward transfer.",
      },
    ],
    accommodations: [],
  },
  {
    id: "harare",
    name: "Harare",
    country: "Zimbabwe",
    heroImage:
      "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1400&q=85",
    gallery: [],
    summary:
      "Zimbabwe's lively capital, with a welcoming city atmosphere and a blend of culture, gardens and local flavor.",
    highlights: [
      "Harare city orientation",
      "National Gallery of Zimbabwe",
      "Local markets and dining",
      "Gardens and green spaces",
    ],
    visaNotes:
      "Entry requirements vary by nationality. Check current Zimbabwe visa and passport requirements with official sources before travel.",
    defaultItinerary: [
      {
        day: 1,
        title: "Arrival in Harare",
        description:
          "Meet your driver, check in and enjoy a relaxed introduction to the city.",
      },
      {
        day: 2,
        title: "Culture & City Gardens",
        description:
          "Explore the city's cultural attractions and green spaces at a comfortable pace.",
      },
      {
        day: 3,
        title: "Local Harare",
        description:
          "Enjoy time for local shopping and dining before your onward journey.",
      },
    ],
    accommodations: [],
  },
  {
    id: "great-zimbabwe",
    name: "Great Zimbabwe",
    country: "Zimbabwe",
    heroImage: "/great-zimbabwe.png",
    gallery: [],
    summary:
      "Discover the remarkable stone architecture and rich history of Zimbabwe's celebrated heritage site.",
    highlights: [
      "Great Zimbabwe National Monument",
      "The Hill Complex and Great Enclosure",
      "On-site museum",
      "Guided heritage walk",
    ],
    visaNotes:
      "Entry requirements vary by nationality. Check current Zimbabwe visa and passport requirements with official sources before travel.",
    defaultItinerary: [
      {
        day: 1,
        title: "Arrival & Heritage Introduction",
        description:
          "Arrive in the Great Zimbabwe area and enjoy an introduction to the site's history.",
      },
      {
        day: 2,
        title: "Explore Great Zimbabwe",
        description:
          "Visit the monument with time to explore its stone enclosures, hilltop complex and museum.",
      },
      {
        day: 3,
        title: "Leisure & Onward Travel",
        description:
          "Enjoy a relaxed morning before continuing your journey.",
      },
    ],
    accommodations: [],
  },
  {
    id: "kruger-national-park",
    name: "Kruger National Park",
    country: "South Africa",
    heroImage:
      "https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1400&q=85",
    gallery: [],
    summary:
      "Discover South Africa's iconic wilderness on unforgettable game drives through diverse landscapes.",
    highlights: [
      "Big Five wildlife viewing",
      "Guided morning and evening game drives",
      "Bush walks with experienced guides",
      "Diverse landscapes and birdlife",
    ],
    visaNotes:
      "Travelers should check current South African entry requirements before departure. Park fees, opening times and activity availability can change; confirm details with SANParks before travel.",
    defaultItinerary: [
      {
        day: 1,
        title: "Arrival & First Game Drive",
        description:
          "Arrive at your selected rest camp or lodge, settle in and head out for an afternoon game drive.",
      },
      {
        day: 2,
        title: "Safari in Kruger",
        description:
          "Set out early with a guide to look for wildlife, return for a midday rest and enjoy an evening drive.",
      },
      {
        day: 3,
        title: "Morning in the Bush",
        description:
          "Enjoy a final morning drive or guided walk, then continue to your next destination.",
      },
    ],
    accommodations: [],
  },
];

let initialization: Promise<void> | undefined;

async function readLocalStore(): Promise<Store | undefined> {
  try {
    const parsed: unknown = JSON.parse(await readFile(storePath, "utf8"));
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !("destinations" in parsed) ||
      !Array.isArray(parsed.destinations) ||
      !("proposals" in parsed) ||
      !Array.isArray(parsed.proposals)
    ) {
      throw new Error("The existing local data file has an invalid format.");
    }
    return parsed as Store;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined;
    throw error;
  }
}

function getDatabase() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured. Add it to your local environment.");
  }
  return neon(connectionString);
}

async function initializeDatabase(): Promise<void> {
  const sql = getDatabase();
  await Promise.all([
    sql`
    CREATE TABLE IF NOT EXISTS destinations (
      id TEXT PRIMARY KEY,
      data JSONB NOT NULL
    )
  `,
    sql`
    CREATE TABLE IF NOT EXISTS proposals (
      id TEXT PRIMARY KEY,
      data JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL
    )
  `,
    sql`
    CREATE TABLE IF NOT EXISTS app_metadata (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `,
    sql`
    CREATE TABLE IF NOT EXISTS staff_users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('admin', 'consultant')),
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      is_initial_admin BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `,
    sql`
    CREATE TABLE IF NOT EXISTS auth_login_attempts (
      email TEXT PRIMARY KEY,
      attempts INTEGER NOT NULL DEFAULT 0,
      locked_until TIMESTAMPTZ,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `,
    sql`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      token_hash TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      used_at TIMESTAMPTZ
    )
  `,
    sql`
    CREATE TABLE IF NOT EXISTS public_inquiry_rate_limits (
      ip_hash TEXT PRIMARY KEY,
      window_started_at TIMESTAMPTZ NOT NULL,
      request_count INTEGER NOT NULL
    )
  `,
  ]);
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS staff_users_single_initial_admin
    ON staff_users (is_initial_admin)
    WHERE is_initial_admin = TRUE
  `;

  const [migration, kumabiriraMigration, krugerMigration] = await Promise.all([
    sql`SELECT value FROM app_metadata WHERE key = 'local-json-import-v1'`,
    sql`SELECT value FROM app_metadata WHERE key = 'kumabirira-destination-v1'`,
    sql`SELECT value FROM app_metadata WHERE key = 'kruger-national-park-destination-v1'`,
  ]);
  if (migration.length === 0) {
    const localStore = await readLocalStore();
    const existing = await sql`SELECT id FROM destinations LIMIT 1`;
    const destinations =
      localStore?.destinations.length
        ? localStore.destinations
        : existing.length === 0
          ? initialDestinations
          : [];

    for (const destination of destinations) {
      await sql`
        INSERT INTO destinations (id, data)
        VALUES (${destination.id}, ${JSON.stringify(destination)}::jsonb)
        ON CONFLICT (id) DO NOTHING
      `;
    }
    for (const proposal of localStore?.proposals ?? []) {
      await sql`
        INSERT INTO proposals (id, data, created_at)
        VALUES (
          ${proposal.id},
          ${JSON.stringify(proposal)}::jsonb,
          ${proposal.createdAt}::timestamptz
        )
        ON CONFLICT (id) DO NOTHING
      `;
    }
    await sql`
      INSERT INTO app_metadata (key, value)
      VALUES ('local-json-import-v1', 'complete')
      ON CONFLICT (key) DO NOTHING
    `;
  }

  if (kumabiriraMigration.length === 0) {
    const kumabirira = initialDestinations.find(
      (destination) => destination.id === "kumabirira-lodge",
    );
    if (!kumabirira) {
      throw new Error("Kumabirira destination seed is missing.");
    }
    await sql`
      INSERT INTO destinations (id, data)
      VALUES (${kumabirira.id}, ${JSON.stringify(kumabirira)}::jsonb)
      ON CONFLICT (id) DO NOTHING
    `;
    await sql`
      INSERT INTO app_metadata (key, value)
      VALUES ('kumabirira-destination-v1', 'complete')
      ON CONFLICT (key) DO NOTHING
    `;
  }

  if (krugerMigration.length === 0) {
    const kruger = initialDestinations.find(
      (destination) => destination.id === "kruger-national-park",
    );
    if (!kruger) {
      throw new Error("Kruger National Park destination seed is missing.");
    }
    await sql`
      INSERT INTO destinations (id, data)
      VALUES (${kruger.id}, ${JSON.stringify(kruger)}::jsonb)
      ON CONFLICT (id) DO NOTHING
    `;
    await sql`
      INSERT INTO app_metadata (key, value)
      VALUES ('kruger-national-park-destination-v1', 'complete')
      ON CONFLICT (key) DO NOTHING
    `;
  }
}

async function ensureDatabase(): Promise<void> {
  if (!initialization) {
    initialization = initializeDatabase().catch((error: unknown) => {
      initialization = undefined;
      throw error;
    });
  }
  await initialization;
}

const getCachedDestinations = unstable_cache(
  async (): Promise<Destination[]> => {
    const rows = await getDatabase()`SELECT data FROM destinations ORDER BY data->>'name'`;
    return rows.map((row) => row.data as Destination);
  },
  ["destinations"],
  { revalidate: 300, tags: ["destinations"] },
);

export async function getDestinations(): Promise<Destination[]> {
  await ensureDatabase();
  return getCachedDestinations();
}

export async function saveDestination(input: Omit<Destination, "id"> & { id?: string }) {
  await ensureDatabase();
  const id = input.id || randomUUID();
  const destination: Destination = { ...input, id };
  await getDatabase()`
    INSERT INTO destinations (id, data)
    VALUES (${id}, ${JSON.stringify(destination)}::jsonb)
    ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data
  `;
  revalidateTag("destinations");
  return destination;
}

export async function deleteDestination(id: string): Promise<boolean> {
  await ensureDatabase();
  const rows = await getDatabase()`
    DELETE FROM destinations WHERE id = ${id} RETURNING id
  `;
  if (rows.length > 0) revalidateTag("destinations");
  return rows.length > 0;
}

export async function getProposals(): Promise<Proposal[]> {
  await ensureDatabase();
  const rows = await getDatabase()`SELECT data FROM proposals ORDER BY created_at DESC`;
  return rows.map((row) => row.data as Proposal);
}

export async function getProposal(id: string): Promise<Proposal | undefined> {
  await ensureDatabase();
  const rows = await getDatabase()`SELECT data FROM proposals WHERE id = ${id} LIMIT 1`;
  return rows.length ? (rows[0].data as Proposal) : undefined;
}

export async function saveProposal(proposal: Omit<Proposal, "id" | "createdAt">) {
  await ensureDatabase();
  const saved: Proposal = {
    ...proposal,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
  };
  await getDatabase()`
    INSERT INTO proposals (id, data, created_at)
    VALUES (${saved.id}, ${JSON.stringify(saved)}::jsonb, ${saved.createdAt}::timestamptz)
  `;
  return saved;
}

export async function replaceProposal(
  id: string,
  proposal: Omit<Proposal, "id" | "createdAt">,
): Promise<Proposal | undefined> {
  await ensureDatabase();
  const rows = await getDatabase()`
    UPDATE proposals
    SET data =
      ${JSON.stringify(proposal)}::jsonb
      || jsonb_build_object('createdAt', data->'createdAt')
      || CASE
        WHEN data ? 'clientFeedback' THEN jsonb_build_object('clientFeedback', data->'clientFeedback')
        ELSE '{}'::jsonb
      END
    WHERE id = ${id}
    RETURNING data
  `;
  return rows.length ? (rows[0].data as Proposal) : undefined;
}

export async function duplicateProposal(id: string): Promise<Proposal | undefined> {
  const existing = await getProposal(id);
  if (!existing) return undefined;
  const { id: _id, createdAt: _createdAt, clientFeedback: _clientFeedback, ...proposal } = existing;
  return saveProposal({ ...proposal, status: "Draft" });
}

export async function deleteProposal(id: string): Promise<boolean> {
  await ensureDatabase();
  const rows = await getDatabase()`DELETE FROM proposals WHERE id = ${id} RETURNING id`;
  return rows.length > 0;
}

export async function updateProposalStatus(
  id: string,
  status: Proposal["status"],
  clientFeedback?: string,
): Promise<Proposal | undefined> {
  await ensureDatabase();
  const rows = clientFeedback === undefined
    ? await getDatabase()`
        UPDATE proposals
        SET data = jsonb_set(data, '{status}', to_jsonb(${status}::text))
        WHERE id = ${id}
        RETURNING data
      `
    : await getDatabase()`
        UPDATE proposals
        SET data = jsonb_set(
          jsonb_set(data, '{status}', to_jsonb(${status}::text)),
          '{clientFeedback}',
          to_jsonb(${clientFeedback}::text)
        )
        WHERE id = ${id}
        RETURNING data
      `;
  return rows.length ? (rows[0].data as Proposal) : undefined;
}

interface StaffUserRow {
  id: string;
  email: string;
  name: string;
  role: StaffUser["role"];
  is_active: boolean;
  created_at: Date | string;
}

function toStaffUser(row: StaffUserRow): StaffUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    isActive: row.is_active,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

export async function getStaffUserForLogin(email: string) {
  await ensureDatabase();
  const rows = await getDatabase()`
    SELECT id, email, name, password_hash, role, is_active, created_at
    FROM staff_users WHERE email = ${email} LIMIT 1
  `;
  if (!rows.length) return undefined;
  const row = rows[0] as StaffUserRow & { password_hash: string };
  return { ...toStaffUser(row), passwordHash: row.password_hash };
}

export async function getActiveStaffUser(id: string): Promise<StaffUser | undefined> {
  await ensureDatabase();
  const rows = await getDatabase()`
    SELECT id, email, name, role, is_active, created_at
    FROM staff_users WHERE id = ${id} AND is_active = TRUE LIMIT 1
  `;
  return rows.length ? toStaffUser(rows[0] as StaffUserRow) : undefined;
}

export async function getStaffUsers(): Promise<StaffUser[]> {
  await ensureDatabase();
  const rows = await getDatabase()`
    SELECT id, email, name, role, is_active, created_at
    FROM staff_users ORDER BY created_at ASC
  `;
  return rows.map((row) => toStaffUser(row as StaffUserRow));
}

export async function createInitialAdmin(input: {
  email: string;
  name: string;
  passwordHash: string;
}): Promise<StaffUser | undefined> {
  await ensureDatabase();
  const id = randomUUID();
  const rows = await getDatabase()`
    INSERT INTO staff_users (id, email, name, password_hash, role, is_initial_admin)
    VALUES (${id}, ${input.email}, ${input.name}, ${input.passwordHash}, 'admin', TRUE)
    ON CONFLICT DO NOTHING
    RETURNING id, email, name, role, is_active, created_at
  `;
  return rows.length ? toStaffUser(rows[0] as StaffUserRow) : undefined;
}

export async function createStaffUser(input: {
  email: string;
  name: string;
  passwordHash: string;
  role: StaffUser["role"];
}): Promise<StaffUser | undefined> {
  await ensureDatabase();
  const rows = await getDatabase()`
    INSERT INTO staff_users (id, email, name, password_hash, role)
    VALUES (${randomUUID()}, ${input.email}, ${input.name}, ${input.passwordHash}, ${input.role})
    ON CONFLICT (email) DO NOTHING
    RETURNING id, email, name, role, is_active, created_at
  `;
  return rows.length ? toStaffUser(rows[0] as StaffUserRow) : undefined;
}

export async function updateStaffUserActive(
  id: string,
  active: boolean,
): Promise<StaffUser | undefined> {
  await ensureDatabase();
  const rows = await getDatabase()`
    UPDATE staff_users SET is_active = ${active}
    WHERE id = ${id}
    RETURNING id, email, name, role, is_active, created_at
  `;
  return rows.length ? toStaffUser(rows[0] as StaffUserRow) : undefined;
}

export async function getStaffUserCount(): Promise<number> {
  await ensureDatabase();
  const rows = await getDatabase()`SELECT COUNT(*)::int AS count FROM staff_users`;
  return rows[0].count as number;
}

export async function isLoginLocked(email: string): Promise<boolean> {
  await ensureDatabase();
  const rows = await getDatabase()`
    SELECT locked_until > NOW() AS locked
    FROM auth_login_attempts WHERE email = ${email}
  `;
  return rows.length > 0 && rows[0].locked === true;
}

export async function recordLoginFailure(email: string): Promise<void> {
  await ensureDatabase();
  await getDatabase()`
    INSERT INTO auth_login_attempts (email, attempts, locked_until, updated_at)
    VALUES (${email}, 1, NULL, NOW())
    ON CONFLICT (email) DO UPDATE SET
      attempts = CASE
        WHEN auth_login_attempts.locked_until IS NOT NULL
          AND auth_login_attempts.locked_until <= NOW() THEN 1
        ELSE auth_login_attempts.attempts + 1
      END,
      locked_until = CASE
        WHEN auth_login_attempts.locked_until IS NOT NULL
          AND auth_login_attempts.locked_until <= NOW() THEN NULL
        WHEN auth_login_attempts.attempts + 1 >= 5 THEN NOW() + INTERVAL '15 minutes'
        ELSE auth_login_attempts.locked_until
      END,
      updated_at = NOW()
  `;
}

export async function clearLoginFailures(email: string): Promise<void> {
  await ensureDatabase();
  await getDatabase()`DELETE FROM auth_login_attempts WHERE email = ${email}`;
}

export async function createPasswordResetToken(
  email: string,
  tokenHash: string,
): Promise<"sent" | "limited" | "missing"> {
  await ensureDatabase();
  await getDatabase()`
    DELETE FROM password_reset_tokens
    WHERE expires_at <= NOW()
       OR used_at < NOW() - INTERVAL '30 days'
  `;
  const users = await getDatabase()`
    SELECT id FROM staff_users WHERE email = ${email} AND is_active = TRUE LIMIT 1
  `;
  if (!users.length) return "missing";
  const userId = users[0].id as string;
  const recent = await getDatabase()`
    SELECT token_hash FROM password_reset_tokens
    WHERE user_id = ${userId} AND created_at > NOW() - INTERVAL '1 minute'
    LIMIT 1
  `;
  if (recent.length) return "limited";
  await getDatabase()`
    INSERT INTO password_reset_tokens (token_hash, user_id, expires_at)
    VALUES (${tokenHash}, ${userId}, NOW() + INTERVAL '30 minutes')
  `;
  return "sent";
}

export async function resetStaffPassword(
  tokenHash: string,
  passwordHash: string,
): Promise<boolean> {
  await ensureDatabase();
  const rows = await getDatabase()`
    WITH valid_token AS (
      UPDATE password_reset_tokens
      SET used_at = NOW()
      WHERE token_hash = ${tokenHash}
        AND used_at IS NULL
        AND expires_at > NOW()
        AND EXISTS (
          SELECT 1 FROM staff_users
          WHERE staff_users.id = password_reset_tokens.user_id
            AND staff_users.is_active = TRUE
        )
      RETURNING user_id
    )
    UPDATE staff_users
    SET password_hash = ${passwordHash}
    WHERE id = (SELECT user_id FROM valid_token)
    RETURNING id
  `;
  return rows.length > 0;
}

export async function updateStaffProfile(
  id: string,
  name: string,
): Promise<StaffUser | undefined> {
  await ensureDatabase();
  const rows = await getDatabase()`
    UPDATE staff_users SET name = ${name}
    WHERE id = ${id} AND is_active = TRUE
    RETURNING id, email, name, role, is_active, created_at
  `;
  return rows.length ? toStaffUser(rows[0] as StaffUserRow) : undefined;
}

export async function updateStaffPassword(
  id: string,
  passwordHash: string,
): Promise<boolean> {
  await ensureDatabase();
  const rows = await getDatabase()`
    UPDATE staff_users SET password_hash = ${passwordHash}
    WHERE id = ${id} AND is_active = TRUE
    RETURNING id
  `;
  return rows.length > 0;
}

export async function claimPublicInquiry(ipHash: string): Promise<boolean> {
  await ensureDatabase();
  const rows = await getDatabase()`
    INSERT INTO public_inquiry_rate_limits (ip_hash, window_started_at, request_count)
    VALUES (${ipHash}, NOW(), 1)
    ON CONFLICT (ip_hash) DO UPDATE SET
      request_count = CASE
        WHEN public_inquiry_rate_limits.window_started_at < NOW() - INTERVAL '1 hour' THEN 1
        ELSE public_inquiry_rate_limits.request_count + 1
      END,
      window_started_at = CASE
        WHEN public_inquiry_rate_limits.window_started_at < NOW() - INTERVAL '1 hour' THEN NOW()
        ELSE public_inquiry_rate_limits.window_started_at
      END
    RETURNING request_count
  `;
  return Number(rows[0].request_count) <= 5;
}
