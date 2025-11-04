'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useUser, useAuth } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

export default function MakeAdminPage() {
  const { user } = useUser();
  const auth = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleMakeAdmin = async () => {
    if (!user) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'You must be logged in to perform this action.',
      });
      return;
    }

    setIsLoading(true);

    try {
      const token = await user.getIdToken();
      const response = await fetch('/api/make-admin', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to assign admin role.');
      }

      toast({
        title: 'Success!',
        description: 'Admin role assigned. Please log out and log back in for the changes to take effect.',
      });
      
      // Log the user out
      if(auth) {
        await auth.signOut();
        router.push('/login');
      }

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-1 items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Become Administrator</CardTitle>
          <CardDescription>
            This is a one-time action to grant administrative privileges to your current user account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            You are currently logged in as: <span className="font-semibold">{user?.email}</span>
          </p>
          <p className="mt-4 text-sm text-muted-foreground">
            Clicking the button below will elevate this user to an Admin. You will be logged out and will need to log back in to see the changes.
          </p>
        </CardContent>
        <CardFooter>
          <Button onClick={handleMakeAdmin} disabled={isLoading} className="w-full">
            {isLoading ? 'Assigning Role...' : 'Make Me Admin'}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
