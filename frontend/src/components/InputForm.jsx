import { useState } from "react";
import { postBFHL } from "../services/api.js";

const SAMPLE = "A->B,A->C,B->D,C->E,E->F,X->Y,Y->Z,Z->X";

function InputForm({ onResult, onError, onLoading, loading }) {
  const [input, setInput] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    onError("");
    onResult(null);

    const trimmed = input.trim();
    if (!trimmed) {
      onError("Please enter at least one edge.");
      return;
    }

    // Split by comma, trim each token, filter empty strings
    const data = trimmed.split(",").map((s) => s.trim()).filter(Boolean);

    onLoading(true);
    try {
      const result = await postBFHL({ data });
      onResult(result);
    } catch (err) {
      onError(err.message || "Something went wrong. Is the backend running?");
    } finally {
      onLoading(false);
    }
  };

  return (
    <form className="input-card" onSubmit={handleSubmit}>
      <div className="input-header">
        <label htmlFor="edge-input" className="input-label">
          Enter Edges
        </label>
        <button
          type="button"
          className="btn-sample"
          onClick={() => setInput(SAMPLE)}
        >
          Load Sample
        </button>
      </div>

      <textarea
        id="edge-input"
        className="edge-textarea"
        rows={4}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="A->B, A->C, B->D"
        disabled={loading}
      />

      <p className="input-hint">
        Comma-separated edges — e.g. <code>A-&gt;B, A-&gt;C, B-&gt;D</code>
      </p>

      <button className="btn-submit" type="submit" disabled={loading}>
        {loading ? (
          <span className="btn-inner">
            <span className="spinner" /> Analysing…
          </span>
        ) : (
          "Submit"
        )}
      </button>
    </form>
  );
}

export default InputForm;
