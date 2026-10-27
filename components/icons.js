// Lightweight inline SVG icon set (no external icon library = faster pages).

const P = {
  star: "M12 2.5l2.95 6.36 6.95.8-5.13 4.73 1.36 6.86L12 17.9l-6.13 3.35 1.36-6.86L2.1 9.66l6.95-.8L12 2.5z",
  video: "M3 6.5A2.5 2.5 0 0 1 5.5 4h8A2.5 2.5 0 0 1 16 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-8A2.5 2.5 0 0 1 3 17.5v-11z M16 10l5-3v10l-5-3",
  play: "M8 5.5v13l11-6.5-11-6.5z",
  image: "M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z M3 16l5-5 4 4 3.5-3.5L21 17 M8.5 10a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6z",
  compress: "M9 4L4 4v5 M4 4l6 6 M15 4h5v5 M20 4l-6 6 M9 20H4v-5 M4 20l6-6 M15 20h5v-5 M20 20l-6-6",
  wand: "M5 19L16.5 7.5 M15 4l.7 1.8L17.5 6.5l-1.8.7L15 9l-.7-1.8L12.5 6.5l1.8-.7L15 4z M19.5 10l.5 1.3 1.3.5-1.3.5-.5 1.3-.5-1.3-1.3-.5 1.3-.5.5-1.3z M6.5 3.5l.45 1.15L8.1 5.1l-1.15.45L6.5 6.7l-.45-1.15L4.9 5.1l1.15-.45L6.5 3.5z",
  resize: "M4 9V5.5A1.5 1.5 0 0 1 5.5 4H9 M15 4h3.5A1.5 1.5 0 0 1 20 5.5V9 M20 15v3.5a1.5 1.5 0 0 1-1.5 1.5H15 M9 20H5.5A1.5 1.5 0 0 1 4 18.5V15",
  convert: "M4 8h13l-3-3 M20 16H7l3 3",
  pdf: "M7 3h7l5 5v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z M14 3v5h5 M9 17h6 M9 13.5h6",
  qr: "M4 4h6v6H4z M14 4h6v6h-6z M4 14h6v6H4z M14 14h3v3h-3z M20 14v.01 M14 20v.01 M20 20v.01 M17.5 17.5h.01",
  key: "M14.5 4.5a5 5 0 1 0 3.4 8.6L21 16.2V21h-4.8v-2.9h-2.9v-2.9l-1.2-1.2A5 5 0 0 0 14.5 4.5z M7 10.5h.01",
  type: "M5 6V4h14v2 M12 4v16 M9 20h6",
  layers: "M12 3l9 5-9 5-9-5 9-5z M3 13l9 5 9-5",
  upload: "M12 16V4 M7 9l5-5 5 5 M4 20h16",
  download: "M12 4v12 M7 11l5 5 5-5 M4 20h16",
  shield: "M12 3l7 2.8V11c0 5-3 8.4-7 10-4-1.6-7-5-7-10V5.8L12 3z M9 11.5l2 2 4-4",
  zap: "M13 2L4.5 13.5H11L9.8 22l8.7-11.5H12L13 2z",
  check: "M4 12.5l5 5L20 6.5",
  x: "M5 5l14 14 M19 5L5 19",
  search: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14z M20.5 20.5L16 16",
  menu: "M4 7h16 M4 12h16 M4 17h16",
  chevron: "M6 9l6 6 6-6",
  arrow: "M4 12h15 M13 6l6 6-6 6",
  sparkles: "M12 4l1.3 3.7L17 9l-3.7 1.3L12 14l-1.3-3.7L7 9l3.7-1.3L12 4z M19 15l.7 2 2 .7-2 .7L19 20.4l-.7-2-2-.7 2-.7.7-2z M5 16l.6 1.6L7.2 18.2l-1.6.6L5 20.4l-.6-1.6L2.8 18.2l1.6-.6L5 16z",
  gauge: "M4 14a8 8 0 1 1 16 0 M12 14l4-4.5 M3.5 19h17",
  cpu: "M7 7h10v10H7z M10 10h4v4h-4z M9 4v3 M15 4v3 M9 17v3 M15 17v3 M4 9h3 M4 15h3 M17 9h3 M17 15h3",
  trash: "M4 7h16 M9 7V4h6v3 M6.5 7l1 13h9l1-13 M10 11v6 M14 11v6",
  copy: "M9 9h10v11H9z M5 15H4V4h11v1",
  refresh: "M20 12a8 8 0 1 1-2.3-5.6 M20 3v5h-5",
  lock: "M6 11V8a6 6 0 0 1 12 0v3 M5 11h14v10H5z M12 15v3",
  infinity: "M7 9.5a3.5 3.5 0 1 0 0 5c2.8 0 4.2-5 7-5a3.5 3.5 0 1 1 0 5c-2.8 0-4.2-5-7-5z",
  clock: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18z M12 7v5l3.5 2",
  file: "M7 3h7l5 5v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z M14 3v5h5",
  grid: "M4 4h7v7H4z M13 4h7v7h-7z M4 13h7v7H4z M13 13h7v7h-7z",
};

export function Icon({ name, size = 22, className = "", filled = false, strokeWidth = 1.8 }) {
  const d = P[name] || P.star;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {d.split(" M").map((seg, i) => (
        <path key={i} d={(i === 0 ? "" : "M") + seg} />
      ))}
    </svg>
  );
}

export function Logo({ size = 34 }) {
  return (
    <span className="relative inline-flex shrink-0" style={{ width: size, height: size }}>
      <span className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-300 via-amber-400 to-orange-500 shadow-lg shadow-amber-500/30 rotate-3" />
      <span className="absolute inset-0 grid place-items-center text-[#241a00]">
        <Icon name="star" size={size * 0.62} filled strokeWidth={1.2} />
      </span>
    </span>
  );
}
