import { useState } from "react";
import InputForm from "../components/InputForm.jsx";
import ResultDisplay from "../components/ResultDisplay.jsx";

function Home() {
  const [result, setResult]   = useState(null);
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <main className="page">
      <header className="page-header">
        <div className="header-inner">
          <div className="header-badge">BFHL</div>
          <div>
            <h1 className="page-title">Chitkara Challenge</h1>
            <p className="page-sub">Bajaj Finserv Health — Tree Hierarchy Analyser</p>
          </div>
        </div>
      </header>

      <div className="content">
        <InputForm
          onResult={setResult}
          onError={setError}
          onLoading={setLoading}
          loading={loading}
        />
        <ResultDisplay result={result} error={error} />
      </div>
    </main>
  );
}

export default Home;
