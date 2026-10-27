import { Icon } from "./icons";

// ─────────────────────────────────────────────────────────────────────────────
// Animated diagrams — pure SVG + CSS animations, rendered on the server.
// Zero JavaScript ships to the browser for these, so the page stays fast.
// ─────────────────────────────────────────────────────────────────────────────

function Chip({ children, tone = "slate" }) {
  const tones = {
    slate: "border-white/10 bg-white/[0.05] text-slate-300",
    gold: "border-amber-400/30 bg-amber-400/10 text-amber-200",
    green: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
    violet: "border-violet-400/30 bg-violet-400/10 text-violet-200",
    red: "border-rose-400/30 bg-rose-400/10 text-rose-200",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}

/* 1 ── How it works: Upload → Process on device → Download ───────────────── */
export function FlowDiagram() {
  const steps = [
    {
      icon: "upload",
      title: "1. Drop your file",
      text: "Drag & drop or tap to choose. The file opens locally — it is never uploaded anywhere.",
      tone: "from-sky-400 to-cyan-300",
    },
    {
      icon: "cpu",
      title: "2. Your browser does the work",
      text: "Modern in-browser engines (Canvas, WebAssembly & on-device AI) process everything on your machine.",
      tone: "from-amber-400 to-orange-400",
    },
    {
      icon: "download",
      title: "3. Download instantly",
      text: "No queue, no email, no watermark. Your finished file is ready the second processing ends.",
      tone: "from-emerald-400 to-teal-300",
    },
  ];
  return (
    <div className="relative">
      {/* animated connector (desktop) */}
      <svg
        className="absolute left-0 right-0 top-10 hidden md:block w-full"
        height="24"
        viewBox="0 0 900 24"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M40 12 H860" stroke="rgba(255,197,49,.35)" strokeWidth="2" className="flow-dash" fill="none" />
        <circle r="5" fill="#ffc531">
          <animateMotion dur="3.2s" repeatCount="indefinite" path="M40 12 H860" />
        </circle>
        <circle r="3.5" fill="#22d3ee">
          <animateMotion dur="3.2s" begin="1.1s" repeatCount="indefinite" path="M40 12 H860" />
        </circle>
        <circle r="3.5" fill="#a78bfa">
          <animateMotion dur="3.2s" begin="2.1s" repeatCount="indefinite" path="M40 12 H860" />
        </circle>
      </svg>

      <div className="relative grid gap-8 md:grid-cols-3">
        {steps.map((s, i) => (
          <div key={s.title} className="flex flex-col items-center text-center px-2">
            <span
              className={`anim-bob relative grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br ${s.tone} text-[#101223] shadow-2xl`}
              style={{ animationDelay: `${i * 0.55}s` }}
            >
              <Icon name={s.icon} size={36} strokeWidth={1.9} />
              {i === 1 && (
                <span className="anim-ring absolute inset-0 rounded-3xl" aria-hidden="true" />
              )}
            </span>
            <h3 className="mt-5 text-lg font-bold text-white">{s.title}</h3>
            <p className="mt-2 max-w-xs text-sm leading-relaxed text-slate-400">{s.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* 2 ── Video compression diagram ──────────────────────────────────────────── */
function FilmStrip() {
  const frames = Array.from({ length: 8 }, (_, i) => i);
  return (
    <div className="overflow-hidden rounded-lg bg-black/50 py-1.5" aria-hidden="true">
      <div className="anim-film flex w-[200%] gap-1.5 px-1.5">
        {[...frames, ...frames].map((f, i) => (
          <div
            key={i}
            className="grid h-10 w-14 shrink-0 place-items-center rounded-md text-[9px] font-bold text-white/90"
            style={{
              background: `linear-gradient(135deg, hsl(${210 + f * 18} 80% 45%), hsl(${280 + f * 10} 75% 50%))`,
            }}
          >
            ▶ {String(f + 1).padStart(2, "0")}
          </div>
        ))}
      </div>
    </div>
  );
}

export function VideoDiagram() {
  const bars = [100, 88, 76, 62, 48, 36, 26, 18];
  return (
    <figure className="dotgrid relative overflow-hidden rounded-3xl border border-white/[0.09] bg-[#0a0d20]/90 p-5 sm:p-7">
      <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-rose-500/15 blur-3xl" aria-hidden="true" />

      <div className="relative grid items-center gap-6 lg:grid-cols-[1fr_auto_1fr]">
        {/* input */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <Chip tone="red"><Icon name="video" size={12} /> INPUT</Chip>
            <span className="text-sm font-extrabold text-rose-300">248 MB</span>
          </div>
          <div className="rounded-2xl border border-rose-400/25 bg-black/40 p-3">
            <FilmStrip />
            <div className="mt-3 space-y-1.5 text-[11px] text-slate-400">
              <div className="flex justify-between"><span>Resolution</span><span className="font-semibold text-slate-200">3840 × 2160 (4K)</span></div>
              <div className="flex justify-between"><span>Bitrate</span><span className="font-semibold text-slate-200">45 Mbps</span></div>
              <div className="flex justify-between"><span>Every frame stored in full</span><span className="font-semibold text-rose-300">Huge file</span></div>
            </div>
          </div>
        </div>

        {/* compressor core */}
        <div className="mx-auto flex flex-col items-center" aria-hidden="true">
          <svg width="54" height="26" viewBox="0 0 54 26" className="hidden lg:block text-amber-400">
            <path d="M2 13 H44 M36 5 L46 13 L36 21" stroke="currentColor" strokeWidth="2.5" fill="none" className="flow-dash" strokeLinecap="round" />
          </svg>
          <div className="relative my-2 grid h-24 w-24 place-items-center">
            <span className="anim-spin-slow absolute inset-0 rounded-full border-2 border-dashed border-amber-400/50" />
            <span className="absolute inset-2 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-xl shadow-amber-500/30" />
            <span className="relative text-[#241a00]"><Icon name="compress" size={34} strokeWidth={2.1} /></span>
          </div>
          <p className="text-center text-[11px] font-bold uppercase tracking-widest text-amber-300">Smart<br />Compressor</p>
          {/* falling bitrate EQ */}
          <div className="mt-3 flex h-12 items-end gap-1">
            {bars.map((h, i) => (
              <span
                key={i}
                className="anim-eq w-2 rounded-t bg-gradient-to-t from-rose-500 via-amber-400 to-emerald-400"
                style={{ height: `${h}%`, animationDelay: `${i * 0.14}s` }}
              />
            ))}
          </div>
          <p className="mt-1.5 text-[10px] font-semibold text-slate-500">bitrate ↓ quality kept</p>
          <svg width="54" height="26" viewBox="0 0 54 26" className="hidden lg:block text-emerald-400 mt-1">
            <path d="M2 13 H44 M36 5 L46 13 L36 21" stroke="currentColor" strokeWidth="2.5" fill="none" className="flow-dash" strokeLinecap="round" />
          </svg>
        </div>

        {/* output */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <Chip tone="green"><Icon name="check" size={12} /> OUTPUT</Chip>
            <span className="text-sm font-extrabold text-emerald-300">21 MB · −92%</span>
          </div>
          <div className="rounded-2xl border border-emerald-400/25 bg-black/40 p-3">
            <div className="anim-shrink mx-auto w-4/5">
              <FilmStrip />
            </div>
            <div className="mt-3 space-y-1.5 text-[11px] text-slate-400">
              <div className="flex justify-between"><span>Resolution</span><span className="font-semibold text-slate-200">1280 × 720 (HD)</span></div>
              <div className="flex justify-between"><span>Bitrate</span><span className="font-semibold text-slate-200">2.4 Mbps</span></div>
              <div className="flex justify-between"><span>Only frame changes stored</span><span className="font-semibold text-emerald-300">Tiny file</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* size bar */}
      <div className="relative mt-6" aria-hidden="true">
        <div className="flex justify-between text-[11px] font-semibold text-slate-400 mb-1.5">
          <span>Original size</span><span className="text-emerald-300">After compression → 21 MB</span>
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-white/[0.07]">
          <div className="anim-barshrink h-full rounded-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400" />
        </div>
      </div>

      <figcaption className="relative mt-5 flex flex-wrap gap-2">
        <Chip>① Frames analysed one by one</Chip>
        <Chip>② Repeated pixels stored once</Chip>
        <Chip>③ Re-encoded at a smart bitrate</Chip>
        <Chip tone="gold">Result: same looking video, fraction of the size</Chip>
      </figcaption>
    </figure>
  );
}

/* 3 ── Background removal diagram ─────────────────────────────────────────── */
function Person({ className = "", color = "#0b0e1f" }) {
  return (
    <svg viewBox="0 0 100 110" className={className} aria-hidden="true">
      <circle cx="50" cy="24" r="13" fill={color} />
      <path d="M50 40c-15 0-22 11-22 28v42h44V68c0-17-7-28-22-28z" fill={color} />
      <path d="M28 66c-6 8-8 20-7 30l8 1c0-10 1-19 4-26zM72 66c6 8 8 20 7 30l-8 1c0-10-1-19-4-26z" fill={color} opacity=".9" />
    </svg>
  );
}

function Scene() {
  return (
    <div className="absolute inset-0" aria-hidden="true">
      <div className="absolute inset-0 bg-gradient-to-b from-sky-400 via-sky-300 to-amber-100" />
      <span className="absolute right-5 top-4 h-9 w-9 rounded-full bg-yellow-200 shadow-[0_0_24px_8px_rgba(253,224,71,.8)]" />
      <svg viewBox="0 0 300 90" preserveAspectRatio="none" className="absolute bottom-0 left-0 h-2/5 w-full">
        <polygon points="0,90 70,25 130,90" fill="#64748b" />
        <polygon points="90,90 180,10 260,90" fill="#475569" />
        <polygon points="200,90 260,35 300,90" fill="#64748b" />
        <rect y="78" width="300" height="12" fill="#65a30d" />
      </svg>
      <span className="absolute left-4 top-6 h-4 w-14 rounded-full bg-white/85 blur-[1px]" />
      <span className="absolute left-10 top-10 h-3 w-10 rounded-full bg-white/70 blur-[1px]" />
    </div>
  );
}

export function BgDiagram() {
  return (
    <figure className="dotgrid relative overflow-hidden rounded-3xl border border-white/[0.09] bg-[#0a0d20]/90 p-5 sm:p-7">
      <div className="pointer-events-none absolute -left-16 -top-16 h-48 w-48 rounded-full bg-violet-500/15 blur-3xl" aria-hidden="true" />

      <div className="relative">
        <div className="mb-3 flex items-center justify-between">
          <Chip><Icon name="image" size={12} /> ORIGINAL PHOTO</Chip>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-violet-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-400" />
            </span>
            AI SCANNING…
          </span>
          <Chip tone="violet"><Icon name="sparkles" size={12} /> TRANSPARENT PNG</Chip>
        </div>

        {/* wipe stage */}
        <div className="relative mx-auto aspect-[4/3] max-w-xl overflow-hidden rounded-2xl border border-white/15 shadow-2xl">
          {/* before */}
          <Scene />
          <Person className="absolute bottom-1 left-1/2 h-[76%] -translate-x-1/2 drop-shadow-[0_6px_10px_rgba(0,0,0,.45)]" color="#1e293b" />

          {/* after (revealed by wipe) */}
          <div className="anim-reveal absolute inset-0">
            <div className="checker-light absolute inset-0" />
            <Person className="absolute bottom-1 left-1/2 h-[76%] -translate-x-1/2 drop-shadow-[0_0_0.5px_rgba(124,92,255,.9)] drop-shadow-[0_8px_14px_rgba(0,0,0,.35)]" color="#1e293b" />
            {/* dashed AI mask outline */}
            <svg viewBox="0 0 100 110" className="absolute bottom-1 left-1/2 h-[79%] -translate-x-1/2" aria-hidden="true">
              <circle cx="50" cy="24" r="15.5" fill="none" stroke="#7c5cff" strokeWidth="1.4" strokeDasharray="4 3" className="flow-dash" />
              <path d="M50 37c-17 0-25 12-25 31v42h50V68c0-19-8-31-25-31z" fill="none" stroke="#7c5cff" strokeWidth="1.4" strokeDasharray="4 3" className="flow-dash" />
            </svg>
          </div>

          {/* wipe + scan lines */}
          <span className="anim-wipe absolute top-0 bottom-0 w-[3px] bg-violet-400 shadow-[0_0_18px_4px_rgba(167,139,250,.8)]" aria-hidden="true" />
          <span className="anim-scan absolute left-0 right-0 h-[3px] bg-cyan-300/90 shadow-[0_0_16px_4px_rgba(34,211,238,.75)]" aria-hidden="true" />

          <span className="absolute left-3 top-3 rounded-md bg-black/55 px-2 py-1 text-[10px] font-bold tracking-wide text-white">BEFORE</span>
          <span className="absolute right-3 top-3 rounded-md bg-violet-600/85 px-2 py-1 text-[10px] font-bold tracking-wide text-white">AFTER</span>
        </div>

        {/* pipeline */}
        <div className="mx-auto mt-5 grid max-w-xl grid-cols-2 gap-2 text-center sm:grid-cols-4" aria-hidden="true">
          {[
            ["search", "Finds the subject"],
            ["layers", "Builds an alpha mask"],
            ["wand", "Refines hair & edges"],
            ["download", "Exports transparent PNG"],
          ].map(([icon, label], i) => (
            <div key={label} className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-2 py-2.5">
              <span className="anim-bob mx-auto grid h-8 w-8 place-items-center rounded-lg bg-violet-500/15 text-violet-300" style={{ animationDelay: `${i * 0.4}s` }}>
                <Icon name={icon} size={17} />
              </span>
              <p className="mt-1.5 text-[11px] font-semibold leading-tight text-slate-300">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <figcaption className="relative mt-5 flex flex-wrap gap-2">
        <Chip tone="violet">On-device AI model — your photo never leaves the browser</Chip>
        <Chip>Works for people, products, pets, cars & logos</Chip>
      </figcaption>
    </figure>
  );
}

/* 4 ── Image compression diagram ──────────────────────────────────────────── */
export function ImageDiagram() {
  const pixels = Array.from({ length: 48 }, (_, i) => ({
    h: (i * 47) % 360,
    keep: i % 5 !== 3,
    d: (i % 8) * 0.22,
  }));
  return (
    <figure className="dotgrid relative overflow-hidden rounded-3xl border border-white/[0.09] bg-[#0a0d20]/90 p-5 sm:p-7">
      <div className="pointer-events-none absolute -right-16 -bottom-16 h-48 w-48 rounded-full bg-amber-500/15 blur-3xl" aria-hidden="true" />

      <div className="relative grid items-center gap-7 lg:grid-cols-[1fr_1fr]">
        {/* pixel grid */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <Chip tone="gold"><Icon name="grid" size={12} /> PIXEL DATA</Chip>
            <span className="text-[11px] font-semibold text-slate-400">invisible detail <span className="text-rose-300">fades out</span></span>
          </div>
          <div className="grid grid-cols-8 gap-1.5 rounded-2xl border border-white/10 bg-black/40 p-3" style={{ gridTemplateColumns: "repeat(8,1fr)" }} aria-hidden="true">
            {pixels.map((p, i) => (
              <span
                key={i}
                className="aspect-square rounded-[4px]"
                style={{
                  background: `hsl(${p.h} 75% 55%)`,
                  animation: p.keep ? "none" : `pixelFade 2.2s ease-in-out ${p.d}s infinite`,
                  opacity: p.keep ? 1 : undefined,
                }}
              />
            ))}
          </div>
          <p className="mt-2.5 text-[11px] leading-relaxed text-slate-500">
            Smart quantization keeps the colours your eyes can see and discards the
            near-identical shades they can&apos;t.
          </p>
        </div>

        {/* slider + sizes */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <Chip><Icon name="gauge" size={12} /> QUALITY SLIDER</Chip>
            <span className="text-[11px] font-bold text-amber-300">you stay in control</span>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
            <div className="relative h-2.5 rounded-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400" aria-hidden="true">
              <span className="anim-thumb absolute -top-[7px] h-6 w-6 -translate-x-1/2 rounded-full border-[3px] border-white bg-[#12152e] shadow-lg" />
            </div>
            <div className="mt-2 flex justify-between text-[10px] font-semibold text-slate-500">
              <span>SMALLEST FILE</span><span>BALANCED ★</span><span>BEST QUALITY</span>
            </div>

            <div className="mt-5 space-y-3" aria-hidden="true">
              <div>
                <div className="mb-1 flex justify-between text-[11px]"><span className="text-slate-400">photo.jpg — original</span><span className="font-bold text-rose-300">4.8 MB</span></div>
                <div className="h-2.5 rounded-full bg-rose-500/80" style={{ width: "100%" }} />
              </div>
              <div>
                <div className="mb-1 flex justify-between text-[11px]"><span className="text-slate-400">photo-compressed.jpg</span><span className="font-bold text-emerald-300">612 KB · −87%</span></div>
                <div className="h-2.5 rounded-full bg-emerald-400/90" style={{ width: "13%" }} />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-xl bg-emerald-400/10 border border-emerald-400/25 px-3 py-2 text-[11px] font-semibold text-emerald-200">
              <Icon name="check" size={14} /> Looks identical. Loads 8× faster. Perfect for web & WhatsApp.
            </div>
          </div>
        </div>
      </div>

      <figcaption className="relative mt-5 flex flex-wrap gap-2">
        <Chip>① Pick a quality level</Chip>
        <Chip>② Optional: resize dimensions</Chip>
        <Chip>③ Compare before / after live</Chip>
        <Chip tone="gold">Bulk mode: compress 50 images at once → one ZIP</Chip>
      </figcaption>
    </figure>
  );
}

/* 5 ── Privacy diagram: device vs server ──────────────────────────────────── */
export function PrivacyDiagram() {
  return (
    <figure className="dotgrid relative overflow-hidden rounded-3xl border border-white/[0.09] bg-[#0a0d20]/90 p-5 sm:p-7">
      <div className="relative grid items-center gap-6 md:grid-cols-[1.3fr_auto_1fr]">
        {/* your device */}
        <div className="rounded-2xl border border-emerald-400/25 bg-black/40 p-4">
          <div className="flex items-center justify-between">
            <Chip tone="green"><Icon name="shield" size={12} /> YOUR DEVICE</Chip>
            <span className="text-[10px] font-bold text-emerald-300">100% OF THE WORK</span>
          </div>
          {/* laptop */}
          <div className="mx-auto mt-4 max-w-[280px]" aria-hidden="true">
            <div className="rounded-t-xl border border-white/15 bg-[#12152e] p-3">
              <div className="flex items-center gap-1.5 pb-2">
                <span className="h-2 w-2 rounded-full bg-rose-400" /><span className="h-2 w-2 rounded-full bg-amber-400" /><span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="ml-2 rounded bg-white/[0.07] px-2 py-0.5 text-[9px] text-slate-400">toolsstars.com</span>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-black/40 p-3">
                <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-[#241a00]">
                  <Icon name="cpu" size={22} />
                  <span className="anim-ring absolute inset-0 rounded-xl" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-bold text-white">compressing video.mp4…</p>
                  <div className="mt-1.5 flex h-6 items-end gap-[3px]">
                    {[70, 95, 55, 85, 65, 100, 45, 80, 60, 90].map((h, i) => (
                      <span key={i} className="anim-eq w-1.5 rounded-t bg-amber-400" style={{ height: `${h}%`, animationDelay: `${i * 0.12}s` }} />
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-1.5 text-[10px] font-semibold text-emerald-300">
                <Icon name="lock" size={11} /> File stays here. Close the tab = file is gone.
              </div>
            </div>
            <div className="h-2.5 rounded-b-xl bg-white/[0.12]" />
          </div>
        </div>

        {/* blocked arrow */}
        <div className="mx-auto flex md:flex-col items-center gap-2" aria-hidden="true">
          <svg width="86" height="30" viewBox="0 0 86 30" className="text-rose-400 rotate-90 md:rotate-0">
            <path d="M4 15 H72 M62 6 L74 15 L62 24" stroke="currentColor" strokeWidth="2.5" strokeDasharray="5 6" fill="none" strokeLinecap="round" opacity=".55" />
          </svg>
          <span className="grid h-11 w-11 place-items-center rounded-full border-2 border-rose-400 bg-rose-500/15 text-rose-300 shadow-lg shadow-rose-500/20">
            <Icon name="x" size={20} strokeWidth={2.4} />
          </span>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-rose-300">No upload</span>
        </div>

        {/* server */}
        <div className="rounded-2xl border border-white/10 bg-black/30 p-4 opacity-80">
          <div className="flex items-center justify-between">
            <Chip>OUR SERVERS</Chip>
            <span className="text-[10px] font-bold text-slate-500">0% — IDLE</span>
          </div>
          <div className="mx-auto mt-4 max-w-[180px] space-y-2" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-slate-600" />
                <span className="h-1.5 flex-1 rounded bg-white/[0.08]" />
                <span className="text-[9px] font-bold text-slate-600">EMPTY</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-center text-[11px] text-slate-500">
            They only serve the web page itself — roughly the weight of one photo.
          </p>
        </div>
      </div>

      <figcaption className="relative mt-5 flex flex-wrap gap-2">
        <Chip tone="green">Works even after going offline (once loaded)</Chip>
        <Chip>No file ever crosses the network</Chip>
        <Chip tone="gold">That&apos;s why Tools Stars can be free & unlimited</Chip>
      </figcaption>
    </figure>
  );
}
