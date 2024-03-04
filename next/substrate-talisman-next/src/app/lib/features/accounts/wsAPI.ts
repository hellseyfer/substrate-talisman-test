'use server';
import { ApiPromise, WsProvider } from '@polkadot/api';
import { toDecimal, toPlanckUnit } from './utils/unitConversion';
import {
  web3Accounts,
  web3AccountsSubscribe,
  web3Enable,
  web3FromAddress,
} from '@polkadot/extension-dapp';
import log from 'loglevel';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';

const WS_URL = 'wss://westend-rpc.polkadot.io';
const provider = new WsProvider(WS_URL);

let api: ApiPromise;
const initializeApi = async () => {
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
};

const wsAPI = {
  connectWallet: async () => {
    try {
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
    callback: (balance: number) => void
  ) => {
    // fetch current free balance
    let {
      data: { free: previousFree },
    } = (await api.query.system.account(address)) as any;
    callback(parseFloat(toDecimal(previousFree, api)));
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
          callback(parseFloat(balance));
        }
      }
    );
  },
  subscribeToExtensionChanges: async (
    addresses: InjectedAccountWithMeta[] | undefined,
    callback: (accounts: any) => void
  ) => {
    if (addresses === undefined) return;
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
};

export { wsAPI, initializeApi };
