import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Save, Bell } from 'lucide-react';
import { apiFetch } from '../../lib/api';

export default function UserSettingsPage() {
  const { userData } = useOutletContext();
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const [formData, setFormData] = useState({
    firstName: userData?.first_name || '',
    lastName: userData?.last_name || '',
    email: userData?.email || '',
    phone: userData?.phone_number || ''
  });

  const [preferences, setPreferences] = useState({
    receive_email_notifications: userData?.receive_email_notifications ?? true,
    receive_inapp_notifications: userData?.receive_inapp_notifications ?? true,
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      const token = localStorage.getItem('access');
      await apiFetch('http://localhost:8000/api/accounts/preferences/', {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(preferences)
      });
      setSuccessMsg('Settings saved successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = (key) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-1">Settings</h1>
        <p className="text-text-main/70">Manage your account preferences and personal information.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your profile details.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1.5">First Name</label>
                <Input name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First Name" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Last Name</label>
                <Input name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last Name" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Email Address</label>
                <Input name="email" type="email" value={formData.email} disabled className="bg-surface/50 opacity-70" />
                <p className="text-[10px] text-text-main/50 mt-1">Email cannot be changed.</p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Phone Number</label>
                <Input name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 00000 00000" />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button type="submit" isLoading={isSaving}>
                <Save className="w-4 h-4 mr-2" /> Save Changes
              </Button>
              {successMsg && (
                <span className="text-sm font-medium text-success">{successMsg}</span>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>Choose how you want to be notified.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-xl border border-border-main/50 bg-surface">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10 text-primary">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-medium text-sm">In-App Notifications</h4>
                  <p className="text-xs text-text-main/60">Receive alerts directly within the dashboard.</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={preferences.receive_inapp_notifications}
                  onChange={() => handleToggle('receive_inapp_notifications')}
                />
                <div className="w-11 h-6 bg-border-main peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border-main after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border border-border-main/50 bg-surface">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10 text-primary">
                  <span className="w-5 h-5 font-bold flex items-center justify-center text-sm">@</span>
                </div>
                <div>
                  <h4 className="font-medium text-sm">Email Notifications</h4>
                  <p className="text-xs text-text-main/60">Receive important updates and receipts via email.</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer"
                  checked={preferences.receive_email_notifications}
                  onChange={() => handleToggle('receive_email_notifications')}
                />
                <div className="w-11 h-6 bg-border-main peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-border-main after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
              </label>
            </div>
            
            <div className="flex items-center gap-4">
              <Button onClick={handleSave} isLoading={isSaving}>
                <Save className="w-4 h-4 mr-2" /> Save Preferences
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
