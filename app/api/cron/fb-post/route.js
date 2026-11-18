import { NextResponse } from "next/server";
import queue from "@/content/social-queue.json";

// Daily Facebook page publisher, driven by Vercel Cron (vercel.json).
// Content lives in content/social-queue.json — one entry per date; the
// cron posts today's entry and skips quietly when nothing is queued or
// the page credentials are not configured yet.
//
// Credentials stay in Vercel env vars (FB_PAGE_ID, FB_PAGE_TOKEN) that
// the owner pastes themselves — they never touch the repo or chat.
// An optional CRON_SECRET guards manual triggers; Vercel Cron sends it
// automatically on scheduled runs.
//
// Manual trigger / backfill (owner only):
//   curl -H "Authorization: Bearer $CRON_SECRET" \
//     "https://toolsstars.com/api/cron/fb-post?date=2026-11-17"

export async function GET(req) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization") || "";
  if (secret && auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const pageId = process.env.FB_PAGE_ID;
  const token = process.env.FB_PAGE_TOKEN;
  if (!pageId || !token) {
    return NextResponse.json({ skipped: "FB_PAGE_ID / FB_PAGE_TOKEN not configured" });
  }

  const want = req.nextUrl.searchParams.get("date");
  const today = new Date().toISOString().slice(0, 10);
  const date = want || today;
  const post = (Array.isArray(queue) ? queue : []).find((p) => p.date === date);
  if (!post) {
    return NextResponse.json({ skipped: `nothing queued for ${date}` });
  }

  const form = new URLSearchParams({ access_token: token, message: post.message });
  let endpoint = "feed";
  if (post.type === "photo" && post.image) {
    endpoint = "photos";
    form.set("url", post.image);
    if (post.link) form.set("link", post.link);
  } else if (post.link) {
    form.set("link", post.link);
  }

  const res = await fetch(`https://graph.facebook.com/v21.0/${pageId}/${endpoint}`, {
    method: "POST",
    body: form,
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json({
    posted: res.ok,
    status: res.status,
    date,
    postId: data.id || null,
    error: data.error ? { code: data.error.code, message: data.error.message } : null,
  });
}
