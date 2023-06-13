import { useState, useRef, useEffect,useMemo } from 'react';
//@ts-ignore
import styles from './login.module.scss';
//@ts-ignore
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import axios, { AxiosResponse } from 'axios';
//@ts-ignore
import cookie from 'react-cookies';
import { userInfo } from 'os';
import {RiKakaoTalkFill} from "react-icons/ri"; 
import { useRecoilState, useSetRecoilState } from 'recoil';
import { loginAtom } from '../../recoil/loginState';
import { TailSpin } from 'react-loader-spinner';
import { getKakaoLogin } from '../../apis/Fetcher';

const API_KEY = process.env.REACT_APP_API_KEY;
const KAKAO_KEY = process.env.REACT_APP_KAKAO_API_KEY;

function Login() {
  const emailRef = useRef<any>(null);
  const passwordRef = useRef<any>(null);
  const [isEmail, setIsEmail] = useState(false);
  const [isPassword, setIsPassword] = useState(false);
  const [isKakaoLoading, setIsKakaoLoading] = useState(false);
  const [code, setCode] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const setLoginData = useSetRecoilState(loginAtom);
  const codeSearchParams = useMemo(() =>{
    return code.get('code') ?? '';
  }, [code]);
  const handleLoginSuccess = () =>{
    try{
      const path = location.state.returnPath || '/';
      navigate(path);
    }
    catch(e:any){
      navigate('/');
    }
  }

  useEffect(() =>{
    const code = new URL(window.location.href).searchParams.get("code");
    const kakaoLoginFunction = async (code:string) =>{
      return await getKakaoLogin(code)

    }
    
    if(code === null){

    }
    else{
      setIsKakaoLoading(true);
      var data = kakaoLoginFunction(code); 
    }

    }, [codeSearchParams]);

  const isEmailBlank = () => {
    if (emailRef.current.value === '') {
      setIsEmail(true);

      return true;
    } else {
      setIsEmail(false);

      return false;
    }
  }

  const isPasswordBlank = () => {
    if (passwordRef.current.value === '') {
      setIsPassword(true);

      return true;
    } else {
      setIsPassword(false);

      return false;
    }
  }

  const login = async (e: any) => {
    e.preventDefault();

    if (isEmailBlank() || isPasswordBlank()) {
      return;
    }

    const header = {
      headers: {
        'Content-type': 'application/json',
      },
    };

    try {
      const res = await axios.post(
        `${API_KEY}/users/login`,
        {
          user_email: emailRef.current.value,
          user_password: passwordRef.current.value,
        },
        header
      );

      const data = res.data.data;

      if (res.status === 200) {
        // const author = await res.headers['authorization'];
        // const token = author.split(' ')[1];
        const accessToken = data.accessToken;
        cookie.save('accessToken', accessToken, {
          path: '/',
        });

        const refreshToken = data.refreshToken;
        cookie.save('refreshToken', refreshToken, {
          path: '/',
        });

        setLoginData((prev) =>{
          return {...prev,
            user_id:data.user_id,
            user_name:data.user_name,
            user_img:data.user_img || 'https://api.dicebear.com/6.x/pixel-art/svg?seed=3',
            user_career_goal:data.user_career_goal,
            user_stacks:data.user_stacks,
            user_introduction:data.user_introduction,
          }
        });

        handleLoginSuccess();
      }
    } catch (e:any) {
      alert('사용자 정보를 다시 확인해주세요.');
      console.log(e.message);
      return;
    }
  };

  const kakaoLogin = () =>{
    const redirect_uri = `${API_KEY}/login`;
    const kakaoURL = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_KEY}&redirect_uri=${redirect_uri}&response_type=code`;

    window.location.href = kakaoURL;
  };

  if(isKakaoLoading){
    return (
      <>
          <div className={styles.loadingContainer}>
              <div className={styles.loadingComponent}>
              <h3>정보를 가져오는 중 ...</h3>
              <TailSpin color="#6636DA" height={50} width={50}/>
              </div>
          </div>
      </>

    );
  }

  return (
    <>
      <div className={styles.container}>
        <div className={styles.component}>
          <div className={styles.title}>
            <p>로그인</p>
          </div>

          <form
            onSubmit={(e) => {
              login(e);
            }}
            className={styles.form}
          >
            <div className={styles.label}>이메일</div>
            <div className={styles.input}>
              <input
                type="email"
                placeholder="이메일 입력"
                ref={emailRef}
                onBlur={isEmailBlank}
              ></input>
            </div>
            {isEmail && <div className={styles.emptyWarning}>이메일을 확인해주세요.</div>}

            <div className={styles.label}>비밀번호</div>
            <div className={styles.input}>
              <input
                type="password"
                className={styles.password}
                placeholder="비밀번호 입력"
                ref={passwordRef}
                onBlur={isPasswordBlank}
              ></input>
            </div>
            {isPassword && <div className={styles.emptyWarning}>비밀번호를 입력해주세요.</div>}
            <div className={styles.submit}>
              <button type="submit" className={styles.submitButton}>
                이메일로 계속하기
              </button>
            </div>

            <div className={styles.hrContainer}>
              <hr className={styles.hr}></hr>
            </div>
          </form>

          <div className={styles.kakaoContainer}>
            <button type="button" className={styles.kakaoLogin} onClick={kakaoLogin}>
              <div className={styles.kakaoContainer}><RiKakaoTalkFill className={styles.kakaoImage} size="20"/><span className={styles.kakaoDesc}>카카오로 계속하기</span></div>
            </button>
          </div>

          <div className={styles.menu}>
            <div className={styles.registerContainer}>
              <span>아직 회원이 아니신가요? 3초 만에</span>
              <span className={styles.register}>
                <Link to="/register">가입하기</Link>
              </span>
            </div>

            <div className={styles.menuLine}>
              <span className={styles.call}>
                <Link to="" className={styles.link}>
                  고객센터
                </Link>
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
