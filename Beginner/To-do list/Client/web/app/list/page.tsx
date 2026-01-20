"use client";

import { Button } from "@/components/ui/button";
import {
  ChangeEvent,
  Dispatch,
  MouseEvent,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    status: "",
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

  const submitHandler = async (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      toast.error("User not identified, log in or signup to continue");
      return;
    }

    let filledDetails: Record<string, string> = {};

    for (let [key, value] of Object.entries(newDetails)) {
      if (value.trim().length > 0) filledDetails[key] = value;
    }

    filledDetails["id"] = todoId;

    try {
      const editRequest = await fetch("/api/todos", {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(filledDetails),
        }),
        editResponse = await editRequest.json();

      if (!editRequest.ok) {
        toast.error(`${editResponse.error}`);
        return;
      }

      toast.success("Task edited successfully");
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
              <Field>
                <FieldLabel>Status</FieldLabel>
                <Select
                  onValueChange={(value) =>
                    setDetails((details) => ({
                      ...details,
                      status: value,
                    }))
                  }
                >
                  <SelectTrigger className="w-45">
                    <SelectValue placeholder="how far are you?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="complete">Complete</SelectItem>
                    <SelectItem value="incomplete">Incomplete</SelectItem>
                    <SelectItem value="in progress">In progress</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>
          </FieldSet>
          <Field orientation="horizontal">
            <Button
              onClick={(event: MouseEvent<HTMLButtonElement>) =>
                submitHandler(event)
              }
              type="submit"
            >
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

  const deleteTaskHandler = async () => {
    const accessToken = localStorage.getItem("accessToken");

    if (!accessToken) {
      toast.error("User not identified, log in or signup to continue");
      return;
    }

    try {
      const deleteRequest: Response = await fetch(
          `/api/todos?todoid=${editId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        ),
        deleteResponse = await deleteRequest.json();

      if (!deleteRequest.ok) {
        toast.error(`${deleteResponse.error}`);
        return;
      }

      toast.success("Task deleted successfully");
    } catch (error) {
      toast.error(`${(error as Error).message}`);
    }
  };

  useEffect(() => {
    setDateTasks(() => {
      return todos.filter((todo) => {
        if (!todo.created_at) return false;

        const taskDate = new Date(todo.created_at);
        if (isNaN(taskDate.getTime())) return false;

        return (
          selectedDate.getFullYear() === taskDate.getFullYear() &&
          selectedDate.getMonth() === taskDate.getMonth() &&
          selectedDate.getDate() === taskDate.getDate()
        );
      });
    });
  }, [selectedDate, todos]);

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
          selectedDateTasks.map((todo, index) => {
            const todoDate = new Date(todo.created_at),
              formattedDate = `${todoDate.getDate()}/${todoDate.getMonth() + 1}/${todoDate.getFullYear()}`;
            return (
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
                    <span>, {todo.category}</span>
                  </div>
                  <p>{todo.content}</p>
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
                            onSelect={(event) => {
                              event.preventDefault();
                              setId(`${todo.id}`);
                            }}
                          >
                            Delete
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Delete task item
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will
                              permanently delete the task and remove it from our
                              servers.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteTaskHandler()}
                            >
                              Continue
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <p>Created at {formattedDate}</p>
                </div>
              </div>
            );
          })}
      </div>
      {editModal && <EditModal modalVisibility={setVisible} todoId={editId} />}
    </div>
  );
};

export default TodoList;
