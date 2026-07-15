import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Save } from 'lucide-react';

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaving(true);
    // Simulate save since we don't have a specific update profile endpoint in this example, or we can just mock it.
    setTimeout(() => {
      setIsSaving(false);
      setSuccessMsg('Settings saved successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    }, 1000);
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
    </div>
  );
}
