import { useEffect, useRef, useState } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import styles from './Editor.module.scss';

interface EditorProps {
  value: string;
  onChange: (content: string) => void;
}
function Editor({ value, onChange }: EditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const editorElement = editorRef.current;
    if (!editorElement) return;

    const quill = new Quill(editorElement, {
      modules: {
        toolbar: [
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          [{ color: [] }, { background: [] }],
          ['link', 'code-block', 'image'],
        ],
      },
      placeholder: '프로젝트 소개를 입력하세요.',
      theme: 'snow',
    });

    // 텍스트 변경 시 이벤트 처리
    quill.on('text-change', () => {
      const value = quill.root.innerHTML;
      onChange(value);
    });
  }, []);

  return (
    <div className={styles.editorContainer}>
      <div className={styles.editorMiddleContainer} ref={editorRef}>
        <div dangerouslySetInnerHTML={{ __html: value }}></div>
      </div>
    </div>
  );
}

export default Editor;
