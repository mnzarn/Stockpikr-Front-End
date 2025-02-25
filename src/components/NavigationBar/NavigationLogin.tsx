import React, { useEffect, useState } from 'react';
import '../../index.css';
import { UserApiService } from '../../services/UserApiService';
import SearchBar from '../SearchBar';
import NavigationAccount from './NavigationAccount';
import NavigationSignin from './NavigationSignin';

const NavigationLogin: React.FC = () => {
  const [isUserLoggedIn, setIsUserLoggedIn] = useState<boolean | null>(null); // Null = Loading state

  useEffect(() => {
    let isMounted = true;

    const checkUserLoggedIn = async () => {
      const loggedIn = await UserApiService.isUserLoggedIn();
      if (isMounted) {
        console.log('isUserLoggedIn:', loggedIn);
        setIsUserLoggedIn(loggedIn);
      }
    };

    checkUserLoggedIn();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isUserLoggedIn === null) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {isUserLoggedIn ? (
        <>
          <SearchBar /> <NavigationAccount />
        </>
      ) : (
        <NavigationSignin />
      )}
    </>
  );
};

export default NavigationLogin;
