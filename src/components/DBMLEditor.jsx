
import React, { useEffect } from 'react';
import MonacoEditor, { useMonaco } from '@monaco-editor/react';
import { Parser } from '@dbml/core';

export default function DBMLEditor({ value, onChange, theme, editorRef }) {
  const monaco = useMonaco();

  useEffect(() => {
    if (!monaco) return;

    if (!monaco.languages.getLanguages().some(lang => lang.id === 'dbml')) {
      monaco.languages.register({ id: 'dbml' });

      monaco.languages.setMonarchTokensProvider('dbml', {
        tokenizer: {
          root: [
            [/\b(Table|Ref|Enum|Note|Project|TableGroup)\b/, 'keyword'],
            [/\b(int|bigint|varchar|nvarchar|uuid|boolean|bit|datetime|datetime2|datetimeoffset|float|text|decimal|numeric)\b/, 'type'],
            [/\[[^\]]+\]/, 'attribute'],
            [/"[^"]*"/, 'string'],
            [/'[^']*'/, 'string'],
            [/\b\d+(\.\d+)?\b/, 'number'],
            [/[{}()\[\]=:>]/, 'operator'],
            [/[a-zA-Z_][\w$]*/, 'identifier'],
            [/#.*$/, 'comment'],
            [/\/\/.*$/, 'comment'],
            [/\/\*/, { token: 'comment', next: '@comment' }],
          ],
          comment: [
            [/[^\/*]+/, 'comment'],
            [/\*\//, 'comment', '@pop'],
            [/[\/*]/, 'comment']
          ]
        }
      });

      monaco.languages.registerCompletionItemProvider('dbml', {
        triggerCharacters: [' ', ':', '>', '.', '['],
        provideCompletionItems: (model, position) => {
          const textUntilPosition = model.getValueInRange({
            startLineNumber: position.lineNumber,
            startColumn: 1,
            endLineNumber: position.lineNumber,
            endColumn: position.column
          });

          const dbml = model.getValue();
          let tableMap = {};
          try {
            const parser = new Parser();
            const ast = parser.parse(dbml, 'dbml');
            const tables = ast.schemas[0].tables || [];
            tableMap = tables.reduce((acc, table) => {
              acc[table.name] = table.fields.map(f => f.name);
              return acc;
            }, {});
          } catch {}

          const refMatch = textUntilPosition.match(/\[ref:\s*>\s*([\w]*)\.?([\w]*)?$/);
          if (refMatch) {
            const [_, tablePrefix, fieldPrefix] = refMatch;
            if (!tablePrefix) {
              return {
                suggestions: Object.keys(tableMap).map(table => ({
                  label: table,
                  kind: monaco.languages.CompletionItemKind.Class,
                  insertText: table,
                  documentation: 'Referenced table'
                }))
              };
            }
            if (tablePrefix && !fieldPrefix) {
              const fields = tableMap[tablePrefix] || [];
              return {
                suggestions: fields.map(field => ({
                  label: field,
                  kind: monaco.languages.CompletionItemKind.Field,
                  insertText: field,
                  documentation: `Field in ${tablePrefix}`
                }))
              };
            }
          }

          return {
            suggestions: [
              {
                label: 'Table',
                kind: monaco.languages.CompletionItemKind.Keyword,
                insertText: 'Table ${1:TableName} {\n\t$0\n}',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: 'Define a new table'
              },
              {
                label: 'Ref',
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: '[ref: > ${1:Table.Column}]',
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: 'Define a foreign key reference'
              },
              {
                label: 'note',
                kind: monaco.languages.CompletionItemKind.Snippet,
                insertText: "[note: '${1:Your note here}']",
                insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                documentation: 'Add a note to a column or table'
              },
              ...['int', 'bigint', 'varchar', 'nvarchar', 'uuid', 'boolean', 'bit', 'datetime', 'datetime2', 'datetimeoffset', 'float', 'text', 'decimal', 'numeric'].map(type => ({
                label: type,
                kind: monaco.languages.CompletionItemKind.TypeParameter,
                insertText: type,
                documentation: `DBML data type: ${type}`
              })),
              ...['pk', 'not null', 'unique', 'increment', 'default'].map(attr => ({
                label: `[${attr}]`,
                kind: monaco.languages.CompletionItemKind.Property,
                insertText: `[${attr}]`,
                documentation: `Column attribute: ${attr}`
              }))
            ]
          };
        }
      });

      monaco.editor.defineTheme('dbml-dark', {
        base: 'vs-dark',
        inherit: true,
        rules: [
          { token: 'keyword', foreground: 'FFB86C', fontStyle: 'bold' },
          { token: 'type', foreground: '8BE9FD', fontStyle: 'bold' },
          { token: 'attribute', foreground: 'F1FA8C' },
          { token: 'string', foreground: '50FA7B' },
          { token: 'number', foreground: 'BD93F9' },
          { token: 'comment', foreground: '6272A4', fontStyle: 'italic' },
          { token: 'operator', foreground: 'F8F8F2' },
          { token: 'identifier', foreground: 'FF79C6' },
        ],
        colors: {
          'editor.background': '#282A36',
        },
      });

      monaco.editor.defineTheme('dbml-light', {
        base: 'vs',
        inherit: true,
        rules: [
          { token: 'keyword', foreground: '005CC5', fontStyle: 'bold' },
          { token: 'type', foreground: '22863A', fontStyle: 'bold' },
          { token: 'attribute', foreground: 'B08800' },
          { token: 'string', foreground: '032F62' },
          { token: 'number', foreground: '6F42C1' },
          { token: 'comment', foreground: '6A737D', fontStyle: 'italic' },
          { token: 'operator', foreground: '24292E' },
          { token: 'identifier', foreground: 'D73A49' },
        ],
        colors: {
          'editor.background': '#FAFBFC',
        },
      });
    }
  }, [monaco]);

  return (
    <div style={{ height: '100%', width: '100%' }}>
      <MonacoEditor
        key={theme}
        height="100%"
        width="100%"
        language="dbml"
        theme={theme === 'dark' ? 'dbml-dark' : 'dbml-light'}
        value={value}
        onChange={onChange}
        onMount={(editor) => {
          if (editorRef) {
            editorRef.current = editor;
          }
        }}
        options={{
          fontSize: 16,
          minimap: { enabled: false },
          wordWrap: 'on',
          automaticLayout: true,
        }}
      />
    </div>
  );
}
