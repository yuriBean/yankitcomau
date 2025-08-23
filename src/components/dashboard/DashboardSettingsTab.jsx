import React from 'react';
    import { Button } from '@/components/ui/button';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { LogOut, Bell, Shield, Palette, CreditCard } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast';

    const SettingsSection = ({ title, description, icon: Icon, children }) => (
      <Card className="bg-background/70 dark:bg-slate-800/50 shadow-lg border-border dark:border-slate-700/50">
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            <Icon className="w-6 h-6 text-primary dark:text-purple-400" />
            <div>
              <CardTitle className="text-xl text-foreground dark:text-slate-100">{title}</CardTitle>
              <CardDescription className="text-muted-foreground dark:text-slate-400">{description}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {children}
        </CardContent>
      </Card>
    );

    const DashboardSettingsTab = ({ onSignOut }) => {
      const { toast } = useToast();

      const handlePlaceholderAction = (actionName) => {
        toast({
          title: "Feature Coming Soon",
          description: `${actionName} functionality is under development.`,
          variant: "default",
          className: "bg-sky-500 dark:bg-sky-600 text-white"
        });
      };
      
      return (
        <div className="space-y-8 text-foreground dark:text-slate-200">
          <SettingsSection title="Account Settings" description="Manage your account details and preferences." icon={Shield}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-foreground dark:text-slate-300">Email Address</Label>
                <Input id="email" type="email" placeholder="your.email@example.com" defaultValue="user@example.com" disabled className="mt-1 bg-muted dark:bg-slate-700/60 dark:text-slate-400" />
              </div>
              <div>
                <Button variant="outline" className="dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700" onClick={() => handlePlaceholderAction('Change Password')}>Change Password</Button>
              </div>
            </div>
          </SettingsSection>

          <SettingsSection title="Notification Preferences" description="Control how you receive notifications from Yankit." icon={Bell}>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground dark:text-slate-400">Configure your email and push notification settings (feature coming soon).</p>
              <Button variant="outline" className="dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700" onClick={() => handlePlaceholderAction('Manage Notifications')}>Manage Notifications</Button>
            </div>
          </SettingsSection>

          <SettingsSection title="Appearance" description="Customize the look and feel of your dashboard." icon={Palette}>
            <p className="text-sm text-muted-foreground dark:text-slate-400">Theme settings are typically managed globally (Light/Dark mode toggle in header).</p>
            <Button variant="outline" className="dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700" onClick={() => handlePlaceholderAction('Customize Theme')}>Customize Theme (Coming Soon)</Button>
          </SettingsSection>
          
          <SettingsSection title="Payment Methods" description="Manage your saved payment methods." icon={CreditCard}>
             <p className="text-sm text-muted-foreground dark:text-slate-400">Add or remove payment methods for faster checkout (feature coming soon).</p>
            <Button variant="outline" className="dark:text-slate-300 dark:border-slate-600 dark:hover:bg-slate-700" onClick={() => handlePlaceholderAction('Manage Payment Methods')}>Manage Payment Methods</Button>
          </SettingsSection>

          <SettingsSection title="Sign Out" description="Securely sign out of your Yankit account." icon={LogOut}>
            <Button onClick={onSignOut} variant="destructive" className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white">
              <LogOut size={16} className="mr-2" /> Sign Out
            </Button>
            <p className="mt-2 text-xs text-muted-foreground dark:text-slate-500">You will be logged out from this device.</p>
          </SettingsSection>
        </div>
      );
    };

    export default DashboardSettingsTab;