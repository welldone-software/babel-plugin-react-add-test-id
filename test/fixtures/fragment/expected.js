const Foo = ({ children }) => (
  <>
    <React.Fragment>
      <div>{children}</div>
      <Fragment></Fragment>
    </React.Fragment>
  </>
);
