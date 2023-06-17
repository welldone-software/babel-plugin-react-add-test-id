const Foo = ({ children }) => (
  <>
    <React.Fragment>
      <Fragment>
        <div>
          <Bar data-test-id="Foo-Bar">{children}</Bar>
        </div>
      </Fragment>
    </React.Fragment>
  </>
);
