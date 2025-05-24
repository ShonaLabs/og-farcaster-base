import { useReadContract, useWriteContract, useAccount } from 'wagmi'
import { nfts } from '../abis/nfts'
import { merkleAbi } from '../abis/merkle'

// Kontrak addresses dari deployment
const FARCASTER_OG_ADDRESS = '0xd6226Eb26A1306DAA2Ca96752DF3A0E62ef6b289'
const MERKLE_CLAIM_ADDRESS = '0x02a837A421101eb874CcfA20F3c1921f3f62D1b9'

export const useNFTContract = () => {
  const { address } = useAccount()

  // Untuk membaca data NFT
  const { data: balanceOf, isLoading: isBalanceLoading } = useReadContract({
    address: FARCASTER_OG_ADDRESS,
    abi: nfts,
    functionName: 'balanceOf',
    args: [address || '0x'],
    query: {
      enabled: !!address,
    },
  })

  // Untuk membaca total supply
  const { data: totalSupply, isLoading: isTotalSupplyLoading } = useReadContract({
    address: FARCASTER_OG_ADDRESS,
    abi: nfts,
    functionName: 'totalSupply',
  })

  // Untuk membaca base URI
  const { data: baseURI } = useReadContract({
    address: FARCASTER_OG_ADDRESS,
    abi: nfts,
    functionName: 'baseURI',
  })

  return { 
    balanceOf, 
    totalSupply, 
    baseURI, 
    isBalanceLoading, 
    isTotalSupplyLoading
  }
}

// Custom hook untuk mengecek status klaim token
export const useTokenClaimStatus = (tokenId: number) => {
  const { data: isClaimed, isLoading: isClaimedLoading } = useReadContract({
    address: MERKLE_CLAIM_ADDRESS,
    abi: merkleAbi,
    functionName: 'claimed',
    args: [BigInt(tokenId || 0)],
    query: {
      enabled: !!tokenId,
    },
  })

  return { isClaimed, isClaimedLoading }
}

export const useMerkleClaim = () => {
  const { writeContractAsync, isPending, isError, error, isSuccess } = useWriteContract()

  const claimToken = async (tokenId: number, proof: `0x${string}`[]) => {
    return await writeContractAsync({
      address: MERKLE_CLAIM_ADDRESS,
      abi: merkleAbi,
      functionName: 'claimToken',
      args: [BigInt(tokenId), proof],
    })
  }

  return { claimToken, isPending, isError, error, isSuccess }
} 