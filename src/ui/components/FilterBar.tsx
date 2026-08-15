export interface FilterOption {
  value: string;
  label: string;
}

/** Shared search + optional category filter, used above Equipment/Traits/Skills lists. */
export function FilterBar({
  query,
  onQueryChange,
  searchPlaceholder = "Search…",
  categoryValue,
  categoryOptions,
  onCategoryChange
}: {
  query: string;
  onQueryChange: (query: string) => void;
  searchPlaceholder?: string;
  categoryValue?: string;
  categoryOptions?: FilterOption[];
  onCategoryChange?: (value: string) => void;
}) {
  return (
    <div className="filter-bar">
      <input
        type="text"
        className="filter-search"
        placeholder={searchPlaceholder}
        value={query}
        onChange={event => onQueryChange(event.target.value)}
      />
      {categoryOptions && onCategoryChange && (
        <select className="filter-category" value={categoryValue} onChange={event => onCategoryChange(event.target.value)}>
          {categoryOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
