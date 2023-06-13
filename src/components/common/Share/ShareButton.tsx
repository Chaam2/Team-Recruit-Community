import { useEffect, useRef, useState } from 'react';
import { CgShare } from 'react-icons/cg';

// 스타일
import styles from './ShareButton.module.scss';
import ModalFullScreen from '../Modal/ModalFullScreen';
import DefaultUserImage from '../../../assets/DefaultUser.png';

//로고
import { MdClose } from 'react-icons/md';
import { RiKakaoTalkFill, RiFacebookBoxFill, RiTwitterFill, RiLinksFill } from 'react-icons/ri';

const LOGO_SIZE: number = 14;
const LOGO_DEFAULT_COLOR: string = '#D3D3D3';
const CLOSE_LOGO_SIZE: number = 24;
const CLOSE_LOGO_COLOR: string = '#555555';

// 카카오 SDK는 window 객체에 전역으로 추가되니 TS를 위해 선언해줍시다.
declare global {
  interface Window {
    Kakao: any;
  }
}
// 카카오 환경변수 키
const KAKAO_SHARE_KEY = process.env.REACT_APP_KAKAO_SHARE_KEY;

const ShareModal = ({ onClose, title }: { onClose: () => void; title: string }) => {
  const [isCopy, setIsCopy] = useState<boolean>(false);
  const urlTextRef = useRef<HTMLTextAreaElement>(null);
  // 현재 주소
  const url = window.location.href;

  const shareToKakaoTalk = () => {
    if (window.Kakao === undefined) {
      return;
    }

    const kakao = window.Kakao;

    // 인증이 안되어 있는 경우, 인증한다.
    if (!kakao.isInitialized()) {
      kakao.init(KAKAO_SHARE_KEY);
    }

    kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: title,
        description: '모프에서 게시글을 확인하세요!',
        imageUrl: DefaultUserImage,
        link: {
          mobileWebUrl: url,
          webUrl: url,
        },
      },
    });
  };
  const shareToTwitter = () => {
    const shareText = `모프에서 게시글을 확인하세요!   |
${title}
`;
    const sharedLink = 'text=' + encodeURIComponent(shareText + '\n') + encodeURIComponent(url);
    window.open(`https://twitter.com/intent/tweet?${sharedLink}`, '_black');
  };
  const shareToFacebook = () => {
    const sharedLink = encodeURIComponent(url);
    window.open(`http://www.facebook.com/sharer/sharer.php?u=${sharedLink}`, '_black');
  };
  const copyLink = async () => {
    // 현재 컨텍스트가 안전한지(HTTPS) 확인합니다.
    if (window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(url);
        alert('복사되었습니다.');
      } catch (error) {
        alert(`${error}: 복사에 실패했습니다. HTTPS로 접속 중인지 확인해주세요.`);
      }
    } else {
      // 그렇지 않으면 사용자가 직접 복사할 수 있는 주소 표시
      setIsCopy(true);
    }
  };

  useEffect(() => {
    isCopy && urlTextRef.current && urlTextRef.current.select();
  }, [isCopy]);

  return (
    <ModalFullScreen setModalOpen={() => true} closeButton={false}>
      <div className={styles.modalContainer}>
        <button className={styles.closeButton} onClick={onClose}>
          <MdClose size={CLOSE_LOGO_SIZE} color={CLOSE_LOGO_COLOR} />
        </button>
        <p className={styles.modalText}>공유하기</p>
        <div className={styles.modalButtonBox}>
          <button className={styles.kakaoLogoCircle} onClick={shareToKakaoTalk}>
            <RiKakaoTalkFill className={styles.logo} />
            <p>카카오톡</p>
          </button>
          <button className={styles.facebookLogoCircle} onClick={shareToFacebook}>
            <RiFacebookBoxFill className={styles.logo} />
            <p>페이스북</p>
          </button>
          <button className={styles.twitterLogoCircle} onClick={shareToTwitter}>
            <RiTwitterFill className={styles.logo} />
            <p>트위터</p>
          </button>
          <button className={styles.linkLogoCircle} onClick={copyLink}>
            <RiLinksFill className={styles.logo} />
            <p>주소복사</p>
          </button>
        </div>
      </div>
      {isCopy && (
        <div className={styles.urlTextBox}>
          <span>Ctrl + C로 복사해주세요 !</span>
          <textarea ref={urlTextRef} value={url} readOnly />
        </div>
      )}
    </ModalFullScreen>
  );
};

export default function ShareButton({ title }: { title: string }) {
  // 모달 설정
  const [isModal, setIsModal] = useState<boolean>(false);
  const handleModal = () => {
    setIsModal(false);
  };

  // 카카오톡 sdk 추가
  useEffect(() => {
    // 카카오톡 sdk 추가
    const script = document.createElement('script');
    script.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.2.0/kakao.min.js';
    script.integrity = 'sha384-x+WG2i7pOR+oWb6O5GV5f1KN2Ko6N7PTGPS7UlasYWNxZMKQA63Cj/B2lbUmUfuC';
    script.crossOrigin = 'anonymous';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <>
      <div className={styles.container} onClick={() => setIsModal(true)}>
        <div className={styles.logoCircle}>
          <CgShare size={LOGO_SIZE} color={LOGO_DEFAULT_COLOR} />
        </div>
        <p>공유하기</p>
      </div>
      {isModal ? <ShareModal onClose={handleModal} title={title} /> : ''}
    </>
  );
}
