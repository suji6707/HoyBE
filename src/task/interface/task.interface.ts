export type TaskPartial = {
  id: number;
  title: string;
  userId: number;
  priority: number;
  done: boolean; // 추후 number?
  commentCount: number;
  scheduleDate: Date;
};

export type TaskResponse = {
  dayOfWeek: string;
  day: string;
  dDay: boolean;
  tasks: TaskPartial[];
};
