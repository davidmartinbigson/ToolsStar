"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Dropzone from "@/components/Dropzone";
import { Icon } from "@/components/icons";
import { formatBytes, downloadBlob, stripExt, loadScript, friendlyError } from "@/lib/utils";

const btnP = "inline-flex items-center gap-2 rounded-2xl bg-amber-400 px-6 py-3 font-extrabold text-[#241a00] shadow-xl shadow-amber-500/20 transition hover:bg-amber-300 disabled:opacity-60 disabled:cursor-not-allowed";
const btnG = "inline-flex items-center gap-2 rounded-2xl bg-emerald-400 px-6 py-3 font-extrabold text-[#032114] shadow-xl shadow-emerald-500/20 transition hover:bg-emerald-300 disabled:opacity-60";
const btnGhost = "inline-flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-slate-300 hover:border-rose-400/40 hover:text-rose-300";
const sel = "mt-2 w-full rounded-xl border border-white/10 bg-[#12152e] px-3 py-2.5 text-sm text-white outline-none focus:border-amber-400/60 disabled:opacity-50";
function Alert({ msg }) { return msg ? <div className="mt-4 rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm leading-relaxed text-rose-200" role="alert">{msg}</div> : null; }
function Bar({ pct, text }) {
  return (pct != null || text) ? (
    <div className="mt-5" role="status" aria-live="polite">
      {pct != null && <div className="h-3 overflow-hidden rounded-full bg-white/[0.08]"><div className="h-full rounded-full bg-gradient-to-r from-rose-500 to-amber-400 transition-all duration-300" style={{ width: `${pct}%` }} /></div>}
      {text && <p className="mt-2 text-xs text-slate-400">{text}</p>}
    </div>
  ) : null;
}
const fmt = (s) => { if (!isFinite(s)) return "0:00"; const m = Math.floor(s / 60), x = Math.floor(s % 60); return `${m}:${String(x).padStart(2, "0")}`; };
function pickMime() {
  return ['video/mp4;codecs="avc1.640028,mp4a.40.2"', "video/mp4", "video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"].find((m) => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(m)) || "";
}
function makeVideo(src) {
  return new Promise((resolve, reject) => {
    const v = document.createElement("video");
    v.src = src; v.playsInline = true; v.preload = "auto";
    v.onloadedmetadata = () => resolve(v);
    v.onerror = () => reject(new Error("Your browser can't play this video format. MP4 (H.264) and WebM work best."));
  });
}
function seekTo(v, t) {
  return new Promise((resolve) => {
    let done = false;
    const finish = () => { if (!done) { done = true; resolve(); } };
    v.addEventListener("seeked", finish, { once: true });
    try { v.currentTime = t; } catch { finish(); }
    setTimeout(finish, 1800);
  });
}
function useVideoFile() {
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState("");
  const [meta, setMeta] = useState(null);
  const onFiles = useCallback((files) => {
    const f = files[0]; if (!f) return;
    setFile(f); setMeta(null);
    setUrl((p) => { if (p) URL.revokeObjectURL(p); return URL.createObjectURL(f); });
  }, []);
  const onMeta = (e) => setMeta({ duration: e.target.duration, width: e.target.videoWidth, height: e.target.videoHeight });
  const reset = () => { if (url) URL.revokeObjectURL(url); setFile(null); setUrl(""); setMeta(null); };
  return { file, url, meta, onFiles, onMeta, reset };
}

/* ═══════════════ VIDEO TO GIF ═══════════════ */
export function VideoToGif() {
  const V = useVideoFile();
  const [start, setStart] = useState(0);
  const [len, setLen] = useState(4);
  const [fps, setFps] = useState(12);
  const [width, setWidth] = useState(480);
  const [busy, setBusy] = useState(false);
  const [pct, setPct] = useState(null);
  const [stage, setStage] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const cancelRef = useRef(false);
  useEffect(() => { if (V.meta && len > V.meta.duration) setLen(Math.max(1, Math.floor(V.meta.duration))); }, [V.meta]); // eslint-disable-line

  const run = async () => {
    cancelRef.current = false;
    const s = Math.min(+start || 0, Math.max(0, V.meta.duration - 0.2));
    const e = Math.min(V.meta.duration, s + Math.min(+len || 4, 20));
    if (e - s < 0.4) { setError("That clip is too short — pick at least half a second."); return; }
    setBusy(true); setError(""); setResult(null); setPct(1);
    try {
      setStage("Loading the GIF engine…");
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.js");
      const workerRes = await fetch("https://cdnjs.cloudflare.com/ajax/libs/gif.js/0.2.0/gif.worker.js");
      const workerUrl = URL.createObjectURL(await workerRes.blob());
      const video = await makeVideo(V.url);
      const ratio = video.videoHeight / video.videoWidth;
      const ow = Math.min(+width, video.videoWidth), oh = Math.max(2, Math.round(ow * ratio));
      const canvas = document.createElement("canvas"); canvas.width = ow; canvas.height = oh;
      const ctx = canvas.getContext("2d");
      const GIF = window.GIF;
      const gif = new GIF({ workers: Math.min(4, navigator.hardwareConcurrency || 2), quality: 12, workerScript: workerUrl, width: ow, height: oh });
      const total = Math.floor((e - s) * fps);
      setStage(`Capturing ${total} frames…`);
      for (let i = 0; i < total; i++) {
        if (cancelRef.current) { try { gif.abort(); } catch {} throw new Error("__cancelled__"); }
        await seekTo(video, s + i / fps);
        ctx.drawImage(video, 0, 0, ow, oh);
        gif.addFrame(canvas, { copy: true, delay: Math.round(1000 / fps) });
        setPct(Math.round(((i + 1) / total) * 65));
      }
      const blob = await new Promise((resolve) => {
        gif.on("progress", (p) => { setStage("Assembling your GIF…"); setPct(65 + Math.round(p * 35)); });
        gif.on("finished", resolve);
        gif.render();
      });
      URL.revokeObjectURL(workerUrl);
      setResult({ blob, url: URL.createObjectURL(blob), w: ow, h: oh, frames: total });
      setStage("Done!");
    } catch (err) {
      if (String(err.message).includes("__cancelled__")) { setStage("Cancelled."); setPct(null); }
      else { setError("GIF creation failed — try a shorter clip, smaller width, or an MP4 video in Chrome/Edge."); setStage(""); setPct(null); }
    } finally { setBusy(false); }
  };

  return (
    <div>
      {!V.file && <Dropzone accept="video/*,.mp4,.webm,.mov" onFiles={V.onFiles} title="Drop a video to turn into a GIF" hint="Pick the funniest 2–10 seconds — memes, reactions, demos" icon="video" />}
      <Alert msg={error} />
      {V.file && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-black"><video src={V.url} controls playsInline onLoadedMetadata={V.onMeta} className="aspect-video w-full" /></div>
            <p className="mt-2 truncate text-xs text-slate-500">{V.file.name} · {formatBytes(V.file.size)}{V.meta ? ` · ${fmt(V.meta.duration)} · ${V.meta.width}×${V.meta.height}` : ""}</p>
            <button onClick={() => { V.reset(); setResult(null); }} className={`${btnGhost} mt-3`}><Icon name="trash" size={15} /> Different video</button>
          </div>
          <div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className="flex justify-between text-sm font-semibold text-white">Start at <span className="text-amber-300 font-bold">{fmt(+start || 0)}</span></label>
                <input type="range" min="0" max={Math.max(0, (V.meta?.duration || 1) - 1)} step="0.1" value={start} onChange={(e) => setStart(e.target.value)} className="mt-3 w-full" /></div>
              <div><label className="flex justify-between text-sm font-semibold text-white">Clip length <span className="text-amber-300 font-bold">{len}s</span></label>
                <input type="range" min="1" max="15" step="0.5" value={len} onChange={(e) => setLen(+e.target.value)} className="mt-3 w-full" /></div>
              <div><label className="text-sm font-semibold text-white">GIF width</label>
                <select value={width} onChange={(e) => setWidth(+e.target.value)} className={sel}><option value={560}>560px — best quality</option><option value={480}>480px — balanced ★</option><option value={360}>360px — WhatsApp/Discord</option><option value={240}>240px — tiny stickers</option></select></div>
              <div><label className="flex justify-between text-sm font-semibold text-white">Smoothness (FPS) <span className="text-amber-300 font-bold">{fps}</span></label>
                <input type="range" min="6" max="20" value={fps} onChange={(e) => setFps(+e.target.value)} className="mt-3 w-full" />
                <p className="mt-1 text-[11px] text-slate-500">Higher FPS = smoother but bigger GIF.</p></div>
            </div>
            {!busy ? <button onClick={run} disabled={!V.meta} className={`${btnP} mt-6`}><Icon name="sparkles" size={18} /> Create GIF</button>
              : <button onClick={() => { cancelRef.current = true; }} className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-rose-400/40 bg-rose-400/10 px-5 py-3 text-sm font-bold text-rose-300"><Icon name="x" size={16} /> Cancel</button>}
            <Bar pct={pct} text={stage} />
          </div>
        </div>
      )}
      {result && (
        <div className="mt-8 grid items-start gap-5 rounded-3xl border border-emerald-400/25 bg-emerald-400/[0.04] p-5 md:grid-cols-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={result.url} alt="Your animated GIF" className="w-full rounded-2xl border border-white/10 checker" />
          <div>
            <h2 className="text-lg font-extrabold text-white">Your GIF is ready 🎉</h2>
            <p className="mt-1 text-sm text-slate-400">{result.w}×{result.h} · {result.frames} frames · {formatBytes(result.blob.size)} — loops forever, plays everywhere.</p>
            <button onClick={() => downloadBlob(result.blob, `${stripExt(V.file.name)}.gif`)} className={`${btnG} mt-4`}><Icon name="download" size={17} /> Download GIF</button>
            <p className="mt-2 text-xs text-slate-500">Too heavy to share? Re-run at 360px / fewer FPS — or shorten the clip.</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════ VIDEO TRIMMER ═══════════════ */
export function VideoTrimmer() {
  const V = useVideoFile();
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [keepAudio, setKeepAudio] = useState(true);
  const [busy, setBusy] = useState(false);
  const [pct, setPct] = useState(null);
  const [stage, setStage] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const cancelRef = useRef(false);
  const previewRef = useRef(null);
  const segPlayRef = useRef(false);
  useEffect(() => { if (V.meta) { setStart(0); setEnd(Math.floor(V.meta.duration)); } }, [V.meta]);

  const preview = () => { const v = previewRef.current; if (!v) return; segPlayRef.current = true; v.currentTime = +start; v.play(); };

  const run = async () => {
    if (typeof MediaRecorder === "undefined" || !HTMLCanvasElement.prototype.captureStream) { setError("This browser can't trim video locally — try Chrome, Edge or Firefox (latest)."); return; }
    const s = Math.max(0, +start), e = Math.min(V.meta.duration, +end);
    if (e - s < 0.3) { setError("End time must be after the start — give the clip at least half a second."); return; }
    cancelRef.current = false; setBusy(true); setError(""); setResult(null); setPct(1); setStage("Preparing…");
    let timer = null, actx = null, video = null, recorder = null;
    try {
      video = await makeVideo(V.url);
      document.body.appendChild(video); video.style.display = "none";
      await seekTo(video, s);
      const scale = Math.min(1, 1280 / Math.max(video.videoWidth, video.videoHeight));
      const w = Math.max(2, Math.round(video.videoWidth * scale / 2) * 2), h = Math.max(2, Math.round(video.videoHeight * scale / 2) * 2);
      const canvas = document.createElement("canvas"); canvas.width = w; canvas.height = h;
      const ctx = canvas.getContext("2d"); ctx.drawImage(video, 0, 0, w, h);
      const stream = canvas.captureStream(30);
      if (keepAudio) {
        try {
          const AC = window.AudioContext || window.webkitAudioContext; actx = new AC(); await actx.resume();
          const src = actx.createMediaElementSource(video); const dest = actx.createMediaStreamDestination(); src.connect(dest);
          dest.stream.getAudioTracks().forEach((t) => stream.addTrack(t));
        } catch { try { (video.captureStream?.() || video.mozCaptureStream?.())?.getAudioTracks().forEach((t) => stream.addTrack(t)); } catch {} }
      } else video.muted = true;
      const mime = pickMime();
      recorder = new MediaRecorder(stream, { ...(mime ? { mimeType: mime } : {}), videoBitsPerSecond: 5_000_000, audioBitsPerSecond: 160_000 });
      const chunks = []; recorder.ondataavailable = (ev) => ev.data.size && chunks.push(ev.data);
      const stopped = new Promise((r) => (recorder.onstop = r));
      timer = setInterval(() => {
        if (cancelRef.current) { video.pause(); if (recorder.state !== "inactive") recorder.stop(); return; }
        if (!video.paused && !video.ended) {
          ctx.drawImage(video, 0, 0, w, h);
          setPct(Math.min(100, Math.round(((video.currentTime - s) / (e - s)) * 100)));
          if (video.currentTime >= e) { video.pause(); if (recorder.state !== "inactive") recorder.stop(); }
        }
      }, 1000 / 30);
      setStage(`Trimming ${fmt(s)} → ${fmt(e)} (runs at playback speed, keep this tab visible)…`);
      recorder.start(250);
      try { await video.play(); } catch { video.muted = true; await video.play(); }
      await stopped;
      if (cancelRef.current) { setStage("Cancelled."); setPct(null); return; }
      const type = (recorder.mimeType || mime || "video/webm").split(";")[0];
      const blob = new Blob(chunks, { type });
      if (!blob.size) throw new Error("Empty output");
      setResult({ blob, url: URL.createObjectURL(blob), name: `${stripExt(V.file.name)}-trimmed.${type.includes("mp4") ? "mp4" : "webm"}` });
      setStage("Done! Preview your clip below.");
    } catch (err) { console.error(err); setError("Trimming failed in this browser — MP4 in Chrome/Edge gives the most reliable results."); setStage(""); setPct(null); }
    finally { if (timer) clearInterval(timer); try { actx?.close(); } catch {} try { video?.remove(); } catch {} setBusy(false); }
  };

  return (
    <div>
      {!V.file && <Dropzone accept="video/*,.mp4,.webm,.mov" onFiles={V.onFiles} title="Drop a video to trim" hint="Cut the boring start/end — keep only the good part" icon="video" />}
      <Alert msg={error} />
      {V.file && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-black">
              <video ref={previewRef} src={V.url} controls playsInline onLoadedMetadata={V.onMeta} onTimeUpdate={(ev) => { if (segPlayRef.current && ev.target.currentTime >= +end) { ev.target.pause(); segPlayRef.current = false; } }} className="aspect-video w-full" />
            </div>
            <p className="mt-2 truncate text-xs text-slate-500">{V.file.name} · {formatBytes(V.file.size)}{V.meta ? ` · full length ${fmt(V.meta.duration)}` : ""}</p>
            <button onClick={() => { V.reset(); setResult(null); }} className={`${btnGhost} mt-3`}><Icon name="trash" size={15} /> Different video</button>
          </div>
          <div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><label className="flex justify-between text-sm font-semibold text-white">Start <span className="font-bold text-amber-300">{fmt(+start)}</span></label>
                <input type="range" min="0" max={Math.max(0, (V.meta?.duration || 1) - 0.5)} step="0.1" value={start} onChange={(e) => { const v = +e.target.value; setStart(v); if (v >= +end) setEnd(Math.min(V.meta.duration, v + 1)); }} className="mt-3 w-full" />
                <button onClick={() => previewRef.current && setStart(previewRef.current.currentTime.toFixed(1))} className="mt-1.5 text-xs font-semibold text-amber-300">Set start = current player position</button></div>
              <div><label className="flex justify-between text-sm font-semibold text-white">End <span className="font-bold text-amber-300">{fmt(+end)}</span></label>
                <input type="range" min="0.5" max={V.meta?.duration || 1} step="0.1" value={end} onChange={(e) => setEnd(+e.target.value)} className="mt-3 w-full" />
                <button onClick={() => previewRef.current && setEnd(previewRef.current.currentTime.toFixed(1))} className="mt-1.5 text-xs font-semibold text-amber-300">Set end = current player position</button></div>
            </div>
            <p className="mt-3 rounded-xl border border-white/[0.08] bg-white/[0.02] px-3.5 py-2.5 text-sm text-slate-300">Your clip: <strong className="text-white">{fmt(Math.max(0, (+end) - (+start)))}</strong> (from {fmt(+start)} to {fmt(+end)})</p>
            <label className="mt-3 flex items-center gap-2.5 text-sm text-slate-300"><input type="checkbox" checked={keepAudio} onChange={(e) => setKeepAudio(e.target.checked)} className="h-4 w-4" /> Keep sound</label>
            <div className="mt-5 flex flex-wrap gap-3">
              <button onClick={preview} className="inline-flex items-center gap-2 rounded-2xl border border-white/12 bg-white/[0.04] px-5 py-3 font-bold text-white hover:border-amber-400/50"><Icon name="play" size={16} filled /> Preview selection</button>
              {!busy ? <button onClick={run} disabled={!V.meta} className={btnP}><Icon name="video" size={17} /> Trim video</button>
                : <button onClick={() => { cancelRef.current = true; }} className="inline-flex items-center gap-2 rounded-2xl border border-rose-400/40 bg-rose-400/10 px-5 py-3 text-sm font-bold text-rose-300"><Icon name="x" size={16} /> Cancel</button>}
            </div>
            <Bar pct={pct} text={stage} />
          </div>
        </div>
      )}
      {result && (
        <div className="mt-8 grid items-start gap-5 rounded-3xl border border-emerald-400/25 bg-emerald-400/[0.04] p-5 md:grid-cols-2">
          <video src={result.url} controls playsInline className="aspect-video w-full rounded-2xl bg-black" />
          <div>
            <h2 className="text-lg font-extrabold text-white">Trimmed clip ready ✂️</h2>
            <p className="mt-1 text-sm text-slate-400">{formatBytes(result.blob.size)} · {result.name}</p>
            <button onClick={() => downloadBlob(result.blob, result.name)} className={`${btnG} mt-4`}><Icon name="download" size={17} /> Download clip</button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════ SCREEN RECORDER ═══════════════ */
export function ScreenRecorder() {
  const [state, setState] = useState("idle"); // idle | recording | paused | done
  const [mic, setMic] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const recRef = useRef(null); const streamRef = useRef(null); const chunksRef = useRef([]); const timerRef = useRef(null); const startedRef = useRef(0); const previewRef = useRef(null);

  const stopAll = useCallback(() => {
    clearInterval(timerRef.current);
    try { streamRef.current?.getTracks().forEach((t) => t.stop()); } catch {}
  }, []);

  const start = async () => {
    setError(""); setResult(null);
    if (!navigator.mediaDevices?.getDisplayMedia || typeof MediaRecorder === "undefined") { setError("Screen recording needs a desktop browser (Chrome/Edge/Firefox). Phone browsers don't allow capturing your screen."); return; }
    try {
      const display = await navigator.mediaDevices.getDisplayMedia({ video: { frameRate: 30 }, audio: true });
      const tracks = [...display.getVideoTracks(), ...display.getAudioTracks()];
      if (mic) { try { const m = await navigator.mediaDevices.getUserMedia({ audio: true }); tracks.push(...m.getAudioTracks()); m.getAudioTracks().forEach((t) => (display._extra = [...(display._extra || []), t])); } catch { setError("Mic was not allowed — recording screen only."); } }
      const stream = new MediaStream(tracks);
      streamRef.current = display;
      const rec = new MediaRecorder(stream, { ...(pickMime() ? { mimeType: pickMime() } : {}), videoBitsPerSecond: 6_000_000 });
      recRef.current = rec; chunksRef.current = [];
      rec.ondataavailable = (e) => e.data.size && chunksRef.current.push(e.data);
      rec.onstop = () => {
        stopAll();
        const type = (rec.mimeType || "video/webm").split(";")[0];
        const blob = new Blob(chunksRef.current, { type });
        if (blob.size) setResult({ blob, url: URL.createObjectURL(blob), name: `toolsstars-screen-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.${type.includes("mp4") ? "mp4" : "webm"}` });
        setState(blob.size ? "done" : "idle");
      };
      display.getVideoTracks()[0].addEventListener("ended", () => { if (rec.state !== "inactive") rec.stop(); });
      if (previewRef.current) { previewRef.current.srcObject = stream; previewRef.current.play().catch(() => {}); }
      rec.start(500);
      startedRef.current = Date.now(); setElapsed(0);
      timerRef.current = setInterval(() => setElapsed(Math.floor((Date.now() - startedRef.current) / 1000)), 500);
      setState("recording");
    } catch { setError("Screen sharing was cancelled — no recording was made. Click Start and choose a screen, window or tab."); }
  };

  return (
    <div>
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-black">
        {result ? <video src={result.url} controls playsInline className="aspect-video w-full" /> :
          state === "recording" || state === "paused" ? <video ref={previewRef} muted playsInline className="aspect-video w-full" /> :
          <div className="grid aspect-video place-items-center p-8 text-center">
            <div>
              <span className="anim-floaty mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-red-500/15 text-red-300"><Icon name="video" size={30} /></span>
              <p className="mt-4 font-bold text-white">Record your screen in HD — nothing uploads, ever</p>
              <p className="mx-auto mt-1 max-w-md text-sm text-slate-400">Perfect for tutorials, demos, class recordings and bug reports. Works on desktop Chrome, Edge & Firefox.</p>
            </div>
          </div>}
      </div>
      <Alert msg={error} />
      <div className="mt-5 flex flex-wrap items-center gap-3">
        {state === "idle" || state === "done" ? (
          <>
            <button onClick={start} className="inline-flex items-center gap-2 rounded-2xl bg-red-500 px-6 py-3 font-extrabold text-white shadow-xl shadow-red-500/25 transition hover:bg-red-400"><span className="h-3 w-3 rounded-full bg-white" /> {state === "done" ? "Record again" : "Start recording"}</button>
            <label className="flex items-center gap-2.5 text-sm text-slate-300"><input type="checkbox" checked={mic} onChange={(e) => setMic(e.target.checked)} className="h-4 w-4" /> Also record my microphone (voice-over)</label>
          </>
        ) : (
          <>
            <span className="inline-flex items-center gap-2 rounded-full border border-red-400/40 bg-red-400/10 px-4 py-2 text-sm font-extrabold text-red-300"><span className="relative flex h-2.5 w-2.5"><span className="absolute h-full w-full animate-ping rounded-full bg-red-400 opacity-75" /><span className="relative h-2.5 w-2.5 rounded-full bg-red-400" /></span> REC {fmt(elapsed)}</span>
            {state === "recording" ? <button onClick={() => { recRef.current?.pause(); setState("paused"); }} className={btnGhost}>Pause</button> : <button onClick={() => { recRef.current?.resume(); setState("recording"); }} className={btnGhost}>Resume</button>}
            <button onClick={() => recRef.current?.state !== "inactive" && recRef.current.stop()} className={btnP}><Icon name="check" size={16} /> Stop & save</button>
          </>
        )}
        {result && <button onClick={() => downloadBlob(result.blob, result.name)} className={btnG}><Icon name="download" size={16} /> Download recording ({formatBytes(result.blob.size)})</button>}
      </div>
      <p className="mt-2.5 text-xs text-slate-500">Tip: choose "Chrome Tab" in the picker to also capture that tab's sound. Your recording exists only in this tab until you download it.</p>
    </div>
  );
}

/* ═══════════════ VIDEO TO MP3 ═══════════════ */
function floatTo16(f32, from, len) {
  const out = new Int16Array(len);
  for (let i = 0; i < len; i++) { const s = Math.max(-1, Math.min(1, f32[from + i])); out[i] = s < 0 ? s * 0x8000 : s * 0x7fff; }
  return out;
}
export function VideoToMp3() {
  const [file, setFile] = useState(null);
  const [bitrate, setBitrate] = useState(192);
  const [busy, setBusy] = useState(false);
  const [pct, setPct] = useState(null);
  const [stage, setStage] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const run = async () => {
    if (!file) return;
    setBusy(true); setError(""); setResult(null); setPct(2);
    try {
      setStage("Decoding the soundtrack…");
      const AC = window.AudioContext || window.webkitAudioContext;
      const actx = new AC();
      let buffer;
      try { buffer = await actx.decodeAudioData(await file.arrayBuffer()); }
      catch { await actx.close(); throw new Error("Your browser could not decode this file's audio codec. MP4/MOV/WebM and MP3/WAV files work best in Chrome/Edge."); }
      setStage("Loading the MP3 encoder…");
      await loadScript("https://cdnjs.cloudflare.com/ajax/libs/lamejs/1.2.1/lame.min.js");
      const Mp3Encoder = window.lamejs?.Mp3Encoder || window.Mp3Encoder;
      if (!Mp3Encoder) throw new Error("MP3 encoder failed to load — check your connection/ad-blocker.");
      const ch = Math.min(2, buffer.numberOfChannels);
      const left = buffer.getChannelData(0);
      const right = ch > 1 ? buffer.getChannelData(1) : left;
      const enc = new Mp3Encoder(ch, buffer.sampleRate, +bitrate);
      const parts = [];
      const block = 1152, total = left.length;
      setStage("Encoding MP3…");
      for (let i = 0; i < total; i += block) {
        const len = Math.min(block, total - i);
        const out = ch > 1 ? enc.encodeBuffer(floatTo16(left, i, len), floatTo16(right, i, len)) : enc.encodeBuffer(floatTo16(left, i, len));
        if (out.length) parts.push(new Int8Array(out));
        if (i % (block * 300) === 0) { setPct(Math.round((i / total) * 100)); await new Promise((r) => setTimeout(r, 0)); }
      }
      const end = enc.flush(); if (end.length) parts.push(new Int8Array(end));
      await actx.close();
      const blob = new Blob(parts, { type: "audio/mpeg" });
      setResult({ blob, url: URL.createObjectURL(blob), name: `${stripExt(file.name)}.mp3`, dur: buffer.duration });
      setPct(100); setStage("Done — press play to check it!");
    } catch (e) { setError(friendlyError(e, "That step failed. Try a different file, or a shorter clip.")); setStage(""); setPct(null); }
    finally { setBusy(false); }
  };

  return (
    <div>
      {!file && <Dropzone accept="video/*,audio/*,.mp4,.mov,.webm,.mp3,.wav,.m4a" onFiles={(f) => { setFile(f[0]); setError(""); }} title="Drop a video — get its MP3" hint="Extract songs, lectures, nasheeds, podcasts from any clip" icon="gauge" />}
      <Alert msg={error} />
      {file && (
        <>
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.02] px-4 py-3">
            <Icon name="video" size={22} className="text-rose-300" />
            <span className="min-w-0 flex-1"><span className="block truncate font-semibold text-white">{file.name}</span><span className="text-xs text-slate-500">{formatBytes(file.size)}</span></span>
            <button onClick={() => { setFile(null); setResult(null); }} className={btnGhost}><Icon name="trash" size={15} /> Different file</button>
          </div>
          <div className="mt-5 max-w-sm">
            <label className="text-sm font-semibold text-white">MP3 quality</label>
            <select value={bitrate} onChange={(e) => setBitrate(+e.target.value)} className={sel}>
              <option value={128}>128 kbps — small file, good for speech</option><option value={192}>192 kbps — balanced ★</option><option value={256}>256 kbps — high quality</option><option value={320}>320 kbps — maximum music quality</option>
            </select>
          </div>
          <button onClick={run} disabled={busy} className={`${btnP} mt-5`}><Icon name="gauge" size={17} /> {busy ? "Extracting…" : "Extract MP3"}</button>
          <Bar pct={pct} text={stage} />
          {result && (
            <div className="mt-6 rounded-2xl border border-emerald-400/25 bg-emerald-400/[0.05] p-5">
              <h2 className="font-extrabold text-white">Your MP3 is ready 🎧 <span className="text-sm font-semibold text-slate-400">({fmt(result.dur)} · {formatBytes(result.blob.size)})</span></h2>
              <audio src={result.url} controls className="mt-3 w-full" />
              <button onClick={() => downloadBlob(result.blob, result.name)} className={`${btnG} mt-4`}><Icon name="download" size={16} /> Download MP3</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
