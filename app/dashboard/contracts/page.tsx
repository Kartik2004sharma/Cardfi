'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ExternalLink, FileText, CheckCircle, Clock } from 'lucide-react';

interface Contract {
  id: string;
  name: string;
  address: string;
  chain: string;
  type: 'YieldManager' | 'StrategyVault' | 'LiquidityPool' | 'Bridge';
  status: 'active' | 'deployed' | 'pending';
  balance: number;
  lastInteraction: string;
  version: string;
}

interface Transaction {
  id: string;
  contract: string;
  action: string;
  amount: number;
  timestamp: string;
  status: 'success' | 'pending' | 'failed';
  txHash: string;
  chain: string;
}

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('contracts');

  useEffect(() => {
    // Mock data for contracts
    const mockContracts: Contract[] = [
      {
        id: '1',
        name: 'Main Yield Manager',
        address: '0x742d35Cc6635C0532925a3b8D400a8e13e3B5a3D',
        chain: 'Ethereum',
        type: 'YieldManager',
        status: 'active',
        balance: 125000,
        lastInteraction: '2024-01-15 14:30:00',
        version: '1.2.0'
      },
      {
        id: '2',
        name: 'USDC Strategy Vault',
        address: '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2',
        chain: 'Ethereum',
        type: 'StrategyVault',
        status: 'active',
        balance: 85000,
        lastInteraction: '2024-01-15 12:15:00',
        version: '1.1.5'
      },
      {
        id: '3',
        name: 'Polygon Bridge Vault',
        address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
        chain: 'Polygon',
        type: 'Bridge',
        status: 'deployed',
        balance: 45000,
        lastInteraction: '2024-01-14 16:45:00',
        version: '1.0.8'
      }
    ];

    const mockTransactions: Transaction[] = [
      {
        id: '1',
        contract: 'Main Yield Manager',
        action: 'Deposit USDC',
        amount: 5000,
        timestamp: '2024-01-15 14:30:00',
        status: 'success',
        txHash: '0xabc123...',
        chain: 'Ethereum'
      },
      {
        id: '2',
        contract: 'USDC Strategy Vault',
        action: 'Rebalance',
        amount: 0,
        timestamp: '2024-01-15 12:15:00',
        status: 'success',
        txHash: '0xdef456...',
        chain: 'Ethereum'
      },
      {
        id: '3',
        contract: 'Polygon Bridge Vault',
        action: 'Bridge USDC',
        amount: 2500,
        timestamp: '2024-01-15 10:00:00',
        status: 'pending',
        txHash: '0xghi789...',
        chain: 'Polygon'
      }
    ];

    setTimeout(() => {
      setContracts(mockContracts);
      setTransactions(mockTransactions);
      setLoading(false);
    }, 1000);
  }, []);

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'deployed':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Smart Contracts</h1>
          <p className="text-muted-foreground">
            Monitor and interact with your yield optimization contracts
          </p>
        </div>
        <Button>
          <FileText className="mr-2 h-4 w-4" />
          Deploy Contract
        </Button>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="contracts">Contracts</TabsTrigger>
          <TabsTrigger value="transactions">Recent Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="contracts" className="space-y-4">
          <div className="grid gap-4">
            {contracts.map((contract) => (
              <Card key={contract.id}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-lg font-medium">
                      {contract.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {formatAddress(contract.address)}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{contract.chain}</Badge>
                    <Badge className={getStatusColor(contract.status)}>
                      {contract.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Type</p>
                      <p className="text-lg font-bold">{contract.type}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Balance</p>
                      <p className="text-lg font-bold">{formatCurrency(contract.balance)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Version</p>
                      <p className="text-lg font-bold">{contract.version}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Last Interaction</p>
                      <p className="text-sm">{new Date(contract.lastInteraction).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <Button variant="outline" size="sm">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View on Explorer
                    </Button>
                    <Button variant="outline" size="sm">
                      Interact
                    </Button>
                    {contract.type === 'YieldManager' && (
                      <Button size="sm">
                        Rebalance
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <div className="grid gap-4">
            {transactions.map((tx) => (
              <Card key={tx.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(tx.status)}
                      <div>
                        <p className="font-medium">{tx.action}</p>
                        <p className="text-sm text-muted-foreground">
                          {tx.contract} • {formatAddress(tx.txHash)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {tx.amount > 0 ? formatCurrency(tx.amount) : '-'}
                      </p>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">{tx.chain}</Badge>
                        <Badge className={`text-xs ${getStatusColor(tx.status)}`}>
                          {tx.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center mt-3 pt-3 border-t">
                    <p className="text-sm text-muted-foreground">
                      {new Date(tx.timestamp).toLocaleString()}
                    </p>
                    <Button variant="ghost" size="sm">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Transaction
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
