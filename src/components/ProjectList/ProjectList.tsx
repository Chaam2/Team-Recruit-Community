import { TypeProjectList } from '../../interfaces/Project.interface';
import styles from './ProjectList.module.scss';
import ProjectItem from './ProjectItem';
import LoadingProject from './LoadingProject';
import { RefObject } from 'react';
import { useMediaQuery } from 'react-responsive';

interface ProjectListProps {
  projectList: TypeProjectList[];
  isLoading: boolean;
  innerRef?: RefObject<HTMLElement | HTMLLIElement>;
  moreData?: boolean;
}
function ProjectList({ projectList, isLoading, innerRef, moreData }: ProjectListProps) {
  const isMobile = useMediaQuery({ query: '(max-width:768px)' });

  return (
    <ul
      className={
        !isMobile ? `${styles.container}` : `${styles.container} ${styles.mobileContainer}`
      }
    >
      {isLoading && <LoadingProject />}
      {!isLoading && projectList.length > 0 ? (
        projectList.map((project) => <ProjectItem projectData={project} key={project.project_id} />)
      ) : !isLoading && projectList.length === 0 ? (
        <li className={styles.noneContentContainer}>
          <p className={styles.noneContent}>게시글이 없습니다 :(</p>
        </li>
      ) : undefined}
      {moreData && <LoadingProject innerRef={innerRef} />}
    </ul>
  );
}
export default ProjectList;
