import { RefObject, useEffect } from 'react';
import Category from '../../components/ProjectList/Category';
import ProjectList from '../../components/ProjectList/ProjectList';
import ProjectPostButton from '../../components/common/ProjectPostButton';
import ProjectSearch from '../../components/ProjectList/ProjectSearch';
import styles from './ProjectListMain.module.scss';
import RecruitingProjectFilter from '../../components/ProjectList/RecruitingProjectFilter';
import useInfiniteScroll from '../../hooks/useInfiniteScroll';

import { useMediaQuery } from 'react-responsive';
import useProjectList from '../../hooks/controllers/useProjectList';
import Error from '../../components/common/Error';

function ProjectListMain() {
  const isMobile = useMediaQuery({ query: '(max-width:768px)' });

  const {
    projectList,
    projectListFilter,
    getNextProjectList,
    handleCategoryClick,
    handleSearchChange,
    handleRecruitingSelect,
  } = useProjectList();

  const {
    load: { isError },
  } = projectList;

  const { selectedCategory, searchKeyword, recruitingMode } = projectListFilter;

  const target: RefObject<HTMLElement | HTMLLIElement> = useInfiniteScroll(async () => {
    await getNextProjectList();
  });

  isError && <Error />;

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
        <ProjectList projectList={projectList} innerRef={target} />
      </div>
      {isMobile && <ProjectPostButton />}
    </div>
  );
}

export default ProjectListMain;
