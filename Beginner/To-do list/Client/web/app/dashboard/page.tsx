"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import useProfile, { Todo } from "../_components/Profile";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogClose,
  DialogHeader,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ChangeEvent, Suspense, useEffect, useState } from "react";
import { toast } from "sonner";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Plus,
  CheckCircle2,
  Clock,
  ListTodo,
  CalendarDays,
  PlusCircle,
  Circle,
  Loader2,
} from "lucide-react";

// 1. Move the logic into a separate inner component
const DashboardContent = () => {
  const { username, todos, setTodos } = useProfile(),
    [todaysTasks, setTTasks] = useState<Todo[]>([]),
    [monthTasks, setMTasks] = useState<Todo[]>(),
    [completed, setCompleted] = useState<number>(0),
    [inProgress, setInProgress] = useState<number>(0),
    [current, setCurrent] = useState<number>(0);

  const searchParams = useSearchParams(),
    accessToken = searchParams.get("accessToken"),
    refreshToken = searchParams.get("refreshToken");

  const router = useRouter();

  useEffect(() => {
    if (accessToken && refreshToken) {
      try {
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);

        const searchParamsForDeletion = new URLSearchParams(
          searchParams.toString(),
        );
        searchParamsForDeletion.delete("accessToken");
        searchParamsForDeletion.delete("refreshToken");

        const newUrl = searchParamsForDeletion.toString()
          ? `${window.location.pathname}?${searchParams.toString()}`
          : window.location.pathname;

        router.replace(newUrl);

        toast.success("Google sign-in Successful");
      } catch (err) {
        toast.error("Internal connection error");
      }
    }
  }, [accessToken, refreshToken, router, searchParams]);

  useEffect(() => {
    setTTasks(() => {
      const today = new Date().getDate();
      return todos.filter((todo) => {
        const taskDate = new Date(todo.created_at);
        return taskDate.getDate() === today;
      });
    });

    setCompleted(
      todos.reduce(
        (count, todo) => (todo.status === "complete" ? count + 1 : count),
        0,
      ),
    );

    setInProgress(
      todos.reduce(
        (count, todo) => (todo.status === "in progress" ? count + 1 : count),
        0,
      ),
    );

    setCurrent(
      todos.reduce(
        (count, todo) => (todo.status === "incomplete" ? count + 1 : count),
        0,
      ),
    );

    setMTasks(() => {
      const today = new Date();
      return todos.filter((todo) => {
        const taskDate = new Date(todo.created_at);
        return (
          taskDate.getMonth() === today.getMonth() &&
          taskDate.getFullYear() === today.getFullYear()
        );
      });
    });
  }, [todos]);

  const [details, setDetails] = useState<Record<string, string>>({
    title: "",
    category: "",
    content: "",
  });

  const inputHandler = (
    event: ChangeEvent<any>,
    key: "title" | "category" | "content",
  ) => {
    setDetails((details) => ({ ...details, [key]: event.target.value }));
  };

  const addTaskHandler = async () => {
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      toast.error("User not identified, log in or signup to continue");
      return;
    }
    for (let [key, value] of Object.entries(details)) {
      if (value.trim().length <= 0) {
        toast.error(`${key} has an empty value`);
        return;
      }
    }
    try {
      const addRequest = await fetch("/api/todos", {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify(details),
      });

      const addResponse = await addRequest.json();

      if (!addRequest.ok) {
        toast.error(`${addResponse.error}`);
        return;
      }

      toast.success("Todo created");

      const getTodos = await fetch("/api/todos", {
        method: "GET",
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const getResponse = await getTodos.json();

      if (!getResponse.ok) {
        toast.error(`Error: ${getResponse.error}`);
        return;
      }

      setTodos(getResponse);
    } catch (error) {
      toast.error(`${(error as Error).message}`);
    }
  };

  return (
    <div className="container mx-auto max-w-5xl p-6 pt-24 space-y-8">
      {/* Welcome Header */}
      <header className="space-y-2 text-left animate-in fade-in slide-in-from-top-4 duration-500">
        <h3 className="text-zinc-500 font-medium italic">
          Good morning, {username}
        </h3>
        <h1 className="text-3xl font-black tracking-tight uppercase">
          Month Overview:{" "}
          <span className="text-zinc-400">{monthTasks?.length || 0} Tasks</span>
        </h1>
      </header>

      {/* Summary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 rounded-2xl border bg-white shadow-sm dark:bg-zinc-900 space-y-2 border-b-4 border-b-blue-500">
          <ListTodo className="h-5 w-5 text-blue-500" />
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
            Pending
          </p>
          <p className="text-3xl font-black">{current}</p>
        </div>
        <div className="p-6 rounded-2xl border bg-white shadow-sm dark:bg-zinc-900 space-y-2 border-b-4 border-b-amber-500">
          <Clock className="h-5 w-5 text-amber-500" />
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
            Working
          </p>
          <p className="text-3xl font-black">{inProgress}</p>
        </div>
        <div className="p-6 rounded-2xl border bg-white shadow-sm dark:bg-zinc-900 space-y-2 border-b-4 border-b-emerald-500">
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
            Completed
          </p>
          <p className="text-3xl font-black">{completed}</p>
        </div>
      </div>

      {/* Tasks Section */}
      <section className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2 tracking-tight">
              Today's Agenda{" "}
              <CalendarDays size={20} className="text-zinc-400" />
            </h2>
            <p className="text-sm text-zinc-500 italic">
              Focused progress for a productive day
            </p>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2 shadow-lg rounded-xl font-bold">
                <Plus size={18} /> New Task
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-xl font-black">
                  Create new task
                </DialogTitle>
                <DialogDescription>
                  Add a new todo for the day to track your progress.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label className="font-bold uppercase text-[10px] tracking-widest">
                    Title
                  </Label>
                  <Input
                    onChange={(e) => inputHandler(e, "title")}
                    placeholder="e.g. Finish Project UI"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold uppercase text-[10px] tracking-widest">
                    Category
                  </Label>
                  <Input
                    onChange={(e) => inputHandler(e, "category")}
                    placeholder="e.g. Work, Personal"
                    className="rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold uppercase text-[10px] tracking-widest">
                    Description
                  </Label>
                  <Textarea
                    onChange={(e) => inputHandler(e, "content")}
                    placeholder="Task details..."
                    rows={4}
                    className="rounded-xl"
                  />
                </div>
              </div>
              <DialogFooter className="gap-2">
                <DialogClose asChild>
                  <Button variant="ghost">Cancel</Button>
                </DialogClose>
                <Button onClick={addTaskHandler} className="gap-2 rounded-xl">
                  <PlusCircle size={18} /> Create task
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Task List */}
        <div className="grid gap-3">
          {todaysTasks.length <= 0 ? (
            <div className="flex flex-col items-center justify-center p-16 rounded-[2rem] border border-dashed border-zinc-200 dark:border-zinc-800 text-zinc-400 bg-zinc-50/50 dark:bg-zinc-950/50">
              <Circle className="mb-4 opacity-10" size={56} />
              <p className="font-medium">All clear! No tasks for today.</p>
            </div>
          ) : (
            todaysTasks.map((todo, index) => (
              <div
                key={index}
                className="p-5 rounded-2xl border bg-white dark:bg-zinc-900 hover:shadow-md transition-all flex items-start justify-between group"
              >
                <div className="space-y-2 text-left">
                  <h4 className="font-bold text-lg group-hover:text-blue-500 transition-colors tracking-tight">
                    {todo.title}
                  </h4>
                  <p className="text-sm text-zinc-500 leading-relaxed max-w-2xl">
                    {todo.content}
                  </p>
                  <div className="flex items-center gap-4 pt-3 text-[9px] font-black uppercase tracking-[0.15em]">
                    <span className="flex items-center gap-1.5 text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md">
                      <CalendarDays size={10} />{" "}
                      {new Date(todo.created_at).toLocaleDateString()}
                    </span>
                    <span
                      className={`px-2 py-1 rounded-md border ${
                        todo.status === "complete"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/10 dark:text-emerald-400 dark:border-emerald-900"
                          : "bg-zinc-50 text-zinc-500 border-zinc-100 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-800"
                      }`}
                    >
                      {todo.status}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

// 2. Wrap the component with Suspense in the export
const Dashboard = () => {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center gap-3 text-zinc-500 font-bold uppercase tracking-widest text-xs">
          <Loader2 className="animate-spin" size={20} />
          Synchronizing...
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
};

export default Dashboard;
