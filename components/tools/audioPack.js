"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Dropzone from "@/components/Dropzone";
import { Icon } from "@/components/icons";
import { formatBytes, downloadBlob, loadScript, stripExt } from "@/lib/utils";

const btnPrimary = "inline-flex items-center gap-2 rounded-2xl bg-amber-400 px-6 py-3 font-extrabold text-[#241a00] shadow-xl shadow-amber-500/20 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-60";
const btnGreen = "inline-flex items-center gap-2 rounded-2xl bg-emerald-400 px-6 py-3 font-extrabold text-[#032114] shadow-xl shadow-emerald-500/20 transition hover:bg-emerald-300 disabled:opacity-60";
const btnGhost = "inline-flex items-center gap-1.5 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-slate-300 transition hover:border-rose-400/40 hover:text-rose-300";
const btnSmall = "inline-flex items-center gap-1.5 rounded-xl border border-white/12 bg-white/[0.04] px-3 py-2 text-xs font-bold text-slate-200 transition hover:border-amber-400/50 disabled:opacity-50";
const selectCls = "mt-2 w-full rounded-xl border border-white/10 bg-[#12152e] px-3 py-2.5 text-sm text-white outline-none focus:border-amber-400/60 disabled:opacity-50";
const inputCls = "mt-2 w-full rounded-xl border border-white/10 bg-[#12152e] px-3.5 py-2.5 text-sm text-white outline-none focus:border-amber-400/60";
const choiceBase = "rounded-2xl border px-4 py-3 text-left transition";
const choiceOn = "border-amber-400 bg-amber-400/10 text-white";
const choiceOff = "border-white/10 bg-white/[0.02] text-slate-300 hover:border-white/25";

function Alert({ msg }) {
  return msg ? (
    <div className="mt-4 flex items-start gap-2.5 rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm leading-relaxed text-rose-200" role="alert">
      <Icon name="x" size={17} className="mt-0.5 shrink-0" /> {msg}
    </div>
  ) : null;
}

function Progress({ pct, text }) {
  if (pct == null && !text) return null;
  return (
    <div className="mt-5" role="status" aria-live="polite">
      {pct != null && <div className="h-3 overflow-hidden rounded-full bg-white/[0.08]"><div className="h-full rounded-full bg-gradient-to-r from-violet-400 to-amber-400 transition-all duration-300" style={{ width: `${pct}%` }} /></div>}
      {text && <p className="mt-2 text-xs text-slate-400">{text}</p>}
    </div>
  );
}

function fmtTime(seconds) {
  const safe = Math.max(0, Number(seconds) || 0);
  const mins = Math.floor(safe / 60);
  const secs = Math.floor(safe % 60);
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

async function decodeAudio(file) {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) throw new Error("This browser does not support local audio processing. Try a current Chrome, Edge, Firefox or Safari.");
  const ctx = new AudioCtx();
  try {
    return await ctx.decodeAudioData(await file.arrayBuffer());
  } catch {
    throw new Error("Your browser could not decode this audio. MP3, WAV, M4A, AAC, OGG and most MP4 soundtracks work best in Chrome or Edge.");
  } finally {
    try { await ctx.close(); } catch {}
  }
}

function makePeaks(buffer, count = 140) {
  if (!buffer) return [];
  const channels = Array.from({ length: buffer.numberOfChannels }, (_, i) => buffer.getChannelData(i));
  const block = Math.max(1, Math.floor(buffer.length / count));
  const peaks = [];
  for (let i = 0; i < count; i += 1) {
    let peak = 0;
    const start = i * block;
    const stride = Math.max(1, Math.floor(block / 500));
    for (const data of channels) {
      for (let j = start; j < Math.min(buffer.length, start + block); j += stride) {
        peak = Math.max(peak, Math.abs(data[j]));
      }
    }
    peaks.push(Math.max(0.04, Math.min(1, peak)));
  }
  return peaks;
}

function segmentPeak(buffer, start, end) {
  if (!buffer) return 0;
  const from = Math.max(0, Math.floor(start * buffer.sampleRate));
  const to = Math.min(buffer.length, Math.ceil(end * buffer.sampleRate));
  const stride = Math.max(1, Math.floor(Math.max(1, to - from) / 250000));
  let peak = 0;
  for (let c = 0; c < buffer.numberOfChannels; c += 1) {
    const data = buffer.getChannelData(c);
    for (let i = from; i < to; i += stride) peak = Math.max(peak, Math.abs(data[i]));
  }
  return peak;
}

function floatTo16(data, offset, length) {
  const out = new Int16Array(length);
  for (let i = 0; i < length; i += 1) {
    const value = Math.max(-1, Math.min(1, data[offset + i] || 0));
    out[i] = value < 0 ? value * 0x8000 : value * 0x7fff;
  }
  return out;
}

async function encodeMp3(buffer, {
  start = 0,
  end = buffer?.duration || 0,
  bitrate = 192,
  mono = false,
  sampleRate,
  fadeIn = 0,
  fadeOut = 0,
  gainValue = 1,
  onProgress,
} = {}) {
  if (!buffer) throw new Error("Audio is not ready yet.");
  const duration = Math.max(0.1, end - start);
  const channels = mono ? 1 : Math.min(2, buffer.numberOfChannels);
  const outRate = Number(sampleRate) || buffer.sampleRate;
  const OfflineCtx = window.OfflineAudioContext || window.webkitOfflineAudioContext;
  if (!OfflineCtx) throw new Error("This browser cannot prepare audio offline. Try a current desktop browser.");

  onProgress?.(3, "Preparing the selected audio…");
  const offline = new OfflineCtx(channels, Math.max(1, Math.ceil(duration * outRate)), outRate);
  const source = offline.createBufferSource();
  source.buffer = buffer;
  const gain = offline.createGain();
  const safeGain = Math.max(0.05, Math.min(3, gainValue || 1));
  const safeFadeIn = Math.max(0, Math.min(Number(fadeIn) || 0, duration / 2));
  const safeFadeOut = Math.max(0, Math.min(Number(fadeOut) || 0, duration / 2));
  if (safeFadeIn > 0) {
    gain.gain.setValueAtTime(0.0001, 0);
    gain.gain.exponentialRampToValueAtTime(safeGain, safeFadeIn);
  } else gain.gain.setValueAtTime(safeGain, 0);
  if (safeFadeOut > 0) {
    gain.gain.setValueAtTime(safeGain, Math.max(safeFadeIn, duration - safeFadeOut));
    gain.gain.exponentialRampToValueAtTime(0.0001, duration);
  }
  source.connect(gain).connect(offline.destination);
  source.start(0, Math.max(0, start), duration + 0.05);
  const rendered = await offline.startRendering();

  onProgress?.(12, "Loading the MP3 encoder…");
  await loadScript("https://cdnjs.cloudflare.com/ajax/libs/lamejs/1.2.1/lame.min.js");
  const Mp3Encoder = window.lamejs?.Mp3Encoder || window.Mp3Encoder;
  if (!Mp3Encoder) throw new Error("The MP3 encoder failed to load. Check your connection or ad-blocker and try again.");
  const encoder = new Mp3Encoder(channels, rendered.sampleRate, Number(bitrate));
  const left = rendered.getChannelData(0);
  const right = channels > 1 ? rendered.getChannelData(1) : left;
  const parts = [];
  const block = 1152;
  for (let i = 0; i < rendered.length; i += block) {
    const length = Math.min(block, rendered.length - i);
    const encoded = channels > 1
      ? encoder.encodeBuffer(floatTo16(left, i, length), floatTo16(right, i, length))
      : encoder.encodeBuffer(floatTo16(left, i, length));
    if (encoded.length) parts.push(new Int8Array(encoded));
    if (i % (block * 250) === 0) {
      onProgress?.(12 + Math.round((i / rendered.length) * 86), "Encoding MP3…");
      await new Promise((resolve) => setTimeout(resolve, 0));
    }
  }
  const final = encoder.flush();
  if (final.length) parts.push(new Int8Array(final));
  onProgress?.(100, "MP3 ready — press play to check it.");
  return new Blob(parts, { type: "audio/mpeg" });
}

function AudioFileCard({ file, meta, onReset }) {
  if (!file) return null;
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.02] px-4 py-3">
      <span className="grid h-11 w-11 place-items-center rounded-xl bg-violet-400/15 text-violet-300"><Icon name="music" size={23} /></span>
      <span className="min-w-0 flex-1">
        <span className="block truncate font-semibold text-white" title={file.name}>{file.name}</span>
        <span className="text-xs text-slate-500">{formatBytes(file.size)}{meta ? ` · ${fmtTime(meta.duration)} · ${meta.channels === 1 ? "mono" : "stereo"} · ${(meta.sampleRate / 1000).toFixed(1)} kHz` : " · reading…"}</span>
      </span>
      <button type="button" onClick={onReset} className={btnGhost}><Icon name="trash" size={15} /> Different file</button>
    </div>
  );
}

function Waveform({ peaks, duration, start, end, current, onSeek }) {
  const startPct = duration ? (start / duration) * 100 : 0;
  const endPct = duration ? (end / duration) * 100 : 100;
  const currentPct = duration ? (current / duration) * 100 : 0;
  return (
    <button
      type="button"
      aria-label="Seek in audio waveform"
      onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        onSeek(Math.max(0, Math.min(duration, ((e.clientX - rect.left) / rect.width) * duration)));
      }}
      className="relative mt-4 block h-32 w-full overflow-hidden rounded-3xl border border-white/[0.08] bg-[#080a19] px-2 py-3 text-left"
    >
      <span className="absolute inset-y-0 left-0 bg-black/55" style={{ width: `${startPct}%` }} aria-hidden="true" />
      <span className="absolute inset-y-0 right-0 bg-black/55" style={{ width: `${100 - endPct}%` }} aria-hidden="true" />
      <span className="absolute inset-y-0 bg-violet-400/[0.08]" style={{ left: `${startPct}%`, width: `${Math.max(0, endPct - startPct)}%` }} aria-hidden="true" />
      <span className="relative flex h-full items-center gap-[2px]" aria-hidden="true">
        {peaks.map((peak, i) => {
          const pos = peaks.length ? (i / peaks.length) * 100 : 0;
          const selected = pos >= startPct && pos <= endPct;
          return <span key={i} className={`min-w-[1px] flex-1 rounded-full ${selected ? "bg-gradient-to-t from-violet-400 to-amber-300" : "bg-slate-700"}`} style={{ height: `${Math.max(6, peak * 100)}%` }} />;
        })}
      </span>
      <span className="absolute inset-y-0 w-0.5 bg-white shadow-[0_0_10px_white]" style={{ left: `${currentPct}%` }} aria-hidden="true" />
      <span className="absolute bottom-1.5 left-3 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white">{fmtTime(start)}</span>
      <span className="absolute bottom-1.5 right-3 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white">{fmtTime(end)}</span>
    </button>
  );
}

/* ═══════════════ SHARED CUTTER (MP3 CUTTER + RINGTONE MAKER) ═══════════════ */
function AudioEditor({ mode }) {
  const ringtone = mode === "ringtone";
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState("");
  const [meta, setMeta] = useState(null);
  const [peaks, setPeaks] = useState([]);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(0);
  const [current, setCurrent] = useState(0);
  const [loop, setLoop] = useState(ringtone);
  const [fadeIn, setFadeIn] = useState(ringtone ? 0.4 : 0);
  const [fadeOut, setFadeOut] = useState(ringtone ? 1 : 0);
  const [normalize, setNormalize] = useState(ringtone);
  const [bitrate, setBitrate] = useState(192);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pct, setPct] = useState(null);
  const [stage, setStage] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const audioRef = useRef(null);
  const bufferRef = useRef(null);
  const selectionPlayRef = useRef(false);

  const duration = meta?.duration || 0;
  const selectedDuration = Math.max(0, end - start);
  const selectedPeak = useMemo(() => segmentPeak(bufferRef.current, start, end), [meta, start, end]); // eslint-disable-line react-hooks/exhaustive-deps

  const reset = useCallback(() => {
    if (url) URL.revokeObjectURL(url);
    if (result?.url) URL.revokeObjectURL(result.url);
    bufferRef.current = null;
    setFile(null); setUrl(""); setMeta(null); setPeaks([]); setStart(0); setEnd(0); setCurrent(0); setResult(null); setError(""); setPct(null); setStage("");
  }, [url, result]);

  const add = useCallback(async (files) => {
    const nextFile = files?.[0];
    if (!nextFile) return;
    setError(""); setResult(null); setLoading(true); setMeta(null); setPeaks([]);
    const objectUrl = URL.createObjectURL(nextFile);
    setFile(nextFile); setUrl((old) => { if (old) URL.revokeObjectURL(old); return objectUrl; });
    try {
      const buffer = await decodeAudio(nextFile);
      bufferRef.current = buffer;
      setMeta({ duration: buffer.duration, channels: buffer.numberOfChannels, sampleRate: buffer.sampleRate });
      setPeaks(makePeaks(buffer));
      setStart(0);
      setEnd(ringtone ? Math.min(buffer.duration, 30) : buffer.duration);
      setCurrent(0);
    } catch (error) {
      setError(error.message);
      bufferRef.current = null;
    } finally {
      setLoading(false);
    }
  }, [ringtone]);

  const seek = (time) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = time;
    setCurrent(time);
  };

  const playSelection = () => {
    const audio = audioRef.current;
    if (!audio) return;
    selectionPlayRef.current = true;
    audio.currentTime = start;
    audio.play().catch(() => {});
  };

  const onTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio) return;
    setCurrent(audio.currentTime);
    if (selectionPlayRef.current && audio.currentTime >= end) {
      if (loop) audio.currentTime = start;
      else { audio.pause(); selectionPlayRef.current = false; }
    }
  };

  const setStartSafe = (value) => {
    const next = Math.max(0, Math.min(Number(value) || 0, Math.max(0, end - 0.1)));
    setStart(next);
  };
  const setEndSafe = (value) => {
    const next = Math.min(duration, Math.max(Number(value) || 0, start + 0.1));
    setEnd(next);
  };
  const setLength = (seconds) => {
    const nextEnd = Math.min(duration, start + seconds);
    if (nextEnd - start < seconds && duration > seconds) {
      setStart(Math.max(0, duration - seconds));
      setEnd(duration);
    } else setEnd(nextEnd);
  };

  const run = async () => {
    if (!bufferRef.current || selectedDuration < 0.2) { setError("Choose at least 0.2 seconds of audio."); return; }
    setBusy(true); setError(""); setResult(null); setPct(1);
    try {
      const gainValue = normalize && selectedPeak > 0.01 ? Math.min(2.5, 0.95 / selectedPeak) : 1;
      const blob = await encodeMp3(bufferRef.current, {
        start, end, bitrate, fadeIn, fadeOut, gainValue,
        onProgress: (value, text) => { setPct(value); setStage(text); },
      });
      const name = ringtone ? `${stripExt(file.name)}-ringtone.mp3` : `${stripExt(file.name)}-cut.mp3`;
      setResult({ blob, url: URL.createObjectURL(blob), name });
    } catch (error) {
      setError(error.message || "MP3 export failed in this browser.");
      setPct(null); setStage("");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      {!file && <Dropzone accept="audio/*,video/mp4,.mp3,.wav,.m4a,.aac,.ogg,.opus,.flac" onFiles={add} title={ringtone ? "Drop a song to make a ringtone" : "Drop an MP3 or audio file to cut"} hint={ringtone ? "Choose the best chorus or hook — 15 to 40 seconds is ideal" : "Trim songs, lectures, podcasts and voice notes"} icon={ringtone ? "bell" : "scissors"} />}
      <Alert msg={error} />
      {file && (
        <>
          <AudioFileCard file={file} meta={meta} onReset={reset} />
          {loading && <p className="mt-4 text-sm text-amber-300" role="status">Reading the audio and drawing its waveform…</p>}
          {meta && (
            <>
              <Waveform peaks={peaks} duration={duration} start={start} end={end} current={current} onSeek={seek} />
              <p className="mt-2 text-xs text-slate-500">The bright waveform is your selection. Click anywhere on it to move the player.</p>
              <audio ref={audioRef} src={url} controls preload="metadata" onTimeUpdate={onTimeUpdate} onPause={() => { selectionPlayRef.current = false; }} className="mt-4 w-full" />

              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <div>
                  <h2 className="font-extrabold text-white">1. Choose the part you want</h2>
                  <div className="mt-4 space-y-5">
                    <div>
                      <label htmlFor={`${mode}-start`} className="flex justify-between text-sm font-semibold text-white">Start <span className="font-bold text-amber-300">{fmtTime(start)}</span></label>
                      <input id={`${mode}-start`} type="range" min="0" max={Math.max(0.1, duration - 0.1)} step="0.05" value={start} onChange={(e) => setStartSafe(e.target.value)} className="mt-3 w-full" />
                      <button type="button" onClick={() => setStartSafe(audioRef.current?.currentTime || 0)} className="mt-1 text-xs font-semibold text-amber-300">Set start at current player position</button>
                    </div>
                    <div>
                      <label htmlFor={`${mode}-end`} className="flex justify-between text-sm font-semibold text-white">End <span className="font-bold text-amber-300">{fmtTime(end)}</span></label>
                      <input id={`${mode}-end`} type="range" min="0.1" max={duration} step="0.05" value={end} onChange={(e) => setEndSafe(e.target.value)} className="mt-3 w-full" />
                      <button type="button" onClick={() => setEndSafe(audioRef.current?.currentTime || duration)} className="mt-1 text-xs font-semibold text-amber-300">Set end at current player position</button>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {ringtone ? [15, 30, 40].map((seconds) => <button key={seconds} type="button" onClick={() => setLength(seconds)} className={btnSmall}>{seconds} sec ringtone</button>)
                      : [[15, "First 15 sec"], [30, "First 30 sec"], [60, "First 1 min"]].map(([seconds, label]) => <button key={seconds} type="button" onClick={() => { setStart(0); setEnd(Math.min(duration, seconds)); }} className={btnSmall}>{label}</button>)}
                    <button type="button" onClick={() => { setStart(0); setEnd(duration); }} className={btnSmall}>Full file</button>
                  </div>
                  <p className="mt-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-sm text-slate-300">Selected length: <strong className="text-white">{fmtTime(selectedDuration)}</strong> ({selectedDuration.toFixed(1)} seconds)</p>
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <button type="button" onClick={playSelection} className="inline-flex items-center gap-2 rounded-2xl border border-white/12 bg-white/[0.04] px-5 py-3 font-bold text-white hover:border-amber-400/50"><Icon name="play" size={16} filled /> Preview selection</button>
                    <label className="flex items-center gap-2 text-sm text-slate-300"><input type="checkbox" checked={loop} onChange={(e) => setLoop(e.target.checked)} className="h-4 w-4" /> Loop preview</label>
                  </div>
                </div>

                <div>
                  <h2 className="font-extrabold text-white">2. Polish & export MP3</h2>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor={`${mode}-fade-in`} className="flex justify-between text-sm font-semibold text-white">Fade in <span className="text-amber-300">{fadeIn}s</span></label>
                      <input id={`${mode}-fade-in`} type="range" min="0" max="3" step="0.1" value={fadeIn} onChange={(e) => setFadeIn(Number(e.target.value))} className="mt-3 w-full" />
                    </div>
                    <div>
                      <label htmlFor={`${mode}-fade-out`} className="flex justify-between text-sm font-semibold text-white">Fade out <span className="text-amber-300">{fadeOut}s</span></label>
                      <input id={`${mode}-fade-out`} type="range" min="0" max="3" step="0.1" value={fadeOut} onChange={(e) => setFadeOut(Number(e.target.value))} className="mt-3 w-full" />
                    </div>
                    <div>
                      <label htmlFor={`${mode}-bitrate`} className="text-sm font-semibold text-white">MP3 quality</label>
                      <select id={`${mode}-bitrate`} value={bitrate} onChange={(e) => setBitrate(Number(e.target.value))} className={selectCls}>
                        <option value={128}>128 kbps — smaller</option><option value={192}>192 kbps — balanced ★</option><option value={256}>256 kbps — high</option><option value={320}>320 kbps — maximum</option>
                      </select>
                    </div>
                    <label className="flex items-start gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-sm text-slate-300 sm:mt-6">
                      <input type="checkbox" checked={normalize} onChange={(e) => setNormalize(e.target.checked)} className="mt-0.5 h-4 w-4" />
                      <span><strong className="text-white">Make volume consistent</strong><span className="block text-xs text-slate-500">Raises a quiet selection toward full volume without clipping.</span></span>
                    </label>
                  </div>
                  <button type="button" onClick={run} disabled={busy} className={`${btnPrimary} mt-6`}><Icon name={ringtone ? "bell" : "scissors"} size={18} /> {busy ? "Creating MP3…" : ringtone ? "Create ringtone MP3" : "Cut & create MP3"}</button>
                  <Progress pct={pct} text={stage} />
                </div>
              </div>

              {result && (
                <div className="mt-7 rounded-3xl border border-emerald-400/25 bg-emerald-400/[0.05] p-5" role="status">
                  <h2 className="font-extrabold text-white">{ringtone ? "Your ringtone is ready" : "Your cut MP3 is ready"} <span className="text-sm font-semibold text-slate-400">({fmtTime(selectedDuration)} · {formatBytes(result.blob.size)})</span></h2>
                  <audio src={result.url} controls loop={ringtone} className="mt-3 w-full" />
                  <button type="button" onClick={() => downloadBlob(result.blob, result.name)} className={`${btnGreen} mt-4`}><Icon name="download" size={17} /> Download MP3</button>
                  {ringtone && <p className="mt-2 text-xs text-slate-500">Android can normally select this MP3 directly in ringtone settings. iPhone requires adding it through GarageBand, Finder or iTunes.</p>}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

export function Mp3Cutter() { return <AudioEditor mode="cutter" />; }
export function RingtoneMaker() { return <AudioEditor mode="ringtone" />; }

/* ═════════════════ AUDIO COMPRESSOR ═════════════════ */
const COMPRESS_PRESETS = {
  speech: { label: "Speech / lecture / podcast", detail: "64 kbps mono — tiny and clear for voice", bitrate: 64, mono: true, sampleRate: 22050 },
  balanced: { label: "Balanced music ★", detail: "128 kbps stereo — good quality, much smaller", bitrate: 128, mono: false, sampleRate: 44100 },
  quality: { label: "High-quality music", detail: "192 kbps stereo — gentle compression", bitrate: 192, mono: false, sampleRate: 44100 },
  custom: { label: "Custom", detail: "Choose bitrate, channels and sample rate yourself" },
};

export function AudioCompressor() {
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState("");
  const [meta, setMeta] = useState(null);
  const [preset, setPreset] = useState("balanced");
  const [bitrate, setBitrate] = useState(96);
  const [mono, setMono] = useState(false);
  const [sampleRate, setSampleRate] = useState(32000);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [pct, setPct] = useState(null);
  const [stage, setStage] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const bufferRef = useRef(null);

  const settings = preset === "custom" ? { bitrate, mono, sampleRate } : COMPRESS_PRESETS[preset];
  const estimatedBytes = meta ? Math.round(((Number(settings.bitrate) * 1000) / 8) * meta.duration) : 0;
  const originalBitrate = meta?.duration ? Math.round((file.size * 8) / meta.duration / 1000) : 0;

  const reset = () => {
    if (url) URL.revokeObjectURL(url);
    if (result?.url) URL.revokeObjectURL(result.url);
    bufferRef.current = null;
    setFile(null); setUrl(""); setMeta(null); setResult(null); setError(""); setPct(null); setStage("");
  };

  const add = useCallback(async (files) => {
    const nextFile = files?.[0];
    if (!nextFile) return;
    setLoading(true); setError(""); setResult(null); setMeta(null);
    const objectUrl = URL.createObjectURL(nextFile);
    setFile(nextFile); setUrl((old) => { if (old) URL.revokeObjectURL(old); return objectUrl; });
    try {
      const buffer = await decodeAudio(nextFile);
      bufferRef.current = buffer;
      setMeta({ duration: buffer.duration, channels: buffer.numberOfChannels, sampleRate: buffer.sampleRate });
    } catch (error) {
      setError(error.message);
      bufferRef.current = null;
    } finally { setLoading(false); }
  }, []);

  const run = async () => {
    if (!bufferRef.current) return;
    setBusy(true); setError(""); setResult(null); setPct(1);
    try {
      const blob = await encodeMp3(bufferRef.current, {
        start: 0, end: meta.duration, bitrate: settings.bitrate, mono: settings.mono, sampleRate: settings.sampleRate,
        onProgress: (value, text) => { setPct(value); setStage(text); },
      });
      setResult({ blob, url: URL.createObjectURL(blob), name: `${stripExt(file.name)}-compressed.mp3` });
    } catch (error) {
      setError(error.message || "Audio compression failed in this browser.");
      setPct(null); setStage("");
    } finally { setBusy(false); }
  };

  const saved = result ? Math.max(0, Math.round((1 - result.blob.size / file.size) * 100)) : 0;

  return (
    <div>
      {!file && <Dropzone accept="audio/*,video/mp4,.mp3,.wav,.m4a,.aac,.ogg,.opus,.flac" onFiles={add} title="Drop audio to compress" hint="Shrink WAV, MP3, M4A and other audio for sharing & uploads" icon="compress" />}
      <Alert msg={error} />
      {file && (
        <>
          <AudioFileCard file={file} meta={meta} onReset={reset} />
          {loading && <p className="mt-4 text-sm text-amber-300" role="status">Reading the audio…</p>}
          {meta && (
            <>
              <audio src={url} controls preload="metadata" className="mt-4 w-full" />
              <p className="mt-2 text-xs text-slate-500">Original average bitrate estimate: about {originalBitrate} kbps. Choosing a lower number below should make the MP3 smaller.</p>
              <h2 className="mt-6 font-extrabold text-white">Choose how small it should be</h2>
              <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {Object.entries(COMPRESS_PRESETS).map(([value, item]) => (
                  <button key={value} type="button" onClick={() => setPreset(value)} className={`${choiceBase} ${preset === value ? choiceOn : choiceOff}`} aria-pressed={preset === value}>
                    <span className="block font-bold">{item.label}</span><span className="mt-1 block text-xs text-slate-500">{item.detail}</span>
                  </button>
                ))}
              </div>

              {preset === "custom" && (
                <div className="mt-5 grid gap-4 sm:grid-cols-3">
                  <div><label htmlFor="ac-bitrate" className="text-sm font-semibold text-white">MP3 bitrate</label><select id="ac-bitrate" value={bitrate} onChange={(e) => setBitrate(Number(e.target.value))} className={selectCls}>{[32, 48, 64, 96, 128, 160, 192, 256, 320].map((value) => <option key={value} value={value}>{value} kbps</option>)}</select></div>
                  <div><label htmlFor="ac-channels" className="text-sm font-semibold text-white">Channels</label><select id="ac-channels" value={mono ? "mono" : "stereo"} onChange={(e) => setMono(e.target.value === "mono")} className={selectCls}><option value="stereo">Stereo</option><option value="mono">Mono — best for speech</option></select></div>
                  <div><label htmlFor="ac-rate" className="text-sm font-semibold text-white">Sample rate</label><select id="ac-rate" value={sampleRate} onChange={(e) => setSampleRate(Number(e.target.value))} className={selectCls}><option value={44100}>44.1 kHz — music</option><option value={32000}>32 kHz — balanced</option><option value={22050}>22.05 kHz — speech</option></select></div>
                </div>
              )}

              <div className="mt-5 flex flex-wrap items-center gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.02] px-4 py-3 text-sm text-slate-300">
                <span>Estimated MP3 size: <strong className="text-white">{formatBytes(estimatedBytes)}</strong></span>
                <span className="text-slate-500">Current: {formatBytes(file.size)}</span>
                {estimatedBytes >= file.size && <span className="font-semibold text-amber-300">This setting may not shrink it — choose a lower bitrate.</span>}
              </div>
              <button type="button" onClick={run} disabled={busy} className={`${btnPrimary} mt-6`}><Icon name="compress" size={18} /> {busy ? "Compressing…" : "Compress to MP3"}</button>
              <Progress pct={pct} text={stage} />

              {result && (
                <div className="mt-7 rounded-3xl border border-emerald-400/25 bg-emerald-400/[0.05] p-5" role="status">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="font-extrabold text-white">{formatBytes(file.size)} → <span className="text-emerald-300">{formatBytes(result.blob.size)}</span></h2>
                    {saved > 0 && <span className="rounded-full bg-emerald-400 px-3 py-1 text-xs font-extrabold text-[#032114]">Saved {saved}%</span>}
                  </div>
                  <audio src={result.url} controls className="mt-3 w-full" />
                  <button type="button" onClick={() => downloadBlob(result.blob, result.name)} className={`${btnGreen} mt-4`}><Icon name="download" size={17} /> Download compressed MP3</button>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}

/* ═════════════════ VOICE RECORDER ═════════════════ */
function pickAudioMime() {
  if (typeof MediaRecorder === "undefined") return "";
  return ["audio/mp4", "audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/ogg"].find((mime) => MediaRecorder.isTypeSupported(mime)) || "";
}

export function VoiceRecorder() {
  const [state, setState] = useState("idle");
  const [elapsed, setElapsed] = useState(0);
  const [result, setResult] = useState(null);
  const [mp3, setMp3] = useState(null);
  const [converting, setConverting] = useState(false);
  const [pct, setPct] = useState(null);
  const [stage, setStage] = useState("");
  const [error, setError] = useState("");
  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const animationRef = useRef(null);
  const canvasRef = useRef(null);

  const stopTracks = useCallback(() => {
    clearInterval(timerRef.current);
    cancelAnimationFrame(animationRef.current);
    try { streamRef.current?.getTracks().forEach((track) => track.stop()); } catch {}
    try { audioCtxRef.current?.close(); } catch {}
    streamRef.current = null;
    audioCtxRef.current = null;
    analyserRef.current = null;
  }, []);

  const drawLevels = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;
    const ctx = canvas.getContext("2d");
    const data = new Uint8Array(analyser.frequencyBinCount);
    const render = () => {
      analyser.getByteFrequencyData(data);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const bars = 56;
      const step = Math.max(1, Math.floor(data.length / bars));
      const barW = canvas.width / bars;
      for (let i = 0; i < bars; i += 1) {
        const value = data[i * step] / 255;
        const height = Math.max(4, value * canvas.height * 0.9);
        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, "#8b5cf6");
        gradient.addColorStop(1, "#f59e0b");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(i * barW + 1, (canvas.height - height) / 2, Math.max(1, barW - 2), height, 3);
        ctx.fill();
      }
      animationRef.current = requestAnimationFrame(render);
    };
    render();
  }, []);

  const start = async () => {
    setError(""); setResult(null); setMp3(null); setPct(null); setStage("");
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setError("Voice recording is not supported in this browser. Try a current Chrome, Edge, Firefox or Safari, and open the site over HTTPS.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
      streamRef.current = stream;
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 512;
        ctx.createMediaStreamSource(stream).connect(analyser);
        audioCtxRef.current = ctx;
        analyserRef.current = analyser;
        requestAnimationFrame(drawLevels);
      }
      const mime = pickAudioMime();
      const recorder = new MediaRecorder(stream, mime ? { mimeType: mime, audioBitsPerSecond: 160000 } : undefined);
      recorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (event) => { if (event.data.size) chunksRef.current.push(event.data); };
      recorder.onstop = () => {
        const type = (recorder.mimeType || mime || "audio/webm").split(";")[0];
        const blob = new Blob(chunksRef.current, { type });
        stopTracks();
        if (blob.size) {
          const ext = type.includes("mp4") ? "m4a" : type.includes("ogg") ? "ogg" : "webm";
          const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
          setResult({ blob, url: URL.createObjectURL(blob), name: `toolsstars-voice-${stamp}.${ext}`, type });
          setState("done");
        } else setState("idle");
      };
      recorder.start(500);
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed((value) => value + 1), 1000);
      setState("recording");
    } catch (error) {
      stopTracks();
      setError(error?.name === "NotAllowedError"
        ? "Microphone permission was denied. Allow microphone access in the browser address bar, then try again."
        : "Could not start recording. Check that a microphone is connected and not being used by another app.");
    }
  };

  const pause = () => {
    try { recorderRef.current?.pause(); clearInterval(timerRef.current); setState("paused"); } catch {}
  };
  const resume = () => {
    try {
      recorderRef.current?.resume();
      timerRef.current = setInterval(() => setElapsed((value) => value + 1), 1000);
      setState("recording");
    } catch {}
  };
  const stop = () => {
    try { if (recorderRef.current?.state !== "inactive") recorderRef.current.stop(); } catch { stopTracks(); setState("idle"); }
  };

  const convertToMp3 = async () => {
    if (!result) return;
    setConverting(true); setError(""); setPct(1); setStage("Reading your recording…");
    try {
      const file = new File([result.blob], result.name, { type: result.blob.type });
      const buffer = await decodeAudio(file);
      const blob = await encodeMp3(buffer, {
        start: 0, end: buffer.duration, bitrate: 128, mono: buffer.numberOfChannels === 1,
        onProgress: (value, text) => { setPct(value); setStage(text); },
      });
      setMp3({ blob, url: URL.createObjectURL(blob), name: `${stripExt(result.name)}.mp3` });
    } catch (error) {
      setError(error.message || "MP3 conversion failed, but your original recording below is safe.");
      setPct(null); setStage("");
    } finally { setConverting(false); }
  };

  useEffect(() => () => stopTracks(), [stopTracks]);

  return (
    <div>
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#080a19] p-5 sm:p-7">
        {result ? (
          <div>
            <h2 className="text-center text-xl font-extrabold text-white">Your recording is ready</h2>
            <p className="mt-1 text-center text-sm text-slate-500">{fmtTime(elapsed)} · {formatBytes(result.blob.size)} · {result.name}</p>
            <audio src={result.url} controls className="mx-auto mt-5 w-full max-w-2xl" />
          </div>
        ) : state === "recording" || state === "paused" ? (
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-red-400/40 bg-red-400/10 px-4 py-2 text-sm font-extrabold text-red-300">
              <span className="relative flex h-2.5 w-2.5"><span className="absolute h-full w-full animate-ping rounded-full bg-red-400 opacity-75" /><span className="relative h-2.5 w-2.5 rounded-full bg-red-400" /></span>
              {state === "paused" ? "PAUSED" : "RECORDING"} {fmtTime(elapsed)}
            </span>
            <canvas ref={canvasRef} width={900} height={190} className="mt-5 h-44 w-full" aria-label="Live microphone level" />
            <p className="text-sm text-slate-500">Speak normally — the bars should move, but do not need to touch the top.</p>
          </div>
        ) : (
          <div className="py-8 text-center">
            <span className="anim-floaty mx-auto grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-2xl shadow-violet-500/25"><Icon name="mic" size={36} /></span>
            <h2 className="mt-5 text-xl font-extrabold text-white">Record a voice note, lecture or idea</h2>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-slate-400">Your microphone audio stays in this tab. Download it before closing the page if you want to keep it.</p>
          </div>
        )}
      </div>
      <Alert msg={error} />

      <div className="mt-5 flex flex-wrap items-center gap-3">
        {state === "idle" || state === "done" ? (
          <button type="button" onClick={start} className="inline-flex items-center gap-2 rounded-2xl bg-red-500 px-6 py-3 font-extrabold text-white shadow-xl shadow-red-500/25 transition hover:bg-red-400"><span className="h-3 w-3 rounded-full bg-white" /> {state === "done" ? "Record again" : "Start recording"}</button>
        ) : (
          <>
            {state === "recording" ? <button type="button" onClick={pause} className={btnGhost}>Pause</button> : <button type="button" onClick={resume} className={btnGhost}>Resume</button>}
            <button type="button" onClick={stop} className={btnPrimary}><Icon name="check" size={17} /> Stop & save</button>
          </>
        )}
        {result && <button type="button" onClick={() => downloadBlob(result.blob, result.name)} className={btnGreen}><Icon name="download" size={17} /> Download recording</button>}
        {result && !mp3 && <button type="button" onClick={convertToMp3} disabled={converting} className={btnGhost}><Icon name="music" size={16} /> {converting ? "Converting…" : "Also make MP3"}</button>}
        {mp3 && <button type="button" onClick={() => downloadBlob(mp3.blob, mp3.name)} className={btnPrimary}><Icon name="download" size={17} /> Download MP3 ({formatBytes(mp3.blob.size)})</button>}
      </div>
      <Progress pct={pct} text={stage} />
      <p className="mt-3 text-xs leading-relaxed text-slate-500">Chrome usually saves WebM, while Safari usually saves M4A/MP4. Use “Also make MP3” when you need the most compatible format.</p>
    </div>
  );
}
