import ROUTES from '../../constants/Routes';
import { useNavigate } from 'react-router-dom';
import ModalBasic from '../common/Modal/ModalBasic';
import styles from './MyPageModal.module.scss';

interface ModalBasicProps {
  setModalOpen: (value: boolean) => void;
  modalOpen: boolean;
  onClickLogout: () => void;
}
export function MyPageModal({ modalOpen, setModalOpen, onClickLogout }: ModalBasicProps) {
  const navigate = useNavigate();
  return (
    <div>
      {modalOpen && (
        <ModalBasic setModalOpen={setModalOpen} closeButton={false}>
          <ul className={styles.ulContainer}>
            <li
              onClick={() => {
                navigate(ROUTES.MY_PAGE);
                setModalOpen(false);
              }}
            >
              내 프로필
            </li>
            <li
              onClick={() => {
                navigate(ROUTES.EDIT_PASSWORD);
                setModalOpen(false);
              }}
            >
              비밀번호 변경
            </li>
            <li
              onClick={() => {
                onClickLogout();
                setModalOpen(false);
              }}
            >
              로그아웃
            </li>
          </ul>
        </ModalBasic>
      )}
    </div>
  );
}
