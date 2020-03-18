const Foo = ({ children }) => (
  <>
    <React.Fragment>
      <Fragment>
        <div>
          <Bar>{children}</Bar>
        </div>
      </Fragment>
    </React.Fragment>
  </>
);
