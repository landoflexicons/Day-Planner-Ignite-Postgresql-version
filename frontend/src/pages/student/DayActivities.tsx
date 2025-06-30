import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  Calendar,
  FileText,
  CheckCircle,
  AlertCircle,
  Eye,
  Sunrise,
  Sun,
  Moon,
  Send
} from 'lucide-react';
import { eventPlansAPI, submissionsAPI } from '@/api';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const getTimePhase = () => {
  const now = new Date();
  const hour = now.getHours();
  
  if (hour >= 0 && hour < 9) return 'preview';
  if (hour >= 9 && hour < 24) return 'active';
  return 'review';
};

const getActivityStatus = (activity: any, currentTime: Date) => {
  const activityTime = new Date(activity.date);
  const [time, period] = activity.time.split(' ');
  const [hours, minutes] = time.split(':');
  
  let hour24 = parseInt(hours);
  if (period === 'PM' && hour24 !== 12) hour24 += 12;
  if (period === 'AM' && hour24 === 12) hour24 = 0;
  
  activityTime.setHours(hour24, parseInt(minutes), 0, 0);
  
  const endOfDay = new Date(activity.date);
  endOfDay.setHours(23, 59, 59, 999);
  
  if (currentTime < activityTime) return 'upcoming';
  if (currentTime >= activityTime && currentTime <= endOfDay) return 'ongoing';
  return 'completed';
};

const getCurrentDateIST = () => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

const DayActivities: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(getCurrentDateIST());
  const [timePhase, setTimePhase] = useState(getTimePhase());
  const [eventPlans, setEventPlans] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { userProfile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      setTimePhase(getTimePhase());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (userProfile?.id) {
      fetchTodayActivities();
      fetchUserSubmissions();
    }
  }, [userProfile, selectedDate]);

  const fetchTodayActivities = async () => {
    try {
      const response = await eventPlansAPI.getAll({ date: selectedDate });
      setEventPlans(response.data);
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast({
        title: "Error",
        description: "Failed to load today's activities",
        variant: "destructive",
      });
    }
  };

  const fetchUserSubmissions = async () => {
    if (!userProfile?.id) return;
    
    try {
      const response = await submissionsAPI.getAll({ studentId: userProfile.id });
      setSubmissions(response.data);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  const handleTextSubmission = async (activityId: string, text: string) => {
    if (!text.trim() || !userProfile?.id) return;

    setLoading(true);
    try {
      await submissionsAPI.create({
        eventPlanId: activityId,
        submissionType: 'text',
        content: text
      });

      toast({
        title: "Success!",
        description: "Text submission saved successfully",
        variant: "success",
      });

      fetchUserSubmissions();
    } catch (error) {
      console.error('Error submitting text:', error);
      toast({
        title: "Error",
        description: "Failed to submit text. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLinkSubmission = async (activityId: string, link: string) => {
    if (!link.trim() || !userProfile?.id) return;

    setLoading(true);
    try {
      await submissionsAPI.create({
        eventPlanId: activityId,
        submissionType: 'link',
        content: link
      });

      toast({
        title: "Success!",
        description: "Link submission saved successfully",
        variant: "success",
      });

      fetchUserSubmissions();
    } catch (error) {
      console.error('Error submitting link:', error);
      toast({
        title: "Error",
        description: "Failed to submit link. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderPhaseIcon = () => {
    switch (timePhase) {
      case 'preview':
        return <Sunrise className="h-5 w-5 text-orange-600" />;
      case 'active':
        return <Sun className="h-5 w-5 text-blue-600" />;
      case 'review':
        return <Moon className="h-5 w-5 text-purple-600" />;
    }
  };

  const renderPhaseMessage = () => {
    switch (timePhase) {
      case 'preview':
        return 'Good morning! Here\'s a preview of today\'s activities';
      case 'active':
        return 'Activities are active. You can submit work until 11:59 PM today!';
      case 'review':
        return 'Day completed! Review today\'s activities and catch up on submissions';
    }
  };

  const isSubmitted = (activityId: string) => {
    return submissions.some(sub => sub.eventPlanId === activityId);
  };

  const canSubmit = (activity: any) => {
    const now = new Date();
    const activityDate = new Date(activity.date);
    const endOfDay = new Date(activityDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    return now <= endOfDay && !isSubmitted(activity.id);
  };

  const renderSubmissionInterface = (activity: any) => {
    const submission = submissions.find(sub => sub.eventPlanId === activity.id);
    const submitted = isSubmitted(activity.id);
    const submissionAllowed = canSubmit(activity);

    if (submitted) {
      return (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-green-800 font-medium">Submitted Successfully</span>
          </div>
          <p className="text-sm text-green-700 mt-1">
            {submission?.submissionType === 'file' 
              ? `File: ${submission.fileName || 'File uploaded'}`
              : submission?.submissionType === 'text'
              ? `Text: ${submission.content?.substring(0, 50)}...`
              : `Link: ${submission.content}`
            }
          </p>
          <p className="text-xs text-green-600 mt-1">
            Submitted at: {new Date(submission?.submittedAt || new Date()).toLocaleString()}
          </p>
        </div>
      );
    }

    if (!submissionAllowed) {
      return (
        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-gray-600" />
            <span className="text-gray-800 font-medium">Submission Period Ended</span>
          </div>
          <p className="text-sm text-gray-700 mt-1">
            Submissions were due by 11:59 PM on {new Date(activity.date).toLocaleDateString()}
          </p>
        </div>
      );
    }

    if (activity.submissionType === 'file') {
      return (
        <div className="mt-4 space-y-4">
          <div>
            <Label htmlFor={`file-${activity.id}`} className="text-sm font-medium text-black">
              Upload File (Max: {activity.fileSizeLimit || 5}MB)
            </Label>
            <Input
              id={`file-${activity.id}`}
              type="file"
              className="mt-1 border border-gray-300"
              disabled={loading}
            />
          </div>
        </div>
      );
    }

    if (activity.submissionType === 'text') {
      return (
        <div className="mt-4 space-y-4">
          <div>
            <Label htmlFor={`text-${activity.id}`} className="text-sm font-medium text-black">
              Your Response
            </Label>
            <Textarea
              id={`text-${activity.id}`}
              placeholder="Enter your response here..."
              rows={4}
              className="mt-1 border border-gray-300"
            />
          </div>
          <Button
            onClick={() => {
              const textarea = document.getElementById(`text-${activity.id}`) as HTMLTextAreaElement;
              if (textarea?.value.trim()) {
                handleTextSubmission(activity.id, textarea.value);
              }
            }}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Send className="h-4 w-4 mr-2" />
            {loading ? 'Submitting...' : 'Submit Response'}
          </Button>
        </div>
      );
    }

    if (activity.submissionType === 'link') {
      return (
        <div className="mt-4 space-y-4">
          <div>
            <Label htmlFor={`link-${activity.id}`} className="text-sm font-medium text-black">
              Submit Link
            </Label>
            <Input
              id={`link-${activity.id}`}
              type="url"
              placeholder="Enter URL here..."
              className="mt-1 border border-gray-300"
            />
          </div>
          <Button
            onClick={() => {
              const input = document.getElementById(`link-${activity.id}`) as HTMLInputElement;
              if (input?.value.trim()) {
                handleLinkSubmission(activity.id, input.value);
              }
            }}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Send className="h-4 w-4 mr-2" />
            {loading ? 'Submitting...' : 'Submit Link'}
          </Button>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-black">Today's Activities</h1>
          <div className="flex items-center space-x-2">
            {renderPhaseIcon()}
            <Badge variant="secondary" className="text-sm bg-gray-100 text-black">
              {timePhase === 'preview' ? 'Preview Mode' : 
               timePhase === 'active' ? 'Active Mode' : 
               'Review Mode'}
            </Badge>
          </div>
        </div>
        
        <Alert className="border border-blue-200 bg-blue-50">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <AlertDescription className="text-blue-800">
              {renderPhaseMessage()} • Current time: {currentTime.toLocaleTimeString()}
            </AlertDescription>
          </div>
        </Alert>

        <div className="flex items-center space-x-4">
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-auto border border-gray-300"
          />
        </div>
      </div>

      {/* Activities Grid */}
      <div className="grid gap-6">
        {eventPlans.length === 0 ? (
          <Card className="border border-gray-200 p-8 text-center bg-white">
            <CardContent>
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-black mb-2">No Activities Today</h3>
              <p className="text-gray-600">Check back later or select a different date.</p>
            </CardContent>
          </Card>
        ) : (
          eventPlans.map((activity) => {
            const status = getActivityStatus(activity, currentTime);
            const submitted = isSubmitted(activity.id);
            
            return (
              <Card key={activity.id} className={`border transition-all duration-300 bg-white ${
                status === 'ongoing' ? 'border-blue-500 bg-blue-50' :
                status === 'completed' ? 'border-green-500 bg-green-50' : 
                'border-gray-200'
              }`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-3 flex-1">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-lg text-black">{activity.title}</CardTitle>
                        <Badge 
                          variant="default"
                          className={
                            status === 'ongoing' ? 'bg-blue-600 text-white' :
                            status === 'completed' ? 'bg-green-600 text-white' : 
                            'bg-orange-600 text-white'
                          }
                        >
                          {status === 'ongoing' ? 'Live Now' :
                           status === 'completed' ? 'Completed' : 
                           'Upcoming'}
                        </Badge>
                        {submitted && (
                          <Badge variant="success" className="bg-green-600 text-white">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Submitted
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-4 w-4" />
                          <span>{activity.time} - {activity.endTime}</span>
                        </div>
                        {activity.planType === 'withSubmission' && (
                          <div className="flex items-center space-x-1">
                            <FileText className="h-4 w-4" />
                            <span>Submission Required</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {timePhase === 'review' && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" className="border border-gray-300 hover:bg-gray-50">
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl bg-white">
                          <DialogHeader>
                            <DialogTitle className="text-black">{activity.title}</DialogTitle>
                            <DialogDescription className="text-gray-600">{activity.time} - {activity.endTime}</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <p className="text-black">{activity.description}</p>
                            {activity.planType === 'withSubmission' && renderSubmissionInterface(activity)}
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                  
                  {timePhase !== 'preview' && (
                    <CardDescription className="text-base text-black">
                      {activity.description}
                    </CardDescription>
                  )}
                </CardHeader>
                
                {timePhase !== 'preview' && activity.planType === 'withSubmission' && timePhase !== 'review' && (
                  <CardContent>
                    {renderSubmissionInterface(activity)}
                  </CardContent>
                )}
              </Card>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="text-center text-sm text-gray-600 space-y-2 p-4 bg-white rounded-lg border border-gray-200">
        <p>
          {timePhase === 'preview' && 'Full activity details will be available from 9:00 AM'}
          {timePhase === 'active' && 'You can submit your work for any activity until 11:59 PM today'}
          {timePhase === 'review' && 'Click "View Details" to see full information and submit if you missed anything'}
        </p>
        <p className="flex items-center justify-center space-x-1">
          <span>Last updated:</span>
          <span className="font-medium">{currentTime.toLocaleTimeString()}</span>
        </p>
      </div>
    </div>
  );
};

export default DayActivities;