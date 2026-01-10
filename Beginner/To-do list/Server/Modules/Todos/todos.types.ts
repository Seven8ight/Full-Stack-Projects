export type Todo = {
  id: string;
  title: string;
  content: string;
  category: string;
  userId: string;
  createdDate: Date;
  status: "complete" | "incomplete" | "in progress";
};

export type createTodo = Pick<Todo, "title" | "content" | "category">;

export type updateTodo = Pick<Todo, "id"> &
  Omit<Partial<Todo>, "userId" | "createdDate">;

export interface ToDoInterface {
  createTodo: (userId: string, todoData: createTodo) => Promise<Todo>;
  editTodo: (newTodo: updateTodo) => Promise<Todo>;
  getTodo: (userId: string, todoId: string) => Promise<Todo>;
  getTodos: (userId: string) => Promise<Todo[]>;
  deleteTodo: (userId: string, todoId: string) => Promise<void>;
  deleteTodos: (userId: string) => Promise<void>;
}

export interface ToDoService {}
