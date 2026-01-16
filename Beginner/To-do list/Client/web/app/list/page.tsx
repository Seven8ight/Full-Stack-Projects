"use client";

import { Button } from "@/components/ui/button";
import { Dispatch, SetStateAction, useState } from "react";
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
                <Input type="text" />
              </Field>
              <Field>
                <FieldLabel>Category</FieldLabel>
                <Input type="text" />
              </Field>
              <Field>
                <FieldLabel>Content</FieldLabel>
                <Textarea />
              </Field>
            </FieldGroup>
          </FieldSet>
          <Field orientation="horizontal">
            <Button type="submit">Submit</Button>
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
      normalize(new Date())
    ),
    [editId, setId] = useState<string>(""),
    [editModal, setVisible] = useState<boolean>(false);

  const week = getWeek(selectedDate),
    colors: string[] = ["#7b6069", "#D72D66", "#2DD7A1"];

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
        {[
          {
            todo: "todo",
            category: "String",
          },
          {
            todo: "todo",
            category: "String",
          },
          {
            todo: "todo",
            category: "String",
          },
          {
            todo: "todo",
            category: "String",
          },
          {
            todo: "todo",
            category: "String",
          },
          {
            todo: "todo",
            category: "String",
          },
        ].map((element, index) => {
          return (
            <div
              key={index}
              style={{
                backgroundColor: colors[index % colors.length],
              }}
              className={styles.todo}
            >
              <div id="todo-info">
                <div id="todo-header" className={styles.todoHeader}>
                  <h2>{element.todo}</h2>
                  <span>, Category</span>
                </div>
                <p>{element.category}</p>
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
                        setId(`${index}`);
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

                <p>Created at</p>
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
