import styles from './ProjectList.module.scss';
import ProjectItem from './ProjectItem';
import LoadingProject from './LoadingProject';
import { RefObject } from 'react';
import { useMediaQuery } from 'react-responsive';
import { IProjectList } from '../../interfaces/Project.interface';

interface ProjectListProps {
  projectList: IProjectList;
  innerRef?: RefObject<HTMLElement | HTMLLIElement>;
}
function ProjectList({ projectList, innerRef }: ProjectListProps) {
  const isMobile = useMediaQuery({ query: '(max-width:768px)' });

  const {
    page: { moreData },
    load: { isLoading, isError },
    data,
  } = projectList;

  return (
    <ul
      className={
        !isMobile ? `${styles.container}` : `${styles.container} ${styles.mobileContainer}`
      }
    >
      {isLoading && <LoadingProject />}
      {!isLoading && data.length > 0 ? (
        data.map((project) => <ProjectItem projectData={project} key={project.project_id} />)
      ) : !isLoading && !isError && data.length === 0 ? (
        <li className={styles.noneContentContainer}>
          <p className={styles.noneContent}>게시글이 없습니다 :(</p>
        </li>
      ) : !isLoading && isError ? (
        <li className={styles.noneContentContainer}>
          <p className={styles.noneContent}>목록을 불러오는데 실패했습니다. :(</p>
        </li>
      ) : undefined}
      {moreData && <LoadingProject innerRef={innerRef} />}
    </ul>
  );
}
export default ProjectList;
