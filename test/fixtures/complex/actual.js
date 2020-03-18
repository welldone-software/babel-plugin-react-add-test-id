const Foo = ({ className, children }) => {
  const x = 2;
  return (
    <div className={className}>
      <div>
        <Bar>{children}</Bar>
      </div>
    </div>
  );
};
