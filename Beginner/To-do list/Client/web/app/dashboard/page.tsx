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
import { useEffect, useState } from "react";

const Dashboard = (): React.ReactNode => {
  const { username, todos } = useProfile(),
    [todaysTasks, setTTasks] = useState<Todo[]>([]),
    [completed, setCompleted] = useState<number>(0),
    [inProgress, setInProgress] = useState<number>(0),
    [current, setCurrent] = useState<number>(0);

  useEffect(() => {
    setTTasks(() => {
      return todos.map((todo) => {
        const currentDate = new Date(),
          taskDate = new Date(todo.createdDate);

        if (currentDate.getDate() == taskDate.getDate()) return todo;
      }) as Todo[];
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

  return (
    <div id="container">
      <div id="todos-container" className={styles.todosContainer}>
        <div id="text" className={styles.text}>
          <h3>Good morning, {username}</h3>
          <h2>
            You have <span>49 tasks</span> completed this month
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
                      <Input id="name-1" name="name" placeholder="Task title" />
                    </div>
                    <div className="grid gap-3">
                      <Label htmlFor="username-1">Category</Label>
                      <Input
                        id="username-1"
                        name="username"
                        placeholder="category"
                      />
                    </div>
                    <div className="grid gap-3">
                      <Label htmlFor="username-1">Content</Label>
                      <Textarea placeholder="What are we doing currently?" />
                    </div>
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit">Create task</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
          <div id="todays-tasks" className={styles.todaystasks}>
            {/* {Array.from({ length: 2 }).map((_, index) => (
              <div id="task" key={index} className={styles.todaytask}>
                <h4>Clean dishes</h4>
                <p>Ensure to clean all the dishes in the house</p>
                <p>
                  Created at <span>1300hrs</span>
                </p>
                <p>
                  Status: <span>Completed</span>
                </p>
              </div>
            ))} */}
            {todaysTasks.length == 0 && (
              <div id="no-tasks" className={styles.noTasks}>
                <p>No tasks added, its a free day then</p>
              </div>
            )}
            {todaysTasks.map((todo, index) => (
              <div id="task" key={index} className={styles.todaytask}>
                <h4>{todo.title}</h4>
                <p>{todo.content}</p>
                <p>
                  Created at <span>{todo.createdDate.getHours()}</span>
                </p>
                <p>
                  Status: <span>{todo.status}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
