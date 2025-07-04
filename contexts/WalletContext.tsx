"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { ethers } from 'ethers'

interface WalletState {
  address: string
  isConnected: boolean
  isConnecting: boolean
  chainId: number | null
  balance: string | null
  provider: ethers.BrowserProvider | null
  signer: ethers.JsonRpcSigner | null
}

interface WalletContextType extends WalletState {
  connectWallet: () => Promise<void>
  disconnect: () => void
  error: string
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}

interface WalletProviderProps {
  children: ReactNode
}

export function WalletProvider({ children }: WalletProviderProps) {
  const [wallet, setWallet] = useState<WalletState>({
    address: '',
    isConnected: false,
    isConnecting: false,
    chainId: null,
    balance: null,
    provider: null,
    signer: null
  })
  const [error, setError] = useState<string>('')

  // Check if already connected on component mount
  useEffect(() => {
    checkIfWalletIsConnected()
  }, [])

  // Listen for account changes
  useEffect(() => {
    if (typeof (window as any).ethereum !== 'undefined') {
      ;(window as any).ethereum.on('accountsChanged', handleAccountsChanged)
      ;(window as any).ethereum.on('chainChanged', handleChainChanged)
      
      return () => {
        ;(window as any).ethereum.removeListener('accountsChanged', handleAccountsChanged)
        ;(window as any).ethereum.removeListener('chainChanged', handleChainChanged)
      }
    }
  }, [])

  const checkIfWalletIsConnected = async () => {
    try {
      if (typeof (window as any).ethereum === 'undefined') {
        return
      }

      const provider = new ethers.BrowserProvider((window as any).ethereum)
      const accounts = await provider.listAccounts()
      
      if (accounts.length > 0) {
        const signer = await provider.getSigner()
        const address = await signer.getAddress()
        const network = await provider.getNetwork()
        const balance = await provider.getBalance(address)
        
        setWallet({
          address,
          isConnected: true,
          isConnecting: false,
          chainId: Number(network.chainId),
          balance: ethers.formatEther(balance),
          provider,
          signer
        })
      }
    } catch (err) {
      console.error('Error checking wallet connection:', err)
    }
  }

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      disconnect()
    } else {
      checkIfWalletIsConnected()
    }
  }

  const handleChainChanged = () => {
    checkIfWalletIsConnected()
  }

  const connectWallet = async () => {
    // Check if MetaMask is installed
    if (typeof (window as any).ethereum === 'undefined') {
      setError('MetaMask is not installed. Please install MetaMask to connect your wallet.')
      return
    }

    setWallet(prev => ({ ...prev, isConnecting: true }))
    setError('')

    try {
      // Request account access
      const provider = new ethers.BrowserProvider((window as any).ethereum)
      await provider.send("eth_requestAccounts", [])
      
      // Get the signer and address
      const signer = await provider.getSigner()
      const address = await signer.getAddress()
      const network = await provider.getNetwork()
      const balance = await provider.getBalance(address)
      
      setWallet({
        address,
        isConnected: true,
        isConnecting: false,
        chainId: Number(network.chainId),
        balance: ethers.formatEther(balance),
        provider,
        signer
      })

      console.log('Wallet connected:', {
        address,
        chainId: Number(network.chainId),
        balance: ethers.formatEther(balance)
      })

    } catch (err: any) {
      setWallet(prev => ({ ...prev, isConnecting: false }))
      
      if (err.code === 4001) {
        setError('Connection rejected by user')
      } else if (err.code === -32002) {
        setError('Connection request already pending')
      } else {
        setError('Failed to connect wallet')
      }
      console.error('Wallet connection error:', err)
    }
  }

  const disconnect = () => {
    setWallet({
      address: '',
      isConnected: false,
      isConnecting: false,
      chainId: null,
      balance: null,
      provider: null,
      signer: null
    })
    setError('')
  }

  const value: WalletContextType = {
    ...wallet,
    connectWallet,
    disconnect,
    error
  }

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  )
}
