import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  Plus, 
  Upload,
  Edit, 
  Trash2, 
  Search,
  UserCheck,
  UserX,
  Shield,
  GraduationCap,
  FileSpreadsheet,
  AlertCircle,
  Filter,
  Save
} from 'lucide-react';
import { usersAPI, brigadesAPI } from '@/api';
import { generateStudentTemplate, generateAdminTemplate } from '@/lib/excelTemplates';
import { useToast } from '@/hooks/use-toast';

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [brigades, setBrigades] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<'ALL' | 'ADMIN' | 'STUDENT'>('ALL');
  const { toast } = useToast();

  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    rollNumber: '',
    role: 'STUDENT' as 'ADMIN' | 'STUDENT',
    brigadeId: '',
    password: ''
  });

  useEffect(() => {
    fetchUsers();
    fetchBrigades();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await usersAPI.getAll();
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users');
    }
  };

  const fetchBrigades = async () => {
    try {
      const response = await brigadesAPI.getAll();
      setBrigades(response.data);
    } catch (error) {
      console.error('Error fetching brigades:', error);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userForm.name || !userForm.password || 
        (userForm.role === 'ADMIN' && !userForm.email) ||
        (userForm.role === 'STUDENT' && (!userForm.rollNumber || !userForm.brigadeId))) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      await usersAPI.create(userForm);
      setUserForm({
        name: '',
        email: '',
        rollNumber: '',
        role: 'STUDENT',
        brigadeId: '',
        password: ''
      });
      fetchUsers();
      toast({
        title: "Success!",
        description: "User created successfully",
        variant: "success",
      });
    } catch (error) {
      console.error('Error creating user:', error);
      setError('Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'ALL' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-black">User Management</h1>
          <p className="text-gray-600 mt-2">Manage admin and student accounts</p>
        </div>
        <div className="flex items-center space-x-3">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-purple-200 text-purple-600 hover:bg-purple-50">
                <Upload className="h-4 w-4 mr-2" />
                Bulk Upload
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-white">
              <DialogHeader>
                <DialogTitle className="text-black">Bulk Upload Users</DialogTitle>
                <DialogDescription className="text-gray-600">
                  Upload multiple users using Excel files
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <Button 
                    variant="outline" 
                    onClick={generateStudentTemplate}
                    className="h-20 flex-col space-y-2 border-green-200 hover:bg-green-50"
                  >
                    <FileSpreadsheet className="h-6 w-6 text-green-600" />
                    <span className="text-black">Download Student Template</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={generateAdminTemplate}
                    className="h-20 flex-col space-y-2 border-blue-200 hover:bg-blue-50"
                  >
                    <FileSpreadsheet className="h-6 w-6 text-blue-600" />
                    <span className="text-black">Download Admin Template</span>
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-white">
              <DialogHeader>
                <DialogTitle className="text-black">Add New User</DialogTitle>
                <DialogDescription className="text-gray-600">
                  Create a new admin or student account
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="userName" className="text-black">Name</Label>
                  <Input
                    id="userName"
                    value={userForm.name}
                    onChange={(e) => setUserForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter full name"
                    className="border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="userRole" className="text-black">Role</Label>
                  <Select value={userForm.role} onValueChange={(value: 'ADMIN' | 'STUDENT') => 
                    setUserForm(prev => ({ ...prev, role: value }))}>
                    <SelectTrigger className="border-gray-300">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="STUDENT" className="text-black">Student</SelectItem>
                      <SelectItem value="ADMIN" className="text-black">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {userForm.role === 'ADMIN' ? (
                  <div className="space-y-2">
                    <Label htmlFor="userEmail" className="text-black">Email</Label>
                    <Input
                      id="userEmail"
                      type="email"
                      value={userForm.email}
                      onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter email address"
                      className="border-gray-300"
                    />
                  </div>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="userRollNumber" className="text-black">Roll Number</Label>
                      <Input
                        id="userRollNumber"
                        value={userForm.rollNumber}
                        onChange={(e) => setUserForm(prev => ({ ...prev, rollNumber: e.target.value }))}
                        placeholder="Enter roll number"
                        className="border-gray-300"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="userBrigade" className="text-black">Brigade</Label>
                      <Select value={userForm.brigadeId} onValueChange={(value) => 
                        setUserForm(prev => ({ ...prev, brigadeId: value }))}>
                        <SelectTrigger className="border-gray-300">
                          <SelectValue placeholder="Select brigade" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          {brigades.map(brigade => (
                            <SelectItem key={brigade.id} value={brigade.id} className="text-black">
                              {brigade.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
                <div className="space-y-2">
                  <Label htmlFor="userPassword" className="text-black">Password</Label>
                  <Input
                    id="userPassword"
                    type="password"
                    value={userForm.password}
                    onChange={(e) => setUserForm(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Enter password"
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
                  {loading ? 'Creating...' : 'Create User'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card className="bg-white border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2 text-black">
            <Filter className="h-5 w-5 text-purple-600" />
            <span>Filters & Search</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-300"
                />
              </div>
            </div>
            <Select value={selectedRole} onValueChange={(value: 'ALL' | 'ADMIN' | 'STUDENT') => setSelectedRole(value)}>
              <SelectTrigger className="w-40 border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="ALL" className="text-black">All Roles</SelectItem>
                <SelectItem value="ADMIN" className="text-black">Admins</SelectItem>
                <SelectItem value="STUDENT" className="text-black">Students</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      <div className="grid gap-4">
        {filteredUsers.length === 0 ? (
          <Card className="p-8 text-center bg-white border border-gray-200">
            <CardContent>
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-black mb-2">No Users Found</h3>
              <p className="text-gray-600">No users match your current filters.</p>
            </CardContent>
          </Card>
        ) : (
          filteredUsers.map((user) => (
            <Card key={user.id} className="bg-white border border-gray-200">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-xl ${user.role === 'ADMIN' ? 'bg-purple-50' : 'bg-blue-50'}`}>
                        {user.role === 'ADMIN' ? 
                          <Shield className="h-6 w-6 text-purple-600" /> :
                          <GraduationCap className="h-6 w-6 text-blue-600" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg text-black">{user.name}</CardTitle>
                        <CardDescription className="text-gray-600">
                          {user.role === 'ADMIN' ? user.email : `${user.rollNumber} • ${user.brigadeName}`}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'}`}>
                        {user.role}
                      </Badge>
                      <Badge variant={user.isActive ? 'default' : 'destructive'} className={user.isActive ? 'bg-green-100 text-green-800' : ''}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        Created: {new Date(user.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white border border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">{users.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{users.filter(u => u.role === 'STUDENT').length}</div>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Admins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{users.filter(u => u.role === 'ADMIN').length}</div>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{users.filter(u => u.isActive).length}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};