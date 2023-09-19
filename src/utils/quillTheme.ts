import { HighlightModules } from '../components/Editor/Highlight';

export const quillPortfolio = {
  modules: {
    ...HighlightModules,
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ color: [] }, { background: [] }],
      ['link', { 'code-block': 'highlight' }],
      ['image'],
      [{ imageDrop: true, imagePaste: true }],
    ],
  },
  placeholder: '내용을 입력하세요...',
  theme: 'snow',
};
