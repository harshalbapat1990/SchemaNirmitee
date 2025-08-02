import React, { useContext, useEffect, useState, useRef, useCallback } from 'react'
import { EditorProvider, EditorContext } from './state/editorContext.jsx'
import { DiagramProvider, DiagramContext } from './state/diagramContext.jsx'
import { AppProvider, AppContext } from './state/appContext.jsx'
import LayoutContainer from './components/LayoutContainer'
import ThemeToggle from './components/ThemeToggle'
import DBMLEditor from './components/DBMLEditor'
import DiagramViewer from './components/DiagramViewer'
import CompileErrorsViewer from './components/CompileErrorsViewer'
import { Parser } from '@dbml/core'
import './App.css'
import TableNode from './components/CustomNodes.jsx'
import CustomEdgeStartEnd from './components/CustomEdgeStartEnd.jsx'

function MainApp() {
  const editorRef = useRef(null);
  const { dbml, setDbml } = useContext(EditorContext)
  const { diagramCode, setDiagramCode } = useContext(DiagramContext)
  const { theme } = useContext(AppContext)
  const [dbmlError, setDbmlError] = useState('')
  const [diagnostics, setDiagnostics] = useState({ diags: [] });
  const [diagramNodes, setDiagramNodes] = useState([]);
  const [diagramEdges, setDiagramEdges] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);

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

  // Single click: select/highlight in diagram
  const onNodeClick = useCallback((nodeId) => {
    setSelectedTable(nodeId);
  }, []);

  // Double click: highlight code in editor (table or field)
  const onNodeDoubleClick = useCallback((nodeId) => {
    if (!dbml) return;
    const lines = dbml.split('\n');

    // Field node: TableName.FieldName
    if (nodeId.includes('.')) {
      const [tableName, fieldNameOrHeader] = nodeId.split('.');
      // If it's a header node, treat as table node
      if (fieldNameOrHeader === 'header') {
        // Table node logic below
        nodeId = tableName;
      } else {
        // Field node logic
        const tableStart = lines.findIndex(line => line.trim().toLowerCase().startsWith(`table ${tableName.toLowerCase()}`));
        if (tableStart === -1 || !editorRef.current) return;
        let openBraceLine = tableStart;
        while (openBraceLine < lines.length && !lines[openBraceLine].includes('{')) openBraceLine++;
        if (openBraceLine >= lines.length) return;
        let fieldLine = -1;
        for (let i = openBraceLine + 1; i < lines.length; i++) {
          if (lines[i].includes('}')) break;
          if (lines[i].trim().toLowerCase().startsWith(fieldNameOrHeader.toLowerCase())) {
            fieldLine = i;
            break;
          }
        }
        if (fieldLine === -1) return;
        editorRef.current.setSelection({
          startLineNumber: fieldLine + 1,
          startColumn: 1,
          endLineNumber: fieldLine + 1,
          endColumn: lines[fieldLine].length + 1,
        });
        editorRef.current.revealPositionInCenter({
          lineNumber: fieldLine + 1,
          column: 1,
        });
        editorRef.current.focus();
        return;
      }
    }

    // Table node logic
    const tableStart = lines.findIndex(line => line.trim().toLowerCase().startsWith(`table ${nodeId.toLowerCase()}`));
    if (tableStart === -1 || !editorRef.current) return;
    let openBraceLine = tableStart;
    while (openBraceLine < lines.length && !lines[openBraceLine].includes('{')) openBraceLine++;
    if (openBraceLine >= lines.length) return;
    let braceCount = 0;
    let tableEnd = openBraceLine;
    for (let i = openBraceLine; i < lines.length; i++) {
      if (lines[i].includes('{')) braceCount++;
      if (lines[i].includes('}')) braceCount--;
      if (braceCount === 0) {
        tableEnd = i;
        break;
      }
    }
    editorRef.current.setSelection({
      startLineNumber: tableStart + 1,
      startColumn: 1,
      endLineNumber: tableEnd + 1,
      endColumn: lines[tableEnd].length + 1,
    });
    editorRef.current.revealPositionInCenter({
      lineNumber: tableStart + 1,
      column: 1,
    });
    editorRef.current.focus();
  }, [dbml]);

  useEffect(() => {
    try {
      if (dbml.trim()) {
        const parser = new Parser();
        const parsed = parser.parse(dbml, 'dbmlv2', { locations: true });
        setDiagnostics({ diags: [] });
        const nodes = dbmlToReactFlowNodes(parsed, theme);
        const edges = dbmlToReactFlowEdges(parsed);
        setDiagramNodes(nodes);
        setDiagramEdges(edges);
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
              location: { start: { line: 1, column: 1 } },
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
  }, [dbml, setDiagramCode, theme]);

  return (
    <div style={{ background: 'var(--bg-secondary)', minHeight: '100%' }}>
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 32px',
        background: 'var(--bg-primary)',
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
              <DiagramViewer
                refnodes={diagramNodes}
                refedges={diagramEdges}
                onTableClick={onNodeClick}
                onTableDoubleClick={onNodeDoubleClick}
                onFieldDoubleClick={onNodeDoubleClick}
                selectedTable={selectedTable}
                theme={theme}
              />
            </div>
          </div>
        }
      />
    </div>
  )
}

function dbmlToReactFlowNodes(parsed, theme) {
  if (!parsed || !parsed.schemas || !parsed.schemas[0] || !parsed.schemas[0].tables) return [];

  const tables = parsed.schemas[0].tables;

  const estimateTextWidth = (text, charWidth = 8) => text.length * charWidth;

  const nodes = tables.flatMap((table, idx) => {
    const parentId = `${table.name}parent`;

    const fieldLabels = table.fields.map(
      (field) => `${field.name}: ${field.type?.type_name || field.type || 'unknown'}`
    );

    const maxFieldLabelWidth = Math.max(...fieldLabels.map(label => estimateTextWidth(label)));
    console.log(maxFieldLabelWidth)
    const headerWidth = estimateTextWidth(table.name);
    console.log(headerWidth)
    const contentWidth = Math.max(maxFieldLabelWidth, headerWidth);
    console.log(contentWidth)

    const parentNode = {
      id: parentId,
      data: { 
        label: table.name,
        isParent: true,
        theme
      },
      position: { x: 100 + idx * 400, y: 100 },
      style: {
        width: contentWidth + 2, // Add padding
        height: ((table.fields.length + 1) * 40 + 2),
      },
      type: 'default',
    };

    const headerNode = {
      id: `${table.name}.header`,
      data: {
        label: table.name,
        isTable: true,
        fieldName: table.name,
        fieldType: 'Table',
        theme,
      },
      position: { x: 1, y: 1 },
      style: {
        width: contentWidth, // Add padding
      },
      parentId,
      extent: 'parent',
      draggable: false,
      type: 'tableNode',
    };

    const fieldNodes = table.fields.map((field, fIdx) => ({
      id: `${table.name}.${field.name}`,
      data: {
        label: `${field.name}: ${field.type?.type_name || field.type || 'unknown'}`,
        isField: true,
        fieldName: field.name,
        fieldType: field.type?.type_name || field.type || 'unknown',
      },
      position: { x: 1, y: (fIdx + 1) * 40 + 1},
      style: {
        width: contentWidth, // Add padding
      },
      parentId,
      extent: 'parent',
      draggable: false,
      type: 'tableNode',
    }));

    return [parentNode, headerNode, ...fieldNodes];
  });

  return nodes;
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
        type: 'start-end',
        data: {
          startLabel: sourceRelation,
          endLabel: targetRelation,
        },
        // label: `${sourceRelation} → ${targetRelation}`,
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
