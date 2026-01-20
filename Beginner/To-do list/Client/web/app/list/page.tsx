"use client";

import { Button } from "@/components/ui/button";
import {
  ChangeEvent,
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
} from "react";
import styles from "./page.module.scss";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import FeatherIcon from "feather-icons-react";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import useProfile, { Todo } from "../_components/Profile";
import { toast } from "sonner";

/* ---------- Helpers ---------- */

function normalize(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeek(date: Date): Date[] {
  const d = normalize(date);

  const day = d.getDay(); // 0 = Sun, 1 = Mon ...
  const diff = day === 0 ? -6 : 1 - day; // ISO Monday

  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);

  return Array.from({ length: 7 }, (_, i) => {
    const next = new Date(monday);
    next.setDate(monday.getDate() + i);
    return next;
  });
}

function getDayLabel(day: number): string {
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][day];
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getDate() === b.getDate() &&
    a.getMonth() === b.getMonth() &&
    a.getFullYear() === b.getFullYear()
  );
}

/* ---------- Components ---------- */

const EditModal = ({
  todoId,
  modalVisibility,
}: {
  todoId: string;
  modalVisibility: Dispatch<SetStateAction<boolean>>;
}): React.ReactNode => {
  const [newDetails, setDetails] = useState<Record<string, string>>({
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

  const submitHandler = async () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      toast.error("User not identified, log in or signup to continue");
      return;
    }

    let filledDetails: Record<string, string> = {};

    for (let [key, value] of Object.entries(newDetails)) {
      if (value.trim().length > 0) filledDetails[key] = value;
    }

    try {
      const editRequest = await fetch("/api/todos", {
        method: "PATCH",
        headers: {
          Authorization: `${accessToken}`,
        },
        body: JSON.stringify(filledDetails),
      });
    } catch (error) {
      toast.error(`${(error as Error).message}`);
    }
  };

  return (
    <div className={styles.editmodal}>
      <form>
        <FieldGroup>
          <FieldSet>
            <FieldLegend>Edit Task</FieldLegend>
            <FieldDescription>
              Update and changes to this todo item
            </FieldDescription>
            <FieldGroup>
              <Field>
                <FieldLabel>Title</FieldLabel>
                <Input
                  onChange={(event) => inputHandler(event, "title")}
                  type="text"
                />
              </Field>
              <Field>
                <FieldLabel>Category</FieldLabel>
                <Input
                  onChange={(event) => inputHandler(event, "category")}
                  type="text"
                />
              </Field>
              <Field>
                <FieldLabel>Content</FieldLabel>
                <Textarea
                  onChange={(event) => inputHandler(event, "content")}
                />
              </Field>
            </FieldGroup>
          </FieldSet>
          <Field orientation="horizontal">
            <Button onClick={() => submitHandler()} type="submit">
              Submit
            </Button>
            <Button
              variant="outline"
              type="button"
              onClick={() => modalVisibility(false)}
            >
              Cancel
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  );
};

const TodoList = (): React.ReactNode => {
  const [selectedDate, setSelectedDate] = useState<Date>(() =>
      normalize(new Date()),
    ),
    [editId, setId] = useState<string>(""),
    [editModal, setVisible] = useState<boolean>(false),
    { todos } = useProfile(),
    [selectedDateTasks, setDateTasks] = useState<Todo[]>([]);

  const week = getWeek(selectedDate),
    colors: string[] = ["#7b6069", "#D72D66", "#2DD7A1"];

  useEffect(() => {
    setDateTasks(() => {
      return todos.map((todo) => {
        const taskDate = new Date(todo.createdDate);

        if (selectedDate.getDate() == taskDate.getDate()) return todo;
      }) as Todo[];
    });
  }, [selectedDate]);

  return (
    <div id="days">
      <div className={styles.days}>
        {week.map((date) => {
          const active = isSameDay(date, selectedDate);

          return (
            <div
              key={date.toISOString()}
              className={active ? styles.currentDate : styles.day}
              onClick={() => setSelectedDate(date)}
            >
              <span>{getDayLabel(date.getDay())}</span>
              <Button variant="ghost">{date.getDate()}</Button>
            </div>
          );
        })}
      </div>
      <div id="todos" className={styles.todos}>
        {selectedDateTasks.length == 0 && (
          <div className={styles.emptyTasks} id="empty-tasks">
            <p>No tasks for the day</p>
          </div>
        )}
        {selectedDateTasks.length > 0 &&
          selectedDateTasks.map((todo, index) => (
            <div
              key={todo.id}
              style={{
                backgroundColor: colors[index % colors.length],
              }}
              className={styles.todo}
            >
              <div id="todo-info">
                <div id="todo-header" className={styles.todoHeader}>
                  <h2>{todo.title}</h2>
                  <span>, Category</span>
                </div>
                <p>{todo.category}</p>
              </div>
              <div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <FeatherIcon
                      className={styles.options}
                      icon={"more-horizontal"}
                    />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>Options</DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    <DropdownMenuItem
                      onSelect={() => {
                        setVisible(true);
                        setId(`${todo.id}`);
                      }}
                    >
                      Edit
                    </DropdownMenuItem>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem
                          onSelect={(event) => event.preventDefault()}
                        >
                          Delete
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete task item</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete the task and remove it from our servers.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction>Continue</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>

                <p>
                  Created at{" "}
                  {`${todo.createdDate.getDate()}/${todo.createdDate.getMonth() + 1}/${todo.createdDate.getFullYear()}`}
                </p>
              </div>
            </div>
          ))}
      </div>
      {editModal && <EditModal modalVisibility={setVisible} todoId={editId} />}
    </div>
  );
};

export default TodoList;
