import styles from "./../auth.module.scss";

const Login = (): React.ReactNode => {
  return (
    <div id="login" className={styles.login}>
      <h1>Login</h1>
      <form>
        <label>Email</label>
        <input type="email" placeholder="Doe@example.com" />
        <label>Password</label>
        <input type="password" placeholder="$3@#$!#@##@" />
        <button>Log In</button>
      </form>
    </div>
  );
};

export default Login;
