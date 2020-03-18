const Foo = () => (
  <div>
    <div>
      <Bar>
        {[1, 2, 3, 4, 5].map(i => (
          <span key={i}>{i}</span>
        ))}
      </Bar>
    </div>
  </div>
);
