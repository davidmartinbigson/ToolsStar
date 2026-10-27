import ToolShell from "@/components/ToolShell";
import WordCounter from "@/components/tools/WordCounter";
import { getTool } from "@/lib/tools";

export const metadata = {
  title: "Word Counter — Count Words, Characters & Reading Time Free",
  description:
    "Free online word counter: words, characters (with & without spaces), sentences, paragraphs, reading & speaking time, keyword density and length goals for tweets, essays & SEO. Private — runs in your browser.",
  keywords: ["word counter", "word count", "character counter", "reading time calculator", "keyword density checker"],
  alternates: { canonical: "/tools/word-counter" },
  openGraph: { title: "Free Word Counter & Keyword Density | Tools Stars", description: "Live word, character and reading-time counts plus keyword density. 100% private." },
};

export default function Page() {
  return (
    <ToolShell
      tool={getTool("word-counter")}
      intro="Everything about your text, counted as you type: words, characters, sentences, paragraphs, reading and speaking time — plus keyword density and goal bars for tweets, meta descriptions, essays and blog posts."
      steps={[
        { title: "Type or paste your text", text: "Essays, articles, captions, cover letters, scripts — paste anything into the box. Counting starts instantly." },
        { title: "Read your stats", text: "Check total words against your limit, see how long it takes to read or present aloud, and spot over-used keywords in the density panel." },
        { title: "Polish & hit your target", text: "Use the goal bars to trim a tweet to 280 characters, stretch an essay to 650 words, or keep your SEO keyword near a natural 1–2%." },
      ]}
      features={[
        "Live counts for words, characters, characters without spaces, sentences & paragraphs",
        "Reading time (200 wpm) and speaking time (130 wpm) for essays, videos & presentations",
        "Keyword density top-8 with percentages — built for bloggers and SEO writers",
        "Goal trackers for X/Twitter posts, meta descriptions, blog posts and college essays",
        "Average sentence length and longest-word stats to improve readability",
        "Completely private: your unpublished drafts never leave this browser tab",
      ]}
      faqs={[
        { q: "How is reading time calculated?", a: "We use the widely-used average adult reading speed of about 200 words per minute for silent reading, and ~130 words per minute for speaking aloud (presentations, speeches, video scripts)." },
        { q: "What keyword density is good for SEO?", a: "Around 1–2% for your main keyword reads naturally and avoids 'keyword stuffing' penalties. Focus on covering the topic well with related terms rather than repeating one phrase." },
        { q: "How long should a blog post / essay be?", a: "Competitive blog posts usually run 1,500–2,500 words; a standard college application essay is ~650 words; a sharp meta description fits in 150–160 characters. The goal bars above track all of these for you." },
        { q: "Does the counter include numbers and hyphenated words?", a: "Numbers count as words (matching most editors), and a hyphenated word like 'well-written' counts as one word. Extra spaces and blank lines never inflate your counts." },
        { q: "Is my text stored or uploaded anywhere?", a: "No. Counting happens locally in your browser — safe for confidential legal, business and academic drafts. Closing the tab erases the text." },
      ]}
    >
      <WordCounter />
    </ToolShell>
  );
}
