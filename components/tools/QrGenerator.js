"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { Icon } from "@/components/icons";
import { downloadBlob } from "@/lib/utils";

const TEMPLATES = [
  { id: "url", label: "Website URL", placeholder: "https://your-website.com" },
  { id: "text", label: "Plain text", placeholder: "Type any text…" },
  { id: "wifi", label: "Wi-Fi", placeholder: "" },
  { id: "email", label: "Email", placeholder: "you@example.com" },
  { id: "phone", label: "Phone", placeholder: "+92 300 1234567" },
];

export default function QrGenerator() {
  const [kind, setKind] = useState("url");
  const [value, setValue] = useState("https://toolsstars.com");
  const [ssid, setSsid] = useState("");
  const [wifiPass, setWifiPass] = useState("");
  const [size, setSize] = useState(1024);
  const [fg, setFg] = useState("#0b0e1f");
  const [bg, setBg] = useState("#ffffff");
  const [level, setLevel] = useState("M");
  const [dataUrl, setDataUrl] = useState("");
  const [error, setError] = useState("");

  const content =
    kind === "wifi"
      ? `WIFI:T:WPA;S:${ssid.replace(/([\\;,:"'])/g, "\\$1")};P:${wifiPass.replace(/([\\;,:"'])/g, "\\$1")};;`
      : kind === "email"
        ? `mailto:${value.trim()}`
        : kind === "phone"
          ? `tel:${value.replace(/[\s()-]/g, "")}`
          : value;

  useEffect(() => {
    let cancelled = false;
    const t = setTimeout(async () => {
      if (!content.trim() || (kind === "wifi" && !ssid.trim())) {
        setDataUrl("");
        setError(kind === "wifi" ? "Enter your Wi-Fi network name (SSID)." : "Type something to generate a QR code.");
        return;
      }
      try {
        const url = await QRCode.toDataURL(content, {
          width: 640,
          margin: 2,
          errorCorrectionLevel: level,
          color: { dark: fg, light: bg },
        });
        if (!cancelled) { setDataUrl(url); setError(""); }
      } catch {
        if (!cancelled) setError("That content is too long for a QR code — try shortening it or lowering error correction.");
      }
    }, 220);
    return () => { cancelled = true; clearTimeout(t); };
  }, [content, fg, bg, level, kind, ssid]);

  const downloadPng = async () => {
    const url = await QRCode.toDataURL(content, { width: size, margin: 2, errorCorrectionLevel: level, color: { dark: fg, light: bg } });
    const blob = await (await fetch(url)).blob();
    downloadBlob(blob, "toolsstars-qr-code.png");
  };
  const downloadSvg = async () => {
    const svg = await QRCode.toString(content, { type: "svg", margin: 2, errorCorrectionLevel: level, color: { dark: fg, light: bg } });
    downloadBlob(new Blob([svg], { type: "image/svg+xml" }), "toolsstars-qr-code.svg");
  };

  const activeTemplate = TEMPLATES.find((t) => t.id === kind);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.25fr_1fr]">
      <div>
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="QR content type">
          {TEMPLATES.map((t) => (
            <button key={t.id} role="tab" aria-selected={kind === t.id} onClick={() => setKind(t.id)}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition ${kind === t.id ? "bg-amber-400 text-[#241a00]" : "border border-white/10 bg-white/[0.04] text-slate-300 hover:border-amber-400/40"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {kind === "wifi" ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="ssid" className="text-sm font-semibold text-white">Network name (SSID)</label>
              <input id="ssid" value={ssid} onChange={(e) => setSsid(e.target.value)} placeholder="MyHomeWiFi"
                className="mt-2 w-full rounded-xl border border-white/10 bg-[#12152e] px-3.5 py-2.5 text-white placeholder:text-slate-500 outline-none focus:border-amber-400/60" />
            </div>
            <div>
              <label htmlFor="wpass" className="text-sm font-semibold text-white">Wi-Fi password</label>
              <input id="wpass" value={wifiPass} onChange={(e) => setWifiPass(e.target.value)} placeholder="••••••••"
                className="mt-2 w-full rounded-xl border border-white/10 bg-[#12152e] px-3.5 py-2.5 text-white placeholder:text-slate-500 outline-none focus:border-amber-400/60" />
            </div>
            <p className="sm:col-span-2 text-xs text-slate-500">Guests scan the code and join instantly — no typing. The password is encoded locally, never sent anywhere.</p>
          </div>
        ) : (
          <div className="mt-5">
            <label htmlFor="qrtext" className="text-sm font-semibold text-white">{activeTemplate.label}</label>
            <textarea id="qrtext" value={value} onChange={(e) => setValue(e.target.value)} rows={3} placeholder={activeTemplate.placeholder}
              className="mt-2 w-full rounded-xl border border-white/10 bg-[#12152e] px-3.5 py-2.5 text-white placeholder:text-slate-500 outline-none focus:border-amber-400/60" />
          </div>
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <label className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-sm font-semibold text-white">
            QR colour
            <input type="color" value={fg} onChange={(e) => setFg(e.target.value)} className="h-8 w-11 cursor-pointer rounded-lg border border-white/15 bg-transparent" />
          </label>
          <label className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-sm font-semibold text-white">
            Background
            <input type="color" value={bg} onChange={(e) => setBg(e.target.value)} className="h-8 w-11 cursor-pointer rounded-lg border border-white/15 bg-transparent" />
          </label>
          <div>
            <label htmlFor="qsize" className="text-sm font-semibold text-white">Download size</label>
            <select id="qsize" value={size} onChange={(e) => setSize(+e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-[#12152e] px-3 py-2.5 text-sm text-white outline-none focus:border-amber-400/60">
              <option value={512}>512 px — screen</option>
              <option value={1024}>1024 px — standard</option>
              <option value={2048}>2048 px — print</option>
              <option value={4096}>4096 px — large print</option>
            </select>
          </div>
          <div>
            <label htmlFor="qlevel" className="text-sm font-semibold text-white">Error correction</label>
            <select id="qlevel" value={level} onChange={(e) => setLevel(e.target.value)}
              className="mt-2 w-full rounded-xl border border-white/10 bg-[#12152e] px-3 py-2.5 text-sm text-white outline-none focus:border-amber-400/60">
              <option value="L">Low (L) — smallest code</option>
              <option value="M">Medium (M) ★</option>
              <option value="Q">Quartile (Q)</option>
              <option value="H">High (H) — survives damage</option>
            </select>
          </div>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-slate-500">
          Tip: keep strong contrast (dark code on light background) so every phone camera can scan it. Always test-scan before printing.
        </p>
      </div>

      <div>
        <div className="checker grid place-items-center rounded-3xl border border-white/10 p-6">
          {dataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={dataUrl} alt="Generated QR code" className="w-full max-w-[320px] rounded-2xl shadow-2xl" />
          ) : (
            <div className="grid aspect-square w-full max-w-[320px] place-items-center rounded-2xl bg-[#0b0e1f]/80 text-center px-6">
              <div>
                <span className="anim-floaty mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-lime-400/15 text-lime-300"><Icon name="qr" size={28} /></span>
                <p className="mt-3 text-sm font-semibold text-white">Your QR code appears here</p>
                <p className="mt-1 text-xs text-slate-500">{error}</p>
              </div>
            </div>
          )}
        </div>
        {dataUrl && (
          <div className="mt-4 flex gap-3">
            <button onClick={downloadPng} className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-5 py-3 font-extrabold text-[#032114] shadow-xl shadow-emerald-500/20 transition hover:bg-emerald-300">
              <Icon name="download" size={18} strokeWidth={2.1} /> PNG ({size}px)
            </button>
            <button onClick={downloadSvg} className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/[0.04] px-5 py-3 font-bold text-white transition hover:border-amber-400/50">
              <Icon name="download" size={18} /> SVG (vector)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
