"use client";

import { useState } from "react";
import { Icon } from "./icons";
import { SITE_EMAIL } from "@/lib/site";

// There is no backend on Tools Stars — by design — so the contact form
// composes a properly formatted mailto: link and hands it to the visitor's
// own mail client. Nothing is ever POSTed anywhere.

const TOPICS = [
  "Something is broken",
  "Suggest a new tool",
  "Privacy question",
  "Advertising / business",
  "Report abuse",
  "Something else",
];

const inputCls =
  "w-full rounded-xl border border-white/[0.09] bg-white/[0.03] px-3.5 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-amber-400/50 focus:bg-white/[0.05]";
const labelCls = "mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-400";

export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [topic, setTopic] = useState(TOPICS[0]);
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

  const subject = `[Tools Stars] ${topic}`;
  const body = `${message}\n\n—\nName: ${name || "(not given)"}\nReply-to: ${email || "(not given)"}\nTopic: ${topic}`;
  const mailto = `mailto:${SITE_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  const ready = message.trim().length > 0;

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(SITE_EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="mt-8">
      <form
        className="rounded-3xl border border-white/[0.09] bg-[#0a0d20]/80 p-5 shadow-2xl sm:p-7"
        onSubmit={(e) => {
          e.preventDefault();
          if (ready) window.location.href = mailto;
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelCls} htmlFor="c-name">Your name</label>
            <input
              id="c-name"
              className={inputCls}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Optional"
              autoComplete="name"
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="c-email">Reply-to email</label>
            <input
              id="c-email"
              type="email"
              className={inputCls}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="so we can answer you"
              autoComplete="email"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className={labelCls} htmlFor="c-topic">Topic</label>
          <select
            id="c-topic"
            className={inputCls}
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          >
            {TOPICS.map((t) => (
              <option key={t} value={t} className="bg-[#0a0d20]">{t}</option>
            ))}
          </select>
        </div>

        <div className="mt-4">
          <label className={labelCls} htmlFor="c-msg">Message</label>
          <textarea
            id="c-msg"
            className={`${inputCls} min-h-[150px] resize-y`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell us which tool you were using, what you expected, and what happened instead. The more detail, the faster the fix."
            required
          />
          <p className="mt-2 text-xs text-slate-500">
            {message.trim().length} characters. Please do not include passwords, identity documents or other
            sensitive files in an email.
          </p>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
          <button
            type="submit"
            disabled={!ready}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-2.5 text-sm font-bold text-[#241a00] shadow-lg shadow-amber-500/20 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none"
          >
            <Icon name="arrow" size={16} /> Open in my mail app
          </button>
          <button
            type="button"
            onClick={copyAddress}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/[0.04] px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.08]"
          >
            <Icon name={copied ? "check" : "copy"} size={15} className={copied ? "text-emerald-400" : ""} />
            {copied ? "Address copied" : SITE_EMAIL}
          </button>
        </div>

        <p className="mt-4 text-xs leading-relaxed text-slate-500">
          This form opens your own email client with the message pre-filled — Tools Stars has no server that
          receives or stores your message. If you would rather not use a mail app, copy the address above.
        </p>
      </form>
    </div>
  );
}
