// Password strength is maths, not folklore: entropy, cracking costs and what actually protects you.
export default [
  {
    p: "Every signup form on the internet demands a 'strong' password, and most people respond with a memory trick: a name, a year, an exclamation mark to satisfy the meter. Meanwhile the attackers guessing that password are not humans typing slowly — they are GPUs running through billions of candidates per second, and they do not care about your memory trick.",
  },
  {
    p: "The honest measure of password strength is not creativity, it is entropy: the size of the space an attacker must search. Understand that one number and every piece of password advice you have ever heard snaps into place.",
  },
  { h2: "What entropy actually measures" },
  {
    p: "Entropy counts how many guesses a perfect attacker needs on average, expressed in bits: each bit doubles the guessing space. The space itself comes from one multiplication — the number of possible symbols (the charset) raised to the password length. Lowercase only gives 26 symbols per character; mixed case plus digits, 62; adding punctuation, around 95.",
  },
  {
    ul: [
      "Length multiplies the space again and again — every extra character is another exponent, which is why length is the cheapest strength you can buy.",
      "Charset widens the base: going from 26 to 95 symbols adds roughly 1.9 bits per character — useful, but never as dramatic as adding characters.",
      "Randomness is the hidden requirement: entropy calculations assume every character was drawn uniformly at random. A human picking 'cleverly' collapses the space to the patterns attackers try first.",
    ],
  },
  { h2: "How long does cracking actually take?" },
  {
    p: "The realistic threat model is offline: a service you used gets breached, its password hashes leak, and attackers grind through candidates on their own hardware with no rate limits. Assume a strong modern rig at ten billion guesses per second against a fast hash — and remember the average crack finds you halfway through the space:",
  },
  {
    table: {
      head: ["Password shape", "Entropy (approx.)", "Average time at 10B guesses/sec"],
      rows: [
        ["8 lowercase letters", "~38 bits", "Seconds"],
        ["8 mixed case + digits", "~48 bits", "A few hours"],
        ["8 mixed case + digits + symbols", "~53 bits", "About a week"],
        ["4 random dictionary words", "~52 bits", "About a week"],
        ["12 mixed case + digits + symbols", "~79 bits", "Hundreds of thousands of years"],
        ["6 random dictionary words", "~78 bits", "Hundreds of thousands of years"],
        ["16 mixed case + digits + symbols", "~105 bits", "Vastly longer than the age of the universe"],
      ],
    },
  },
  {
    note: {
      tone: "info",
      title: "Online attacks are a different, slower game",
      text: "Against a live login page, rate limiting, lockouts and captcha cap attackers at a trickle of guesses — brute force online is mostly noise. The danger is offline grinding of leaked hashes, which is exactly why the table above assumes it. Your password's job is to survive a breach you never hear about.",
    },
  },
  { h2: "Why 'P@ssw0rd!' fails: attackers guess humans, not strings" },
  {
    p: "Real cracking does not start at aaa and count up. It starts with dictionaries: every leaked password list ever published, then rule-based mutations of them — capitalise the first letter, append a year, swap o for 0. 'P@ssw0rd!' sits in the first few million guesses of essentially every attack, which at ten billion per second means it dies in under a millisecond.",
  },
  {
    ul: [
      "Names, birthdays, team names and keyboard walks (qwerty, 123456) are precomputed in attacker wordlists.",
      "Leet-speak substitutions are rules, not randomness — the mutator applies them automatically.",
      "Appending the current year is the single most predictable human habit in breach data.",
      "Only genuine randomness — a generator, dice, a coin — puts you outside the dictionary entirely.",
    ],
  },
  { h2: "Passphrase or random string? Both win, if truly random" },
  {
    p: "Six random words from a large list (~7,776 entries) carry about 78 bits — the same league as a 12-character random string — with one huge practical advantage: humans can memorise a story of words and cannot memorise noise. The catch is the word 'random': picking words yourself re-introduces taste, and taste is guessable.",
  },
  {
    p: "So the real decision is not passphrase versus string, it is generator versus human. Let software roll the dice, pick whichever shape you can reliably type on a bad day, and spend the saved memory budget on length.",
  },
  { h2: "What protects you more than the password itself" },
  {
    p: "Brute force is actually the least common way accounts die. The working kill-chain is mundane: password reuse across sites, credential stuffing from old breaches, and phishing. Which means the highest-value habits are not about character classes at all:",
  },
  {
    ol: [
      "Unique password per account — one breach must not become ten. This single habit beats any amount of entropy on a reused string.",
      "A password manager to carry the uniqueness for you; its built-in generator is the most convenient source of true randomness you own.",
      "Two-factor authentication (or passkeys) on email, banking and anything irreplaceable — it converts a stolen password into a failed login.",
      "Length first when you must memorise: sixteen random characters or six random words for your vault's master and your email root; everything else the manager can hold.",
    ],
  },
  {
    p: "A strong password is not a test of creativity — it is a lottery ticket whose odds you choose. Roll the space wide with randomness, make it long because length is cheap, keep it unique because reuse is the real killer, and let a generator do the remembering. The maths is on your side the moment you stop outsmarting it.",
  },
  {
    faq: [
      {
        q: "How long should a password be in practice?",
        a: "At least 12 truly random characters (or four-to-six random words) for important accounts, and 16+ for the two that matter most: your email root and your password manager's master. Length is the cheapest strength available — every extra random character doubles the attacker's work.",
      },
      {
        q: "Are browser password generators safe to use?",
        a: "A generator that runs entirely in your browser and never transmits the string is safe by design — nothing leaves your device. The real risks are reused passwords and breached sites, not local generation. Prefer open, inspectable tools or your password manager's built-in generator.",
      },
      {
        q: "Do symbols actually make a password stronger?",
        a: "They widen the charset (about 1.9 extra bits per character), so yes — but length adds far more per unit of effort, and symbols hurt memorability. A long random passphrase without a single symbol beats a short symbol soup every time.",
      },
      {
        q: "Should I change my passwords regularly?",
        a: "Modern guidance (including NIST) says rotate only when there is evidence of a leak, not on a calendar. Forced rotation pushes people into predictable patterns (Spring2026! becomes Summer2026!), which attackers exploit. Uniqueness per site plus two-factor auth beats scheduled changes.",
      },
    ],
  },
  {
    cta: {
      tool: "password-generator",
      text: "Generate a truly random password or passphrase in your browser — nothing typed, nothing transmitted, nothing stored.",
    },
  },
];
