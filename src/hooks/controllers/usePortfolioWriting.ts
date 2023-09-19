import ROUTES from '../../constants/Routes';
import { MAX_LENGTH } from '../../constants/PortfolioWriting';
import { TypePortfolioDetail } from '../../interfaces/Portfolio.interface';
import { TypeTeamProjectUser } from '../../interfaces/User.interface';
import { selectedPostTitleState } from '../../recoil/portfolioState';
import { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import * as fetcher from '../../apis/Fetcher';
import { useLocation, useNavigate } from 'react-router-dom';

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

function usePortfolioWriting(publishedPostData?: TypePortfolioDetail) {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const paramValue = searchParams.get('selectedProject');

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

  const { title, summary, stacks, members, thumbnailSrc, thumbnailFile, gitHubUrl } = form;

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

  // 썸네일 미리보기 src
  useEffect(() => {
    if (thumbnailFile) {
      const reader = new FileReader();
      reader.onload = () => {
        setForm((prev) => ({ ...prev, thumbnailSrc: reader.result as string }));
      };
      reader.readAsDataURL(thumbnailFile);
    }
  }, [thumbnailFile]);

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
    } catch (error: any) {
      switch (error.message) {
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
          alert(error.message);
        }
      }
    }
  };

  const handlers = {
    selectThumbnail: (file: File) => {
      setForm((prev) => ({ ...prev, thumbnailFile: file }));
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

    importSavedPost: (quillRef: any) => {
      const savedPostData = localStorage.getItem('savedPortfolioPost');
      const postData = JSON.parse(savedPostData!);
      const confirm = window.confirm(
        '저장 된 글을 불러올 경우 현재 작성된 글은 지워집니다. 불러오겠습니까?'
      );

      if (confirm) {
        setSelectedProject(postData.selectedProject);
        setForm(postData);
        // 에디터 내용 불러오기
        quillRef.current!.root.innerHTML = postData.description;
      }
    },

    saveTemporary: (quillRef: any) => {
      const editorHTML = quillRef.current!.root.innerHTML;
      const isAtLeastOneFieldFilled =
        thumbnailSrc.length > 0 ||
        title.length > 0 ||
        summary.length > 0 ||
        editorHTML.length > 15 ||
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
  };

  return { form, postPortfolio, handlers, isPostSaved };
}

export default usePortfolioWriting;
