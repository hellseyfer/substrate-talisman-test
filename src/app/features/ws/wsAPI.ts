import { ApiPromise, WsProvider } from '@polkadot/api';
import { toDecimal, toPlanckUnit } from '../../utils/unitConversion';
import { web3FromAddress } from '@polkadot/extension-dapp';
import log from 'loglevel';

export const WS_URL = import.meta.env.VITE_WS_URL;
const provider = new WsProvider(WS_URL);

let api: ApiPromise;
export const initializeApi = async () => {
  if (!api) {
    api = await ApiPromise.create({ provider });
    /**
     *  1. fetch the chain information
     *
     */
    const chainInfo = await api.registry.getChainProperties();
    log.info(`[ws]chainInfo ${chainInfo}`);
  }
  return api;
};

const wsAPI = {
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
            `[ws] Completed at block hash#'${status.asInBlock.toString()}`
          );
          resolve(status.asInBlock.toString()); // Resolve with block hash
        } else if (status.isFinalized) {
          // If you want to handle finalized status separately
          log.info(
            `[ws] Transaction finalized at block hash#'${status.asFinalized.toString()}`
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

export { wsAPI };
