

import { useState, useEffect, useMemo } from "react";
import "prismjs/themes/prism-tomorrow.css";
import Editor from "react-simple-code-editor";
import axios from "axios";
import Markdown from "react-markdown";
import prism from "prismjs";
import "./App.css";



// Language select options
const languages = [
  { value: "javascript", label: "JavaScript", ext: "js" },
  { value: "typescript", label: "TypeScript", ext: "ts" },
  { value: "python", label: "Python", ext: "py" },
  { value: "java", label: "Java", ext: "java" },
  { value: "c", label: "C", ext: "c" },
  { value: "cpp", label: "C++", ext: "cpp" },
  { value: "csharp", label: "C#", ext: "cs" },
  { value: "php", label: "PHP", ext: "php" },
  { value: "ruby", label: "Ruby", ext: "rb" },
  { value: "go", label: "Go", ext: "go" },
  { value: "rust", label: "Rust", ext: "rs" },
  { value: "kotlin", label: "Kotlin", ext: "kt" },
  { value: "swift", label: "Swift", ext: "swift" },
  { value: "r", label: "R", ext: "r" },
  { value: "scala", label: "Scala", ext: "scala" },
  { value: "perl", label: "Perl", ext: "pl" },
  { value: "haskell", label: "Haskell", ext: "hs" },
  { value: "dart", label: "Dart", ext: "dart" },
  { value: "elixir", label: "Elixir", ext: "ex" },
  { value: "clojure", label: "Clojure", ext: "clj" },
];

// Tiny language samples shown when switching languages (optional)
const samples = {
  javascript: `function sum(a, b) { return a + b; }\nconsole.log(sum(2, 3));`,
  typescript: `function sum(a: number, b: number): number { return a + b; }\nconsole.log(sum(2, 3));`,
  python: `def sum(a, b):\n    return a + b\n\nprint(sum(2, 3))`,
  java: `class Main {\n  static int sum(int a, int b){ return a + b; }\n  public static void main(String[] args){ System.out.println(sum(2,3)); }\n}`,
  c: `#include <stdio.h>\nint sum(int a,int b){return a+b;}\nint main(){printf("%d", sum(2,3));}`,
  cpp: `#include <iostream>\nint sum(int a,int b){return a+b;}\nint main(){std::cout<<sum(2,3);}`,
  go: `package main\nimport "fmt"\nfunc sum(a,b int) int {return a+b}\nfunc main(){fmt.Println(sum(2,3))}`,
  rust: `fn sum(a:i32,b:i32)->i32{a+b}\nfn main(){println!("{}", sum(2,3));}`,
};

// Fallback-safe Prism grammar getter
function getGrammar(lang) {
  return (
    prism.languages[lang] ||
    prism.languages[lang?.toLowerCase?.()] ||
    prism.languages.javascript ||
    prism.languages.markup
  );
}

export default function App() {
  const [selectedLang, setSelectedLang] = useState(languages[0]);
  const [code, setCode] = useState(samples.javascript);
  const [review, setReview] = useState("");
  const [dark, setDark] = useState(true);
  const [wrap, setWrap] = useState(false);
  const [loading, setLoading] = useState(false);

  // resizable split
  const [editorWidth, setEditorWidth] = useState(50); // % width
  const [dragging, setDragging] = useState(false);

  // highlight when code or language changes
  useEffect(() => {
    prism.highlightAll();
  }, [code, selectedLang]);

  // keyboard shortcut: Ctrl/Cmd + Enter => review
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") reviewCode();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [code, selectedLang]);

  // Drag to resize
  useEffect(() => {
    const onMove = (e) => {
      if (!dragging) return;
      const min = 25; // %
      const max = 75; // %
      const total = document.body.clientWidth;
      const next = Math.min(max, Math.max(min, (e.clientX / total) * 100));
      setEditorWidth(next);
    };
    const onUp = () => setDragging(false);

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [dragging]);

  async function reviewCode() {
    try {
      setLoading(true);
      const response = await axios.post("http://localhost:3000/ai/get-review", {
        code,
        language: selectedLang.value,
      });
      setReview(response.data);
    } catch (err) {
      setReview("⚠️ Error: Could not fetch review. Is the backend running at http://localhost:3000 ?");
    } finally {
      setLoading(false);
    }
  }

  function copyReview() {
    navigator.clipboard.writeText(review || "");
  }

  function copyCode() {
    navigator.clipboard.writeText(code || "");
  }



  function onLanguageChange(e) {
    const lang = languages.find((l) => l.value === e.target.value) || languages[0];
    setSelectedLang(lang);
    // load a tiny starter snippet if available
    if (samples[lang.value]) setCode(samples[lang.value]);
  }

  const editorStyle = useMemo(
    () => ({
      fontFamily: '"Fira Code", "Fira Mono", monospace',
      fontSize: 15,
      height: "100%",
      width: "100%",
      whiteSpace: wrap ? "pre-wrap" : "pre",
    }),
    [wrap]
  );

  return (
    <div className={`app ${dark ? "dark" : ""}`}>
      {/* Navbar */}
      <nav className="navbar">
        <div className="brand">
          <span className="logo">⚡</span>
          <span className="title"><h3>BugSpotter</h3></span>
        </div>

        <div>
          <p>detects bugs and issues instantly.</p>
        </div>

        <div className="nav-actions">
          {/* Native select (custom-styled) */}
          <label className="select-wrap" title="Language">
            <select value={selectedLang.value} onChange={onLanguageChange}>
              {languages.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
            <span className="arrow" />
          </label>

          {/* <button className="btn btn-ghost" onClick={() => setWrap((w) => !w)} title="Toggle word wrap">
            {wrap ? "⤢ Unwrap" : "⤡ Wrap"}
          </button> */}

          <button className="btn btn-ghost" onClick={() => setDark((d) => !d)} title="Toggle theme">
            {dark ? "☀ Light" : "🌙 Dark"}
          </button>

          <button className="btn btn-secondary" onClick={copyCode} title="Copy code">
            📋 Copy Code
          </button>

          {/* <button className="btn btn-secondary" onClick={downloadCode} title="Download code">
            ⭳ Download
          </button> */}

          <button className="btn btn-primary" onClick={reviewCode} title="Review (Ctrl/Cmd + Enter)">
            🚀 Review
          </button>
        </div>
      </nav>

      {/* Main */}
      <main className="layout">
        {/* Left: Editor */}
        <section className="pane left" style={{ width: `${editorWidth}%` }}>
          <div className="pane-header">
            <div className="pill">{selectedLang.label}</div>
          </div>

          {/* <div className="editor-wrap">
            <Editor
              value={code}
              onValueChange={setCode}
              highlight={(c) => prism.highlight(c, getGrammar(selectedLang.value), selectedLang.value)}
              padding={14}
              style={editorStyle}
            />
          </div> */}


            <div className="editor-wrap">
              <Editor
                value={code}
                onValueChange={setCode}
                highlight={(c) => prism.highlight(c, getGrammar(selectedLang.value), selectedLang.value)}
                padding={14}
                style={editorStyle}
              />
            </div>



        </section>

        {/* Divider */}
        <div
          className={`divider ${dragging ? "dragging" : ""}`}
          onMouseDown={() => setDragging(true)}
          role="separator"
          aria-orientation="vertical"
          aria-label="Resize editor"
        />

        {/* Right: Response */}
        <section className="pane right" style={{ width: `${100 - editorWidth}%` }}>
          <div className="pane-header right-head">
            <h2>💡 AI Suggestions</h2>
            <div className="right-actions">
              <button className="btn btn-secondary" onClick={copyReview} title="Copy response">
                📋 Copy
              </button>
              <button className="btn btn-ghost" onClick={() => setReview("")} title="Clear response">
                🗑 Clear
              </button>
            </div>
          </div>

          <div className="response-body">
            {loading ? (
              <div className="loading">
                <div className="spinner" />
                <span>Reviewing your code…</span>
              </div>
            ) : (
              <div className="markdown">
                <Markdown>{review || "👉 Click **Review** to see suggestions here."}</Markdown>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

