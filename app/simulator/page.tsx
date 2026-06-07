import ScenarioPlayer from "../../components/simulator/ScenarioPlayer";

export default function SimulatorPage() {
  return (
    <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-background">
      <div className="max-w-7xl mx-auto">
        <ScenarioPlayer />
      </div>
    </main>
  );
}
