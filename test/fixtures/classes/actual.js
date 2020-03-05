class Foo extends React.Component {
	render(){
		const {children, className} = this.props;
		return <div className={className}>{children}</div>
	}
}