const Foo = () => (
  <div>
    {[1,2,3,4,5].map(i => <span key={i}>{i}</span>)}
  </div>
);
