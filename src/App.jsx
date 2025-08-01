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
import TableNode from './components/CustomNodes.jsx'
function MainApp() {

  const editorRef = useRef(null);
  const { dbml, setDbml } = useContext(EditorContext)
  const { diagramCode, setDiagramCode } = useContext(DiagramContext)
  const { theme } = useContext(AppContext)
  const [dbmlError, setDbmlError] = useState('')

  const [diagnostics, setDiagnostics] = useState({ diags: [] });
  const [diagramNodes, setDiagramNodes] = useState([]);
  const [diagramEdges, setDiagramEdges] = useState([]);
  

  const nodeTypes = {
    tableNode: TableNode,
  };

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
        console.log('Parsed DBML:', parsed);
        setDiagnostics({ diags: [] });

        const nodes = dbmlToReactFlowNodes(parsed);
        // console.log(nodes);
        const edges = dbmlToReactFlowEdges(parsed);
        // console.log(edges);
        setDiagramNodes(nodes);
        setDiagramEdges(edges);

        // console.log('Nodes:', nodes.map(n => n.id));
        // console.log('Edges:', edges.map(e => ({ source: e.source, target: e.target })));
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
      setDiagramEdges([]);
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
            <CompileErrorsViewer
              diagnostics={diagnostics}
              onErrorClick={handleErrorClick}
            />
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
              <DiagramViewer refnodes={diagramNodes} refedges={diagramEdges}/>
              {/* theme={theme} /> */}
            </div>
          </div>
        }
      />
    </div>
  )
}

function dbmlToReactFlowNodes(parsed) {
  if (!parsed || !parsed.schemas || !parsed.schemas[0] || !parsed.schemas[0].tables) return [];
  const tables = parsed.schemas[0].tables;
  // Spread tables horizontally for now
  // Create a node for each table (as a group node)
  const nodes = tables.map((table, idx) => ({
    id: table.name,
    data: { label: table.name },
    position: { x: 100 + idx * 300, y: 100 },
    style: { width: 200, height: 60 + (table.fields.length * 40) },
    type: 'tableNode',
  }));

  // Create a node for each field, as a child of its table
  const fieldNodes = tables.flatMap((table, idx) =>
    table.fields.map((field, fIdx) => ({
      id: `${table.name}.${field.name}`,
      data: {
        label: `${field.name}: ${field.type?.type_name || field.type || 'unknown'}`,
        isField: true,
        fieldName: field.name,
        fieldType: field.type?.type_name || field.type || 'unknown'
      },
      position: { x: 0, y: 40 + fIdx * 40 },
      parentId: table.name,
      extent: 'parent',
      draggable: false,
      type: 'tableNode',
    }))
  );
  // Merge table nodes and field nodes into a single array and return
  return nodes.concat(fieldNodes);
}

function dbmlToReactFlowEdges(parsed) {
  if (!parsed?.schemas?.[0]?.refs) return [];

  const refs = parsed.schemas[0].refs;
  const edges = [];

  refs.forEach(ref => {
    if (Array.isArray(ref.endpoints) && ref.endpoints.length === 2) {
      const [sourceEndpoint, targetEndpoint] = ref.endpoints;

      const source = sourceEndpoint.fieldNames?.[0]
        ? `${sourceEndpoint.tableName}.${sourceEndpoint.fieldNames[0]}`
        : sourceEndpoint.tableName;

      const target = targetEndpoint.fieldNames?.[0]
        ? `${targetEndpoint.tableName}.${targetEndpoint.fieldNames[0]}`
        : targetEndpoint.tableName;

      const sourceRelation = sourceEndpoint.relation || '';
      const targetRelation = targetEndpoint.relation || '';

      edges.push({
        id: `e-${source}-${target}`,
        source,
        target,
        sourceHandle: 'source',
        targetHandle: 'target',
        label: `${sourceRelation} → ${targetRelation}`,
        type: 'smoothstep'
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
