import Foo from 'foo';

const Wrapper = styled.span`
  width: 60px;
`;

const Bar = styled.div`
  color: blue;
`;

const Foo2 = ({children, className}) => (
  <Wrapper>
    <Foo className={className}>{children}</Foo>
    <Bar className={className}>{children}</Bar>
  </Wrapper>
);
