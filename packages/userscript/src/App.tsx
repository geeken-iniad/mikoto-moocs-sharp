import { CharacterCounter, log, isMoocsPage } from "@mikoto-moocs-sharp/shared";
import { useState } from "react";

function App() {
  const [text, setText] = useState("Sample text\nテストテキスト");

  // Example usage of shared utilities
  if (isMoocsPage()) {
    log("Running on MOOCs page");
  }

  return (
    <div
      className="App"
      style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}
    >
      <h1>Mikoto MOOCs # - Userscript</h1>
      <p>UserScript version powered by vite-plugin-monkey</p>

      <div style={{ marginTop: "20px" }}>
        <h2>Character Counter Demo</h2>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{
            width: "100%",
            minHeight: "150px",
            padding: "10px",
            fontFamily: "monospace",
          }}
        />
        <CharacterCounter value={text} />
      </div>
    </div>
  );
}

export default App;
