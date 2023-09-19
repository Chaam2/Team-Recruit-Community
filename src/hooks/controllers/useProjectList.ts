import { useCallback } from 'react';
import * as fetcher from '../../apis/Fetcher';
import { projectListState } from '../../recoil/projectList';
import { useRecoilState } from 'recoil';

function useProjectList() {
  const [projectList, setProjectList] = useRecoilState(projectListState);

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
        setProjectList((prev) => ({
          data: pagenatedProjects,
          page: { moreData: page < pageSize, currentPage: page, size: pageSize },
          load: { isLoading: false, isError: false },
        }));
      } catch (e) {
        setProjectList((prev) => ({
          ...prev,
          isError: true,
        }));
      }
    },
    [setProjectList]
  );

  const getNextProjectList = useCallback(
    async (
      cate: string = 'all',
      recruiting: boolean | string = 'all',
      keyword: false | string = 'false',
      page: number = 1
    ) => {
      try {
        setProjectList((prev) => ({
          ...prev,
          page: { ...prev.page, moreData: false },
        }));
        const res = await fetcher.getProjects(cate, recruiting, keyword, page);
        const { pageSize, pagenatedProjects } = res.data;
        setProjectList((prev) => ({
          data: [...prev.data, ...pagenatedProjects],
          page: { moreData: page < pageSize, currentPage: page + 1, size: pageSize },
          load: { isLoading: false, isError: false },
        }));
      } catch (e) {
        setProjectList((prev) => ({
          ...prev,
          isError: true,
        }));
      }
    },
    [setProjectList]
  );

  return { projectList, getProjectList, getNextProjectList };
}

export default useProjectList;
