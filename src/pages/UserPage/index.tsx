import { useEffect, useState } from 'react';
import Profile from '../../components/UserProfile';
import Posts from './Posts';

function UserPage() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleContentsError(message: string) {
    setErrorMessage(message);
  }
  useEffect(() => {
    if (errorMessage) {
      alert(errorMessage);
    }
  }, [errorMessage]);
  return (
    <div>
      <Profile />
      {!errorMessage && <Posts onError={handleContentsError} />}
    </div>
  );
}

export default UserPage;
