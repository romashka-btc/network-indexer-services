// Copyright 2020-2023 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: Apache-2.0

import React from 'react';
import { ContractSDK, SdkOptions } from '@subql/contract-sdk';
import { SQNetworks } from '@subql/network-config';
import { intToHex } from 'ethereumjs-util';

import { useIsMetaMask, useWeb3 } from 'hooks/web3Hook';
import Logger from 'utils/logger';
import { ChainID, isSupportNetwork } from 'utils/web3';

import { createContainer } from './unstated';

function createContractOptions(network: SQNetworks): SdkOptions {
  return {
    network,
  };
}

const options = {
  [ChainID.testnet]: createContractOptions(SQNetworks.TESTNET),
  [ChainID.mainnet]: createContractOptions(SQNetworks.MAINNET),
};

export type SDK = ContractSDK | undefined;

function useContractsImpl(logger: Logger): SDK {
  const [sdk, setSdk] = React.useState<ContractSDK>();
  const { library, chainId } = useWeb3();
  const isMetaMask = useIsMetaMask();

  React.useEffect(() => {
    if (!chainId || !isSupportNetwork(intToHex(chainId) as ChainID)) return;

    const sdkOption = options[intToHex(chainId) as ChainID];
    if (!sdkOption || !sdkOption.network) {
      throw new Error(
        'Invalid sdk options, contracts provider requires network and deploymentDetails'
      );
    }

    if (library && isMetaMask) {
      setSdk(ContractSDK.create(library, sdkOption));
    }
  }, [logger, library, chainId, isMetaMask]);

  return sdk;
}

export const { useContainer: useContractSDK, Provider: ContractSDKProvider } = createContainer(
  useContractsImpl,
  {
    displayName: 'Contract SDK',
  }
);
