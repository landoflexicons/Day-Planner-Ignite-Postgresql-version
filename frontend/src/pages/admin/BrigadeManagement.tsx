import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Plus, 
  Edit, 
  Trash2, 
  Users,
  AlertCircle
} from 'lucide-react';
import { brigadesAPI, usersAPI } from '@/api';
import { useToast } from '@/hooks/use-toast';

export const BrigadeManagement: React.FC = () => {
  const [brigades, setBrigades] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const [brigadeForm, setBrigadeForm] = useState({
    name: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [brigadesResponse, usersResponse] = await Promise.all([
        brigadesAPI.getAll(),
        usersAPI.getAll()
      ]);

      setBrigades(brigadesResponse.data);
      setUsers(usersResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch brigade data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBrigade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!brigadeForm.name.trim()) {
      setError('Please enter a brigade name');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await brigadesAPI.create({ name: brigadeForm.name.trim() });
      setBrigadeForm({ name: '' });
      fetchData();
      
      toast({
        title: "Success!",
        description: "Brigade created successfully",
        variant: "success",
      });
    } catch (error) {
      console.error('Error creating brigade:', error);
      setError('Failed to create brigade');
    } finally {
      setLoading(false);
    }
  };

  const getBrigadeStats = (brigadeId: string) => {
    const brigadeStudents = users.filter(u => u.brigadeId === brigadeId && u.role === 'STUDENT');
    const activeStudents = brigadeStudents.filter(u => u.isActive);
    
    return {
      totalStudents: brigadeStudents.length,
      activeStudents: activeStudents.length
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-black">Brigade Management</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Create Brigade
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle className="text-black">Create New Brigade</DialogTitle>
              <DialogDescription className="text-gray-600">
                Create a new brigade to organize students
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateBrigade} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="brigadeName" className="text-black">Brigade Name</Label>
                <Input
                  id="brigadeName"
                  value={brigadeForm.name}
                  onChange={(e) => setBrigadeForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter brigade name"
                  className="border-gray-300"
                />
              </div>
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-red-800">{error}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                {loading ? 'Creating...' : 'Create Brigade'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white border border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Brigades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">{brigades.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Brigades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {brigades.filter(b => b.isActive).length}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {users.filter(u => u.role === 'STUDENT').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Brigades List */}
      <div className="grid gap-4">
        {loading ? (
          <Card className="p-8 text-center bg-white border border-gray-200">
            <CardContent>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading brigades...</p>
            </CardContent>
          </Card>
        ) : brigades.length === 0 ? (
          <Card className="p-8 text-center bg-white border border-gray-200">
            <CardContent>
              <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-black mb-2">No Brigades Found</h3>
              <p className="text-gray-600">Create your first brigade to get started.</p>
            </CardContent>
          </Card>
        ) : (
          brigades.map((brigade) => {
            const stats = getBrigadeStats(brigade.id);
            return (
              <Card key={brigade.id} className="bg-white border border-gray-200">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <Shield className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg text-black">{brigade.name}</CardTitle>
                          <CardDescription className="text-gray-600">
                            Created on {new Date(brigade.createdAt).toLocaleDateString()}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-600">
                            {stats.totalStudents} students ({stats.activeStudents} active)
                          </span>
                        </div>
                        <Badge variant={brigade.isActive ? 'default' : 'secondary'} className={brigade.isActive ? 'bg-green-100 text-green-800' : ''}>
                          {brigade.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};