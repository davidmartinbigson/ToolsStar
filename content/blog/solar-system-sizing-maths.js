// Solar sizing maths: daily watt-hours, inverter headroom, battery autonomy, panel array.
export default [
  {
    p: "Solar quotes arrive as walls of jargon — 5 kW this, 200 Ah that, hybrid inverter, tubular battery — and most people sign one without knowing which number belongs to their life. The honest truth is that a home solar system is sized by four arithmetic steps, and anyone who can multiply can check a quote against them.",
  },
  {
    p: "Here is the whole chain: what you consume in a day, what must run at once, how long you need to run it without sun, and how much panel it takes to refill the battery. Four numbers, in that order, always.",
  },
  { h2: "Step 1 — count your watt-hours, not your appliances" },
  {
    p: "Energy is power × time. A 75-watt ceiling fan running ten hours costs 750 watt-hours; the same fan for two hours costs 150. Lists of appliances mean nothing until each one gains an hours column, because the fridge that cycles all night outweighs the kettle that boils for six minutes.",
  },
  {
    table: {
      head: ["Typical load", "Running watts (rough)", "Hours/day example", "Wh/day"],
      rows: [
        ["Ceiling fan", "70–90 W", "10 h", "~800 Wh"],
        ["LED bulb", "9–12 W", "6 h", "~65 Wh each"],
        ["Laptop charger", "45–65 W", "4 h", "~240 Wh"],
        ["Efficient fridge (cycles)", "100–200 W average", "24 h cycling", "~1,200–2,000 Wh"],
        ["1–1.5 ton inverter AC", "800–1,500 W", "6 h", "~6,000–9,000 Wh"],
      ],
    },
  },
  {
    note: {
      tone: "info",
      title: "Sum the day, then add a margin",
      text: "Add every Wh line for your real routine, then multiply by about 1.15. Systems lose a little to heat, wiring and battery round-trip efficiency — the margin is not pessimism, it is physics paying its rent.",
    },
  },
  { h2: "Step 2 — size the inverter for the moment everything starts at once" },
  {
    p: "The inverter's job is instantaneous power, not daily energy. Add the running watts of everything that could be on simultaneously, then remember that motors — fridges, pumps, AC compressors — gulp two to three times their running watts for a second at startup. A common rule: simultaneous running watts × 1.25 to 1.5, and convert to VA by dividing by about 0.8, because inverters are rated in VA at a power factor below one.",
  },
  {
    ul: [
      "Fans + lights + laptop + TV: often 400–700 W running → a 1–1.5 kVA inverter breathes easily.",
      "Add a fridge: startup surge pushes you toward 2 kVA or more.",
      "Add any AC: you are in 3.5–5 kVA territory and the battery conversation changes completely.",
      "Undersized inverters do not slowly struggle; they shut down on overload, usually at the worst second.",
    ],
  },
  { h2: "Step 3 — size the battery for the hours without sun" },
  {
    p: "A battery is a bucket measured in watt-hours: volts × amp-hours. But you may not drain the bucket to the bottom — lead-acid batteries live longest kept above ~50 % charge, lithium above ~10–20 %. So usable capacity = V × Ah × depth-of-discharge, and the bucket you buy must be your night-time need divided by that fraction.",
  },
  {
    p: "Example: 1,200 Wh of evening load on a 12 V lead-acid bank at 50 % depth needs 1,200 ÷ 0.5 = 2,400 Wh of bank ≈ 200 Ah at 12 V. The same load on lithium at 90 % depth needs roughly a 110 Ah-equivalent bank — smaller, lighter, and several times more cycles before retirement.",
  },
  { h2: "Step 4 — size the panels to refill the bucket daily" },
  {
    p: "Panels are rated in watts at ideal noon sun; real days give you 'peak sun hours' — the equivalent hours of that ideal — typically around 4–5 in sunny climates, less in winter and monsoon. Divide your daily Wh (plus margin) by peak sun hours, then divide again by ~0.75–0.8 for heat, dust and wiring losses, and you have the array wattage that refills one day's bucket in one day's sun.",
  },
  {
    ul: [
      "2,500 Wh/day ÷ 4.5 peak hours ÷ 0.78 ≈ 710 W of panel — the maths is that short.",
      "Winter sizing: use your worst month's sun hours if the system must carry you year-round.",
      "Panel wattage alone is not a system: a huge array on a tiny battery charges beautifully and runs nothing at night.",
      "Orientation and shade beat paper specs — one shaded panel can drag a whole string.",
    ],
  },
  { h2: "The five mistakes that shrink systems after installation" },
  {
    ol: [
      "Sizing from panel watts alone, with no watt-hour audit — the classic '5 kW should be enough' gamble.",
      "Forgetting motor surges, then wondering why the inverter trips when the fridge starts.",
      "Assuming eight sun hours because the brochure's map looked optimistic.",
      "Mixing old and new batteries in one bank — the weak cell sets the ceiling for all.",
      "Zero headroom for next year's extra load; margins are cheaper today than upgrades later.",
    ],
  },
  {
    p: "A solar system is not a product, it is a budget: energy in, energy out, storage between. Run the four steps on your own routine before any salesperson runs them for you — and every quote you receive afterwards becomes a checkable claim instead of a leap of faith.",
  },
  {
    faq: [
      {
        q: "How do I estimate my daily load without a meter?",
        a: "List what runs, multiply each item's running watts by its daily hours, sum the watt-hours and add ~15 % margin. Nameplate watts overstate cycling devices (fridges, ACs) — use average or measured figures where you can; a plug-in energy meter settles arguments cheaply.",
      },
      {
        q: "Is a lithium battery worth the extra cost?",
        a: "Usually yes for daily cycling: lithium tolerates 80–90 % depth of discharge and thousands of cycles, while lead-acid prefers 50 % depth and far fewer cycles. Compare cost per usable watt-hour over expected life, not the sticker price alone.",
      },
      {
        q: "Can I run an air conditioner on solar?",
        a: "Physically yes — but AC dominates both the inverter (surge) and the battery (night hours) budgets. An inverter-type AC on a generously sized array with a lithium bank works; a non-inverter AC at night is where budgets explode. Size the AC first, everything else follows.",
      },
      {
        q: "What are 'peak sun hours' exactly?",
        a: "The number of hours per day your location receives sunlight at the intensity used to rate panels (1,000 W/m²), folded from the whole day's curve into one equivalent figure — commonly 4–5 in sunny regions, lower in winter, monsoon or heavy shade.",
      },
    ],
  },
  {
    cta: {
      tool: "solar-load-calculator",
      text: "Run your own numbers: add your appliances and hours, get inverter, battery and panel sizes instantly.",
    },
  },
];
