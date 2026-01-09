import Editor from "@monaco-editor/react";

function CodeEditor() {
  return (
    <div style={{ height: "80vh", width: "100%" }}>
      <Editor
        height="100%"
        defaultLanguage="cpp"
        theme="vs-dark"
        defaultValue={`#include <iostream>
using namespace std;

int main() {
    cout << "Hello DSA Mentor AI";
    return 0;
}`}
      />
    </div>
  );
}

export default CodeEditor;
