export default function AppPlannerCanvas() {
  return (
    <div className="app-planner-canvas" aria-hidden="true">
      <div className="app-planner-days">
        <span>Sen</span><span>Sel</span><span>Rab</span><span>Kam</span><span>Jum</span>
      </div>
      <div className="app-planner-grid" />
      <span className="app-planner-slot app-planner-slot-mint">Raka</span>
      <span className="app-planner-slot app-planner-slot-coral">Nala</span>
      <span className="app-planner-slot app-planner-slot-lilac">Dimas</span>
    </div>
  );
}
