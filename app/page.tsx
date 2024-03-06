'use client';
import styles from './page.module.css';
import AccountSelector from './features/account/AccountSelector';
import Extension from './features/account/Extension';
import AccountInfo from './features/account/AccountInfo';
import Transfer from './features/transactions/Transfer';
import { Heading } from '@chakra-ui/react';
import { useAppSelector } from './lib/hooks';
import { Divider } from '@chakra-ui/react';
import SignInContainer from './features/signIn/SignInContainer';
export default function Home() {
  const jwtToken = useAppSelector((state) => state.acc.jwtToken);
  return (
    <main className={styles.main}>
      <Heading as="p" fontSize="5xl">
        Encode Hackathon App
      </Heading>
      <Divider marginY={2} />
      <Extension></Extension>
      <Divider marginY={2} />
      <AccountSelector />
      <AccountInfo />
      <Divider marginY={2} />
      <SignInContainer />
      {!!jwtToken && <Transfer jwtToken={jwtToken}></Transfer>}
    </main>
  );
}
