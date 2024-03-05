import { useAppDispatch, useAppSelector } from '@/app/lib/hooks';
import SignIn from './SignIn';

const SignInContainer = () => {
  const accounts = useAppSelector((state) => state.acc.accounts);
  return <>{accounts && <SignIn />}</>;
};

export default SignInContainer;
