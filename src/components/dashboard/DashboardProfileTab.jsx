import React from 'react';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
    import ProfileForm from './ProfileForm'; 

    const DashboardProfileTab = ({ profile, session, onProfileUpdate, stats }) => {
      return (
        <Card className="shadow-lg glassmorphism dark:bg-slate-800/60 dark:border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-slate-800 dark:text-white">Edit Your Profile</CardTitle>
            <CardDescription className="text-muted-foreground dark:text-slate-400">
              Keep your information up to date. Your email is managed via authentication settings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {session && profile ? (
              <ProfileForm 
                profile={profile} 
                session={session} 
                onProfileUpdate={onProfileUpdate} 
              />
            ) : (
              <p className="text-center text-muted-foreground dark:text-slate-400">Loading profile data...</p>
            )}
          </CardContent>
        </Card>
      );
    };

    export default DashboardProfileTab;