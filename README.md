# web3-multicall

[![npm version](https://badge.fury.io/js/%40hashex%2Fweb3-multicall.svg)](https://badge.fury.io/js/%40hashex%2Fweb3-multicall)

A library to do multiple calls via a single `eth_call` using [web3](https://github.com/ChainSafe/web3.js).

## Installation

- via yarn

```bash
yarn add @hashex/web3-multicall
```

- via npm

```bash
npm i @hashex/web3-multicall
```

## Usage

> [Contract Reference](/src/contract/Multicall.sol)

[Default Supported Networks](./SUPPORTED_NETWORKS.md)

### Constructing

- With `chainId`

  ```js
  import Multicall from '@hashex/web3-multicall';

  import erc20Abi from './abi/erc20.json';

  async function main() {
    const web3 = new Web3(provider /* Your Web3 provider here */);

    const multicall = new Multicall({
      chainId: 1,
      provider: 'Your Web3 provider here',
    });

    ...
  }

  main()
  ```

- With custom Multicall address

  ```js
  import Multicall from '@hashex/web3-multicall';

  import erc20Abi from './abi/erc20.json';

  async function main() {
    const web3 = new Web3(provider /* Your Web3 provider here */);

    const multicall = new Multicall({
      multicallAddress: 'The address of the deployed multicall contract',
      provider: 'Your Web3 provider here',
    });

    ...
  }

  main();
  ```

### Aggregating

```js
const dpxContract = new web3.eth.Contract(dpxAddress, erc20Abi);

const balances = await multicall.aggregate([
  dpxContract.methods.balanceOf('Address 1'),
  dpxContract.methods.balanceOf('Address 2'),
  multicall.getEthBalance('Address 3'),
]);

console.log('DPX balance of Address 1', balances[0]);
console.log('DPX balance of Address 2', balances[1]);
console.log('ETH balance of Address 3', balances[2]);
```

### Helper Functions

- `getEthBalance`
  Gets the ETH balance of an address

  ```js
  const ethBalance = await multicall.getEthBalance('address').call();
  ```

- `getBlockHash`
  Gets the block hash

  Only works for 256 most recent, excluding current according to [Solidity docs](https://docs.soliditylang.org/en/v0.4.24/units-and-global-variables.html#block-and-transaction-properties)

  ```js
  const blockHash = await multicall.getBlockHash(blockNumber).call();
  ```

- `getLastBlockHash`
  Gets the last blocks hash

  ```js
  const lastBlockHash = await multicall.getLastBlockHash().call();
  ```

- `getCurrentBlockTimestamp`
  Gets the current block timestamp

  ```js
  const currentBlockTimestamp = await multicall.getCurrentBlockTimestamp().call();
  ```

- `getCurrentBlockDifficulty`
  Gets the current block difficulty

  ```js
  const currentBlockDifficulty = await multicall.getCurrentBlockDifficulty().call();
  ```

- `getCurrentBlockGasLimit`
  Gets the current block gas limit

  ```js
  const currentBlockGasLimit = await multicall.getCurrentBlockGasLimit().call();
  ```

- `getCurrentBlockCoinbase`
  Gets the current block coinbase

  ```js
  const currentBlockCoinbase = await multicall.getCurrentBlockCoinbase().call();
  ```

## License

This project is licensed under the MIT License - Copyright (c) 2022 HashEx
