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
import { ChangeEvent, useEffect, useState } from "react";
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
} from "lucide-react";

const Dashboard = (): React.ReactNode => {
  const { username, todos } = useProfile(),
    [todaysTasks, setTTasks] = useState<Todo[]>([]),
    [monthTasks, setMTasks] = useState<Todo[]>(),
    [completed, setCompleted] = useState<number>(0),
    [inProgress, setInProgress] = useState<number>(0),
    [current, setCurrent] = useState<number>(0);

  const searchParams = useSearchParams(),
    oauth = searchParams.get("oauth");

  const router = useRouter();

  // --- Retained OAuth Logic ---
  useEffect(() => {
    if (oauth == "google") {
      (async () => {
        const fetchProfile = await fetch("/api/auth/google", {
            method: "GET",
            credentials: "include",
          }),
          fetchResponse = await fetchProfile.json();

        if (!fetchProfile.ok) {
          toast.error("Google login failed. Try again");
          setTimeout(() => {
            router.push("/auth/login");
          }, 2500);
          return;
        }

        toast.success("Google login successful");
        const newParams = new URLSearchParams(searchParams.toString());
        newParams.delete("oauth");
        router.replace(`${window.location.pathname}?${newParams.toString()}`);

        localStorage.clear();
        localStorage.setItem("accessToken", fetchResponse.accessToken);
        localStorage.setItem("refreshToken", fetchResponse.refreshToken);
      })();
    }
  }, [oauth, router, searchParams]);

  // --- Retained Counter Logic ---
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
        (count, todo) => (todo.status == "complete" ? count + 1 : count),
        0,
      ),
    );
    setInProgress(
      todos.reduce(
        (count, todo) => (todo.status == "in progress" ? count + 1 : count),
        0,
      ),
    );
    setCurrent(
      todos.reduce(
        (count, todo) => (todo.status == "incomplete" ? count + 1 : count),
        0,
      ),
    );
    setMTasks(() => {
      const today = new Date();

      return todos.filter((todo) => {
        const taskDate = new Date(todo.created_at);

        return (
          taskDate.getMonth() == today.getMonth() &&
          taskDate.getFullYear() == today.getFullYear()
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
      const addRequest: Response = await fetch("/api/todos", {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}` },
          body: JSON.stringify(details),
        }),
        addResponse = await addRequest.json();
      if (!addRequest.ok) {
        toast.error(`${addResponse.error}`);
        return;
      }
      toast.success("Todo created");
    } catch (error) {
      toast.error(`${(error as Error).message}`);
    }
  };

  return (
    <div className="container mx-auto max-w-5xl p-6 pt-24 space-y-8">
      {/* Welcome Header */}
      <header className="space-y-2 text-left">
        <h3 className="text-zinc-500 font-medium">Good morning, {username}</h3>
        <h1 className="text-3xl font-bold tracking-tight">
          You have {monthTasks?.length}{" "}
          <span className="text-zinc-900 dark:text-zinc-100">
            {monthTasks?.length == 1 ? "task" : "tasks"}
          </span>{" "}
          this month
        </h1>
      </header>

      {/* Summary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 rounded-xl border bg-white shadow-sm dark:bg-zinc-900 space-y-2">
          <ListTodo className="h-5 w-5 text-blue-500" />
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            Pending
          </p>
          <p className="text-3xl font-bold">{current}</p>
        </div>
        <div className="p-6 rounded-xl border bg-white shadow-sm dark:bg-zinc-900 space-y-2">
          <Clock className="h-5 w-5 text-amber-500" />
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            In Progress
          </p>
          <p className="text-3xl font-bold">{inProgress}</p>
        </div>
        <div className="p-6 rounded-xl border bg-white shadow-sm dark:bg-zinc-900 space-y-2">
          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            Completed
          </p>
          <p className="text-3xl font-bold">{completed}</p>
        </div>
      </div>

      {/* Tasks Section */}
      <section className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4">
          <div>
            <h2 className="text-xl font-semibold flex items-center gap-2">
              Today's tasks <CalendarDays size={20} className="text-zinc-400" />
            </h2>
            <p className="text-sm text-zinc-500">
              Kick start the day with some progressive tasks
            </p>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2 shadow-sm">
                <Plus size={18} /> Add Task
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create new task</DialogTitle>
                <DialogDescription>
                  Add a new todo for the day to track your progress.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    onChange={(e) => inputHandler(e, "title")}
                    placeholder="e.g. Finish Project UI"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Input
                    onChange={(e) => inputHandler(e, "category")}
                    placeholder="e.g. Work, Personal"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    onChange={(e) => inputHandler(e, "content")}
                    placeholder="What are we doing currently?"
                    rows={4}
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={addTaskHandler} className="gap-2">
                  <PlusCircle size={18} /> Create task
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Task List */}
        <div className="grid gap-3">
          {todaysTasks.length <= 0 ? (
            <div className="flex flex-col items-center justify-center p-12 rounded-xl border border-dashed border-zinc-300 dark:border-zinc-800 text-zinc-400">
              <Circle className="mb-2 opacity-20" size={40} />
              <p>No tasks added yet. It's a free day!</p>
            </div>
          ) : (
            todaysTasks.map((todo, index) => {
              const todoDate = new Date(todo.created_at);
              const formattedDate = todoDate.toLocaleDateString();

              return (
                <div
                  key={index}
                  className="p-4 rounded-lg border bg-white dark:bg-zinc-900 hover:border-zinc-400 transition-colors flex items-start justify-between shadow-sm"
                >
                  <div className="space-y-1 text-left">
                    <h4 className="font-semibold text-lg">{todo.title}</h4>
                    <p className="text-sm text-zinc-500 leading-relaxed">
                      {todo.content}
                    </p>
                    <div className="flex items-center gap-4 pt-2 text-[10px] font-bold uppercase tracking-widest">
                      <span className="flex items-center gap-1 text-zinc-400">
                        <CalendarDays size={12} /> {formattedDate}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full border ${
                          todo.status === "complete"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800"
                            : "bg-zinc-50 text-zinc-600 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700"
                        }`}
                      >
                        {todo.status}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
