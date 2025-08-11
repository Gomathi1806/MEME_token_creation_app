import { useReadContract, useReadContracts } from 'wagmi';
import { formatEther } from 'viem';
import { ERC20_ABI } from '../config/wagmi';

export function useTokenData(tokenAddress?: `0x${string}`) {
  const { data, isLoading, error } = useReadContracts({
    contracts: [
      {
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: 'name',
      },
      {
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: 'symbol',
      },
      {
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: 'totalSupply',
      },
    ],
    query: {
      enabled: !!tokenAddress,
    },
  });

  const tokenData = data ? {
    name: data[0].result as string,
    symbol: data[1].result as string,
    totalSupply: data[2].result ? formatEther(data[2].result as bigint) : '0',
    address: tokenAddress,
  } : null;

  return {
    tokenData,
    isLoading,
    error,
  };
}

export function useTokenBalance(tokenAddress?: `0x${string}`, userAddress?: `0x${string}`) {
  const { data: balance, isLoading, error } = useReadContract({
    address: tokenAddress,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!(tokenAddress && userAddress),
    },
  });

  return {
    balance: balance ? formatEther(balance as bigint) : '0',
    isLoading,
    error,
  };
}