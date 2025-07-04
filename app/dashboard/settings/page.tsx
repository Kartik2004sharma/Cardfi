'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Bell, Shield, Zap, Settings, Wallet, CreditCard } from 'lucide-react';

interface UserSettings {
  autoRebalance: boolean;
  rebalanceThreshold: number;
  maxSlippage: number;
  gasOptimization: 'slow' | 'medium' | 'fast';
  cardAutoTopup: boolean;
  topupAmount: number;
  topupThreshold: number;
  preferredChain: string;
  notifications: boolean;
  emailAlerts: boolean;
  pushNotifications: boolean;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<UserSettings>({
    autoRebalance: true,
    rebalanceThreshold: 5,
    maxSlippage: 0.5,
    gasOptimization: 'medium',
    cardAutoTopup: true,
    topupAmount: 100,
    topupThreshold: 20,
    preferredChain: 'ethereum',
    notifications: true,
    emailAlerts: true,
    pushNotifications: false,
  });

  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
  };

  const updateSetting = (key: keyof UserSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your CardFi preferences and wallet settings</p>
        </div>
        <Button onClick={handleSave} disabled={loading}>
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="card">MetaMask Card</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                General Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-Rebalancing</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically rebalance your portfolio when thresholds are met
                  </p>
                </div>
                <Switch
                  checked={settings.autoRebalance}
                  onCheckedChange={(checked) => updateSetting('autoRebalance', checked)}
                />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Rebalance Threshold ({settings.rebalanceThreshold}%)</Label>
                <Slider
                  value={[settings.rebalanceThreshold]}
                  onValueChange={([value]) => updateSetting('rebalanceThreshold', value)}
                  min={1}
                  max={20}
                  step={1}
                  className="w-full"
                />
                <p className="text-sm text-muted-foreground">
                  Trigger rebalancing when allocation deviates by this percentage
                </p>
              </div>

              <div className="space-y-2">
                <Label>Maximum Slippage ({settings.maxSlippage}%)</Label>
                <Slider
                  value={[settings.maxSlippage]}
                  onValueChange={([value]) => updateSetting('maxSlippage', value)}
                  min={0.1}
                  max={5}
                  step={0.1}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label>Gas Optimization</Label>
                <Select
                  value={settings.gasOptimization}
                  onValueChange={(value: 'slow' | 'medium' | 'fast') => updateSetting('gasOptimization', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="slow">Slow (Lower fees)</SelectItem>
                    <SelectItem value="medium">Medium (Balanced)</SelectItem>
                    <SelectItem value="fast">Fast (Higher fees)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="card" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                MetaMask Card Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto Top-up</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically top-up your card when balance is low
                  </p>
                </div>
                <Switch
                  checked={settings.cardAutoTopup}
                  onCheckedChange={(checked) => updateSetting('cardAutoTopup', checked)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Top-up Amount ($)</Label>
                  <Input
                    type="number"
                    value={settings.topupAmount}
                    onChange={(e) => updateSetting('topupAmount', Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Top-up Threshold ($)</Label>
                  <Input
                    type="number"
                    value={settings.topupThreshold}
                    onChange={(e) => updateSetting('topupThreshold', Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Preferred Chain</Label>
                <Select
                  value={settings.preferredChain}
                  onValueChange={(value) => updateSetting('preferredChain', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ethereum">Ethereum</SelectItem>
                    <SelectItem value="polygon">Polygon</SelectItem>
                    <SelectItem value="arbitrum">Arbitrum</SelectItem>
                    <SelectItem value="optimism">Optimism</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-6 bg-gradient-to-r from-orange-500 to-yellow-500 rounded"></div>
                    <div>
                      <p className="text-sm font-medium">MetaMask</p>
                      <p className="text-xs text-muted-foreground">0x742d...5a3D</p>
                    </div>
                  </div>
                  <Badge variant="outline">Connected</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications for important events
                  </p>
                </div>
                <Switch
                  checked={settings.notifications}
                  onCheckedChange={(checked) => updateSetting('notifications', checked)}
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Get email notifications for trades and important updates
                  </p>
                </div>
                <Switch
                  checked={settings.emailAlerts}
                  onCheckedChange={(checked) => updateSetting('emailAlerts', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive browser push notifications
                  </p>
                </div>
                <Switch
                  checked={settings.pushNotifications}
                  onCheckedChange={(checked) => updateSetting('pushNotifications', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Wallet Security</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Manage your wallet security settings and connected accounts
                  </p>
                </div>

                <Button variant="outline" className="w-full justify-start">
                  <Wallet className="w-4 h-4 mr-2" />
                  View Connected Wallets
                </Button>

                <Button variant="outline" className="w-full justify-start">
                  <Zap className="w-4 h-4 mr-2" />
                  Manage App Permissions
                </Button>

                <Separator />

                <div>
                  <h3 className="text-lg font-medium mb-2">Account Security</h3>
                  <div className="space-y-2">
                    <Button variant="outline">Change Password</Button>
                    <Button variant="outline">Enable Two-Factor Authentication</Button>
                    <Button variant="outline">Download Recovery Codes</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
