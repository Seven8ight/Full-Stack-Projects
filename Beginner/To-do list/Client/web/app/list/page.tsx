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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MoreHorizontal,
  Calendar,
  Tag,
  Clock,
  Trash2,
  Edit3,
  CheckCircle2,
  Circle,
  FlaskConical,
  FilterX,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import useProfile, { Todo } from "../_components/Profile";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTheme } from "../_components/Theme";

function normalize(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function getWeek(date: Date): Date[] {
  const d = normalize(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
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
  return a.getTime() === b.getTime();
}

const EditModal = ({
  todoId,
  modalVisibility,
  setTodos,
}: {
  todoId: string;
  modalVisibility: Dispatch<SetStateAction<boolean>>;
  setTodos: Dispatch<SetStateAction<Todo[]>>;
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
    setDetails((details) => ({ ...details, [key]: event.target.value }));
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
        headers: { Authorization: `Bearer ${accessToken}` },
        body: JSON.stringify(filledDetails),
      });
      const editResponse = await editRequest.json();

      if (!editRequest.ok) {
        toast.error(`${editResponse.error}`);
        return;
      }
      toast.success("Task edited successfully");
      modalVisibility(false);

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-xl border shadow-lg p-6 space-y-4 animate-in fade-in zoom-in-95">
        <div className="space-y-1 text-left">
          <h2 className="text-xl font-bold">Edit Task</h2>
          <p className="text-sm text-zinc-500">
            Update the details of your todo item.
          </p>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input
              onChange={(e) => inputHandler(e, "title")}
              placeholder="Update title..."
            />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Input
              onChange={(e) => inputHandler(e, "category")}
              placeholder="Update category..."
            />
          </div>
          <div className="space-y-2">
            <Label>Content</Label>
            <Textarea
              onChange={(e) => inputHandler(e, "content")}
              placeholder="Update content..."
            />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              onValueChange={(v) => setDetails((d) => ({ ...d, status: v }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Update status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="complete">Complete</SelectItem>
                <SelectItem value="incomplete">Incomplete</SelectItem>
                <SelectItem value="in progress">In progress</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <Button className="flex-1" onClick={submitHandler}>
            Save Changes
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => modalVisibility(false)}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

const FilterModal = ({
  isOpen,
  onClose,
  selectedFilters,
  handleTaskFilters,
  taskCategories,
  clearFilters,
  applyFilters,
  setFilterDate,
}: any) => {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-md flex flex-col gap-6">
        <SheetHeader className="text-left">
          <SheetTitle className="text-2xl font-bold">Filter Tasks</SheetTitle>
          <SheetDescription>
            Narrow down your schedule by date and category.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-8 overflow-y-auto pr-2 m-4">
          <div className="space-y-4">
            <Label className="text-xs font-black uppercase tracking-widest text-zinc-400">
              Time Range
            </Label>
            <div className="flex flex-wrap gap-2">
              {["Yesterday", "Custom"].map((item) => (
                <Badge
                  key={item}
                  variant={
                    selectedFilters.time === item ? "default" : "secondary"
                  }
                  className="cursor-pointer px-4 py-2 text-sm transition-all"
                  onClick={() => handleTaskFilters("time", item)}
                >
                  {item}
                </Badge>
              ))}
            </div>

            {selectedFilters.time?.toLowerCase() === "custom" && (
              <div className="grid grid-cols-3 gap-2 animate-in slide-in-from-top-2">
                <Input
                  type="number"
                  placeholder="DD"
                  className="text-center"
                  onChange={(e) =>
                    setFilterDate((p: Date) => {
                      const n = new Date(p);
                      n.setDate(parseInt(e.target.value) || 1);
                      return n;
                    })
                  }
                />
                <Input
                  type="number"
                  placeholder="MM"
                  className="text-center"
                  onChange={(e) =>
                    setFilterDate((p: Date) => {
                      const n = new Date(p);
                      n.setMonth((parseInt(e.target.value) || 1) - 1);
                      return n;
                    })
                  }
                />
                <Input
                  type="number"
                  placeholder="YYYY"
                  className="text-center"
                  onChange={(e) =>
                    setFilterDate((p: Date) => {
                      const n = new Date(p);
                      n.setFullYear(parseInt(e.target.value) || 2026);
                      return n;
                    })
                  }
                />
              </div>
            )}
          </div>

          <div className="space-y-4">
            <Label className="text-xs font-black uppercase tracking-widest text-zinc-400">
              Category
            </Label>
            <ScrollArea className="h-62.5 rounded-xl border p-4 bg-zinc-50/50 dark:bg-zinc-900/50">
              {taskCategories.length === 0 ? (
                <p className="text-center text-zinc-400 text-sm py-10">
                  No categories found
                </p>
              ) : (
                <div className="space-y-3">
                  {taskCategories.map((item: string) => (
                    <div
                      key={item}
                      className="flex items-center justify-between p-3 rounded-lg border bg-white dark:bg-zinc-800 shadow-sm"
                    >
                      <span className="text-sm font-medium">{item}</span>
                      <Checkbox
                        checked={selectedFilters.categories.includes(item)}
                        onCheckedChange={() =>
                          handleTaskFilters("category", item)
                        }
                      />
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>

        <SheetFooter className="flex-row gap-3 sm:flex-row">
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={clearFilters}
          >
            <FilterX size={16} /> Clear
          </Button>
          <Button className="flex-2 gap-2" onClick={applyFilters}>
            <CheckCircle2 size={16} /> Apply Filters
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

/* ---------- Main Component ---------- */
const TodoList = (): React.ReactNode => {
  const { todos, setTodos } = useProfile();
  const { theme } = useTheme();

  // States
  const [selectedDate, setSelectedDate] = useState<Date>(() =>
    normalize(new Date()),
  );
  const [editId, setId] = useState<string>("");
  const [editModal, setVisible] = useState<boolean>(false);
  const [selectedDateTasks, setDateTasks] = useState<Todo[]>([]);

  // Filter States
  const [isFilterOpen, setFilterOpen] = useState(false);
  const [filterDate, setFilterDate] = useState<Date>(new Date());
  const [selectedFilters, setSelectedFilters] = useState({
    time: "",
    categories: [] as string[],
  });

  const week = getWeek(selectedDate);
  const taskCategories = Array.from(
    new Set(todos.map((t) => t.category).filter(Boolean)),
  );

  const handleTaskFilters = (type: "time" | "category", value: string) => {
    if (type === "time") {
      setSelectedFilters((prev) => ({
        ...prev,
        time: prev.time === value ? "" : value,
      }));
    } else {
      setSelectedFilters((prev) => ({
        ...prev,
        categories: prev.categories.includes(value)
          ? prev.categories.filter((c) => c !== value)
          : [...prev.categories, value],
      }));
    }
  };

  const applyFilters = () => {
    if (selectedFilters.time === "Yesterday") {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      setSelectedDate(normalize(yesterday));
    } else if (selectedFilters.time === "Custom") {
      setSelectedDate(normalize(filterDate));
    }
    setFilterOpen(false);
  };

  const clearFilters = () => {
    setSelectedFilters({ time: "", categories: [] });
    setSelectedDate(normalize(new Date()));
  };

  const deleteTaskHandler = async () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) return toast.error("User not identified");
    try {
      const res = await fetch(`/api/todos?todoid=${editId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (res.ok) toast.success("Task deleted successfully");
    } catch (error) {
      toast.error("Failed to delete task");
    }
  };

  useEffect(() => {
    setDateTasks(() => {
      return todos.filter((todo) => {
        if (!todo.created_at) return false;
        const taskDate = normalize(new Date(todo.created_at));
        const dateMatch = isSameDay(selectedDate, taskDate);
        const categoryMatch =
          selectedFilters.categories.length === 0 ||
          selectedFilters.categories.includes(todo.category);
        return dateMatch && categoryMatch;
      });
    });
  }, [selectedDate, todos, selectedFilters.categories]);

  return (
    <div className="container mx-auto max-w-4xl p-6 space-y-8 pt-24">
      {/* Week Picker */}
      <div className="flex justify-between items-center gap-2 overflow-x-auto pb-2">
        <div className="flex gap-2">
          {week.map((date) => {
            const active = isSameDay(date, selectedDate);
            return (
              <button
                key={date.toISOString()}
                onClick={() => setSelectedDate(date)}
                className={`flex flex-col items-center justify-center min-w-14 p-3 rounded-2xl transition-all ${
                  active
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-lg"
                    : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500"
                }`}
              >
                <span className="text-[10px] font-bold uppercase mb-1">
                  {getDayLabel(date.getDay())}
                </span>
                <span className="text-lg font-black">{date.getDate()}</span>
              </button>
            );
          })}
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={() => setFilterOpen(true)}
          className={`h-14 w-14 rounded-2xl shadow-sm cursor-pointer border-2 ${
            theme === "light" ? "bg-white text-black" : "bg-zinc-900 text-white"
          }`}
        >
          <FlaskConical size={24} />
        </Button>
      </div>

      <div className="flex items-center justify-between border-b pb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          Schedule <Calendar size={20} className="text-zinc-400" />
        </h2>
        <p className="text-sm text-zinc-500">
          {selectedDateTasks.length}{" "}
          {selectedDateTasks.length === 1 ? "task" : "tasks"} planned
        </p>
      </div>

      <div className="grid gap-4">
        {selectedDateTasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 border border-dashed rounded-3xl text-zinc-400">
            <Circle className="mb-3 opacity-10" size={48} />
            <p className="font-medium text-lg">No tasks found</p>
          </div>
        ) : (
          selectedDateTasks.map((todo) => (
            <div
              key={todo.id}
              className="group flex flex-col p-5 rounded-2xl border bg-white dark:bg-zinc-900 hover:shadow-md transition-all border-l-4 border-l-zinc-900 dark:border-l-zinc-100"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="space-y-1 text-left">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold tracking-tight">
                      {todo.title}
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 font-bold uppercase text-zinc-500 flex items-center gap-1">
                      <Tag size={10} /> {todo.category}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-500 line-clamp-2 leading-relaxed">
                    {todo.content}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full"
                    >
                      <MoreHorizontal size={18} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        setVisible(true);
                        setId(`${todo.id}`);
                      }}
                    >
                      <Edit3 className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem
                          onSelect={(e) => {
                            e.preventDefault();
                            setId(`${todo.id}`);
                          }}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete task?</AlertDialogTitle>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={deleteTaskHandler}
                            className="bg-destructive text-white"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-zinc-50 dark:border-zinc-800 text-[11px] font-bold text-zinc-400">
                <div className="flex items-center gap-1">
                  <Clock size={14} />{" "}
                  {new Date(todo.created_at).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <CheckCircle2
                    size={14}
                    className={
                      todo.status === "complete" ? "text-emerald-500" : ""
                    }
                  />{" "}
                  {todo.status.toUpperCase()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <FilterModal
        isOpen={isFilterOpen}
        onClose={setFilterOpen}
        selectedFilters={selectedFilters}
        handleTaskFilters={handleTaskFilters}
        taskCategories={taskCategories}
        clearFilters={clearFilters}
        applyFilters={applyFilters}
        setFilterDate={setFilterDate}
      />
      {editModal && (
        <EditModal
          setTodos={setTodos}
          modalVisibility={setVisible}
          todoId={editId}
        />
      )}
    </div>
  );
};

export default TodoList;
