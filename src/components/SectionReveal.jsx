export default function SectionReveal({
  children,
  immediate = false,
  className = "",
}) {
  return (
    <div
      className={`section-reveal ${immediate ? "is-immediate" : ""} ${className}`.trim()}
      data-revealed={immediate ? "true" : "structural"}
    >
      <div className="section-reveal__surface">{children}</div>
    </div>
  );
}
