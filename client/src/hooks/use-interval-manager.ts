import { useEffect, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Task } from "@shared/schema";

export interface PendingCheckIn {
  task: Task;
  overdueMinutes: number;
}

export function useIntervalManager() {
  const [pendingCheckIns, setPendingCheckIns] = useState<PendingCheckIn[]>([]);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default");

  // Fetch tasks
  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
    refetchInterval: 30000, // Check every 30 seconds
  });

  // Request notification permission
  useEffect(() => {
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission);
      
      if (Notification.permission === "default") {
        Notification.requestPermission().then((permission) => {
          setNotificationPermission(permission);
        });
      }
    }
  }, []);

  // Check for due tasks
  useEffect(() => {
    if (!tasks || tasks.length === 0) return;

    const checkDueTasks = () => {
      const now = new Date();
      const dueTasks: PendingCheckIn[] = [];

      tasks.forEach((task) => {
        const nextCheckin = new Date(task.nextCheckinAt);
        if (now >= nextCheckin) {
          const overdueMinutes = Math.floor((now.getTime() - nextCheckin.getTime()) / (1000 * 60));
          dueTasks.push({ task, overdueMinutes });
        }
      });

      if (dueTasks.length > 0) {
        setPendingCheckIns(dueTasks);
        
        // Show browser notification for the first due task
        if (notificationPermission === "granted" && dueTasks.length > 0) {
          const firstTask = dueTasks[0].task;
          new Notification("Momentum Check-in", {
            body: `Time for your ${firstTask.name} check-in!`,
            icon: "/favicon.png",
            tag: `checkin-${firstTask.id}`,
          });
        }
      } else {
        // Clear pending check-ins if none are due
        setPendingCheckIns([]);
      }
    };

    // Check immediately when tasks update
    checkDueTasks();

    // Also check periodically
    const checkInterval = setInterval(checkDueTasks, 10000);

    return () => clearInterval(checkInterval);
  }, [tasks, notificationPermission]);

  const dismissCheckIn = useCallback((taskId: string) => {
    setPendingCheckIns((prev) => prev.filter((p) => p.task.id !== taskId));
  }, []);

  const dismissAllCheckIns = useCallback(() => {
    setPendingCheckIns([]);
  }, []);

  return {
    pendingCheckIns,
    dismissCheckIn,
    dismissAllCheckIns,
    notificationPermission,
  };
}
