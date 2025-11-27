import dynamic from "next/dynamic";
import { useState } from "react";
import "react-quill/dist/quill.snow.css";
const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const QuillEditor = ({ value, onChange, title }) => {
  // const [editorHtml, setEditorHtml] = useState(value);

  const handleChange = (html) => {
    // setEditorHtml(html);
    onChange(html); // Passing HTML content to parent component
  };

  return (
    <div className="mb-3">
      <h3 className=" text-primary mb-3">{title}</h3>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={handleChange}
        placeholder={title}
      />
    </div>
  );
};

export default QuillEditor;
