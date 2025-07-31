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
  const [diagramNodes, setDiagramNodes] = useState([]);
  const [diagramEdges, setDiagramEdges] = useState([]);

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
        // After parsing DBML
        const parsed = parser.parse(dbml, 'dbmlv2');
        // console.log('Parsed DBML:', parsed);
        setDiagnostics({ diags: [] });

        const nodes = dbmlToReactFlowNodes(parsed);
        const edges = dbmlToReactFlowEdges(parsed);
        setDiagramNodes(nodes);
        setDiagramEdges(edges);

        console.log('Nodes:', nodes.map(n => n.id));
        console.log('Edges:', edges.map(e => ({ source: e.source, target: e.target })));
      } else {
        setDiagramNodes([]);
        setDiagramEdges([]);
        setDiagnostics({ diags: [] });
      }
    } catch (err) {
      setDiagramNodes([]);
      setDiagramEdges([]);
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
      setDiagramNodes([]);
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
              <DiagramViewer nodes={diagramNodes} edges={diagramEdges} />
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

function dbmlToReactFlowNodes(parsed) {
  if (!parsed || !parsed.schemas || !parsed.schemas[0] || !parsed.schemas[0].tables) return [];
  const tables = parsed.schemas[0].tables;
  // Spread tables horizontally for now
  return tables.map((table, idx) => ({
    id: table.name,
    type: 'default',
    position: { x: 100 + idx * 300, y: 100 },
    data: {
      label: table.name,
      fields: table.fields.map(f => ({
        name: f.name,
        type: f.type?.type_name || f.type || 'unknown'
      }))
    }
  }));
}

function dbmlToReactFlowEdges(parsed) {
  if (!parsed || !parsed.schemas || !parsed.schemas[0] || !parsed.schemas[0].refs) return [];
  const refs = parsed.schemas[0].refs;
  const edges = [];

  refs.forEach(ref => {
    if (Array.isArray(ref.endpoints) && ref.endpoints.length === 2) {
      // referencing = endpoints[0], referenced = endpoints[1]
      const referencing = ref.endpoints[0];
      const referenced = ref.endpoints[1];

      edges.push({
        id: `e-${referencing.tableName}-${referenced.tableName}-${referencing.fieldNames?.[0] || 'ref'}`,
        source: referencing.tableName,
        target: referenced.tableName,
        label: `${referencing.fieldNames?.[0] || 'ref'} → ${referenced.tableName}.${referenced.fieldNames?.[0]}`,
      });
    }
  });

  return edges;
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
