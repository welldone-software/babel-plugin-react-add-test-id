const Wrapper = styled.span`
  width: 60px;
`;

const Bar = styled.div`
  color: blue;
`;

const Bar2 = styled.div`
  color: blue;
`;

class Foo extends React.Component {
  render() {
    const {children, className} = this.props;
    return (
      <Wrapper>
        <Bar className={className}>{children}</Bar>
        <Bar2 className={className}>{children}</Bar2>
      </Wrapper>
    );
  }
}

const Foo2 = ({children, className}) => (
  <Wrapper>
    <Bar className={className}>{children}</Bar>
    <Bar2 className={className}>{children}</Bar2>
  </Wrapper>
);
