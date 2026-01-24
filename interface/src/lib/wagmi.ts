import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Stratum Protocol',
  projectId: '2f8a97914452f8cf69d97b41ae7a0db8',
  chains: [sepolia],
  ssr: false,
});
