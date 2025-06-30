import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar, 
  Plus, 
  Edit, 
  Trash2,
  FileText,
  AlertCircle,
  Save
} from 'lucide-react';
import { eventsAPI, eventPlansAPI } from '@/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const EventManagement: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [eventPlans, setEventPlans] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { userProfile } = useAuth();
  const { toast } = useToast();

  const [eventForm, setEventForm] = useState({
    name: '',
    startDate: '',
    endDate: ''
  });

  const [planForm, setPlanForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    endTime: '',
    planType: 'withoutSubmission' as 'withSubmission' | 'withoutSubmission',
    submissionType: 'file' as 'file' | 'text' | 'link',
    fileSizeLimit: 5
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      fetchEventPlans(selectedEvent.id);
    }
  }, [selectedEvent]);

  const fetchEvents = async () => {
    try {
      const response = await eventsAPI.getAll();
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
      setError('Failed to fetch events');
    }
  };

  const fetchEventPlans = async (eventId: string) => {
    try {
      const response = await eventPlansAPI.getAll({ eventId });
      setEventPlans(response.data);
    } catch (error) {
      console.error('Error fetching event plans:', error);
      setError('Failed to fetch event plans');
    }
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.name || !eventForm.startDate || !eventForm.endDate) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await eventsAPI.create(eventForm);
      setEventForm({ name: '', startDate: '', endDate: '' });
      fetchEvents();
      toast({
        title: "Success!",
        description: "Event created successfully",
        variant: "success",
      });
    } catch (error) {
      console.error('Error creating event:', error);
      setError('Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEventPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEvent || !planForm.title || !planForm.date || !planForm.time) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const planData = {
        ...planForm,
        associatedEventId: selectedEvent.id,
        ...(planForm.planType === 'withSubmission' && {
          submissionType: planForm.submissionType,
          ...(planForm.submissionType === 'file' && { fileSizeLimit: planForm.fileSizeLimit })
        })
      };

      await eventPlansAPI.create(planData);
      setPlanForm({
        title: '',
        description: '',
        date: '',
        time: '',
        endTime: '',
        planType: 'withoutSubmission',
        submissionType: 'file',
        fileSizeLimit: 5
      });
      fetchEventPlans(selectedEvent.id);
      toast({
        title: "Success!",
        description: "Activity created successfully",
        variant: "success",
      });
    } catch (error) {
      console.error('Error creating event plan:', error);
      setError('Failed to create event plan');
    } finally {
      setLoading(false);
    }
  };

  const timeSlots = [
    '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-black">Event Management</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Create Event
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle className="text-black">Create New Event</DialogTitle>
              <DialogDescription className="text-gray-600">
                Create a new event to organize activities and plans
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="eventName" className="text-black">Event Name</Label>
                <Input
                  id="eventName"
                  value={eventForm.name}
                  onChange={(e) => setEventForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter event name"
                  className="border-gray-300"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate" className="text-black">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={eventForm.startDate}
                    onChange={(e) => setEventForm(prev => ({ ...prev, startDate: e.target.value }))}
                    className="border-gray-300"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate" className="text-black">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={eventForm.endDate}
                    onChange={(e) => setEventForm(prev => ({ ...prev, endDate: e.target.value }))}
                    className="border-gray-300"
                  />
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                {loading ? 'Creating...' : 'Create Event'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="events" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gray-100">
          <TabsTrigger value="events" className="text-black">Events</TabsTrigger>
          <TabsTrigger value="plans" disabled={!selectedEvent} className="text-black">
            Event Plans {selectedEvent && `(${selectedEvent.name})`}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          <div className="grid gap-4">
            {events.length === 0 ? (
              <Card className="p-8 text-center bg-white border border-gray-200">
                <CardContent>
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-black mb-2">No Events Created</h3>
                  <p className="text-gray-600">Create your first event to get started.</p>
                </CardContent>
              </Card>
            ) : (
              events.map((event) => (
                <Card key={event.id} className="bg-white border border-gray-200">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <CardTitle className="text-xl text-black">{event.name}</CardTitle>
                        <CardDescription className="text-gray-600">
                          <div className="flex items-center space-x-4 text-sm">
                            <span className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}</span>
                            </span>
                            <Badge variant={event.isActive ? 'default' : 'secondary'} className="bg-green-100 text-green-800">
                              {event.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedEvent(event)}
                          className="border-blue-200 text-blue-600 hover:bg-blue-50"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Manage Plans
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="plans" className="space-y-4">
          {selectedEvent && (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-black">Plans for {selectedEvent.name}</h2>
                  <p className="text-gray-600">Manage activities and schedules</p>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="bg-green-600 hover:bg-green-700 text-white">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Activity
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl bg-white">
                    <DialogHeader>
                      <DialogTitle className="text-black">Create Activity Plan</DialogTitle>
                      <DialogDescription className="text-gray-600">
                        Create a new activity plan for {selectedEvent.name}
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateEventPlan} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="planTitle" className="text-black">Title</Label>
                        <Input
                          id="planTitle"
                          value={planForm.title}
                          onChange={(e) => setPlanForm(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Enter plan title"
                          className="border-gray-300"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="planDescription" className="text-black">Description</Label>
                        <Textarea
                          id="planDescription"
                          value={planForm.description}
                          onChange={(e) => setPlanForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Enter plan description"
                          rows={3}
                          className="border-gray-300"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="planDate" className="text-black">Date</Label>
                          <Input
                            id="planDate"
                            type="date"
                            value={planForm.date}
                            onChange={(e) => setPlanForm(prev => ({ ...prev, date: e.target.value }))}
                            className="border-gray-300"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="planTime" className="text-black">Start Time</Label>
                          <Select value={planForm.time} onValueChange={(value) => setPlanForm(prev => ({ ...prev, time: value }))}>
                            <SelectTrigger className="border-gray-300">
                              <SelectValue placeholder="Select time" />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                              {timeSlots.map(slot => (
                                <SelectItem key={slot} value={slot} className="text-black">{slot}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="planEndTime" className="text-black">End Time</Label>
                          <Select value={planForm.endTime} onValueChange={(value) => setPlanForm(prev => ({ ...prev, endTime: value }))}>
                            <SelectTrigger className="border-gray-300">
                              <SelectValue placeholder="Select end time" />
                            </SelectTrigger>
                            <SelectContent className="bg-white">
                              {timeSlots.map(slot => (
                                <SelectItem key={slot} value={slot} className="text-black">{slot}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-black">Plan Type</Label>
                          <div className="flex space-x-4">
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                value="withoutSubmission"
                                checked={planForm.planType === 'withoutSubmission'}
                                onChange={(e) => setPlanForm(prev => ({ ...prev, planType: e.target.value as any }))}
                                className="text-blue-600"
                              />
                              <span className="text-black">Without Submission</span>
                            </label>
                            <label className="flex items-center space-x-2">
                              <input
                                type="radio"
                                value="withSubmission"
                                checked={planForm.planType === 'withSubmission'}
                                onChange={(e) => setPlanForm(prev => ({ ...prev, planType: e.target.value as any }))}
                                className="text-blue-600"
                              />
                              <span className="text-black">With Submission</span>
                            </label>
                          </div>
                        </div>
                        {planForm.planType === 'withSubmission' && (
                          <div className="space-y-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                            <div className="space-y-2">
                              <Label className="text-black">Submission Type</Label>
                              <div className="flex space-x-4">
                                <label className="flex items-center space-x-2">
                                  <input
                                    type="radio"
                                    value="file"
                                    checked={planForm.submissionType === 'file'}
                                    onChange={(e) => setPlanForm(prev => ({ ...prev, submissionType: e.target.value as any }))}
                                    className="text-blue-600"
                                  />
                                  <span className="text-black">File Upload</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                  <input
                                    type="radio"
                                    value="text"
                                    checked={planForm.submissionType === 'text'}
                                    onChange={(e) => setPlanForm(prev => ({ ...prev, submissionType: e.target.value as any }))}
                                    className="text-blue-600"
                                  />
                                  <span className="text-black">Text Response</span>
                                </label>
                                <label className="flex items-center space-x-2">
                                  <input
                                    type="radio"
                                    value="link"
                                    checked={planForm.submissionType === 'link'}
                                    onChange={(e) => setPlanForm(prev => ({ ...prev, submissionType: e.target.value as any }))}
                                    className="text-blue-600"
                                  />
                                  <span className="text-black">Link</span>
                                </label>
                              </div>
                            </div>
                            {planForm.submissionType === 'file' && (
                              <div className="space-y-2">
                                <Label htmlFor="fileSizeLimit" className="text-black">File Size Limit (MB)</Label>
                                <Input
                                  id="fileSizeLimit"
                                  type="number"
                                  min="1"
                                  max="100"
                                  value={planForm.fileSizeLimit}
                                  onChange={(e) => setPlanForm(prev => ({ ...prev, fileSizeLimit: parseInt(e.target.value) }))}
                                  className="border-gray-300"
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <Button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700 text-white">
                        {loading ? 'Creating...' : 'Create Activity'}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid gap-4">
                {eventPlans.map((plan) => (
                  <Card key={plan.id} className="bg-white border border-gray-200">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <CardTitle className="text-lg text-black">{plan.title}</CardTitle>
                          <CardDescription className="text-gray-600">{plan.description}</CardDescription>
                          <div className="flex items-center space-x-4 text-sm">
                            <span className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(plan.date).toLocaleDateString()}</span>
                            </span>
                            <span>{plan.time} - {plan.endTime}</span>
                            <Badge variant={plan.planType === 'withSubmission' ? 'default' : 'secondary'} className="bg-blue-100 text-blue-800">
                              {plan.planType === 'withSubmission' ? 'Submission Required' : 'Activity Only'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};