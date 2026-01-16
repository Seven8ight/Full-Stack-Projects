import { Button } from "@/components/ui/button";
import styles from "./page.module.scss";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

const Dashboard = (): React.ReactNode => {
  return (
    <div id="container">
      <div id="todos-container" className={styles.todosContainer}>
        <div id="text" className={styles.text}>
          <h3>Good morning, Lawrence</h3>
          <h2>
            You have <span>49 tasks</span> completed this month
          </h2>
        </div>
        <div id="summary" className={styles.summary}>
          <div>
            <i className="fa-solid fa-list-check"></i>
            <Label>Todo</Label>
          </div>
          <div>
            <i className="fa-solid fa-file-pen"></i>
            <Label>In Progress</Label>
          </div>
          <div>
            <i className="fa-solid fa-check"></i>
            <Label>Completed</Label>
          </div>
        </div>
        <div id="todos">
          <div id="add" className={styles.add}>
            <h3>Today's tasks</h3>
            <div id="input" className={styles.input}>
              <Input type="text" placeholder="New task here" />
              <Button>
                <i className="fa-solid fa-add"></i>
              </Button>
            </div>
          </div>
          <div id="todays-tasks" className={styles.todaystasks}>
            {Array.from({ length: 2 }).map((_, index) => (
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
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
