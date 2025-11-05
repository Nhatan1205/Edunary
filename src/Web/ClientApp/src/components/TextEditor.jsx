import { useMemo, useRef } from "react";
import JoditEditor from "jodit-react";

export default function TextEditor({ value, onChange }) {
  const editor = useRef(null);

  const config =  useMemo(() => ({
    readonly: false,
    height: "auto",
    minHeight: 200,
    maxHeight: -1,
    autoresize: true,
    toolbarButtonSize: "medium",
    statusbar: false,
    askBeforePasteHTML: false,
    askBeforePasteFromWord: false,
    processPasteHTML: true,
    processPaste: true,
    defaultActionOnPaste: "insert_as_html",
    buttons: [
      'bold','italic','|','ul','ol','|','link','image','|','source'
    ],
  }),[]);

  return (
    <JoditEditor
      ref={editor}
      value={value || ""}
      config={config}
      tabIndex={1}
      onBlur={(newContent) => { onChange(newContent)}}
    />
  );
}
