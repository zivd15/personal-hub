/**
 * Cloudflare Pages Function — WhatsApp chatbot webhook
 *
 * Supported commands (send via WhatsApp):
 *   help              — show all commands
 *
 *   tasks             — list open tasks (numbered)
 *   task <text>       — add a new task
 *   done <n>          — mark task #n as complete
 *   delete task <n>   — delete task #n
 *
 *   notes             — list recent notes
 *   note <text>       — add a sticky note
 *
 *   shop              — list grocery items still to buy
 *   buy <item>        — add item to grocery list (e.g. "buy 2 kg flour")
 *   got <n>           — mark grocery item #n as bought
 *
 * Required env vars (set in Cloudflare Pages → Settings → Environment variables):
 *   WHATSAPP_VERIFY_TOKEN    — arbitrary secret used during webhook registration
 *   WHATSAPP_ACCESS_TOKEN    — Meta app access token (System User or temp token)
 *   WHATSAPP_PHONE_NUMBER_ID — phone number ID from Meta Developer console
 *   SUPABASE_URL             — your Supabase project URL
 *   SUPABASE_SERVICE_KEY     — Supabase service-role key (bypasses RLS)
 *
 * Optional env vars:
 *   ALLOWED_PHONE            — only respond to this WhatsApp number (e.g. "972501234567")
 *   SHOP_LIST_ID             — UUID of the grocery list to use; a "Shopping" list is
 *                              auto-created when this is absent
 */

interface Env {
  WHATSAPP_VERIFY_TOKEN: string;
  WHATSAPP_ACCESS_TOKEN: string;
  WHATSAPP_PHONE_NUMBER_ID: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_KEY: string;
  ALLOWED_PHONE?: string;
  SHOP_LIST_ID?: string;
}

// ── Minimal Cloudflare Pages Function context type ──────────────────────────

interface PagesContext {
  request: Request;
  env: Env;
}

// ── WhatsApp Cloud API payload types ────────────────────────────────────────

interface WaTextMessage {
  from: string;
  type: "text";
  text: { body: string };
}

interface WaWebhookBody {
  entry?: Array<{
    changes?: Array<{
      value?: {
        messages?: WaTextMessage[];
      };
    }>;
  }>;
}

// ── Supabase row types ───────────────────────────────────────────────────────

interface TaskRow {
  id: string;
  text: string;
  due_date: string | null;
}

interface NoteRow {
  content: string;
}

interface GroceryListRow {
  id: string;
}

interface GroceryItemRow {
  id: string;
  name: string;
  quantity: string | null;
  unit: string | null;
  status: string;
}

// ── Constants ────────────────────────────────────────────────────────────────

/** Maximum characters shown per note in the *notes* listing. */
const MAX_NOTE_PREVIEW_LENGTH = 100;

// ── Help text ────────────────────────────────────────────────────────────────

const HELP = `*Personal Hub Bot* 🤖

*Tasks*
  tasks — list open tasks
  task <text> — add task
  done <n> — complete task #n
  delete task <n> — delete task #n

*Notes*
  notes — list recent notes
  note <text> — add note

*Shopping*
  shop — list items to buy
  buy <item> — add grocery item
    e.g. buy 2 kg flour
  got <n> — mark item #n as bought

Type *help* to see this again.`;

// ── Entry point ──────────────────────────────────────────────────────────────

export async function onRequest(ctx: PagesContext): Promise<Response> {
  const { request, env } = ctx;

  if (request.method === "GET") {
    return verifyWebhook(request, env);
  }

  if (request.method === "POST") {
    try {
      return await handleWebhook(request, env);
    } catch (err) {
      console.error("[whatsapp] unhandled error:", err);
      // Always return 200 to WhatsApp so it doesn't retry endlessly
      return new Response("OK", { status: 200 });
    }
  }

  return new Response("Method not allowed", { status: 405 });
}

// ── Webhook verification (GET) ───────────────────────────────────────────────

function verifyWebhook(request: Request, env: Env): Response {
  const url = new URL(request.url);
  const mode = url.searchParams.get("hub.mode");
  const token = url.searchParams.get("hub.verify_token");
  const challenge = url.searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === env.WHATSAPP_VERIFY_TOKEN) {
    return new Response(challenge ?? "", { status: 200 });
  }

  return new Response("Forbidden", { status: 403 });
}

// ── Incoming message (POST) ──────────────────────────────────────────────────

async function handleWebhook(request: Request, env: Env): Promise<Response> {
  const body = (await request.json()) as WaWebhookBody;
  const message = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];

  if (!message || message.type !== "text") {
    return new Response("OK", { status: 200 });
  }

  const from = message.from;
  const text = message.text.body.trim();

  // Optional phone-number allowlist
  if (env.ALLOWED_PHONE && from !== env.ALLOWED_PHONE) {
    return new Response("OK", { status: 200 });
  }

  const reply = await processCommand(text, env);
  await sendMessage(from, reply, env);

  return new Response("OK", { status: 200 });
}

// ── Command router ───────────────────────────────────────────────────────────

async function processCommand(text: string, env: Env): Promise<string> {
  const lower = text.toLowerCase().trim();

  if (lower === "help" || lower === "?") return HELP;

  // Tasks
  if (lower === "tasks" || lower === "list tasks") return listTasks(env);
  if (/^(add task|task) .+/i.test(text)) {
    return addTask(text.replace(/^(add task|task) /i, "").trim(), env);
  }
  if (/^done \d+$/.test(lower)) {
    return completeTask(parseInt(lower.split(" ")[1]), env);
  }
  if (/^delete task \d+$/.test(lower)) {
    return deleteTask(parseInt(lower.split(" ")[2]), env);
  }

  // Notes
  if (lower === "notes" || lower === "list notes") return listNotes(env);
  if (/^(add note|note) .+/i.test(text)) {
    return addNote(text.replace(/^(add note|note) /i, "").trim(), env);
  }

  // Shopping
  if (lower === "shop" || lower === "shopping" || lower === "list shopping") {
    return listShop(env);
  }
  if (/^buy .+/i.test(text)) {
    return addShopItem(text.replace(/^buy /i, "").trim(), env);
  }
  if (/^got \d+$/.test(lower)) {
    return markBought(parseInt(lower.split(" ")[1]), env);
  }

  return "Unknown command. Type *help* to see available commands.";
}

// ── Task commands ────────────────────────────────────────────────────────────

async function listTasks(env: Env): Promise<string> {
  const rows = await supabaseGet<TaskRow>(
    env,
    "tasks",
    "completed=eq.false&order=created_at.asc&select=id,text,due_date",
  );

  if (rows.length === 0) return "✅ No open tasks!";

  const lines = rows.map((t, i) => {
    const due = t.due_date ? ` _(due ${t.due_date})_` : "";
    return `${i + 1}. ${t.text}${due}`;
  });

  return `📋 *Open tasks:*\n${lines.join("\n")}`;
}

async function addTask(text: string, env: Env): Promise<string> {
  await supabasePost(env, "tasks", { text, completed: false, due_date: null });
  return `✅ Task added: "${text}"`;
}

async function completeTask(n: number, env: Env): Promise<string> {
  const rows = await supabaseGet<TaskRow>(
    env,
    "tasks",
    "completed=eq.false&order=created_at.asc&select=id,text",
  );

  const task = rows[n - 1];
  if (!task) return `❌ Task #${n} not found. Type *tasks* to see your list.`;

  await supabasePatch(env, "tasks", `id=eq.${task.id}`, { completed: true });
  return `✅ Done: "${task.text}"`;
}

async function deleteTask(n: number, env: Env): Promise<string> {
  const rows = await supabaseGet<TaskRow>(
    env,
    "tasks",
    "completed=eq.false&order=created_at.asc&select=id,text",
  );

  const task = rows[n - 1];
  if (!task) return `❌ Task #${n} not found. Type *tasks* to see your list.`;

  await supabaseDelete(env, "tasks", `id=eq.${task.id}`);
  return `🗑️ Deleted: "${task.text}"`;
}

// ── Note commands ────────────────────────────────────────────────────────────

async function listNotes(env: Env): Promise<string> {
  const rows = await supabaseGet<NoteRow>(
    env,
    "notes",
    "order=updated_at.desc&limit=5&select=content",
  );

  if (rows.length === 0) return "📝 No notes yet.";

  const lines = rows.map((n, i) => `${i + 1}. ${n.content.slice(0, MAX_NOTE_PREVIEW_LENGTH)}`);
  return `📝 *Recent notes:*\n${lines.join("\n")}`;
}

async function addNote(content: string, env: Env): Promise<string> {
  await supabasePost(env, "notes", { content, color: "yellow" });
  return `📝 Note added: "${content}"`;
}

// ── Shopping commands ────────────────────────────────────────────────────────

async function resolveShopListId(env: Env): Promise<string | null> {
  if (env.SHOP_LIST_ID) return env.SHOP_LIST_ID;

  // Try to find an existing "Shopping" list
  const existing = await supabaseGet<GroceryListRow>(
    env,
    "grocery_lists",
    "name=eq.Shopping&select=id&limit=1",
  );
  if (existing.length > 0) return existing[0].id;

  // Create one
  const created = await supabasePost<GroceryListRow>(
    env,
    "grocery_lists",
    { name: "Shopping" },
  );
  return created[0]?.id ?? null;
}

async function listShop(env: Env): Promise<string> {
  const listId = await resolveShopListId(env);
  if (!listId) return "❌ Could not find or create a shopping list.";

  const rows = await supabaseGet<GroceryItemRow>(
    env,
    "grocery_items",
    `list_id=eq.${listId}&status=neq.bought&order=created_at.asc&select=id,name,quantity,unit,status`,
  );

  if (rows.length === 0) return "🛒 Shopping list is empty!";

  const lines = rows.map((item, i) => {
    const qty = item.quantity
      ? ` (${item.quantity}${item.unit ? " " + item.unit : ""})`
      : "";
    const partial = item.status === "partial" ? " ~partial" : "";
    return `${i + 1}. ${item.name}${qty}${partial}`;
  });

  return `🛒 *Shopping list:*\n${lines.join("\n")}`;
}

async function addShopItem(raw: string, env: Env): Promise<string> {
  const listId = await resolveShopListId(env);
  if (!listId) return "❌ Could not find or create a shopping list.";

  // Parse optional leading quantity: "2 kg flour" → qty=2, unit=kg, name=flour
  let name = raw;
  let quantity: string | null = null;
  let unit: string | null = null;

  // Parse optional leading quantity and unit from the raw input.
  // Pattern: <number> [<unit>] <name>
  //   group 1 — quantity  (integer or decimal, e.g. "2" or "1.5")
  //   group 2 — unit      (letters only, optional, e.g. "kg", "l")
  //   group 3 — item name (remainder, e.g. "flour")
  // Examples: "2 kg flour" → qty=2, unit=kg, name=flour
  //           "3 apples"   → qty=3, unit=null, name=apples
  //           "milk"       → no match, treated as name only
  const match = raw.match(/^(\d+(?:\.\d+)?)\s*([a-zA-Z]+)?\s+(.+)$/);
  if (match) {
    quantity = match[1];
    unit = match[2] ?? null;
    name = match[3];
  }

  await supabasePost(env, "grocery_items", {
    list_id: listId,
    name,
    quantity,
    unit,
    status: "notbought",
  });

  return `🛒 Added: "${raw}"`;
}

async function markBought(n: number, env: Env): Promise<string> {
  const listId = await resolveShopListId(env);
  if (!listId) return "❌ Could not find or create a shopping list.";

  const rows = await supabaseGet<GroceryItemRow>(
    env,
    "grocery_items",
    `list_id=eq.${listId}&status=neq.bought&order=created_at.asc&select=id,name`,
  );

  const item = rows[n - 1];
  if (!item) return `❌ Item #${n} not found. Type *shop* to see your list.`;

  await supabasePatch(env, "grocery_items", `id=eq.${item.id}`, { status: "bought" });
  return `✅ Got: "${item.name}"`;
}

// ── Supabase REST helpers ────────────────────────────────────────────────────

function supabaseHeaders(env: Env): HeadersInit {
  return {
    apikey: env.SUPABASE_SERVICE_KEY,
    Authorization: `Bearer ${env.SUPABASE_SERVICE_KEY}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  };
}

async function supabaseGet<T>(env: Env, table: string, query: string): Promise<T[]> {
  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/${table}?${query}`, {
    headers: supabaseHeaders(env),
  });
  if (!res.ok) {
    console.error(`[supabase] GET ${table} failed:`, res.status, await res.text());
    return [];
  }
  return (await res.json()) as T[];
}

async function supabasePost<T>(env: Env, table: string, body: object): Promise<T[]> {
  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/${table}`, {
    method: "POST",
    headers: supabaseHeaders(env),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const msg = await res.text();
    console.error(`[supabase] POST ${table} failed:`, res.status, msg);
    throw new Error(`Supabase POST ${table}: ${msg}`);
  }
  return (await res.json()) as T[];
}

async function supabasePatch(
  env: Env,
  table: string,
  filter: string,
  body: object,
): Promise<void> {
  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/${table}?${filter}`, {
    method: "PATCH",
    headers: supabaseHeaders(env),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    console.error(`[supabase] PATCH ${table} failed:`, res.status, await res.text());
  }
}

async function supabaseDelete(env: Env, table: string, filter: string): Promise<void> {
  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/${table}?${filter}`, {
    method: "DELETE",
    headers: supabaseHeaders(env),
  });
  if (!res.ok) {
    console.error(`[supabase] DELETE ${table} failed:`, res.status, await res.text());
  }
}

// ── WhatsApp send ────────────────────────────────────────────────────────────

async function sendMessage(to: string, text: string, env: Env): Promise<void> {
  const res = await fetch(
    `https://graph.facebook.com/v21.0/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.WHATSAPP_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body: text },
      }),
    },
  );

  if (!res.ok) {
    console.error("[whatsapp] sendMessage failed:", res.status, await res.text());
  }
}
