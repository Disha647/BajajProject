function Badge({ text, variant }) {
  return <span className={`badge badge-${variant}`}>{text}</span>;
}

function InfoCard({ title, children }) {
  return (
    <div className="card">
      <h3 className="card-title">{title}</h3>
      {children}
    </div>
  );
}

function IdentityCard({ data }) {
  const rows = [
    { label: "User ID",              value: data.user_id },
    { label: "Email",                value: data.email_id },
    { label: "College Roll Number",  value: data.college_roll_number },
  ];
  return (
    <InfoCard title="Identity">
      <table className="info-table">
        <tbody>
          {rows.map((r) => (
            <tr key={r.label}>
              <td className="info-key">{r.label}</td>
              <td className="info-val">{r.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </InfoCard>
  );
}

function SummaryCard({ summary }) {
  return (
    <InfoCard title="Summary">
      <div className="summary-grid">
        <div className="summary-stat">
          <span className="stat-value">{summary.total_trees}</span>
          <span className="stat-label">Trees</span>
        </div>
        <div className="summary-stat">
          <span className="stat-value">{summary.total_cycles}</span>
          <span className="stat-label">Cycles</span>
        </div>
        <div className="summary-stat">
          <span className="stat-value">{summary.largest_tree_root ?? "—"}</span>
          <span className="stat-label">Largest Root</span>
        </div>
      </div>
    </InfoCard>
  );
}

function HierarchyCard({ h, index }) {
  return (
    <div className="card hierarchy-card">
      <div className="hierarchy-header">
        <span className="hierarchy-index">#{index + 1}</span>
        <span className="hierarchy-root">Root: <strong>{h.root}</strong></span>
        {h.has_cycle ? (
          <Badge text="Cycle Detected" variant="danger" />
        ) : (
          <Badge text={`Depth: ${h.depth}`} variant="info" />
        )}
      </div>

      {!h.has_cycle && (
        <div className="tree-block">
          <p className="block-label">Tree Structure</p>
          <pre className="tree-pre">{JSON.stringify(h.tree, null, 2)}</pre>
        </div>
      )}

      {h.has_cycle && (
        <p className="cycle-note">
          This component contains a cycle. No depth is calculated.
        </p>
      )}
    </div>
  );
}

function TagList({ items, variant }) {
  if (!items || items.length === 0)
    return <p className="empty-note">None</p>;
  return (
    <div className="tag-list">
      {items.map((item) => (
        <Badge key={item} text={item} variant={variant} />
      ))}
    </div>
  );
}

function ResultDisplay({ result, error }) {
  if (error) {
    return (
      <div className="error-banner">
        <span className="error-icon">⚠</span> {error}
      </div>
    );
  }

  if (!result) return null;

  return (
    <section className="results-section">
      <h2 className="section-heading">Results</h2>

      <IdentityCard data={result} />
      <SummaryCard summary={result.summary} />

      <InfoCard title={`Hierarchies (${result.hierarchies.length})`}>
        {result.hierarchies.length === 0 ? (
          <p className="empty-note">No hierarchies found.</p>
        ) : (
          <div className="hierarchy-list">
            {result.hierarchies.map((h, i) => (
              <HierarchyCard key={h.root + i} h={h} index={i} />
            ))}
          </div>
        )}
      </InfoCard>

      <div className="two-col">
        <InfoCard title="Invalid Entries">
          <TagList items={result.invalid_entries} variant="danger" />
        </InfoCard>
        <InfoCard title="Duplicate Edges">
          <TagList items={result.duplicate_edges} variant="warning" />
        </InfoCard>
      </div>
    </section>
  );
}

export default ResultDisplay;
