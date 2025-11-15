import { useMemo, useRef } from "react";
import JoditEditor from "jodit-react";

export default function TextEditor({ value, onChange, buttons = ['bold','italic','underline','|','ul','ol','brush','|','link','image','|','source']}) {
  const editor = useRef(null);

  const config =  useMemo(() => ({
    readonly: false,
    height: "auto",
    minHeight: 200,
    maxHeight: -1,
    autoresize: true,
    breakWords: true,
    toolbarButtonSize: "medium",
    toolbarAdaptive: false,
    statusbar: false,
    askBeforePasteHTML: false,
    askBeforePasteFromWord: false,
    processPasteHTML: true,
    processPaste: true,
    defaultActionOnPaste: "insert_as_html",
    buttons: buttons,
  }),[buttons]);

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
