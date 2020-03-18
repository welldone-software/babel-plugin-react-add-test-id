const Foo = () => (
  <div data-test-id="Foo">
    <Bar data-test-id="Foo-Bar" />
  </div>
);

const Bar = () => <div data-test-id="Bar">Hi</div>;
