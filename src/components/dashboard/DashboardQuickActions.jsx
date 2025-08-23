import React from 'react';
    import { useNavigate } from 'react-router-dom';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { Send, Briefcase } from 'lucide-react';

    const DashboardQuickActions = () => {
      const navigate = useNavigate();

      return (
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 glassmorphism dark:bg-slate-800/60 dark:border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-slate-700 dark:text-slate-200">Quick Actions</CardTitle>
            <CardDescription className="text-sm text-muted-foreground dark:text-slate-400">Manage your <span className="font-vernaccia-bold">Yankit</span> activities.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button size="lg" className="w-full bg-gradient-to-r from-primary to-purple-600 hover:opacity-90 text-white" onClick={() => navigate('/yank-a-bag')}>
              <Briefcase size={20} className="mr-2" /> Offer Baggage Space
            </Button>
            <Button size="lg" className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:opacity-90 text-white" onClick={() => navigate('/send-a-bag')}>
              <Send size={20} className="mr-2" /> Send a Package
            </Button>
          </CardContent>
        </Card>
      );
    };

    export default DashboardQuickActions;