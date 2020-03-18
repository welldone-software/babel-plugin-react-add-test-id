class Foo extends React.Component {
  render() {
    const { children, className } = this.props;
    return (
      <div className={className}>
        <div>
          <Bar>{children}</Bar>
        </div>
      </div>
    );
  }
}
