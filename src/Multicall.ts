import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import { Contract } from 'web3-eth-contract';
import { provider } from 'web3-core';

import { CHAIN_ID_TO_MULTICALL_ADDRESS } from './constants';
import mulitcallAbi from './abi/Multicall.json';
import multicallAggregate from './abi/MulticallAggregate.json';

interface ConstructorArgs {
  chainId?: number;
  provider: provider;
  multicallAddress?: string;
}

class Multicall {
  web3: Web3;
  multicall: Contract;
  multicallAgg: Contract;

  constructor({ chainId, provider, multicallAddress }: ConstructorArgs) {
    this.web3 = new Web3(provider);

    const _multicallAddress = multicallAddress
      ? multicallAddress
      : chainId
      ? CHAIN_ID_TO_MULTICALL_ADDRESS[chainId]
      : undefined;

    if (!_multicallAddress) {
      throw new Error(
        'No address found via chainId. Please specify multicallAddress.'
      );
    }

    this.multicall = new this.web3.eth.Contract(
      mulitcallAbi as AbiItem[],
      _multicallAddress
    );

    this.multicallAgg = new this.web3.eth.Contract(
      multicallAggregate as AbiItem[],
      _multicallAddress
    );
  }

  /// @dev Works with both versions of multicall
  async aggregate(calls: any[]) {
    const callRequests = calls.map((call) => {
      const callData = call.encodeABI();
      return {
        target: call._parent._address,
        callData,
      };
    });

    let res;

    let e = false;
    try {
      res = await this.multicall.methods.aggregate(callRequests).call();
    } catch (error) {
      e = true;
    }

    if (e) {
      console.log('e: ', e);
      try {
        res = await this.multicallAgg.methods
          .aggregate(callRequests, false)
          .call();
      } catch (e) {}
    }

    let { returnData, results } = res;

    if (e) {
      returnData = returnData.flat();

      let x = {
        returnData: [],
        results: [],
      };
      returnData = returnData.map((e) => {
        typeof e === 'boolean' ? x.results.push(e) : x.returnData.push(e);
      });

      returnData = x.returnData;
      results = x.results;
    }

    return returnData.map((hex: string, index: number) => {
      const types = calls[index]._method.outputs.map((o: any) =>
        o.internalType !== o.type && o.internalType !== undefined ? o : o.type
      );
      console.log('response', results[index], hex);
      if (results[index]) {
        let result;
        try {
          result = this.web3.eth.abi.decodeParameters(types, hex);
        } catch (e: any) {
          return [false, `Data handling error: ${e.message}`];
        }

        delete result.__length__;

        result = Object.values(result);

        return [true, result.length === 1 ? result[0] : result];
      } else {
        return [false, hex];
      }
    });
  }

  getEthBalance(address: string) {
    return this.multicall.methods.getEthBalance(address);
  }

  getBlockHash(blockNumber: string | number) {
    return this.multicall.methods.getBlockHash(blockNumber);
  }

  getLastBlockHash() {
    return this.multicall.methods.getLastBlockHash();
  }

  getCurrentBlockTimestamp() {
    return this.multicall.methods.getCurrentBlockTimestamp();
  }

  getCurrentBlockDifficulty() {
    return this.multicall.methods.getCurrentBlockDifficulty();
  }

  getCurrentBlockGasLimit() {
    return this.multicall.methods.getCurrentBlockGasLimit();
  }

  getCurrentBlockCoinbase() {
    return this.multicall.methods.getCurrentBlockCoinbase();
  }
}

export default Multicall;
