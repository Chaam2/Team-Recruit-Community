import ROUTES from '../../constants/Routes';
import { MAX_LENGTH, MIN_LENGTH } from '../../constants/PortfolioWriting';
import { TypePortfolioDetail } from '../../interfaces/Portfolio.interface';
import { TypeTeamProjectUser } from '../../interfaces/User.interface';
import { selectedPostTitleState } from '../../recoil/portfolioState';
import { RefObject, useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import * as fetcher from '../../apis/Fetcher';
import { useLocation, useNavigate } from 'react-router-dom';
import { contentWBase64Converter } from '../../utils/imageConverter';
import { loginAtom } from '../../recoil/loginState';
import Quill from 'quill';

interface IForm {
  title: string;
  summary: string;
  description: string;
  stacks: string[];
  members: TypeTeamProjectUser[];
  thumbnailSrc: string;
  thumbnailFile: File | null;
  gitHubUrl: string;
}
const IMG_DOMAIN = process.env.REACT_APP_DOMAIN || '';

function usePortfolioWriting(publishedPostData?: TypePortfolioDetail) {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const paramValue = searchParams.get('selectedProject');
  const loginData = useRecoilValue(loginAtom);

  const isEditMode = publishedPostData?.portfolio_id;

  const [isPostSaved, setIsPostSaved] = useState<boolean>(false);

  const [form, setForm] = useState<IForm>({
    title: '',
    summary: '',
    description: '',
    stacks: [],
    members: [],
    thumbnailSrc: '',
    thumbnailFile: null,
    gitHubUrl: '',
  });

  const { title, summary, stacks, members, thumbnailSrc, gitHubUrl } = form;

  const [selectedProject, setSelectedProject] = useRecoilState(selectedPostTitleState);

  // 수정 모드인 경우 원래 데이터 불러오기
  useEffect(() => {
    if (publishedPostData) {
      const {
        project_id: id,
        portfolio_title: title,
        portfolio_summary: summary,
        portfolio_stacks: { stackList: stacks },
        participated_members: members,
        portfolio_description: description,
        portfolio_github: gitHubUrl,
        portfolio_thumbnail: thumbnailSrc,
      } = publishedPostData;
      setSelectedProject({ id: id || 0, title: `${id}번째 모집 글` });
      const newFormData = {
        title,
        summary,
        description,
        stacks,
        members,
        thumbnailSrc,
        thumbnailFile: null,
        gitHubUrl,
      };
      setForm(newFormData);
    }
  }, [publishedPostData, setSelectedProject]);

  useEffect(() => {
    //로컬스토리지에 postData가 있으면 savedPost 상태 저장
    const savedPostData = localStorage.getItem('savedPortfolioPost');
    savedPostData && setIsPostSaved(true);
  }, []);

  useEffect(() => {
    if (paramValue) {
      // 작성 들어오면 선택한 모집글 초기화
      const isModifyPath = location.pathname.includes('modify');
      !isModifyPath && setSelectedProject({ id: 0, title: '' });

      const getCompletedProjectList = async () => {
        try {
          const { data } = await fetcher.getCompletedProject();
          const userSelectedProject = data.completedProjects.filter(
            (project) => project.project_id.toString() === paramValue
          )[0];
          if (userSelectedProject) {
            setSelectedProject({
              id: userSelectedProject.project_id,
              title: userSelectedProject.project_title,
            });
          } else {
            alert('권한이 없는 경로입니다.');
            navigate(ROUTES.PORTFOLIO_CREATE);
          }
        } catch (error) {
          console.error(error);
        }
      };

      getCompletedProjectList();
    }
  }, [location.pathname, navigate, paramValue, setSelectedProject]);

  const postPortfolio = async (formData: FormData) => {
    try {
      const response = isEditMode
        ? await fetcher.patchPortfolio(publishedPostData!.portfolio_id.toString(), formData)
        : await fetcher.postPortfolio(formData);
      navigate(`${ROUTES.PORTFOLIO_DETAIL}${response.data.portfolio_id}`);
    } catch (e: any) {
      switch (e.message) {
        case '401': {
          alert('로그인 후 이용해 주세요.');
          break;
        }
        case '400': {
          alert('입력되지 않은 정보를 확인해 주세요.');
          break;
        }
        case '413': {
          alert('파일 용량이 너무 큽니다!');
          break;
        }
        default: {
          alert(e.message);
        }
      }
    }
  };

  const handlers = {
    selectThumbnail: (file: File) => {
      setForm((prev) => ({ ...prev, thumbnailFile: file }));
      const reader = new FileReader();
      reader.onload = () => {
        setForm((prev) => ({ ...prev, thumbnailSrc: reader.result as string }));
      };
      reader.readAsDataURL(file);
    },
    changeTitle: (value: string) => {
      if (value.length <= MAX_LENGTH.TITLE) {
        setForm((prev) => ({ ...prev, title: value }));
      }
    },
    changeSummary: (value: string) => {
      if (value.length <= MAX_LENGTH.SUMMARY) {
        setForm((prev) => ({ ...prev, summary: value }));
      }
    },
    changeGitHubUrl: (value: string) => {
      if (value.length <= MAX_LENGTH.GITHUB_URL) {
        setForm((prev) => ({ ...prev, gitHubUrl: value }));
      }
    },
    updateStacks: (stacks: string[]) => {
      setForm((prev) => ({ ...prev, stacks }));
    },
    selectUser: (userData: TypeTeamProjectUser): void => {
      if (
        members.length < MAX_LENGTH.MEMBERS &&
        !members.some((user) => user.user_id === userData.user_id)
      ) {
        setForm((prev) => ({ ...prev, members: [...prev.members, userData] }));
      }
    },
    unselectUser: (userId: number) => {
      const newMembers = members.filter((user) => user.user_id !== userId);
      setForm((prev) => ({ ...prev, members: newMembers }));
    },

    importSavedPost: (quillRef: RefObject<Quill>) => {
      const savedPostData = localStorage.getItem('savedPortfolioPost');
      const postData = JSON.parse(savedPostData!);
      const confirm = window.confirm(
        '저장 된 글을 불러올 경우 현재 작성된 글은 지워집니다. 불러오겠습니까?'
      );

      if (confirm) {
        setSelectedProject(postData.selectedProject);
        setForm(postData);
        quillRef.current!.root.innerHTML = postData.description;
      }
    },

    saveTemporary: (quillRef: RefObject<Quill>) => {
      const editorHTML = quillRef.current!.root.innerHTML;
      const isAtLeastOneFieldFilled =
        thumbnailSrc.length > 0 ||
        title.length > 0 ||
        summary.length > 0 ||
        editorHTML.length > MIN_LENGTH.EDITOR_CONTENT ||
        gitHubUrl.length > 0 ||
        stacks.length > 0 ||
        members.length > 0;
      if (!isAtLeastOneFieldFilled) {
        alert('최소 한 개 이상의 필드를 입력해 주세요.');
        return;
      }

      const form = {
        selectedProject,
        thumbnailSrc,
        title,
        summary,
        stacks,
        description: editorHTML,
        gitHubUrl,
        members,
      };
      localStorage.setItem('savedPortfolioPost', JSON.stringify(form));
      alert('임시저장 성공');
    },

    submitForm: async (
      quillRef: RefObject<Quill>,
      titleRef: RefObject<HTMLInputElement>,
      summaryRef: RefObject<HTMLInputElement>,
      thumbnailRef: RefObject<HTMLButtonElement>,
      githubRef: RefObject<HTMLInputElement>
    ) => {
      const editorHTML = quillRef.current!.root.innerHTML;

      const { parsedContent: parsedDesContent, convertedFiles: convertedDesFiles } =
        await contentWBase64Converter(loginData, editorHTML, IMG_DOMAIN, {
          maxSizeMB: 150,
          maxWidthOrHeight: 780,
          useWebWorker: true,
        });

      const { convertedFiles: convertedThumbnailFiles } = await contentWBase64Converter(
        loginData,
        thumbnailSrc,
        IMG_DOMAIN,
        {
          maxSizeMB: 150,
          maxWidthOrHeight: 780,
          useWebWorker: true,
        }
      );

      const convertedThumbnailFile = convertedThumbnailFiles[0];

      const formData = new FormData();
      formData.append('portfolio_img', convertedThumbnailFile as File);
      formData.append('portfolio_title', title);
      formData.append('portfolio_summary', summary);
      formData.append('portfolio_github', gitHubUrl);
      formData.append('portfolio_stacks', JSON.stringify(stacks || []));
      formData.append('portfolio_description', parsedDesContent);
      convertedDesFiles.length > 0 &&
        convertedDesFiles.forEach((file) => formData.append('portfolio_img', file as File));
      formData.append('memberIds', JSON.stringify(members.map((info) => info.user_id) || []));
      formData.append('project_id', JSON.stringify(selectedProject.id));

      const refFocusAndScroll = (
        targetRef: RefObject<HTMLInputElement> | RefObject<HTMLButtonElement> | RefObject<Quill>
      ) => {
        if (targetRef.current) {
          targetRef.current.focus();
        }
      };

      const validationRules = [
        { condition: !title, message: '제목을 입력해 주세요.', ref: titleRef },
        { condition: !summary, message: '요약을 입력해 주세요.', ref: summaryRef },
        { condition: !thumbnailSrc, message: '썸네일을 등록해 주세요.', ref: thumbnailRef },
        {
          condition: editorHTML.length <= MIN_LENGTH.EDITOR_CONTENT,
          message: '내용이 너무 짧습니다.',
          ref: quillRef,
        },
        {
          condition: !gitHubUrl,
          message: '깃허브 레포지토리 url을 입력해 주세요.',
          ref: githubRef,
        },
      ];

      const validationFailed = validationRules.find((rule) => rule.condition);

      if (validationFailed) {
        alert(validationFailed.message);
        refFocusAndScroll(validationFailed.ref!);
      } else {
        postPortfolio(formData);
      }
    },
  };

  return { form, postPortfolio, handlers, isPostSaved };
}

export default usePortfolioWriting;
