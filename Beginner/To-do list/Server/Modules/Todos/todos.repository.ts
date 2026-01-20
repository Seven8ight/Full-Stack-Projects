import type { Client, QueryResult } from "pg";
import type {
  createTodo,
  Todo,
  ToDoInterface,
  updateTodo,
} from "./todos.types.js";
import { errorMsg, warningMsg } from "../../Utils/Logger.js";

export class TodoRepository implements ToDoInterface {
  constructor(private pgClient: Client) {}

  async createTodo(userId: string, todoData: createTodo) {
    try {
      const todoItem: QueryResult<Todo> = await this.pgClient.query(
        `INSERT INTO todos(title,content,category,user_id) VALUES($1,$2,$3,$4) RETURNING *`,
        [todoData.title, todoData.content, todoData.category, userId],
      );

      if (todoItem.rowCount && todoItem.rowCount > 0)
        return todoItem.rows[0] as Todo;

      throw new Error("Couldn't complete database operation, try again");
    } catch (error) {
      warningMsg(`Error at creating todo repo`);
      errorMsg(`${(error as Error).message}`);
      throw error;
    }
  }

  async editTodo(newTodo: updateTodo) {
    try {
      let keys: string[] = [],
        values: string[] = [],
        paramIndex = 2;

      for (let [key, value] of Object.entries(newTodo)) {
        keys.push(`${key}=$${paramIndex++}`);
        values.push(value);
      }

      const todoUpdate: QueryResult<Todo> = await this.pgClient.query(
        `UPDATE todos SET ${keys.join(",")} WHERE id=$1 RETURNING *`,
        [newTodo.id, ...values],
      );

      if (todoUpdate.rowCount && todoUpdate.rowCount > 0)
        return todoUpdate.rows[0]!;

      throw new Error(`Todo item does not exist of id, ${newTodo.id}`);
    } catch (error) {
      warningMsg("Edit todo repo error occurred");
      throw error;
    }
  }

  async getTodo(userId: string, todoId: string) {
    try {
      const todoRetrieval: QueryResult<Todo> = await this.pgClient.query(
        "SELECT * FROM todos WHERE id=$1 and user_id=$2",
        [todoId, userId],
      );

      if (todoRetrieval.rowCount && todoRetrieval.rowCount > 0)
        return todoRetrieval.rows[0]!;
      throw new Error("Todo does not exist");
    } catch (error) {
      warningMsg("Get todo repo error occurred");
      throw error;
    }
  }

  async getTodos(userId: string) {
    try {
      const todosRetrieval: QueryResult<Todo> = await this.pgClient.query(
        "SELECT * FROM todos WHERE user_id=$1",
        [userId],
      );

      return todosRetrieval.rows;
    } catch (error) {
      warningMsg("Get todos repo error occurred");
      errorMsg(`${(error as Error).message}`);
      throw error;
    }
  }

  async deleteTodo(userId: string, todoId: string) {
    try {
      await this.pgClient.query(
        `DELETE FROM todos WHERE id=$1 AND user_id=$2`,
        [todoId, userId],
      );
    } catch (error) {
      warningMsg("Delete user repo error occurred");
      throw error;
    }
  }
  async deleteTodos(userId: string) {
    try {
      await this.pgClient.query(`DELETE FROM todos WHERE user_id=$1`, [userId]);
    } catch (error) {
      warningMsg("Delete user repo error occurred");
      throw error;
    }
  }
}
