import Foo from 'foo';

const Wrapper = styled.span`
  width: 60px;
`;

const Bar = styled.div`
  color: blue;
`;

const Foo2 = ({children, className}) => (
  <Wrapper data-test-id="Foo2-Wrapper">
    <Foo className={className} data-test-id="Foo2-Foo">{children}</Foo>
    <Bar className={className} data-test-id="Foo2-Bar">{children}</Bar>
  </Wrapper>
);
