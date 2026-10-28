import { ADSENSE_PUBLISHER_ID } from "@/lib/site";

// /ads.txt — generated so it is always consistent with the deployed config.
// Set NEXT_PUBLIC_ADSENSE_PUBLISHER_ID (e.g. "pub-1234567890123456") after
// AdSense approval and the authoritative line appears automatically.

export const dynamic = "force-static";

export function GET() {
  const raw = (ADSENSE_PUBLISHER_ID || "").trim();
  const id = raw && !raw.startsWith("pub-") ? `pub-${raw.replace(/^pub/i, "")}` : raw;

  const body = id
    ? `# Tools Stars — ads.txt\ngoogle.com, ${id}, DIRECT, f08c47fec0942fa0\n`
    : [
        "# Tools Stars — ads.txt",
        "#",
        "# No advertising inventory is authorised for this domain yet.",
        "#",
        "# After Google AdSense approval, set the build-time variable",
        "# NEXT_PUBLIC_ADSENSE_PUBLISHER_ID to your publisher id (the pub-",
        "# number shown in AdSense under Account > Settings > Account",
        "# information) and redeploy. This file then publishes the matching",
        "# DIRECT authorisation record for google.com automatically.",
        "",
      ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, must-revalidate",
    },
  });
}
