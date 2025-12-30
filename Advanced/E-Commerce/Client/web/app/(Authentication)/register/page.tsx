import styles from "./../auth.module.scss";

const Register = (): React.ReactNode => {
  return (
    <div className={styles.register}>
      <h1>Register</h1>
      <form>
        <label>Name</label>
        <br />
        <input type="text" placeholder="John Doe" />
        <br />
        <label>Email</label>
        <br />
        <input type="email" placeholder="Doe@example.com" />
        <br />
        <label>Password</label>
        <br />
        <input type="password" placeholder="$3@#$!#@##@" />
        <br />
        <button>Register</button>
      </form>
    </div>
  );
};

export default Register;
