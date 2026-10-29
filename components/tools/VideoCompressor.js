"use client";

import { useMemo, useRef, useState } from "react";
import Dropzone from "@/components/Dropzone";
import { Icon } from "@/components/icons";
import { formatBytes, savedPct, downloadBlob, stripExt, friendlyError } from "@/lib/utils";

const PRESETS = [
  { name: "Best quality", desc: "1080p · 5 Mbps", res: "1080", bitrate: 5 },
  { name: "Balanced ★", desc: "720p · 2.5 Mbps", res: "720", bitrate: 2.5 },
  { name: "WhatsApp / Email", desc: "480p · 0.9 Mbps", res: "480", bitrate: 0.9 },
  { name: "Smallest file", desc: "360p · 0.5 Mbps", res: "360", bitrate: 0.5 },
];

function targetDims(w, h, res) {
  if (res === "original") return { width: w - (w % 2), height: h - (h % 2) };
  const target = parseInt(res, 10);
  const landscape = w >= h;
  const scale = Math.min(1, target / (landscape ? h : w));
  const width = Math.max(2, Math.round((w * scale) / 2) * 2);
  const height = Math.max(2, Math.round((h * scale) / 2) * 2);
  return { width, height };
}

function fmtTime(s) {
  if (!isFinite(s)) return "—";
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, "0")}`;
}

export default function VideoCompressor() {
  const [file, setFile] = useState(null);
  const [srcUrl, setSrcUrl] = useState("");
  const [meta, setMeta] = useState(null);
  const [res, setRes] = useState("720");
  const [bitrate, setBitrate] = useState(2.5);
  const [keepAudio, setKeepAudio] = useState(true);
  const [working, setWorking] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const cancelRef = useRef(false);
  const workRef = useRef(null);

  const onFiles = (files) => {
    const f = files[0];
    if (!f) return;
    if (!f.type.startsWith("video/") && !/\.(mp4|webm|mov|m4v|mkv)$/i.test(f.name)) {
      setError("That does not look like a video file. Try MP4, WebM or MOV.");
      return;
    }
    setError("");
    setResult(null);
    setProgress(0);
    setFile(f);
    setMeta(null);
    setSrcUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(f);
    });
  };

  const estimate = useMemo(() => {
    if (!meta?.duration) return null;
    const mbps = bitrate + (keepAudio ? 0.128 : 0);
    return (mbps * 1_000_000 * meta.duration) / 8;
  }, [meta, bitrate, keepAudio]);

  const dims = useMemo(() => (meta ? targetDims(meta.width, meta.height, res) : null), [meta, res]);

  const compress = async () => {
    setError("");
    setResult(null);
    if (typeof MediaRecorder === "undefined" || !HTMLCanvasElement.prototype.captureStream) {
      setError("Your browser does not support in-browser video encoding. Please try the latest Chrome, Edge, Firefox or Safari.");
      return;
    }
    cancelRef.current = false;
    setWorking(true);
    setProgress(0);
    setStatusText("Preparing encoder…");

    const host = workRef.current;
    const video = document.createElement("video");
    video.src = srcUrl;
    video.playsInline = true;
    video.crossOrigin = "anonymous";
    host.appendChild(video);

    let audioCtx = null;
    let drawTimer = null;
    let recorder = null;

    const cleanup = () => {
      if (drawTimer) clearInterval(drawTimer);
      try { audioCtx && audioCtx.close(); } catch {}
      video.remove();
    };

    try {
      await new Promise((resolve, reject) => {
        video.onloadedmetadata = resolve;
        video.onerror = () => reject(new Error("Could not read this video. The format may not be supported by your browser (try MP4/H.264)."));
      });

      const { width, height } = targetDims(video.videoWidth, video.videoHeight, res);
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, width, height);

      const stream = canvas.captureStream(30);

      // Route audio through an AudioContext so we capture sound without blasting speakers.
      if (keepAudio) {
        try {
          const AC = window.AudioContext || window.webkitAudioContext;
          audioCtx = new AC();
          await audioCtx.resume();
          const source = audioCtx.createMediaElementSource(video);
          const dest = audioCtx.createMediaStreamDestination();
          source.connect(dest);
          dest.stream.getAudioTracks().forEach((t) => stream.addTrack(t));
        } catch {
          try {
            const cap = video.captureStream ? video.captureStream() : video.mozCaptureStream ? video.mozCaptureStream() : null;
            cap?.getAudioTracks().forEach((t) => stream.addTrack(t));
          } catch {}
        }
      } else {
        video.muted = true;
      }

      const candidates = [
        'video/mp4;codecs="avc1.640028,mp4a.40.2"',
        "video/mp4",
        "video/webm;codecs=vp9,opus",
        "video/webm;codecs=vp8,opus",
        "video/webm",
      ];
      const mime = candidates.find((m) => MediaRecorder.isTypeSupported(m)) || "";
      recorder = new MediaRecorder(stream, {
        ...(mime ? { mimeType: mime } : {}),
        videoBitsPerSecond: Math.round(bitrate * 1_000_000),
        audioBitsPerSecond: 128_000,
      });

      const chunks = [];
      recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);

      const finished = new Promise((resolve) => {
        recorder.onstop = resolve;
      });

      drawTimer = setInterval(() => {
        if (!video.paused && !video.ended) {
          ctx.drawImage(video, 0, 0, width, height);
          setProgress(Math.min(100, Math.round((video.currentTime / video.duration) * 100)));
          setStatusText(`Re-encoding at ${bitrate} Mbps · ${width}×${height} · ${Math.round((video.currentTime / video.duration) * 100)}%`);
        }
      }, 1000 / 30);

      video.onended = () => {
        setTimeout(() => recorder.state !== "inactive" && recorder.stop(), 250);
      };

      setStatusText("Re-encoding… keep this tab visible for a smooth result.");
      recorder.start(250);
      try {
        await video.play();
      } catch {
        video.muted = true;
        await video.play();
      }

      // cancellation watcher
      const cancelWatch = setInterval(() => {
        if (cancelRef.current) {
          clearInterval(cancelWatch);
          video.pause();
          if (recorder.state !== "inactive") recorder.stop();
        }
      }, 300);

      await finished;
      clearInterval(cancelWatch);

      if (cancelRef.current) {
        setStatusText("Cancelled — no file was created.");
        setProgress(0);
        return;
      }

      const type = recorder.mimeType || mime || "video/webm";
      const blob = new Blob(chunks, { type: type.split(";")[0] });
      if (blob.size === 0) throw new Error("Encoding produced an empty file. Try a shorter clip or a different browser.");
      const ext = blob.type.includes("mp4") ? "mp4" : "webm";
      setResult({
        blob,
        url: URL.createObjectURL(blob),
        name: `${stripExt(file.name)}-compressed.${ext}`,
        width,
        height,
      });
      setProgress(100);
      setStatusText("Done! Your compressed video is ready.");
    } catch (e) {
      setError(friendlyError(e, "Video compression failed in this browser. Try a shorter clip or a lower resolution."));
      setStatusText("");
    } finally {
      cleanup();
      setWorking(false);
    }
  };

  const cancel = () => {
    cancelRef.current = true;
    setStatusText("Cancelling…");
  };

  const reset = () => {
    if (srcUrl) URL.revokeObjectURL(srcUrl);
    if (result?.url) URL.revokeObjectURL(result.url);
    setFile(null); setSrcUrl(""); setMeta(null); setResult(null); setProgress(0); setStatusText(""); setError("");
  };

  return (
    <div>
      <div ref={workRef} className="hidden" aria-hidden="true" />

      {!file && (
        <Dropzone
          accept="video/*,.mp4,.webm,.mov,.m4v"
          onFiles={onFiles}
          title="Drop a video to compress"
          hint="MP4, WebM, MOV — processed entirely on your device, nothing is uploaded"
          icon="video"
        />
      )}

      {error && (
        <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200" role="alert">
          <Icon name="x" size={17} className="mt-0.5 shrink-0" /> {error}
        </div>
      )}

      {file && (
        <div className="grid gap-6 lg:grid-cols-[1.15fr_1fr]">
          {/* preview + meta */}
          <div>
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-black">
              <video
                src={srcUrl}
                controls
                playsInline
                className="aspect-video w-full"
                onLoadedMetadata={(e) =>
                  setMeta({ duration: e.target.duration, width: e.target.videoWidth, height: e.target.videoHeight })
                }
              />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-center sm:grid-cols-4">
              {[
                ["File size", formatBytes(file.size)],
                ["Duration", meta ? fmtTime(meta.duration) : "…"],
                ["Resolution", meta ? `${meta.width} × ${meta.height}` : "…"],
                ["Est. output", estimate ? `~${formatBytes(estimate)}` : "…"],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-2 py-2.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{k}</p>
                  <p className="mt-0.5 truncate text-sm font-bold text-white">{v}</p>
                </div>
              ))}
            </div>
            <p className="mt-2 truncate text-xs text-slate-500" title={file.name}>{file.name}</p>
          </div>

          {/* settings */}
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">Compression preset</h2>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {PRESETS.map((p) => {
                const active = res === p.res && bitrate === p.bitrate;
                return (
                  <button
                    key={p.name}
                    onClick={() => { setRes(p.res); setBitrate(p.bitrate); }}
                    disabled={working}
                    className={`rounded-xl border px-3 py-2.5 text-left transition disabled:opacity-50 ${
                      active ? "border-amber-400 bg-amber-400/10" : "border-white/10 bg-white/[0.02] hover:border-amber-400/40"
                    }`}
                  >
                    <span className="block text-sm font-bold text-white">{p.name}</span>
                    <span className="block text-[11px] text-slate-400">{p.desc}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="vres" className="text-sm font-semibold text-white">Output resolution</label>
                <select id="vres" value={res} disabled={working} onChange={(e) => setRes(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-white/10 bg-[#12152e] px-3 py-2.5 text-sm text-white outline-none focus:border-amber-400/60 disabled:opacity-50">
                  <option value="original">Original{meta ? ` (${meta.height}p)` : ""}</option>
                  <option value="1080">1080p Full HD</option>
                  <option value="720">720p HD</option>
                  <option value="480">480p SD</option>
                  <option value="360">360p</option>
                </select>
                {dims && <p className="mt-1.5 text-xs text-slate-500">Output will be {dims.width} × {dims.height}.</p>}
              </div>
              <div>
                <label htmlFor="vbr" className="flex items-center justify-between text-sm font-semibold text-white">
                  Bitrate <span className="rounded-md bg-amber-400/15 px-2 py-0.5 text-xs font-bold text-amber-300">{bitrate} Mbps</span>
                </label>
                <input id="vbr" type="range" min="0.2" max="10" step="0.1" value={bitrate} disabled={working}
                  onChange={(e) => setBitrate(+e.target.value)} className="mt-3 w-full disabled:opacity-50" />
                <p className="mt-1 text-xs text-slate-500">Lower bitrate = smaller file. 1–3 Mbps suits most sharing.</p>
              </div>
            </div>

            <label className="mt-4 flex cursor-pointer items-center gap-2.5 text-sm text-slate-300">
              <input type="checkbox" checked={keepAudio} disabled={working} onChange={(e) => setKeepAudio(e.target.checked)} className="h-4 w-4 rounded" />
              Keep audio track <span className="text-xs text-slate-500">(uncheck to save extra space)</span>
            </label>

            {!working ? (
              <div className="mt-6 flex flex-wrap gap-3">
                <button onClick={compress} disabled={!meta}
                  className="inline-flex items-center gap-2 rounded-2xl bg-amber-400 px-6 py-3 font-extrabold text-[#241a00] shadow-xl shadow-amber-500/20 transition hover:bg-amber-300 disabled:opacity-50">
                  <Icon name="compress" size={19} strokeWidth={2.1} /> Compress video
                </button>
                <button onClick={reset} className="inline-flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-slate-300 hover:text-rose-300 hover:border-rose-400/40">
                  <Icon name="trash" size={16} /> Choose different video
                </button>
              </div>
            ) : (
              <button onClick={cancel} className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-rose-400/40 bg-rose-400/10 px-5 py-3 text-sm font-bold text-rose-300 hover:bg-rose-400/20">
                <Icon name="x" size={16} /> Cancel compression
              </button>
            )}

            {(working || progress > 0) && (
              <div className="mt-5" role="status" aria-live="polite">
                <div className="h-3 overflow-hidden rounded-full bg-white/[0.08]">
                  <div className="h-full rounded-full bg-gradient-to-r from-rose-500 via-amber-400 to-emerald-400 transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
                <p className="mt-2 text-xs text-slate-400">{statusText}</p>
                {working && meta?.duration > 20 && (
                  <p className="mt-1 text-xs text-slate-500">
                    Heads-up: in-browser encoding runs close to playback speed, so a {fmtTime(meta.duration)} video takes roughly {fmtTime(meta.duration)}.
                    No upload + no queue still usually beats server tools.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {result && (
        <div className="mt-8 rounded-3xl border border-emerald-400/25 bg-emerald-400/[0.05] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="inline-flex items-center gap-2 text-lg font-extrabold text-white">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-400 text-[#032114]"><Icon name="check" size={17} strokeWidth={2.4} /></span>
              Compressed successfully
            </h2>
            <span className="rounded-full bg-emerald-400 px-3 py-1 text-xs font-extrabold text-[#032114]">
              {formatBytes(file.size)} → {formatBytes(result.blob.size)} · saved {savedPct(file.size, result.blob.size)}%
            </span>
          </div>
          <div className="mt-4 grid items-start gap-5 md:grid-cols-[1.2fr_1fr]">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-black">
              <video src={result.url} controls playsInline className="aspect-video w-full" />
            </div>
            <div>
              <div aria-hidden="true">
                <div className="mb-1 flex justify-between text-[11px]"><span className="text-slate-400">Original</span><span className="font-bold text-rose-300">{formatBytes(file.size)}</span></div>
                <div className="h-2.5 rounded-full bg-rose-500/80" />
                <div className="mb-1 mt-3 flex justify-between text-[11px]"><span className="text-slate-400">Compressed ({result.width}×{result.height})</span><span className="font-bold text-emerald-300">{formatBytes(result.blob.size)}</span></div>
                <div className="h-2.5 rounded-full bg-emerald-400/90 transition-all duration-700" style={{ width: `${Math.max(2, (result.blob.size / file.size) * 100)}%` }} />
              </div>
              <button onClick={() => downloadBlob(result.blob, result.name)}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-400 px-6 py-3.5 font-extrabold text-[#032114] shadow-xl shadow-emerald-500/20 transition hover:bg-emerald-300 sm:w-auto">
                <Icon name="download" size={19} strokeWidth={2.1} /> Download compressed video
              </button>
              <p className="mt-2.5 text-xs text-slate-500">{result.name} · Plays everywhere — phones, WhatsApp, YouTube, email.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
