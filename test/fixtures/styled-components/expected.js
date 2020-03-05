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
      <Wrapper data-test-id="Foo-Wrapper">
        <Bar className={className} data-test-id="Foo-Bar">{children}</Bar>
        <Bar2 className={className} data-test-id="Foo-Bar2">{children}</Bar2>
      </Wrapper>
    );
  }
}

const Foo2 = ({children, className}) => (
  <Wrapper data-test-id="Foo2-Wrapper">
    <Bar className={className} data-test-id="Foo2-Bar">{children}</Bar>
    <Bar2 className={className} data-test-id="Foo2-Bar2">{children}</Bar2>
  </Wrapper>
);
