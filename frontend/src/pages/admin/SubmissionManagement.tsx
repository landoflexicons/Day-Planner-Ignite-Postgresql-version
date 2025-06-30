import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  FileText, 
  Download, 
  Eye, 
  Search, 
  Filter,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';
import { submissionsAPI, eventsAPI } from '@/api';

export const SubmissionManagement: React.FC = () => {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [filters, setFilters] = useState({
    searchTerm: '',
    status: 'ALL',
    eventId: 'ALL',
    dateFrom: '',
    dateTo: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [submissionsResponse, eventsResponse] = await Promise.all([
        submissionsAPI.getAll(),
        eventsAPI.getAll()
      ]);

      setSubmissions(submissionsResponse.data);
      setEvents(eventsResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch submissions data');
    } finally {
      setLoading(false);
    }
  };

  const filteredSubmissions = submissions.filter(submission => {
    const matchesSearch = submission.student?.name?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
                         submission.eventPlan?.title?.toLowerCase().includes(filters.searchTerm.toLowerCase());
    
    const matchesStatus = filters.status === 'ALL' || submission.status === filters.status;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'late':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'late':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-black">Submission Management</h1>
        <Button variant="outline" className="border-blue-200 text-blue-600 hover:bg-blue-50">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card className="bg-white border border-gray-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2 text-black">
            <Filter className="h-5 w-5 text-blue-600" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search submissions..."
                value={filters.searchTerm}
                onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                className="pl-10 border-gray-300"
              />
            </div>
            <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
              <SelectTrigger className="border-gray-300">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="ALL" className="text-black">All Status</SelectItem>
                <SelectItem value="submitted" className="text-black">Submitted</SelectItem>
                <SelectItem value="pending" className="text-black">Pending</SelectItem>
                <SelectItem value="late" className="text-black">Late</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.eventId} onValueChange={(value) => setFilters(prev => ({ ...prev, eventId: value }))}>
              <SelectTrigger className="border-gray-300">
                <SelectValue placeholder="Event" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="ALL" className="text-black">All Events</SelectItem>
                {events.map(event => (
                  <SelectItem key={event.id} value={event.id} className="text-black">{event.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="date"
              placeholder="From Date"
              value={filters.dateFrom}
              onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
              className="border-gray-300"
            />
            <Input
              type="date"
              placeholder="To Date"
              value={filters.dateTo}
              onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
              className="border-gray-300"
            />
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Submissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-black">{filteredSubmissions.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Submitted</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {filteredSubmissions.filter(s => s.status === 'submitted').length}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {filteredSubmissions.filter(s => s.status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border border-gray-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Late</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {filteredSubmissions.filter(s => s.status === 'late').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submissions List */}
      <div className="grid gap-4">
        {loading ? (
          <Card className="p-8 text-center bg-white border border-gray-200">
            <CardContent>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading submissions...</p>
            </CardContent>
          </Card>
        ) : filteredSubmissions.length === 0 ? (
          <Card className="p-8 text-center bg-white border border-gray-200">
            <CardContent>
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-black mb-2">No Submissions Found</h3>
              <p className="text-gray-600">No submissions match your current filters.</p>
            </CardContent>
          </Card>
        ) : (
          filteredSubmissions.map((submission) => (
            <Card key={submission.id} className="bg-white border border-gray-200">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <CardTitle className="text-lg text-black">{submission.eventPlan?.title}</CardTitle>
                        <CardDescription className="text-gray-600">
                          {submission.eventPlan?.associatedEvent?.name} • {submission.student?.name}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(submission.status)}
                        <Badge className={getStatusColor(submission.status)}>
                          {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">
                          {new Date(submission.submittedAt).toLocaleDateString()} at {new Date(submission.submittedAt).toLocaleTimeString()}
                        </span>
                      </div>
                      <Badge variant="outline" className="border-gray-300 text-black">
                        {submission.submissionType}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {submission.submissionType === 'file' && submission.fileUrl && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-green-200 text-green-600 hover:bg-green-50"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    )}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="border-blue-200 text-blue-600 hover:bg-blue-50">
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl bg-white">
                        <DialogHeader>
                          <DialogTitle className="text-black">{submission.eventPlan?.title}</DialogTitle>
                          <DialogDescription className="text-gray-600">
                            Submission by {submission.student?.name} • {submission.eventPlan?.associatedEvent?.name}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium text-black">Status:</span>
                              <Badge className={`ml-2 ${getStatusColor(submission.status)}`}>
                                {submission.status}
                              </Badge>
                            </div>
                            <div>
                              <span className="font-medium text-black">Type:</span>
                              <span className="ml-2 text-black">{submission.submissionType}</span>
                            </div>
                            <div>
                              <span className="font-medium text-black">Submitted:</span>
                              <span className="ml-2 text-black">{new Date(submission.submittedAt).toLocaleString()}</span>
                            </div>
                            {submission.fileName && (
                              <div>
                                <span className="font-medium text-black">File:</span>
                                <span className="ml-2 text-black">{submission.fileName}</span>
                              </div>
                            )}
                          </div>
                          {submission.content && (
                            <div>
                              <span className="font-medium text-black">Content:</span>
                              <div className="mt-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <p className="text-sm text-black">{submission.content}</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};