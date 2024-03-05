'use client';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { toDecimal, toPlanckUnit } from './utils/unitConversion';
import log from 'loglevel';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { Address, SiwsMessage } from '@talismn/siws';

const WS_URL = 'wss://westend-rpc.polkadot.io';
const provider = new WsProvider(WS_URL);

let api: ApiPromise;

const wsAPI = {
  initializeApi: async () => {
    if (!api) {
      api = await ApiPromise.create({ provider });
      /**
       *  1. fetch the chain information
       *
       */
      const chainInfo = await api.registry.getChainProperties();
      log.info(`[ws] connected to chain. chain info: ${chainInfo}`);
    }
    return api;
  },
  connectWallet: async () => {
    try {
      const { web3Enable, web3Accounts } = await import(
        '@polkadot/extension-dapp'
      );
      const extensions = await web3Enable('Encode hackaton app');

      if (extensions.length === 0) {
        log.info('[ExtensionInfo] No extension installed');
        alert('Please install a wallet extension');
        return [];
      } else {
        const accounts = await web3Accounts();
        return accounts;
      }
    } catch (error) {
      log.error('[ws] Error connecting to the waller:', error);
      throw error;
    }
  },
  fetchAccounts: async () => {
    const { web3Accounts } = await import('@polkadot/extension-dapp');
    let accounts = await web3Accounts();
    return accounts;
  },
  disconnect: async () => {
    await api.disconnect();
    log.info('\n Disconnected from the wsAPI');
  },
  fetchAccountBalance: async (accountAddress: string) => {
    try {
      let { data } = (await api.query.system.account(accountAddress)) as any;
      /**
       * 2. Convert the planck amount to decimal amount
       */
      const balanceDecimal = toDecimal(data.free, api);
      log.info('[ws] Initial balance: ', balanceDecimal);

      return parseFloat(balanceDecimal);
    } catch (error) {
      log.error('[ws] Error fetching account balance:', error);
      throw error;
    }
  },
  subscribeToBalanceChanges: async (
    address: string,
    callback: (address: string, balance: number) => void
  ) => {
    // fetch current free balance
    let {
      data: { free: previousFree },
    } = (await api.query.system.account(address)) as any;
    callback(address, parseFloat(toDecimal(previousFree, api)));
    // Here we subscribe to any balance changes and update the on-screen value
    api.query.system.account(
      address,
      ({ data: { free: currentFree }, nonce: currentNonce }: any) => {
        // Calculate the delta
        const change = currentFree.sub(previousFree);
        log.info('[ws] Subscribed to balance changes.');

        // Only display positive value changes (Since we are pulling `previous` above already,
        // the initial balance change will also be zero)
        if (!change.isZero()) {
          const balance = toDecimal(currentFree, api);
          log.info(
            `[ws]New balance change of ${toDecimal(
              change,
              api
            )}, nonce ${balance}, previous: ${toDecimal(
              previousFree.toString(),
              api
            )}`
          );
          callback(address, parseFloat(balance));
        }
      }
    );
  },
  subscribeToExtensionChanges: async (
    addresses: InjectedAccountWithMeta[] | undefined,
    callback: (accounts: any) => void
  ) => {
    if (addresses === undefined) return;
    const { web3AccountsSubscribe } = await import('@polkadot/extension-dapp');
    web3AccountsSubscribe((newAccounts) => {
      log.info('[ws] Subscribed to account changes.');
      // dont update if newAccounts is same as accounts
      const newAddresses = newAccounts
        .map((account) => account.address)
        .join('');
      const oldAddresses = addresses.map((account) => account.address).join('');
      if (newAddresses === oldAddresses) return;

      log.info('[ws] Accounts updated:', newAccounts);
      callback(newAccounts);
    });
  },
  signTx: async (
    fromAddress: string,
    toAddress: string,
    decimalAmount: number
  ) => {
    return new Promise(async (resolve, reject) => {
      const { web3FromAddress } = await import('@polkadot/extension-dapp');
      const injector = await web3FromAddress(fromAddress);
      log.info(
        `[ws] Transfering ${decimalAmount} from: ${fromAddress} to: ${toAddress}`
      );
      const planckAmount = toPlanckUnit(decimalAmount, api);
      const tx = api.tx.balances.transferKeepAlive(toAddress, planckAmount);
      tx.signAndSend(fromAddress, { signer: injector.signer }, ({ status }) => {
        if (status.isInBlock) {
          log.info(
            `\n\n######################################## Transaction pending ###########################################`
          );
          log.info(
            `\n Transaction included at blockHash : ${status.asInBlock}`
          );
          log.info(
            `\n Check block status for pending transaction on the Subscan explorer : https://westend.subscan.io/block/${status.asInBlock}`
          );
          resolve(status.asInBlock.toString()); // Resolve with block hash
        } else if (status.isFinalized) {
          log.info(
            `\n\n######################################## Transaction successful and finalized ##########################################`
          );
          log.info(
            `\n Transaction finalized at blockHash : ${status.asFinalized}`
          );
          log.info(
            `\n Check block status for finalized transaction on the Subscan explorer : https://westend.subscan.io/block/${status.asFinalized}`
          );
        } else if (status.isDropped || status.isInvalid) {
          reject(new Error(`Transaction failed with status: ${status.type}`));
        } else {
          log.info(`[ws] Current status: ${status.type}`);
        }
      }).catch((error) => {
        if (error instanceof Error) {
          log.info('[ws] Transaction failed', error);
          reject(error); // Reject with the error object
        }
      });
    });
  },
  signIn: async (selectedAccount: InjectedAccountWithMeta) => {
    try {
      if (!selectedAccount?.address) return;

      const address = Address.fromSs58(selectedAccount.address ?? '');

      // invalid address
      if (!address) return;

      // request nonce from server, we will implement this API in the next page
      const nonceRes = await fetch('/api/nonce');
      const data = await nonceRes.json();
      const { nonce } = data;

      // you need to sign a message consisting the nonce so the backend can
      // validate your sign in request.
      // authentication will fail if you do not sign the nonce back.
      // SIWS helps you construct the message with the nonce in a way that
      // is user friendly and human readable
      const siwsMessage = new SiwsMessage({
        nonce,
        domain: 'localhost',
        uri: 'https://localhost:3001',
        statement: 'Welcome to SIWS! Sign in to see how it works.',
        // use prefix of chain your dapp is on:
        address: selectedAccount.address, //address.toSs58(0),
        chainName: 'Polkadot',
      });

      // get the injector of your account to create a Signature prompt
      const { web3FromSource } = await import('@polkadot/extension-dapp');
      const injectedExtension = await web3FromSource(
        selectedAccount.meta.source
      );

      // sign the SIWS message
      const signed = await siwsMessage.sign(injectedExtension);

      // send the signature and signed message to backend for verification
      const verifyRes = await fetch('/api/verify', {
        method: 'POST',
        body: JSON.stringify({
          ...signed,
          //address: selectedAccount.address,
          address: address.toSs58(0),
        }),
      });
      const verified = await verifyRes.json();
      if (verified.error) throw new Error(verified.error);

      // Hooray we're signed in! The backend should return a JWT so you can authenticate yourself for any future request
      return verified.jwtToken as string;
    } catch (e: any) {
      log.info('[SignIn] Invalid signature');
      throw e;
    }
  },
};

wsAPI.initializeApi();

export { wsAPI };
