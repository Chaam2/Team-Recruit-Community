import 'quill/dist/quill.snow.css';
import styles from './Editor.module.scss';

interface QuillEditorProps {
  innerRef: any;
}
const QuillEditor = ({ innerRef }: QuillEditorProps) => {
  return (
    <div
      ref={innerRef}
      style={{ height: '80vh' }}
      className={`${styles.editor}`}
      id="editor-container"
    />
  );
};

export default QuillEditor;
