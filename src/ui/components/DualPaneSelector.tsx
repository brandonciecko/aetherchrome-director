import { useState, type DragEvent, type ReactNode } from "react";

/**
 * Shared left/right drag-and-drop selector: applied items on the left,
 * available items on the right. Dragging a card from the right pane to the
 * left applies it; dragging an applied card back to the right removes it.
 * Clicking a card (either pane) selects it and shows its details below the
 * available pane. Used by TraitsStep and EquipmentStep, which differ only in
 * what a card/detail body looks like (rank vs. quantity controls).
 */
export interface DualPaneSelectorProps<T> {
  applied: T[];
  available: T[];
  getId: (item: T) => string;
  renderCard: (item: T, context: { applied: boolean }) => ReactNode;
  renderDetails: (item: T) => ReactNode;
  onAdd: (id: string) => void;
  onRemove: (id: string) => void;
  appliedLabel: string;
  availableLabel: string;
}

export function DualPaneSelector<T>({
  applied,
  available,
  getId,
  renderCard,
  renderDetails,
  onAdd,
  onRemove,
  appliedLabel,
  availableLabel
}: DualPaneSelectorProps<T>) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedItem = [...applied, ...available].find(item => getId(item) === selectedId) ?? null;

  function handleDragStart(event: DragEvent, id: string) {
    event.dataTransfer.setData("text/plain", id);
    event.dataTransfer.effectAllowed = "move";
  }

  function allowDrop(event: DragEvent) {
    event.preventDefault();
  }

  function handleDrop(event: DragEvent, target: "applied" | "available") {
    event.preventDefault();
    const id = event.dataTransfer.getData("text/plain");
    if (!id) return;
    if (target === "applied") onAdd(id);
    else onRemove(id);
  }

  return (
    <div className="dual-pane">
      <div className="pane applied-pane" onDragOver={allowDrop} onDrop={event => handleDrop(event, "applied")}>
        <h3>{appliedLabel}</h3>
        <ul>
          {applied.map(item => {
            const id = getId(item);
            return (
              <li
                key={id}
                draggable
                onDragStart={event => handleDragStart(event, id)}
                onClick={() => setSelectedId(id)}
                className={`dual-pane-card ${id === selectedId ? "selected" : ""}`}
              >
                {renderCard(item, { applied: true })}
              </li>
            );
          })}
          {applied.length === 0 && <li className="empty-hint">Drag from the right to add.</li>}
        </ul>
      </div>

      <div className="pane available-pane" onDragOver={allowDrop} onDrop={event => handleDrop(event, "available")}>
        <h3>{availableLabel}</h3>
        <ul>
          {available.map(item => {
            const id = getId(item);
            return (
              <li
                key={id}
                draggable
                onDragStart={event => handleDragStart(event, id)}
                onClick={() => setSelectedId(id)}
                className={`dual-pane-card ${id === selectedId ? "selected" : ""}`}
              >
                {renderCard(item, { applied: false })}
              </li>
            );
          })}
        </ul>
      </div>

      <div className="pane details-pane">
        <h3>Details</h3>
        {selectedItem ? renderDetails(selectedItem) : <p className="empty-hint">Select a card to see details.</p>}
      </div>
    </div>
  );
}
