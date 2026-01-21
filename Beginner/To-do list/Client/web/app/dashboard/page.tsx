"use client";

import { Button } from "@/components/ui/button";
import styles from "./page.module.scss";
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

const Dashboard = (): React.ReactNode => {
  const { username, todos } = useProfile(),
    [todaysTasks, setTTasks] = useState<Todo[]>([]),
    [completed, setCompleted] = useState<number>(0),
    [inProgress, setInProgress] = useState<number>(0),
    [current, setCurrent] = useState<number>(0);

  const searchParams = useSearchParams(),
    oauth = searchParams.get("oauth");

  const router = useRouter();

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
  }, []);

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
    setDetails((details) => ({
      ...details,
      [key]: event.target.value,
    }));
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
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
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
    <div id="container">
      <div id="todos-container" className={styles.todosContainer}>
        <div id="text" className={styles.text}>
          <h3>Good morning, {username}</h3>
          <h2>
            You have <span>{completed} tasks</span> completed this month
          </h2>
        </div>
        <div id="summary" className={styles.summary}>
          <div>
            <i className="fa-solid fa-list-check"></i>
            <Label>Todos</Label>
            <p>{current}</p>
          </div>
          <div>
            <i className="fa-solid fa-file-pen"></i>
            <Label>In Progress</Label>
            <p>{inProgress}</p>
          </div>
          <div>
            <i className="fa-solid fa-check"></i>
            <Label>Completed</Label>
            <p>{completed}</p>
          </div>
        </div>
        <div id="todos">
          <div id="add" className={styles.add}>
            <h3>Today's tasks</h3>
            <div id="input" className={styles.input}>
              <p>
                Kick start the day with some progressive tasks to keep you going
              </p>

              <Dialog>
                <DialogTrigger asChild>
                  <Button className={styles.addTaskBtn}>
                    <i className="fa-solid fa-add"></i>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-106.25">
                  <DialogHeader>
                    <DialogTitle>Create new task</DialogTitle>
                    <DialogDescription>
                      Add a new task/todo for the day for progress
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4">
                    <div className="grid gap-3">
                      <Label htmlFor="name-1">Title</Label>
                      <Input
                        onChange={(event) => inputHandler(event, "title")}
                        id="name-1"
                        name="name"
                        placeholder="Task title"
                      />
                    </div>
                    <div className="grid gap-3">
                      <Label htmlFor="username-1">Category</Label>
                      <Input
                        id="username-1"
                        onChange={(event) => inputHandler(event, "category")}
                        name="username"
                        placeholder="category"
                      />
                    </div>
                    <div className="grid gap-3">
                      <Label htmlFor="username-1">Content</Label>
                      <Textarea
                        onChange={(event) => inputHandler(event, "content")}
                        placeholder="What are we doing currently?"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>

                    <Button onClick={() => addTaskHandler()} type="submit">
                      Create task
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <div id="todays-tasks" className={styles.todaystasks}>
            {todaysTasks.length <= 0 && (
              <div id="no-tasks" className={styles.noTasks}>
                <p>No tasks added, its a free day then</p>
              </div>
            )}
            {todaysTasks.length > 0 &&
              todaysTasks.map((todo, index) => {
                const todoDate = new Date(todo.created_at),
                  formattedDate = `${todoDate.getDate()}/${todoDate.getMonth() + 1}/${todoDate.getFullYear()}`;

                return (
                  <div id="task" key={index} className={styles.todaytask}>
                    <h4>{todo.title}</h4>
                    <p>{todo.content}</p>
                    <p>
                      Created at <span>{formattedDate}</span>
                    </p>
                    <p>
                      Status: <span>{todo.status}</span>
                    </p>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
