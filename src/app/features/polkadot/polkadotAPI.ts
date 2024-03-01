import { ApiPromise, WsProvider } from '@polkadot/api';
import { toDecimal, toPlanckUnit } from '../../utils/unitConversion';
import { web3FromAddress } from '@polkadot/extension-dapp';
import log from 'loglevel';

export const blockchainBaseUrl = 'wss://westend-rpc.polkadot.io';
const provider = new WsProvider(blockchainBaseUrl);

let apiInstance: ApiPromise;
export const initializeApi = async () => {
  if (!apiInstance) {
    apiInstance = await ApiPromise.create({ provider });
    log.info('[Polkadot API] initialized');
  }
  return apiInstance;
};

// userAPI.js
const api = await initializeApi();

const polkadotAPI = {
  fetchAccountBalance: async (accountAddress: string) => {
    try {
      let { data } = (await api.query.system.account(accountAddress)) as any;
      /**
       * 2. Convert the planck amount to decimal amount
       */
      const balanceDecimal = toDecimal(data.free, api);
      log.info('[Polkadot API] Initial balance: ', balanceDecimal);
      return parseFloat(balanceDecimal);
    } catch (error) {
      // Handle error (e.g., logging, throwing, etc.)
      throw error;
    }
  },
  signTx: async (
    fromAddress: string,
    toAddress: string,
    decimalAmount: number
  ) => {
    return new Promise(async (resolve, reject) => {
      const injector = await web3FromAddress(fromAddress);
      log.info(
        `Transfering ${decimalAmount} from: ${fromAddress} to: ${toAddress}`
      );
      const planckAmount = toPlanckUnit(decimalAmount, api);
      const tx = api.tx.balances.transferKeepAlive(toAddress, planckAmount);

      tx.signAndSend(fromAddress, { signer: injector.signer }, ({ status }) => {
        if (status.isInBlock) {
          log.info(
            `[Polkadot API] Completed at block hash#'${status.asInBlock.toString()}`
          );
          resolve(status.asInBlock.toString()); // Resolve with block hash
        } else if (status.isFinalized) {
          // If you want to handle finalized status separately
          log.info(
            `[Polkadot API] Transaction finalized at block hash#'${status.asFinalized.toString()}`
          );
        } else if (status.isDropped || status.isInvalid) {
          reject(new Error(`Transaction failed with status: ${status.type}`));
        } else {
          log.info(`[Polkadot API] Current status: ${status.type}`);
        }
      }).catch((error) => {
        if (error instanceof Error) {
          log.info('[Polkadot API] Transaction failed', error);
          reject(error); // Reject with the error object
        }
      });
    });
  },
};

export { polkadotAPI };
