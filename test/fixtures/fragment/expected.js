const Foo = ({ children }) => (
  <>
    <React.Fragment>
      <Fragment>
        <div data-test-id="Foo">
          <Bar data-test-id="Foo-Bar">{children}</Bar>
        </div>
      </Fragment>
    </React.Fragment>
  </>
);
