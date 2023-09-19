import { RefObject, useEffect } from 'react';
import Category from '../../components/ProjectList/Category';
import ProjectList from '../../components/ProjectList/ProjectList';
import ProjectPostButton from '../../components/common/ProjectPostButton';
import ProjectSearch from '../../components/ProjectList/ProjectSearch';
import styles from './ProjectListMain.module.scss';
import RecruitingProjectFilter from '../../components/ProjectList/RecruitingProjectFilter';
import useInfiniteScroll from '../../hooks/useInfiniteScroll';
import { useRecoilState } from 'recoil';

import { useMediaQuery } from 'react-responsive';
import useProjectList from '../../hooks/controllers/useProjectList';
import { projectListFilterState } from '../../recoil/projectList';
import useDebounce from '../../hooks/useDebounce';

const scrollToTop = () => {
  window.scrollTo(0, 0);
};

function ProjectListMain() {
  const isMobile = useMediaQuery({ query: '(max-width:768px)' });

  const debounce = useDebounce();

  const { projectList, getProjectList, getNextProjectList } = useProjectList();
  const {
    data,
    load: { isLoading, isError },
    page: { moreData, currentPage },
  } = projectList;

  const [projectListFilter, setProjectListFilter] = useRecoilState(projectListFilterState);

  const { selectedCategory, searchKeyword, recruitingMode } = projectListFilter;

  useEffect(() => {
    getProjectList();
  }, [getProjectList, setProjectListFilter]);

  const target: RefObject<HTMLElement | HTMLLIElement> = useInfiniteScroll(async () => {
    await getNextProjectList(selectedCategory, recruitingMode, searchKeyword, currentPage);
  });

  const handleCategoryClick = async (cate: string) => {
    setProjectListFilter((prev) => ({
      ...prev,
      selectedCategory: cate,
      searchKeyword: '',
    }));
    getProjectList(selectedCategory, recruitingMode, searchKeyword);
    scrollToTop();
  };

  const handleSearchChange = (searchKeyword: string) => {
    setProjectListFilter((prev) => ({
      ...prev,
      selectedCategory: 'all',
      searchKeyword: searchKeyword,
    }));
    debounce(() => {
      getProjectList(undefined, recruitingMode, searchKeyword);
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

  return (
    <div className={!isMobile ? `${styles.container}` : `${styles.mobileContainer}`}>
      <div className={styles.leftContainer}>
        <div className={styles.leftContentContainer}>
          <Category selectedCategory={selectedCategory} handleClick={handleCategoryClick} />
          {!isMobile && <ProjectPostButton />}
        </div>
      </div>
      <div className={styles.rightContainer}>
        <div
          className={styles.searchContainer}
          style={(isMobile && { display: 'none' }) || { display: '' }}
        >
          <ProjectSearch handleChange={handleSearchChange} value={searchKeyword} />
          <RecruitingProjectFilter value={recruitingMode} onChange={handleRecruitingSelect} />
        </div>
        <ProjectList
          projectList={data}
          isLoading={isLoading}
          moreData={moreData}
          innerRef={target}
        />
      </div>
      {isMobile && <ProjectPostButton />}
    </div>
  );
}

export default ProjectListMain;
