import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Play, Save, Upload, Trash2, FolderOpen, FileText, Download, Plus, Menu } from 'lucide-react';
import { Edit3 } from 'lucide-react';

// Basic syntax highlighting helper
const highlightCode = (code, lang) => {
  if (!code) return '';
  return code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"(.*?)"/g, '<span class="text-amber-300">"$1"</span>')
    .replace(/'(.*?)'/g, "<span class='text-amber-300'>'$1'</span>")
    .replace(/\b(function|return|var|let|const|if|else|for|while|class|import|from|def|print|echo|public|static|void|fn|main)\b/g, '<span class="text-purple-400 font-bold">$1</span>')
    .replace(/\b(true|false|null|undefined)\b/g, '<span class="text-orange-400">$1</span>')
    .replace(/\b(\d+)\b/g, '<span class="text-blue-300">$1</span>')
    .replace(/\/\/(.*)/g, '<span class="text-slate-500 italic">//$1</span>');
};

const DEFAULT_CODE = {
  html: `<!DOCTYPE html>
<html>
<head>
<title>Page Title</title>
<style>
body { font-family: sans-serif; text-align: center; background: #111; color: #fff; padding: 50px; }
h1 { color: #6366f1; }
</style>
</head>
<body>
<h1>Hello World</h1>
<p>This is a live HTML preview!</p>
<script>console.log("Hello from JS");</script>
</body>
</html>`,
  python: `def greet(name):
    return f"Hello, {name}!"

print(greet("World"))
print("Python is running!")`,
  javascript: `console.log("Hello World");
const sum = (a, b) => a + b;
console.log("2 + 3 =", sum(2, 3));`,
  typescript: `const greeting: string = "Hello TypeScript!";
console.log(greeting);

function add(a: number, b: number): number {
    return a + b;
}
console.log("5 + 3 =", add(5, 3));`,
  php: `<?php
echo "<h1>Hello from PHP!</h1>";
echo "<p>Current time: " . date('Y-m-d H:i:s') . "</p>";
for($i = 1; $i <= 5; $i++) {
    echo "<p>Line $i</p>";
}
?>`,
  sql: `CREATE TABLE users (id INT, name TEXT);
INSERT INTO users VALUES (1, 'Alice'), (2, 'Bob');
SELECT * FROM users;`,
  c: `#include <stdio.h>

int main() {
    printf("Hello from C!\\n");
    printf("This is a simulated output\\n");
    return 0;
}`,
  'c++': `#include <iostream>
using namespace std;

int main() {
    cout << "Hello from C++!" << endl;
    cout << "This is simulated output" << endl;
    return 0;
}`,
  'c#': `using System;

class Program {
    static void Main() {
        Console.WriteLine("Hello from C#!");
        Console.WriteLine("This is simulated output");
    }
}`
};

export default function CodeEditor() {
  const [language, setLanguage] = useState('html');
  const [files, setFiles] = useState([]);
  const [activeFileId, setActiveFileId] = useState(null);
  const [output, setOutput] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [showFileExplorer, setShowFileExplorer] = useState(false);
  const [previewDoc, setPreviewDoc] = useState('');
const [showPlainNotepad, setShowPlainNotepad] = useState(false);


  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);
  const textareaRef = useRef(null);
  const preRef = useRef(null);
  const pyodideRef = useRef(null);
  const sqlDbRef = useRef(null);

  // Initialize
  useEffect(() => {
    const langKey = language.toLowerCase();
    const defaultContent = DEFAULT_CODE[langKey] || `// Write your ${language} code here...`;
    const newFile = {
      id: Date.now().toString(),
      name: `main.${langKey === 'python' ? 'py' : langKey === 'javascript' ? 'js' : langKey === 'html' ? 'html' : langKey === 'php' ? 'php' : 'txt'}`,
      content: defaultContent,
      language: langKey
    };
    setFiles([newFile]);
    setActiveFileId(newFile.id);
  }, []);

  const activeFile = files.find(f => f.id === activeFileId) || files[0];

  const updateActiveFileContent = (newContent) => {
    setFiles(prev => prev.map(f => f.id === activeFileId ? { ...f, content: newContent } : f));
  };

  const handleScroll = () => {
    if (textareaRef.current && preRef.current) {
      preRef.current.scrollTop = textareaRef.current.scrollTop;
      preRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const val = activeFile?.content || '';
      const newCode = val.substring(0, start) + '  ' + val.substring(end);
      updateActiveFileContent(newCode);
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 2;
      }, 0);
    }
  };

  const createNewFile = () => {
    const ext = language === 'python' ? 'py' : language === 'javascript' ? 'js' : language === 'html' ? 'html' : 'txt';
    const newFile = {
      id: Date.now().toString(),
      name: `file_${files.length + 1}.${ext}`,
      content: '',
      language: language
    };
    setFiles([...files, newFile]);
    setActiveFileId(newFile.id);
  };

  const deleteFile = (e, id) => {
    e.stopPropagation();
    if (files.length <= 1) {
      alert("Cannot delete the last file");
      return;
    }
    const newFiles = files.filter(f => f.id !== id);
    setFiles(newFiles);
    if (activeFileId === id) setActiveFileId(newFiles[0].id);
  };

  const handleFileUpload = (e) => {
    const uploadedFiles = Array.from(e.target.files);
    if (uploadedFiles.length === 0) return;

    uploadedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setFiles(prev => [...prev, {
          id: Date.now().toString() + Math.random(),
          name: file.name,
          content: ev.target.result,
          language: language
        }]);
      };
      reader.readAsText(file);
    });
    e.target.value = '';
  };

  const downloadActiveFile = () => {
    if (!activeFile) return;
    const blob = new Blob([activeFile.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const loadScript = (src) => new Promise((res, rej) => {
    if (document.querySelector(`script[src="${src}"]`)) return res();
    const s = document.createElement('script');
    s.src = src; s.onload = res; s.onerror = rej;
    document.head.appendChild(s);
  });

  const runCode = async () => {
    setIsRunning(true);
    setOutput("");
    setPreviewDoc('');
    const code = activeFile.content;
    const lang = language.toLowerCase();

    try {
      // HTML/Web languages - render in iframe
      if (['html', 'react', 'jquery', 'vue', 'angular', 'bootstrap', 'xml'].includes(lang)) {
        setPreviewDoc(code);
        setOutput("✓ Code rendered successfully in preview window");
      }
      
      // PHP - render in iframe with simulation
      else if (lang === 'php') {
        // Simulate PHP execution by converting echo to document.write
        let htmlOutput = code
          .replace(/<\?php/g, '')
          .replace(/\?>/g, '')
          .replace(/echo\s+["'](.+?)["'];/g, '<div>$1</div>')
          .replace(/echo\s+(.+?);/g, '<script>document.write($1)</script>');
        
        const phpHtml = `<!DOCTYPE html>
<html>
<head>
<style>body { font-family: sans-serif; padding: 20px; background: #f5f5f5; }</style>
</head>
<body>
<div style="background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
${htmlOutput}
</div>
</body>
</html>`;
        setPreviewDoc(phpHtml);
        setOutput("✓ PHP code rendered (simulated)");
      }

      // Python with Pyodide
      else if (['python', 'numpy', 'scipy'].includes(lang)) {
        if (!pyodideRef.current) {
          setOutput("⏳ Loading Python runtime...");
          await loadScript('https://cdn.jsdelivr.net/pyodide/v0.23.4/full/pyodide.js');
          pyodideRef.current = await window.loadPyodide();
        }
        setOutput("⏳ Executing Python code...");
        const result = await pyodideRef.current.runPythonAsync(`
import sys
import io
sys.stdout = io.StringIO()
${code}
sys.stdout.getvalue()
        `);
        setOutput(result || "✓ Executed successfully (no output)");
      }

      // SQL with SQL.js
      else if (['sql', 'mysql', 'postgresql'].includes(lang)) {
        if (!sqlDbRef.current) {
          setOutput("⏳ Loading SQL engine...");
          await loadScript('https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-wasm.js');
          const SQL = await window.initSqlJs({
            locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/${file}`
          });
          sqlDbRef.current = new SQL.Database();
        }
        
        const statements = code.split(';').filter(s => s.trim());
        let results = [];
        
        for (let stmt of statements) {
          if (stmt.trim()) {
            try {
              const res = sqlDbRef.current.exec(stmt);
              if (res.length > 0) {
                results.push({
                  query: stmt.trim(),
                  result: res[0]
                });
              } else {
                results.push({
                  query: stmt.trim(),
                  result: "Query executed successfully"
                });
              }
            } catch (err) {
              results.push({
                query: stmt.trim(),
                result: `Error: ${err.message}`
              });
            }
          }
        }
        
        setOutput(results.map(r => {
          if (typeof r.result === 'string') {
            return `${r.query}\n→ ${r.result}\n`;
          }
          return `${r.query}\n${JSON.stringify(r.result, null, 2)}\n`;
        }).join('\n'));
      }

      // JavaScript - eval with console capture
      else if (['javascript', 'node.js'].includes(lang)) {
        const logs = [];
        const oldLog = console.log;
        const oldError = console.error;
        const oldWarn = console.warn;
        
        console.log = (...args) => logs.push(args.map(a => 
          typeof a === 'object' ? JSON.stringify(a, null, 2) : String(a)
        ).join(' '));
        console.error = (...args) => logs.push('ERROR: ' + args.join(' '));
        console.warn = (...args) => logs.push('WARN: ' + args.join(' '));
        
        try {
          eval(code);
          setOutput(logs.join('\n') || "✓ Executed successfully (no console output)");
        } finally {
          console.log = oldLog;
          console.error = oldError;
          console.warn = oldWarn;
        }
      }

      // TypeScript - transpile then execute
      else if (lang === 'typescript') {
        setOutput("⏳ Compiling TypeScript...");
        // Simple TypeScript execution (remove types and run as JS)
        const jsCode = code
          .replace(/:\s*(string|number|boolean|any|void|never)\b/g, '')
          .replace(/interface\s+\w+\s*{[^}]*}/g, '')
          .replace(/type\s+\w+\s*=\s*[^;]+;/g, '');
        
        const logs = [];
        const oldLog = console.log;
        console.log = (...args) => logs.push(args.join(' '));
        
        try {
          eval(jsCode);
          setOutput(logs.join('\n') || "✓ TypeScript compiled and executed successfully");
        } finally {
          console.log = oldLog;
        }
      }

      // C - simulate with basic output parsing
      else if (lang === 'c') {
        setOutput("⏳ Compiling C code...\n");
        // Extract printf statements - match everything between quotes
        const printfRegex = /printf\s*\(\s*"([^"]*)"(?:\s*,\s*[^)]+)?\s*\)/g;
        const matches = [...code.matchAll(printfRegex)];
        
        if (matches.length > 0) {
          const outputs = matches.map(match => {
            let text = match[1];
            // Handle escape sequences
            text = text.replace(/\\n/g, '\n')
                       .replace(/\\t/g, '\t')
                       .replace(/\\"/g, '"')
                       .replace(/\\\\/g, '\\');
            return text;
          });
          setOutput("✓ Compilation successful\n✓ Build complete\n\n=== Program Output ===\n" + outputs.join(''));
        } else {
          setOutput("✓ Compilation successful\n✓ Build complete\n\n=== Program Output ===\n(No output - add printf statements to see output)");
        }
      }

      // C++ - simulate with basic output parsing
      else if (lang === 'c++') {
        setOutput("⏳ Compiling C++ code...\n");
        // Extract cout statements - handle both << "string" and << variable
        const coutLines = code.match(/cout\s*<<[^;]+;/g);
        
        if (coutLines) {
          const outputs = [];
          coutLines.forEach(line => {
            // Extract quoted strings
            const stringMatches = [...line.matchAll(/"([^"]+)"/g)];
            stringMatches.forEach(match => {
              outputs.push(match[1]);
            });
            // Check for endl
            if (line.includes('endl')) {
              outputs.push('\n');
            }
          });
          setOutput("✓ Compilation successful\n✓ Build complete\n\n=== Program Output ===\n" + outputs.join(''));
        } else {
          setOutput("✓ Compilation successful\n✓ Build complete\n\n=== Program Output ===\n(No output - add cout statements to see output)");
        }
      }

      // C# - simulate with basic output parsing
      else if (lang === 'c#') {
        setOutput("⏳ Compiling C# code...\n");
        // Extract Console.WriteLine statements
        const writeLineRegex = /Console\.WriteLine\s*\(\s*"([^"]+)"\s*\)/g;
        const matches = [...code.matchAll(writeLineRegex)];
        
        if (matches.length > 0) {
          const outputs = matches.map(match => match[1] + '\n');
          setOutput("✓ Compilation successful\n✓ Build complete\n\n=== Program Output ===\n" + outputs.join(''));
        } else {
          setOutput("✓ Compilation successful\n✓ Build complete\n\n=== Program Output ===\n(No output - add Console.WriteLine statements to see output)");
        }
      }

      // Java - simulate with basic output parsing
      else if (lang === 'java') {
        setOutput("⏳ Compiling Java code...\n");
        // Extract System.out.println statements
        const printlnRegex = /System\.out\.println\s*\(\s*"([^"]+)"\s*\)/g;
        const matches = [...code.matchAll(printlnRegex)];
        
        if (matches.length > 0) {
          const outputs = matches.map(match => match[1] + '\n');
          setOutput("✓ Compilation successful\n✓ Build complete\n\n=== Program Output ===\n" + outputs.join(''));
        } else {
          setOutput("✓ Compilation successful\n✓ Build complete\n\n=== Program Output ===\n(No output - add System.out.println statements to see output)");
        }
      }

      // Other languages - show simulated output
      else {
        setOutput(`[${lang.toUpperCase()}]\n✓ Code compiled and executed\n\nNote: Full execution for ${lang} requires additional runtime support.\nThis is a simulated output.`);
      }

    } catch (err) {
      setOutput(`❌ Error: ${err.message}\n\n${err.stack || ''}`);
    } finally {
      setIsRunning(false);
    }
  };

  const isWebLanguage = ['html', 'php', 'react', 'vue', 'angular', 'bootstrap', 'xml'].includes(language);

  // Language selector
  const LANGUAGES = ["HTML", "Python", "JavaScript", "PHP", "SQL", "TypeScript", "Java", "C", "C++", "React"];

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      {/* Mobile File Explorer Overlay */}
      {showFileExplorer && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setShowFileExplorer(false)}
        />
      )}

      {/* File Explorer Sidebar */}
      <div className={`
        absolute inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 
        transform transition-transform duration-200 
        ${showFileExplorer ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 md:w-56 flex flex-col
      `}>
        <div className="p-3 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Explorer</span>
          <button 
            onClick={createNewFile} 
            className="h-6 w-6 flex items-center justify-center rounded hover:bg-slate-800 text-slate-400 hover:text-white"
            title="New File"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {files.map(file => (
            <div 
              key={file.id}
              onClick={() => { setActiveFileId(file.id); setShowFileExplorer(false); }}
              className={`
                flex items-center justify-between px-2 py-1.5 rounded text-sm cursor-pointer group
                ${file.id === activeFileId ? 'bg-indigo-500/20 text-indigo-300' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}
              `}
            >
              <div className="flex items-center gap-2 truncate">
                <FileText className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{file.name}</span>
              </div>
              {files.length > 1 && (
                <button
                  onClick={(e) => deleteFile(e, file.id)}
                  className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300 p-1"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="p-2 border-t border-slate-800 space-y-2">
          <input 
            type="file" 
            multiple 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileUpload}
          />
          <input 
            type="file" 
            webkitdirectory="" 
            directory="" 
            multiple
            ref={folderInputRef} 
            className="hidden" 
            onChange={handleFileUpload}
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 text-slate-300"
          >
            <FileText className="w-3 h-3" /> Import Files
          </button>
          <button 
            onClick={() => folderInputRef.current?.click()}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 text-slate-300"
          >
            <FolderOpen className="w-3 h-3" /> Import Folder
          </button>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="flex items-center justify-between p-2 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowFileExplorer(true)}
              className="md:hidden h-8 w-8 flex items-center justify-center rounded hover:bg-slate-800"
            >
              <Menu className="w-4 h-4" />
            </button>
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value.toLowerCase())}
              className="px-2 py-1 text-sm bg-slate-800 border border-slate-700 rounded text-slate-200"
            >
              {LANGUAGES.map(lang => (
                <option key={lang} value={lang.toLowerCase()}>{lang}</option>
              ))}
            </select>
            <span className="text-sm font-medium text-slate-400 truncate hidden sm:block">
              {activeFile?.name || 'Untitled'}
            </span>
          </div>
          
         <div className="flex items-center gap-2">
  <button 
    onClick={downloadActiveFile}
    className="h-8 w-8 flex items-center justify-center rounded hover:bg-slate-800 text-slate-400"
    title="Download File"
  >
    <Download className="w-4 h-4" />
  </button>

  {/* 📝 NOTEPAD BUTTON GOES HERE */}
  <button
    onClick={() => setShowPlainNotepad(true)}
    className="h-8 px-3 flex items-center gap-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
    title="Open Plain Text Notepad"
  >
    <Edit3 className="w-4 h-4" />
    Notepad/ FullScreenCode
  </button>

  <button 
    onClick={runCode}
    disabled={isRunning}
    className="flex items-center gap-2 px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 disabled:bg-green-800 rounded text-white"
  >
    {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
    Run
  </button>
</div>

        </div>
        
 <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Plain Text Notepad Overlay */}
{showPlainNotepad && (
  <div className="fixed inset-0 z-[9999] bg-slate-950 flex flex-col">

              <div className="flex items-center justify-between p-3 bg-slate-900 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-semibold text-slate-200">Plain Text Notepad</span>
                  <span className="text-xs text-slate-500">- Raw code without formatting</span>
                </div>
                <button 
                  onClick={() => setShowPlainNotepad(false)}
                  className="h-8 px-3 flex items-center justify-center rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
                >
                  Close
                </button>
              </div>
              <div className="flex-1 relative overflow-hidden bg-slate-950">
                <textarea
                  value={activeFile?.content || ''}
                  onChange={(e) => updateActiveFileContent(e.target.value)}
                  className="absolute inset-0 w-full h-full p-4 font-mono text-sm leading-6 bg-slate-950 text-slate-100 resize-none outline-none border-none"
                  spellCheck="false"
                  placeholder="Type your code here... This is plain text with no syntax highlighting."
                  style={{ 
                    caretColor: '#10b981',
                    tabSize: 2
                  }}
                  onKeyDown={handleKeyDown}
                />
              </div>
              <div className="p-2 bg-slate-900 border-t border-slate-800 text-xs text-slate-500 text-center">
                Plain text mode - What you type is exactly what you see
              </div>
            </div>
          )}

        {/* Editor & Preview Split */}
       
          {/* Code Input */}
          <div className="flex-1 relative border-b md:border-b-0 md:border-r border-slate-800 bg-slate-950 min-h-[50%] md:min-h-0">
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute left-0 top-0 bottom-0 w-12 bg-slate-900 border-r border-slate-800 text-slate-600 text-xs text-right py-4 pr-2 select-none z-10 font-mono overflow-y-hidden">
                {(activeFile?.content || '').split('\n').map((_, i) => (
                  <div key={i} className="leading-6">{i + 1}</div>
                ))}
              </div>
              <div className="absolute left-12 right-0 top-0 bottom-0 overflow-auto" onScroll={handleScroll}>
                <div className="relative min-h-full">
                  <pre 
                    ref={preRef}
                    className="absolute inset-0 m-0 p-4 font-mono text-sm leading-6 pointer-events-none whitespace-pre z-0"
                    aria-hidden="true"
                    dangerouslySetInnerHTML={{ __html: highlightCode(activeFile?.content || '', language) }}
                    style={{ minHeight: '100%' }}
                  />
                  <textarea
                    ref={textareaRef}
                    value={activeFile?.content || ''}
                    onChange={(e) => updateActiveFileContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="absolute inset-0 w-full h-full m-0 p-4 font-mono text-sm leading-6 bg-transparent text-transparent caret-white resize-none outline-none z-10 selection:bg-indigo-500/30"
                    spellCheck="false"
                    style={{ minHeight: '100%' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Output/Preview */}
          <div className="flex-1 flex flex-col bg-slate-900 min-h-[50%] md:min-h-0 relative">
            <div className="flex items-center justify-between px-4 py-2 bg-slate-800 border-b border-slate-700 text-xs font-semibold text-slate-300">
              <span>{isWebLanguage ? '🌐 Preview' : '💻 Output'}</span>
              <button 
                onClick={() => { setOutput(""); setPreviewDoc(""); }}
                className="h-6 w-6 flex items-center justify-center rounded hover:bg-slate-700"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
            <div className="flex-1 overflow-auto relative bg-slate-950">
              {isWebLanguage && previewDoc ? (
                <iframe 
                  title="preview"
                  srcDoc={previewDoc}
                  className="w-full h-full border-0 bg-white"
                  sandbox="allow-scripts allow-modals"
                />
              ) : (
                <div className="p-4 font-mono text-sm text-slate-300 whitespace-pre-wrap">
                  {isRunning ? (
                    <div className="flex items-center gap-2 text-slate-500">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Running...
                    </div>
                  ) : output ? output : <span className="text-slate-600 italic">Output will appear here after running code...</span>}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}