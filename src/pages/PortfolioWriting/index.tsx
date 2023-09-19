import { useNavigate } from 'react-router-dom';
import PortfolioWritingForm from '../../components/PortfolioWritingForm/PortfolioWritingForm';
import { useEffect } from 'react';
import ROUTES from '../../constants/Routes';
import * as token from '../../apis/Token';

function PortfolioWriting() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!token.getToken()) {
      alert('로그인 후 사용 가능합니다.');
      navigate(ROUTES.LOGIN);
    }
  }, [navigate]);
  return <PortfolioWritingForm />;
}

export default PortfolioWriting;
