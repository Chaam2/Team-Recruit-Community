import Stack from '../Stack';
import BasicTextForm from './BasicTextForm';
import TitleTextForm from './TitleTextForm';
import MemberSelectForm from './MemberSelectForm';
import QuillEditor from '../Editor/Editor2';
import LengthCheck from '../ProjectWritingForm/LengthCheck';
import ThumbnailInput from './ThumbnailInput';
import CompleteListModal from './CompleteListModal';
import styles from './PortfolioCreateWriting.module.scss';
import '../Editor/editor.css';

import { useEffect, useRef, useState } from 'react';

import { useRecoilState } from 'recoil';
import { TypePortfolioDetail } from '../../interfaces/Portfolio.interface';
import Quill from 'quill';
import { BsChevronRight } from 'react-icons/bs';
import { selectedPostTitleState } from '../../recoil/portfolioState';
import { useMediaQuery } from 'react-responsive';
import { AiFillCloseCircle } from 'react-icons/ai';
import { quillPortfolio } from '../../utils/quillTheme';
import usePortfolioWriting from '../../hooks/controllers/usePortfolioWriting';
import { MAX_LENGTH } from '../../constants/PortfolioWriting';

interface PortfolioWritingProps {
  editMode?: boolean;
  publishedPostData?: TypePortfolioDetail;
}

function PortfolioWriting({ editMode, publishedPostData }: PortfolioWritingProps) {
  const isMobile = useMediaQuery({ query: '(max-width:768px)' });
  const [selectedProject, setSelectedProject] = useRecoilState(selectedPostTitleState);

  const { form, handlers, isPostSaved } = usePortfolioWriting(publishedPostData);
  const { title, summary, stacks, members, thumbnailSrc, thumbnailFile, gitHubUrl, description } =
    form;

  const {
    selectThumbnail,
    changeTitle,
    changeSummary,
    changeGitHubUrl,
    updateStacks,
    selectUser,
    unselectUser,
    importSavedPost,
    saveTemporary,
    submitForm,
  } = handlers;

  const [isCompletePost, setIsCompletePost] = useState(false);

  const quillRef = useRef<Quill | null>(null);
  const thumbnailRef = useRef<HTMLButtonElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const summaryRef = useRef<HTMLInputElement>(null);
  const githubRef = useRef<HTMLInputElement>(null);

  // 퀼에디터 추가
  useEffect(() => {
    quillRef.current = new Quill('#editor-container', quillPortfolio);
    const codeBlockElements = document.querySelectorAll('.ql-syntax');
    codeBlockElements.forEach((element) => {
      element.classList.add('code-block');
    });
    return () => {};
  }, []);

  useEffect(() => {
    quillRef.current!.root.innerHTML = description;
  }, [description]);

  useEffect(() => {
    window.scrollTo(0, 0);
    !isMobile && titleRef.current?.focus();
  }, [isMobile]);

  return (
    <div
      className={
        !isMobile ? `${styles.container}` : `${styles.container} ${styles.mobileContainer}`
      }
    >
      <div className={styles.mainFormContainer}>
        <div className={styles.headerContainer}>
          <h1 className={styles.title}>프로젝트 자랑 작성</h1>
          <div
            className={!isMobile ? `${styles.selectedProject}` : `${styles.mobileSelectedProject}`}
          >
            <button
              className={styles.selectPostButton}
              onClick={() => {
                setIsCompletePost((prev) => !prev);
              }}
            >
              관련 모집 글 선택
              <BsChevronRight />
            </button>
            {selectedProject.id !== 0 && (
              <p>
                {selectedProject.title}
                <button onClick={() => setSelectedProject(() => ({ id: 0, title: '' }))}>
                  <AiFillCloseCircle />
                </button>
              </p>
            )}
          </div>
        </div>
        <div className={styles.topContainer}>
          <div>
            {isCompletePost && <CompleteListModal setModalOpen={setIsCompletePost} />}
            <h3 className={styles.required}>썸네일</h3>
            <ThumbnailInput
              innerRef={thumbnailRef}
              imgFile={thumbnailFile!}
              onInputChange={selectThumbnail}
              thumbnailSrc={thumbnailSrc}
            />
          </div>
          <div>
            <label>
              <div className={styles.inputTop}>
                <h3 className={styles.required}>프로젝트 제목</h3>
                <LengthCheck valueLength={title ? title.length : 0} maxLength={MAX_LENGTH.TITLE} />
              </div>
              <TitleTextForm innerRef={titleRef} value={title} onChange={changeTitle} />
            </label>
            <label>
              <div className={styles.inputTop}>
                <h3 className={styles.required}>요약</h3>
                <LengthCheck
                  valueLength={summary ? summary.length : 0}
                  maxLength={MAX_LENGTH.SUMMARY}
                />
              </div>
              <BasicTextForm
                innerRef={summaryRef}
                value={summary}
                onChange={changeSummary}
                placeholder={'프로젝트를 짧게 설명해 주세요.'}
              />
            </label>
          </div>
        </div>
        <div>
          <h3 className={styles.required}>내용</h3>
          <QuillEditor innerRef={quillRef} />
        </div>
        <label className={styles.gitHubContainer}>
          <div className={styles.inputTop}>
            <h3 className={styles.required}>깃허브 레포지토리 링크</h3>
            <LengthCheck
              valueLength={gitHubUrl ? gitHubUrl.length : 0}
              maxLength={MAX_LENGTH.GITHUB_URL}
            />
          </div>
          <BasicTextForm
            innerRef={githubRef}
            value={gitHubUrl}
            onChange={changeGitHubUrl}
            placeholder={'URL을 입력해 주세요.'}
          />
        </label>
        <div className={styles.stacksContainer}>
          <h3 className={styles.stacksTitle}>사용 기술스택</h3>
          <Stack selectedStack={stacks} setStackList={updateStacks} />
        </div>
        <div>
          <div className={styles.inputTop}>
            <h3>참여 멤버</h3>
          </div>
          <MemberSelectForm
            selectedUserList={members}
            onMemberSelect={selectUser}
            onMemberUnselect={unselectUser}
          />
        </div>
      </div>
      <div className={styles.buttonsContainer}>
        {isPostSaved && (
          <button className={styles.importButton} onClick={() => importSavedPost(quillRef)}>
            {!isMobile ? '임시저장 글 불러오기' : `저장 \n 글 불러오기`}
          </button>
        )}
        <div>
          <button className={styles.saveButton} onClick={() => saveTemporary(quillRef)}>
            임시 저장
          </button>
          <button
            className={styles.submitButton}
            onClick={() => submitForm(quillRef, titleRef, summaryRef, thumbnailRef, githubRef)}
          >
            {editMode ? '수정 완료' : '작성 완료'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default PortfolioWriting;
