import type { QueryResult } from "pg";
import { warningMsg } from "../../Utils/Logger.js";
import type {
  createTodo,
  Todo,
  ToDoInterface,
  updateTodo,
} from "./todos.types.js";

export class TodoService implements ToDoInterface {
  constructor(private todoRepo: ToDoInterface) {}

  async createTodo(userId: string, todoData: createTodo) {
    if (!userId) throw new Error("User id must be provided to create todo");

    const allowedFields: string[] = ["title", "content", "category", "status"];

    let newTodoData: Record<string, any> = {};

    for (let [key, value] of Object.entries(todoData)) {
      if (!allowedFields.includes(key.toLowerCase())) continue;
      if (typeof value == "string" && value.length < 0)
        throw new Error(`${key} has an empty value`);

      newTodoData[key] = value;
    }

    const newTodo: Todo = await this.todoRepo.createTodo(
      userId,
      newTodoData as createTodo
    );

    return newTodo;
  }

  async editTodo(newTodo: updateTodo) {
    if (!newTodo.id) throw new Error("Todo id not provided for editing");

    try {
      const allowedFields: string[] = [
        "title",
        "content",
        "category",
        "status",
      ];

      let newTodoObject: Record<string, any> = {};

      for (let [key, value] of Object.entries(newTodo)) {
        if (!allowedFields.includes(key.toLowerCase())) continue;
        if (value.length < 0) throw new Error(`${key} has an empty value`);

        newTodoObject[key] = value;
      }

      newTodoObject["id"] = newTodo.id;

      const updatedTodo = await this.todoRepo.editTodo(
        newTodoObject as updateTodo
      );

      return updatedTodo;
    } catch (error) {
      warningMsg("Edit user service error occurred");
      throw error;
    }
  }

  async getTodo(userId: string, todoId: string) {
    if (!userId || !todoId)
      throw new Error("User id and todo id not provided for retrieval");

    try {
      const retrieveTodo = await this.todoRepo.getTodo(userId, todoId);

      return retrieveTodo;
    } catch (error) {
      warningMsg("Get todo service error occurred");
      throw error;
    }
  }

  async getTodos(userId: string) {
    if (!userId) throw new Error("User id not provided for retrieval");

    try {
      const retrieveTodos = await this.todoRepo.getTodos(userId);

      return retrieveTodos;
    } catch (error) {
      warningMsg("Get user service error occurred");
      throw error;
    }
  }

  async deleteTodo(userId: string, todoId: string) {
    if (!userId) throw new Error("User id not provided for deletion");

    try {
      await this.todoRepo.deleteTodo(userId, todoId);
    } catch (error) {
      warningMsg("Delete user service error occurred");
      throw error;
    }
  }

  async deleteTodos(userId: string) {
    if (!userId) throw new Error("User id not provided for deletion");

    try {
      await this.todoRepo.deleteTodos(userId);
    } catch (error) {
      warningMsg("Delete user service error occurred");
      throw error;
    }
  }
}
