// Clean Slate: delete all rows in "articles" + remove ALL objects from the storage bucket.
// Requires env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, NEXT_PUBLIC_STORAGE_BUCKET

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucket = process.env.NEXT_PUBLIC_STORAGE_BUCKET || "article-images";

if (!url || !serviceKey) {
  console.error("Missing env: NEXT_PUBLIC_SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });

async function deleteAllArticles() {
  // PostgREST needs a filter; this matches every row
  const { error } = await supabase.from("articles").delete().not("id", "is", null);
  if (error) throw new Error("Delete articles failed: " + error.message);
  console.log("✓ Deleted all rows from 'articles'");
}

async function listRecursive(prefix = "") {
  const paths = [];
  const { data, error } = await supabase.storage.from(bucket).list(prefix, { limit: 1000 });
  if (error) throw new Error("List storage failed: " + error.message);

  for (const item of data || []) {
    const isFolder = !item.id && !item.metadata; // folders usually have no id/metadata
    const p = prefix ? `${prefix}/${item.name}` : item.name;
    if (isFolder) {
      const childPaths = await listRecursive(p);
      paths.push(...childPaths);
    } else {
      paths.push(p);
    }
  }
  return paths;
}

async function deleteAllObjects() {
  const allPaths = await listRecursive("");
  if (allPaths.length === 0) {
    console.log(`✓ Bucket '${bucket}' is already empty`);
    return;
  }
  const { error } = await supabase.storage.from(bucket).remove(allPaths);
  if (error) throw new Error("Remove storage objects failed: " + error.message);
  console.log(`✓ Deleted ${allPaths.length} object(s) from bucket '${bucket}'`);
}

(async () => {
  try {
    console.log("Starting Clean Slate…");
    await deleteAllArticles();
    await deleteAllObjects();
    console.log("✓ Clean Slate completed.");
  } catch (e) {
    console.error("Clean Slate failed:", e?.message || e);
    process.exit(1);
  }
})();
