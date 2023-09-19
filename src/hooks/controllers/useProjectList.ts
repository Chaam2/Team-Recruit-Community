import { useCallback, useEffect } from 'react';
import * as fetcher from '../../apis/Fetcher';
import { projectListFilterState, projectListState } from '../../recoil/projectList';
import { useRecoilState, useResetRecoilState } from 'recoil';
import useDebounce from '../useDebounce';

const scrollToTop = () => {
  window.scrollTo(0, 0);
};

function useProjectList() {
  const debounce = useDebounce();

  const [projectList, setProjectList] = useRecoilState(projectListState);
  const [projectListFilter, setProjectListFilter] = useRecoilState(projectListFilterState);

  const resetProjectList = useResetRecoilState(projectListState);
  const resetProjectFilter = useResetRecoilState(projectListFilterState);

  const { selectedCategory, searchKeyword, recruitingMode } = projectListFilter;

  const resetState = () => {
    resetProjectList();
    resetProjectFilter();
  };

  const getProjectList = useCallback(
    async (
      cate: string = 'all',
      recruiting: boolean | string = 'all',
      keyword: false | string = 'false',
      page: number = 1
    ) => {
      try {
        const res = await fetcher.getProjects(cate, recruiting, keyword, page);
        const { pageSize, pagenatedProjects } = res.data;
        setProjectList({
          data: pagenatedProjects,
          page: { moreData: page < pageSize, currentPage: page, size: pageSize },
          load: { isFirstFetched: true, isLoading: false, isError: false },
        });
      } catch (e) {
        setProjectList((prev) => ({
          ...prev,
          isLoading: false,
          isError: true,
        }));
      }
    },
    [setProjectList]
  );

  useEffect(() => {
    if (!projectList.load.isFirstFetched) {
      getProjectList();
    }
  }, [getProjectList, projectList.load.isFirstFetched]);

  const getNextProjectList = useCallback(async () => {
    const nextPage = projectList.page.currentPage + 1;
    try {
      setProjectList((prev) => ({
        ...prev,
        page: { ...prev.page, moreData: false },
      }));
      const res = await fetcher.getProjects(
        selectedCategory,
        recruitingMode,
        searchKeyword,
        nextPage
      );
      const { pageSize, pagenatedProjects } = res.data;
      setProjectList((prev) => ({
        data: [...prev.data, ...pagenatedProjects],
        page: {
          moreData: nextPage < pageSize,
          currentPage: nextPage,
          size: pageSize,
        },
        load: { ...prev.load, isLoading: false, isError: false },
      }));
    } catch (e) {
      setProjectList((prev) => ({
        ...prev,
        isError: true,
      }));
    }
  }, [
    projectList.page.currentPage,
    recruitingMode,
    searchKeyword,
    selectedCategory,
    setProjectList,
  ]);

  const handleCategoryClick = async (cate: string) => {
    setProjectListFilter((prev) => ({
      ...prev,
      selectedCategory: cate,
      searchKeyword: '',
    }));
    getProjectList(cate, recruitingMode, '');
    scrollToTop();
  };

  const handleSearchChange = (searchKeyword: string) => {
    setProjectListFilter((prev) => ({
      ...prev,
      selectedCategory: 'all',
      searchKeyword: searchKeyword,
    }));
    debounce(() => {
      getProjectList('all', recruitingMode, searchKeyword);
      scrollToTop();
    }, 500);
  };

  const handleRecruitingSelect = (recruitingMode: string) => {
    setProjectListFilter((prevState) => ({
      ...prevState,
      recruitingMode: recruitingMode,
    }));
    getProjectList(selectedCategory, recruitingMode, searchKeyword);
    scrollToTop();
  };

  return {
    projectList,
    projectListFilter,
    getProjectList,
    getNextProjectList,
    handleCategoryClick,
    handleSearchChange,
    handleRecruitingSelect,
    resetState,
  };
}

export default useProjectList;
