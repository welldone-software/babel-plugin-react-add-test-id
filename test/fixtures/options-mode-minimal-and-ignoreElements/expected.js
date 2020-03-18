const Foo = () => (
  <div data-test-id="Foo-div">
    <div data-test-id="div">
      <span>
        <Bar1 data-test-id="Bar1" />
        <Bar2 data-test-id="Bar2">
          <Bar3 data-test-id="Bar3" />
        </Bar2>
      </span>
    </div>
  </div>
);
