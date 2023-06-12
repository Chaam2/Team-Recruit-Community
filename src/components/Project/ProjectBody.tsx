import React from 'react';
import DOMPurify from 'dompurify';

// 타입
import { TypeProjectBody } from '../../interfaces/Project.interface';
// 스타일 관련
import { RoleIcon, StackIcon, TargetIcon, ClockIcon } from './ProjectBodyLogo';
import styles from './ProjectBody.module.scss';
// 상수
import {
  PROJECT_GOAL,
  PROJECT_PARTICIPATION_TIME,
  PROJECT_RECRUITMENT_ROLES,
} from '../../constants/project';
const DEFAULT_STACK = '미정';
const DEFAULT_ROLE = '지정안됨';

export default function ProjectBody({ bodyData }: { bodyData: TypeProjectBody | null }) {
  if (!bodyData) return <></>;
  const bodyHTML = bodyData.project_introduction;
  const sanitizedHTML = DOMPurify.sanitize(bodyHTML);

  return (
    <div className={styles.container}>
      {/* 요약 */}
      <div>
        <div className={styles.paragraphTitle}>요약</div>
        <div className={styles.paragraph}>
          <div className={styles.paragraphChild}>{bodyData.project_summary}</div>
        </div>
      </div>

      {/* 모집 역할 */}
      <div>
        <div className={styles.paragraphTitle}>모집 역할</div>
        <div className={styles.logoLine}>
          {bodyData.project_recruitment_roles?.roleList ? (
            bodyData.project_recruitment_roles.roleList.map((role) => {
              return (
                <div className={styles.logoBlock} key={role}>
                  <div className={styles.logoCircle}>
                    <RoleIcon role={PROJECT_RECRUITMENT_ROLES[role]} />
                  </div>
                  <p className={styles.logoText}>{PROJECT_RECRUITMENT_ROLES[role]}</p>
                </div>
              );
            })
          ) : (
            <div className={styles.logoBlock}>
              <div className={styles.logoCircle}>
                <RoleIcon role={DEFAULT_ROLE} />
              </div>
              <p className={styles.logoText}>{DEFAULT_ROLE}</p>
            </div>
          )}
        </div>
      </div>

      {/* 필수 기술 스택 */}
      <div>
        <div className={styles.paragraphTitle}>필수 기술 스택</div>
        <div className={styles.logoLine}>
          {bodyData.project_required_stacks?.stackList &&
          bodyData.project_required_stacks?.stackList.length > 0 ? (
            bodyData.project_required_stacks.stackList.map((stack) => {
              return (
                <div className={styles.logoBlock} key={stack}>
                  <div className={styles.logoCircle}>
                    <StackIcon stack={stack} />
                  </div>
                  <p className={styles.logoText}>{stack}</p>
                </div>
              );
            })
          ) : (
            <div className={styles.logoBlock}>
              <div className={styles.logoCircle}>
                <StackIcon stack={DEFAULT_STACK} />
              </div>
              <p className={styles.logoText}>{DEFAULT_STACK}</p>
            </div>
          )}
        </div>
      </div>

      {/* 목적 */}
      <div>
        <div className={styles.paragraphTitle}>목적</div>
        <div className={styles.logoLine}>
          <div className={styles.logoCircle}>
            <TargetIcon />
          </div>
          <p className={styles.logoText}>{PROJECT_GOAL[bodyData.project_goal]}</p>
        </div>
      </div>

      {/* 참여 시간 */}
      <div>
        <div className={styles.paragraphTitle}>참여 시간</div>
        <div className={styles.logoLine}>
          <div className={styles.logoCircle}>
            <ClockIcon />
          </div>
          <p className={styles.logoText}>
            {PROJECT_PARTICIPATION_TIME[bodyData.project_participation_time]}
          </p>
        </div>
      </div>

      {/* 소개 */}
      <div className={styles.introduction}>
        <div className={styles.paragraphTitle}>소개</div>
        <div className={styles.paragraph}>
          <div
            className={styles.introductionParagraph}
            dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
          />
        </div>
      </div>
    </div>
  );
}
