import React, { useContext, useEffect, useState, useRef } from 'react'
import { EditorProvider, EditorContext } from './state/editorContext.jsx'
import { DiagramProvider, DiagramContext } from './state/diagramContext.jsx'
import { AppProvider, AppContext } from './state/appContext.jsx'
import LayoutContainer from './components/LayoutContainer'
import ThemeToggle from './components/ThemeToggle'
import DBMLEditor from './components/DBMLEditor'
import DiagramViewer from './components/DiagramViewer'
import CompileErrorsViewer from './components/CompileErrorsViewer'
import { Parser, CompilerDiagnostic, CompilerError } from '@dbml/core'
import './App.css'

function MainApp() {

  const editorRef = useRef(null);
  const { dbml, setDbml } = useContext(EditorContext)
  const { diagramCode, setDiagramCode } = useContext(DiagramContext)
  const { theme } = useContext(AppContext)
  const [dbmlError, setDbmlError] = useState('')

  const [diagnostics, setDiagnostics] = useState({ diags: [] });

  const handleErrorClick = (diag) => {
    const editor = editorRef.current;
    if (editor && diag.location?.start) {
      editor.revealPositionInCenter({
        lineNumber: diag.location.start.line,
        column: diag.location.start.column,
      });
      editor.setPosition({
        lineNumber: diag.location.start.line,
        column: diag.location.start.column,
      });
      editor.focus();
    }
  };
  useEffect(() => {
    try {
      if (dbml.trim()) {
        const parser = new Parser();
        const parsed = parser.parse(dbml, 'dbmlv2');
        setDiagnostics({ diags: [] }); // clear previous errors

        // Convert parsed DBML to Mermaid ERD code
        const mermaidCode = dbmlToMermaid(parsed);
        console.log('Mermaid ERD:', mermaidCode);
        setDiagramCode(mermaidCode);
      } else {
        setDiagramCode('');
        setDiagnostics({ diags: [] });
      }
    } catch (err) {
      if (err && err.diags && Array.isArray(err.diags)) {
        setDiagnostics({ diags: err.diags });
      } else {
        setDiagnostics({
          diags: [
            {
              message: err.message || 'Unknown error',
              location: {
                start: { line: 1, column: 1 },
              },
              type: 'error',
              code: 1001,
            },
          ],
        });
      }

      setDiagramCode('');
    }
  }, [dbml, setDiagramCode]);



  return (
    <div style={{ background: 'var(--bg-secondary)', minHeight: '100vh' }}>
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 32px',
        background: 'var(--bg-primary)',
        borderBottom: '1px solid var(--border-color)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
      }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--primary-color)' }}>
          SchemaNirmitee
        </h1>
        <ThemeToggle />
      </header>
      <LayoutContainer
        leftPane={
          <div style={{
            position: 'relative',
            background: 'var(--bg-primary)',
            borderRadius: '12px',
            // boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            height: 'calc(100vh - 96px)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ flex: 1 }}>
              <DBMLEditor
                value={dbml}
                onChange={setDbml}
                theme={theme}
                editorRef={editorRef}
              />
            </div>
            {/* {Array.isArray(diagnostics) && diagnostics.length > 0 && ( */}

            <CompileErrorsViewer
              diagnostics={diagnostics}
              onErrorClick={handleErrorClick}
            />
            {/* )} */}
          </div>
        }
        rightPane={
          <div style={{
            background: 'var(--bg-primary)',
            borderRadius: '12px',
            boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            height: 'calc(100vh - 96px)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ flex: 1 }}>
              <DiagramViewer diagramCode={diagramCode} />
            </div>
          </div>
        }
      />
    </div>
  )
}

function dbmlToMermaid(parsed) {
  if (!parsed || !parsed.schemas || !parsed.schemas[0] || !parsed.schemas[0].tables) return '';
  const tables = parsed.schemas[0].tables;
  let mermaid = 'erDiagram\n';
  tables.forEach(table => {
    mermaid += `  ${table.name} {\n`;
    table.fields.forEach(field => {
      // Use field.type.type_name for type, field.name for name
      const type = field.type?.type_name || field.type || 'unknown';
      mermaid += `    ${type} ${field.name}\n`;
    });
    mermaid += '  }\n';
  });
  return mermaid;
}

export default function App() {
  return (
    <AppProvider>
      <EditorProvider>
        <DiagramProvider>
          <MainApp />
        </DiagramProvider>
      </EditorProvider>
    </AppProvider>
  )
}
