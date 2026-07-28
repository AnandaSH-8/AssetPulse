import { motion } from 'framer-motion';
import {
  Trash2,
  AlertTriangle,
  UserX,
  User,
  Mail,
  Lock,
  Save,
  KeyRound,
  CalendarX,
  Loader2,
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { GlassCard } from '@/components/ui/glass-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { financialAPI, userAPI } from '@/services/api';
import { useState, useEffect } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { DEMO_EMAIL, useDemoReadOnly } from '@/lib/demo-user';


export default function Settings() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isClearing, setIsClearing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const isReadOnly = useDemoReadOnly();

  // Month-wise deletion
  const [monthOptions, setMonthOptions] = useState<
    { value: string; label: string; count: number }[]
  >([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [isDeletingMonth, setIsDeletingMonth] = useState(false);
  const [deleteProgress, setDeleteProgress] = useState<{
    done: number;
    total: number;
  } | null>(null);

  const loadMonths = async () => {
    try {
      const response = await financialAPI.getAll();
      const rows: any[] = response.data || [];
      const map = new Map<
        string,
        { month: string; year: number; monthNumber: number; count: number }
      >();
      for (const item of rows) {
        const key = `${item.month}-${item.year}`;
        const existing = map.get(key);
        if (existing) {
          existing.count += 1;
        } else {
          map.set(key, {
            month: item.month,
            year: item.year,
            monthNumber: item.month_number || 0,
            count: 1,
          });
        }
      }
      const sorted = Array.from(map.values()).sort((a, b) =>
        a.year !== b.year ? b.year - a.year : b.monthNumber - a.monthNumber,
      );
      const options = sorted.map(m => ({
        value: `${m.month}-${m.year}`,
        label: `${String(m.month).substring(0, 3)}-${m.year}`,
        count: m.count,
      }));
      setMonthOptions(options);
      setSelectedMonth(prev =>
        options.some(o => o.value === prev) ? prev : '',
      );
    } catch {
      // silent: month deletion simply stays unavailable
    }
  };

  useEffect(() => {
    loadMonths();
  }, []);

  const selectedMonthOption = monthOptions.find(o => o.value === selectedMonth);

  const handleDeleteMonth = async () => {
    if (!selectedMonth) return;
    setIsDeletingMonth(true);
    setDeleteProgress({ done: 0, total: 0 });
    try {
      const response = await financialAPI.getAll();
      const rows: any[] = response.data || [];
      const ids = rows
        .filter((item: any) => `${item.month}-${item.year}` === selectedMonth)
        .map((item: any) => item.id);

      setDeleteProgress({ done: 0, total: ids.length });

      let done = 0;
      for (const id of ids) {
        await financialAPI.delete(id);
        done += 1;
        setDeleteProgress({ done, total: ids.length });
      }

      toast({
        title: 'Deleted',
        description: `${ids.length} ${ids.length === 1 ? 'entry' : 'entries'} removed from ${selectedMonthOption?.label ?? selectedMonth}.`,
      });
      setSelectedMonth('');
      await loadMonths();
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to delete month data',
        variant: 'destructive',
      });
    } finally {
      setIsDeletingMonth(false);
      setDeleteProgress(null);
    }
  };



  // Creator-only: toggle demo account edit mode
  const [adminSettings, setAdminSettings] = useState<{ demo_editable: boolean; is_creator: boolean } | null>(null);
  const [isTogglingDemo, setIsTogglingDemo] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke('admin-settings', { method: 'GET' });
        if (error || !data) return;
        setAdminSettings({ demo_editable: !!data.demo_editable, is_creator: !!data.is_creator });
      } catch {
        // ignore
      }
    })();
  }, []);

  const handleToggleDemoEditable = async (next: boolean) => {
    setIsTogglingDemo(true);
    try {
      const { data, error } = await supabase.functions.invoke('admin-settings', {
        method: 'POST',
        body: { demo_editable: next },
      });
      if (error) throw error;
      setAdminSettings((prev) => prev ? { ...prev, demo_editable: !!data.demo_editable } : prev);
      const { refreshAdminSettings } = await import('@/lib/demo-user');
      await refreshAdminSettings();
      toast({
        title: 'Updated',
        description: `Demo account editing ${data.demo_editable ? 'enabled' : 'disabled'}.`,
      });
    } catch (e) {
      toast({
        title: 'Error',
        description: e instanceof Error ? e.message : 'Failed to update setting',
        variant: 'destructive',
      });
    } finally {
      setIsTogglingDemo(false);
    }
  };

  // Profile state
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Email state
  const [newEmail, setNewEmail] = useState('');
  const [isChangingEmail, setIsChangingEmail] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await userAPI.getProfile();
      setName(response.data.name || '');
      setUsername(response.data.username || '');
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to load profile data',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateProfile = async () => {
    setIsUpdatingProfile(true);
    try {
      await userAPI.updateProfile({ name, username });
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Passwords do not match',
        variant: 'destructive',
      });
      return;
    }

    const passwordChecks = {
      length: newPassword.length >= 12,
      lowercase: /[a-z]/.test(newPassword),
      uppercase: /[A-Z]/.test(newPassword),
      numbers: /\d/.test(newPassword),
      special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword),
    };
    if (!Object.values(passwordChecks).every(Boolean)) {
      toast({
        title: 'Error',
        description:
          'Password must be at least 12 characters and include uppercase, lowercase, number, and special character',
        variant: 'destructive',
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Password changed successfully',
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to change password',
        variant: 'destructive',
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleChangeEmail = async () => {
    if (!newEmail || !newEmail.includes('@')) {
      toast({
        title: 'Error',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      return;
    }

    setIsChangingEmail(true);
    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail,
      });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Check your email to confirm the change',
      });
      setNewEmail('');
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to change email',
        variant: 'destructive',
      });
    } finally {
      setIsChangingEmail(false);
    }
  };

  const handleClearData = async () => {
    setIsClearing(true);
    try {
      await financialAPI.clearAll();
      toast({
        title: 'Success',
        description: 'All financial data has been cleared successfully',
      });
      navigate('/');
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to clear data',
        variant: 'destructive',
      });
    } finally {
      setIsClearing(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await userAPI.deleteAccount();
      await supabase.auth.signOut();
      toast({
        title: 'Account Deleted',
        description: 'Your account has been deleted successfully',
      });
      navigate('/auth');
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to delete account',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold mb-2 bg-gradient-primary bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-muted-foreground text-lg">
          Manage your account and data
        </p>
      </motion.div>

      {/* Profile Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <User className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold">Profile Information</h2>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Enter your name"
              />
            </div>
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Enter your username"
              />
            </div>
            <Button
              onClick={handleUpdateProfile}
              disabled={isUpdatingProfile}
              className="w-full sm:w-auto"
            >
              <Save className="w-4 h-4 mr-2" />
              {isUpdatingProfile ? 'Updating...' : 'Update Profile'}
            </Button>
          </div>
        </GlassCard>
      </motion.div>

      {/* Password Change */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold">Change Password</h2>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Enter new password"
              />
            </div>
            <div>
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
              />
            </div>
            <Button
              onClick={handleChangePassword}
              disabled={isChangingPassword || !newPassword || !confirmPassword}
              className="w-full sm:w-auto"
            >
              <Lock className="w-4 h-4 mr-2" />
              {isChangingPassword ? 'Changing...' : 'Change Password'}
            </Button>
          </div>
        </GlassCard>
      </motion.div>

      {/* Email Change */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Mail className="h-6 w-6 text-primary" />
            <h2 className="text-xl font-semibold">Change Email</h2>
          </div>
          <div className="space-y-4">
            <div>
              <Label htmlFor="current-email">Current Email</Label>
              <Input
                id="current-email"
                type="email"
                value={user?.email || ''}
                disabled
                className="bg-muted"
              />
            </div>
            <div>
              <Label htmlFor="new-email">New Email</Label>
              <Input
                id="new-email"
                type="email"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                placeholder="Enter new email"
              />
            </div>
            <Button
              onClick={handleChangeEmail}
              disabled={isChangingEmail || !newEmail}
              className="w-full sm:w-auto"
            >
              <Mail className="w-4 h-4 mr-2" />
              {isChangingEmail ? 'Sending...' : 'Change Email'}
            </Button>
            <p className="text-sm text-muted-foreground">
              A confirmation link will be sent to your new email address
            </p>
          </div>
        </GlassCard>
      </motion.div>

      {/* Creator Controls (only visible to the creator account) */}
      {adminSettings?.is_creator && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.38 }}
        >
          <GlassCard className="p-6 border-primary/40">
            <div className="flex items-center gap-3 mb-4">
              <KeyRound className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-semibold">Creator Controls</h2>
            </div>
            <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-background/50">
              <div className="pr-4">
                <h3 className="font-semibold mb-1">Allow demo account to edit data</h3>
                <p className="text-sm text-muted-foreground">
                  When ON, the shared demo account{DEMO_EMAIL ? ` (${DEMO_EMAIL})` : ''} can add, edit,
                  and delete entries. Turn OFF to restore the public read-only demo.
                </p>
              </div>
              <Switch
                checked={!!adminSettings?.demo_editable}
                disabled={isTogglingDemo}
                onCheckedChange={handleToggleDemoEditable}
              />
            </div>
          </GlassCard>
        </motion.div>
      )}

      {/* Danger Zone */}



      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <GlassCard className="p-6 border-destructive/50">
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle className="h-6 w-6 text-destructive" />
            <h2 className="text-xl font-semibold text-destructive">
              Danger Zone
            </h2>
          </div>

          <div className="space-y-4">
            {/* Delete Month Data */}
            <div className="flex flex-col gap-4 p-4 rounded-lg border border-border/50 bg-background/50 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-semibold mb-1">Delete Month Data</h3>
                <p className="text-sm text-muted-foreground">
                  Remove every entry for a single month — useful to undo a
                  copied month you no longer need.
                </p>
              </div>
              <div className="flex items-center gap-2 sm:ml-4 shrink-0">
                <Select
                  value={selectedMonth}
                  onValueChange={setSelectedMonth}
                  disabled={isReadOnly || monthOptions.length === 0}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue
                      placeholder={
                        monthOptions.length === 0 ? 'No data' : 'Select month'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {monthOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label} ({option.count})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled={!selectedMonth || isDeletingMonth || isReadOnly}
                      title={
                        isReadOnly ? 'Disabled for the demo account' : undefined
                      }
                    >
                      {isDeletingMonth ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <CalendarX className="w-4 h-4 mr-2" />
                      )}
                      {isDeletingMonth ? 'Deleting...' : 'Delete Month'}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete month data?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete{' '}
                        {selectedMonthOption?.count ?? 0}{' '}
                        {selectedMonthOption?.count === 1 ? 'entry' : 'entries'}{' '}
                        from {selectedMonthOption?.label ?? ''}. This action
                        cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteMonth}
                        disabled={isDeletingMonth}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {isDeletingMonth ? 'Deleting...' : 'Yes, delete month'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            {/* Clear All Data */}

            <div className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-background/50">
              <div>
                <h3 className="font-semibold mb-1">Clear All Financial Data</h3>
                <p className="text-sm text-muted-foreground">
                  Permanently delete all your financial particulars. Your login
                  credentials will be preserved.
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="ml-4">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear Data
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      all your financial data from our servers. Your account and
                      login credentials will remain intact.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleClearData}
                      disabled={isClearing}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isClearing ? 'Clearing...' : 'Yes, clear all data'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>

            {/* Delete Account */}
            <div className="flex items-center justify-between p-4 rounded-lg border border-destructive bg-destructive/5">
              <div>
                <h3 className="font-semibold mb-1 text-destructive">
                  Delete Account
                </h3>
                <p className="text-sm text-muted-foreground">
                  Permanently delete your account and all associated data. This
                  action cannot be undone.
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="ml-4">
                    <UserX className="w-4 h-4 mr-2" />
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Account</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      your account, profile, and all financial data from our
                      servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      disabled={isDeleting}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isDeleting ? 'Deleting...' : 'Yes, delete my account'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </GlassCard>
      </motion.div>

      {(isDeletingMonth || isClearing) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/70 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 rounded-xl border border-border/60 bg-card/90 px-8 py-6 shadow-xl">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="font-medium">
              {isClearing
                ? 'Clearing all financial data...'
                : 'Deleting month data...'}
            </p>
            {isDeletingMonth && deleteProgress && deleteProgress.total > 0 && (
              <>
                <p className="text-sm text-muted-foreground">
                  {deleteProgress.done} of {deleteProgress.total} entries
                  removed
                </p>
                <div className="h-1.5 w-56 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{
                      width: `${Math.round((deleteProgress.done / deleteProgress.total) * 100)}%`,
                    }}
                  />
                </div>
              </>
            )}
            <p className="text-xs text-muted-foreground">
              Please don't close this page.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
