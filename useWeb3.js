import Web3 from '@Apocentre/solana-web3';
import {useConnection, useWallet} from '@solana/wallet-adapter-react';
import {useEffect, useState} from 'react';

export const useWeb3 = () => {
  const [web3, setWeb3] = useState();
  const {connection} = useConnection();
  const {wallet} = useWallet();

  useEffect(() => {
    const initWeb3 = async () => {
      if (wallet && connection) {
        const _web3 = Web3();
        await _web3.init(connection, wallet.adapter, {});
        setWeb3(_web3);
      }
    };

    initWeb3().catch(console.error);
  }, [wallet?.adapter?.publicKey?.toString()]);

  return web3;
};
