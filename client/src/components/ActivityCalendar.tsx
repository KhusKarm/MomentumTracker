import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { CheckIn } from "@shared/schema";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ActivityCalendarProps {
  startDate?: Date;
}

export default function ActivityCalendar({ startDate }: ActivityCalendarProps) {
  const { data: allCheckIns = [] } = useQuery<CheckIn[]>({
    queryKey: ["/api/check-ins/all"],
  });

  const calendarData = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const start = startDate ? new Date(startDate) : new Date(today.getFullYear(), 0, 1);
    start.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const daysToShow = Math.max(daysDiff + 1, 365);
    
    const checkInsByDate = allCheckIns.reduce((acc, checkIn) => {
      const date = new Date(checkIn.checkedInAt);
      date.setHours(0, 0, 0, 0);
      const dateStr = date.toISOString().split('T')[0];
      
      if (!acc[dateStr]) {
        acc[dateStr] = { total: 0, wasDefeat: false };
      }
      
      if (!checkIn.wasDefeat) {
        acc[dateStr].total += checkIn.value;
      } else {
        acc[dateStr].wasDefeat = true;
      }
      
      return acc;
    }, {} as Record<string, { total: number; wasDefeat: boolean }>);
    
    const days = [];
    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const dateStr = date.toISOString().split('T')[0];
      const data = checkInsByDate[dateStr];
      
      days.push({
        date: new Date(date),
        dateStr,
        value: data?.total || 0,
        wasDefeat: data?.wasDefeat || false,
        hasActivity: !!data,
      });
    }
    
    return days;
  }, [allCheckIns, startDate]);

  const weeks = useMemo(() => {
    type DayData = { date: Date; dateStr: string; value: number; wasDefeat: boolean; hasActivity: boolean };
    const result: DayData[][] = [];
    let currentWeek: DayData[] = [];
    
    const firstDay = calendarData[0];
    if (firstDay) {
      const dayOfWeek = firstDay.date.getDay();
      for (let i = 0; i < dayOfWeek; i++) {
        currentWeek.push({
          date: new Date(0),
          dateStr: '',
          value: 0,
          wasDefeat: false,
          hasActivity: false,
        });
      }
    }
    
    calendarData.forEach((day) => {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        result.push(currentWeek);
        currentWeek = [];
      }
    });
    
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push({
          date: new Date(0),
          dateStr: '',
          value: 0,
          wasDefeat: false,
          hasActivity: false,
        });
      }
      result.push(currentWeek);
    }
    
    return result;
  }, [calendarData]);

  const getIntensity = (value: number, hasActivity: boolean, wasDefeat: boolean) => {
    if (!hasActivity) return "bg-muted";
    if (wasDefeat) return "bg-destructive/50";
    if (value === 0) return "bg-muted";
    if (value < 30) return "bg-primary/20";
    if (value < 60) return "bg-primary/40";
    if (value < 120) return "bg-primary/60";
    return "bg-primary";
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Activity History</h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 bg-muted rounded-sm" />
            <div className="w-3 h-3 bg-primary/20 rounded-sm" />
            <div className="w-3 h-3 bg-primary/40 rounded-sm" />
            <div className="w-3 h-3 bg-primary/60 rounded-sm" />
            <div className="w-3 h-3 bg-primary rounded-sm" />
          </div>
          <span>More</span>
        </div>
      </div>
      
      <TooltipProvider>
        <div className="overflow-x-auto">
          <div className="inline-flex gap-[2px]">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-[2px]">
                {week.map((day, dayIndex) => {
                  if (!day.dateStr) {
                    return (
                      <div
                        key={dayIndex}
                        className="w-3 h-3"
                        data-testid={`calendar-empty-${weekIndex}-${dayIndex}`}
                      />
                    );
                  }
                  
                  return (
                    <Tooltip key={dayIndex}>
                      <TooltipTrigger asChild>
                        <div
                          className={`w-3 h-3 rounded-sm transition-colors hover:ring-2 hover:ring-primary cursor-pointer ${getIntensity(
                            day.value,
                            day.hasActivity,
                            day.wasDefeat
                          )}`}
                          data-testid={`calendar-day-${day.dateStr}`}
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-sm">
                          <div className="font-semibold">{formatDate(day.date)}</div>
                          {day.hasActivity ? (
                            <div className="text-muted-foreground">
                              {day.wasDefeat ? (
                                <span className="text-destructive">Missed tasks</span>
                              ) : (
                                <span>{day.value} minutes completed</span>
                              )}
                            </div>
                          ) : (
                            <div className="text-muted-foreground">No activity</div>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </TooltipProvider>
    </div>
  );
}
