import styles from "@styles/Main.module.css";

const BottomNav = () => {
  return (
    <nav className={styles.bottomNav}>
      <a className="navbar-brand" href="/">
        <i className="fa fa-home"></i>
      </a>
      <a className="navbar-brand" href="/">
        <i className="fa fa-search"></i>
      </a>
      <a className="navbar-brand" href="/">
        <i className="fa fa-plus"></i>
      </a>
      <a className="navbar-brand" href="/">
        <i className="fa fa-commenting"></i>
      </a>
      <a className="navbar-brand" href="/">
        <i className="fa fa-user"></i>
      </a>
    </nav>
  );
};

export default BottomNav;
