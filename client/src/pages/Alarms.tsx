import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { AlarmClock, Plus, Trash, MoonStars } from '@phosphor-icons/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';

const alarmSchema = z.object({
  userId: z.string(),
  name: z.string().optional(),
  time: z.string(),
  days: z.array(z.string()).min(1, 'Mindestens ein Tag erforderlich'),
  volume: z.number().min(0).max(100),
  isActive: z.boolean(),
});

const DAYS = [
  { value: 'mon', label: 'Mo' },
  { value: 'tue', label: 'Di' },
  { value: 'wed', label: 'Mi' },
  { value: 'thu', label: 'Do' },
  { value: 'fri', label: 'Fr' },
  { value: 'sat', label: 'Sa' },
  { value: 'sun', label: 'So' },
];

const SLEEP_TIMER_DURATIONS = [
  { value: 15, label: '15 Minuten' },
  { value: 30, label: '30 Minuten' },
  { value: 45, label: '45 Minuten' },
  { value: 60, label: '1 Stunde' },
];

export default function Alarms() {
  const { toast } = useToast();
  const userId = 'demo-user';
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedDays, setSelectedDays] = useState<string[]>(['mon', 'tue', 'wed', 'thu', 'fri']);

  const form = useForm({
    resolver: zodResolver(alarmSchema),
    defaultValues: {
      userId,
      name: '',
      time: '07:00',
      days: ['mon', 'tue', 'wed', 'thu', 'fri'],
      volume: 50,
      isActive: true,
    },
  });

  const { data: alarms = [], isLoading } = useQuery({
    queryKey: ['/api/alarms', userId],
    queryFn: async () => {
      const res = await fetch(`/api/alarms/${userId}`);
      return res.json();
    },
  });

  const { data: sleepTimer } = useQuery({
    queryKey: ['/api/sleep-timer', userId],
    queryFn: async () => {
      const res = await fetch(`/api/sleep-timer/${userId}`);
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/alarms', 'POST', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/alarms', userId] });
      setIsDialogOpen(false);
      form.reset();
      toast({ title: 'Wecker erstellt!' });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      return apiRequest(`/api/alarms/${id}`, 'PATCH', { isActive });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/alarms', userId] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/alarms/${id}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/alarms', userId] });
      toast({ title: 'Wecker gelöscht' });
    },
  });

  const sleepTimerMutation = useMutation({
    mutationFn: async (durationMinutes: number) => {
      return apiRequest('/api/sleep-timer', 'POST', {
        userId,
        durationMinutes,
        fadeOutMinutes: 5,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sleep-timer', userId] });
      toast({
        title: 'Sleep Timer gestartet',
        description: 'Die Musik wird automatisch gestoppt',
      });
    },
  });

  const cancelSleepTimerMutation = useMutation({
    mutationFn: async () => {
      if (!sleepTimer?.id) return;
      return apiRequest(`/api/sleep-timer/${sleepTimer.id}`, 'DELETE');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sleep-timer', userId] });
      toast({ title: 'Sleep Timer abgebrochen' });
    },
  });

  const toggleDay = (day: string) => {
    const newDays = selectedDays.includes(day)
      ? selectedDays.filter((d) => d !== day)
      : [...selectedDays, day];
    setSelectedDays(newDays);
    form.setValue('days', newDays);
  };

  const onSubmit = (data: any) => {
    createMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="h-8 w-64 bg-muted animate-pulse rounded-md mb-4" />
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 bg-muted animate-pulse rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <AlarmClock size={32} weight="bold" className="text-primary" />
          <h1 className="text-3xl font-bold" data-testid="heading-alarms">Wecker & Timer</h1>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-alarm">
              <Plus size={20} weight="bold" className="mr-2" />
              Neuer Wecker
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Wecker erstellen</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name (optional)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="z.B. Arbeitsalarm" data-testid="input-alarm-name" />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Uhrzeit</FormLabel>
                      <FormControl>
                        <Input {...field} type="time" data-testid="input-alarm-time" />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                  <Label>Wochentage</Label>
                  <div className="flex gap-2">
                    {DAYS.map((day) => (
                      <Button
                        key={day.value}
                        type="button"
                        variant={selectedDays.includes(day.value) ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => toggleDay(day.value)}
                        data-testid={`button-day-${day.value}`}
                      >
                        {day.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={createMutation.isPending} data-testid="button-submit-alarm">
                  {createMutation.isPending ? 'Wird erstellt...' : 'Wecker erstellen'}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2" data-testid="heading-sleep-timer">
            <MoonStars size={24} weight="bold" />
            Sleep Timer
          </h2>
          
          {sleepTimer ? (
            <div className="space-y-4">
              <div className="p-4 bg-primary/10 rounded-md">
                <p className="text-sm font-medium">Sleep Timer aktiv</p>
                <p className="text-xs text-muted-foreground">
                  Endet um {new Date(sleepTimer.expiresAt).toLocaleTimeString('de-DE')}
                </p>
              </div>
              <Button onClick={() => cancelSleepTimerMutation.mutate()} variant="outline" data-testid="button-cancel-sleep-timer">
                Timer abbrechen
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {SLEEP_TIMER_DURATIONS.map((duration) => (
                <Button
                  key={duration.value}
                  variant="outline"
                  onClick={() => sleepTimerMutation.mutate(duration.value)}
                  disabled={sleepTimerMutation.isPending}
                  data-testid={`button-sleep-timer-${duration.value}`}
                >
                  {duration.label}
                </Button>
              ))}
            </div>
          )}
        </Card>

        <div>
          <h2 className="text-lg font-semibold mb-4" data-testid="heading-my-alarms">Meine Wecker ({alarms.length})</h2>
          
          {alarms.length === 0 ? (
            <Card className="p-8 text-center">
              <AlarmClock size={48} weight="light" className="mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Noch keine Wecker erstellt</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {alarms.map((alarm: any) => (
                <Card key={alarm.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold">{alarm.time}</span>
                        {alarm.name && <span className="text-sm text-muted-foreground">{alarm.name}</span>}
                      </div>
                      <div className="flex gap-1 mt-1">
                        {alarm.days.map((day: string) => (
                          <span key={day} className="text-xs px-2 py-0.5 bg-muted rounded">
                            {DAYS.find((d) => d.value === day)?.label}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={alarm.isActive}
                        onCheckedChange={(isActive) => toggleMutation.mutate({ id: alarm.id, isActive })}
                        data-testid={`switch-alarm-${alarm.id}`}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate(alarm.id)}
                        data-testid={`button-delete-alarm-${alarm.id}`}
                      >
                        <Trash size={20} weight="bold" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
