import { connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  coinbaseWallet,
  ledgerWallet,
  metaMaskWallet,
  rainbowWallet,
  safeWallet,
  walletConnectWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { rainbowkitBurnerWallet } from "burner-connector";
import * as chains from "viem/chains";
import scaffoldConfig from "~~/scaffold.config";
import { Web3AuthConnector } from "@web3auth/web3auth-wagmi-connector";
import { Web3AuthOptions } from "@web3auth/modal";
import { CHAIN_NAMESPACES } from "@web3auth/base";

const { onlyLocalBurnerWallet, targetNetworks } = scaffoldConfig;

const web3AuthOptions: Web3AuthOptions = {
  clientId: "YOUR_WEB3AUTH_CLIENT_ID", // TODO: Reemplazar con tu Client ID de Web3Auth
  web3AuthNetwork: "sapphire_mainnet", // Puedes cambiarlo a "testnet" o "mainnet" según tu entorno
  chainConfig: {
    chainNamespace: CHAIN_NAMESPACES.EIP155,
    chainId: `0x${targetNetworks[0].id.toString(16)}`, // Asume que el primer targetNetwork es el principal
    rpcTarget: targetNetworks[0].rpcUrls.default.http[0],
  },
};

const web3AuthConnector = new Web3AuthConnector({
  chains: targetNetworks, // Pasa tus cadenas configuradas
  options: web3AuthOptions,
});

const wallets = [
  metaMaskWallet,
  walletConnectWallet,
  ledgerWallet,
  coinbaseWallet,
  rainbowWallet,
  safeWallet,
  web3AuthConnector, // Añadir el conector de Web3Auth
  ...(!targetNetworks.some(network => network.id !== (chains.hardhat as chains.Chain).id) || !onlyLocalBurnerWallet
    ? [rainbowkitBurnerWallet]
    : []),
];

/**
 * wagmi connectors for the wagmi context
 */
export const wagmiConnectors = connectorsForWallets(
  [
    {
      groupName: "Supported Wallets",
      wallets,
    },
  ],

  {
    appName: "scaffold-eth-2",
    projectId: scaffoldConfig.walletConnectProjectId,
  },
);
