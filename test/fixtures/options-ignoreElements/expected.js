const Foo = () => (
  <div data-test-id="Foo-div">
    <div data-test-id="Foo-div">
      <span>
        <Bar1 data-test-id="Foo-Bar1" />
        <Bar2 data-test-id="Foo-Bar2">
          <Bar3 data-test-id="Foo-Bar3" />
        </Bar2>
      </span>
    </div>
  </div>
);
