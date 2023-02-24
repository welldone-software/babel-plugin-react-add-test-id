const Foo = ({ isLoading }) => {
    return isLoading ? <div>Loading</div> : (
        <div>
            <div>Hi</div>
            <div>Hello</div>
        </div>
    )
};

const Loading = () => <Foo isLoading={true} />;

const Loaded = () => <Foo isLoading={false} />;
