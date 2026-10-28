import ToolShell from "@/components/ToolShell";
import { ZakatCalculator } from "@/components/tools/calcPack";
import { getTool } from "@/lib/tools";

export const metadata = {
  title: "Zakat Calculator Pakistan — Gold, Silver, Cash & Nisab (PKR)",
  description:
    "Calculate your zakat in PKR: gold and silver by tola or gram, cash, bank savings, shares, business stock and money owed to you, minus debts. Instant nisab check and the 2.5% amount due. Free and private.",
  keywords: ["zakat calculator", "zakat calculator pakistan", "gold zakat calculator", "nisab calculator", "zakat on savings", "zakat calculation pkr", "zakat on gold tola"],
  alternates: { canonical: "/tools/zakat-calculator" },
  openGraph: {
    title: "Zakat Calculator — Gold, Cash & Nisab | Tools Stars",
    description: "Tola or gram gold, cash, savings and business stock → zakat due at 2.5%.",
  },
};

export default function Page() {
  return (
    <ToolShell
      tool={getTool("zakat-calculator")}
      intro="Enter your gold and silver (in tola or grams, at today's rate), then your cash, bank balance, investments, business stock and money you expect back. The calculator subtracts your debts, checks the result against the nisab threshold, and shows the 2.5% you owe — with a full line-by-line breakdown so you can see exactly where the number came from."
      steps={[
        { title: "Set units & today's rates", text: "Pick your currency, choose tola or grams, and enter the current rate per tola or per gram. Rates move daily, so use your jeweller's or a live rate site's figure." },
        { title: "Add gold, silver and money", text: "Jewellery, coins and bars at their weight value — then cash at home, bank balances, shares, business inventory and receivables you genuinely expect." },
        { title: "Subtract debts & read the result", text: "Loans, credit card balances and bills due are deducted. If your net wealth is above the nisab, 2.5% of it is your zakat; the breakdown shows every step." },
      ]}
      features={[
        "Gold and silver in tola (1 tola = 11.664 g) or grams — whichever you use at home",
        "Nisab checked against silver (612.36 g) or gold (87.48 g), your choice",
        "Covers cash, bank savings, shares, business stock and receivables",
        "Debts and bills due are subtracted before the 2.5% is applied",
        "PKR by default, plus USD, GBP, EUR, AED, SAR, INR and BDT",
        "Full working shown: total assets, deductions, net wealth, nisab, zakat due",
        "Nothing you type is stored or sent — the figures stay in your browser",
      ]}
      faqs={[
        { q: "What is the nisab, and why is silver usually the better choice?", a: "Nisab is the minimum wealth that makes zakat obligatory. It is set at 87.48 grams of gold (7.5 tola) or 612.36 grams of silver (52.5 tola). Because silver is far cheaper than gold, the silver nisab is a much lower threshold, so more people qualify and more zakat reaches those who need it — which is why most scholars recommend using silver. Use the gold nisab only if that is the ruling you follow." },
        { q: "How much zakat do I pay, and on what?", a: "2.5% of your net zakatable wealth — one fortieth. Net means your gold, silver, cash, bank balances, investments, business inventory and expected receivables, minus debts and bills you must pay. The wealth must also have been held for one full lunar (Hijri) year, which is why most people pay on a fixed zakat anniversary." },
        { q: "Is gold jewellery included even if I wear it daily?", a: "This is one of the genuinely debated points. Many scholars include all gold and silver jewellery in zakat regardless of use, while some exempt jewellery that is worn regularly within a normal, non-extravagant amount. Both positions are mainstream. Enter your jewellery to see the amount under the stricter view, then follow the ruling of a scholar you trust." },
        { q: "How do I convert tola into grams?", a: "One tola equals 11.664 grams, so 3 tola is about 34.99 grams. The calculator does this for you: choose the tola unit and enter the rate per tola, or switch to grams and enter the rate per gram — the values update instantly either way." },
        { q: "What about my house, car and salary?", a: "Personal-use assets are not zakatable: your home, furniture, car and the clothes you wear are all excluded. Salary is not taxed as it arrives either — what matters is the balance that remains in your possession on your zakat anniversary, which is why the bank and cash boxes are the right place for it." },
        { q: "Is this calculator a fatwa?", a: "No. It is an arithmetic helper using the widely accepted 2.5% rate and standard nisab weights. Rulings differ between schools of thought on jewellery, agricultural produce, property held for resale, provident funds, long-term loans and business valuation. For your actual payment, confirm the details with a qualified scholar — and pay before your zakat year passes." },
      ]}
    >
      <ZakatCalculator />
    </ToolShell>
  );
}
