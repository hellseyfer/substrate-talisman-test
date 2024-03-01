import { ApiPromise, WsProvider } from '@polkadot/api';
import { toDecimal, toPlanckUnit } from '../../utils/unitConversion';
import { web3FromAddress } from '@polkadot/extension-dapp';
import log from 'loglevel';

const WS_URL = import.meta.env.VITE_WS_URL;
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
