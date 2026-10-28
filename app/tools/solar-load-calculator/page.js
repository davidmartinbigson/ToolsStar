import ToolShell from "@/components/ToolShell";
import { SolarLoadCalculator } from "@/components/tools/pakistanPack2";
import { getTool } from "@/lib/tools";

export const metadata = {
  title: "Solar Load Calculator Pakistan — Panels, Inverter & Battery Size",
  description: "Calculate your solar system size from fans, lights, fridge, AC and daily hours. Estimate panel count, inverter kW, battery Ah, monthly units and roof area. Free.",
  keywords: ["solar load calculator", "solar system size Pakistan", "inverter load calculator", "solar panel calculator"],
  alternates: { canonical: "/tools/solar-load-calculator" },
  openGraph: { title: "Solar Load Calculator | Tools Stars", description: "Size solar panels, inverter and batteries from your real home load." },
};

export default function Page() {
  return (
    <ToolShell
      tool={getTool("solar-load-calculator")}
      intro="Start with the sample home, change the quantities to match your house, and instantly see the running load, daily units, panel count, inverter size and battery estimate."
      steps={[
        { title: "Enter your appliances", text: "Set how many fans, lights, ACs and other items you have, and roughly how many hours each runs per day." },
        { title: "Set sun & panel size", text: "Five to six useful sun hours is a sensible starting point in many sunny Pakistani areas; adjust for shade, season and your city." },
        { title: "Choose backup needs", text: "Decide whether batteries must run only fans and lights or a larger part of the home, then compare lithium and lead-acid estimates." },
      ]}
      features={[
        "Ready watt estimates for common Pakistani home appliances",
        "Add custom appliances using the watt label on your own device",
        "Panel count, inverter kW, battery kWh/Ah and roof-area estimates",
        "Separate running-load and daily-unit calculations — no confusing them",
        "25% inverter safety margin and realistic system-loss allowance included",
      ]}
      faqs={[
        { q: "What is the difference between running load and daily units?", a: "Running load is watts being used at one moment and mainly decides inverter size. Daily units are watt-hours accumulated through the day and mainly decide how many solar panels and how much battery energy you need. A 1,000W iron used for 30 minutes uses only about 0.5 units." },
        { q: "Why is the fridge set to 10 hours instead of 24?", a: "A refrigerator is plugged in all day, but its compressor cycles on and off. Ten “effective running hours” at its rated watts is a starting estimate. Older or large fridges can use more; check the energy label or use a plug-in energy meter for precision." },
        { q: "Can this calculator tell me the exact system to buy?", a: "It gives a strong first estimate, not a final engineering design. Starting surge from motors, wiring length, roof shade and direction, battery brand limits, future load and local net-metering requirements should be checked by a qualified installer." },
        { q: "Should I size batteries for the full house?", a: "Usually no. Batteries are expensive, so most homes back up fans, lights, TV, router and fridge while avoiding ACs, irons, heaters and pumps during load-shedding. Choosing a lower backup percentage can reduce battery cost dramatically." },
      ]}
    >
      <SolarLoadCalculator />
    </ToolShell>
  );
}
