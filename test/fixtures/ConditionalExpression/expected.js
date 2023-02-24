const Foo = ({ isLoading }) => {
    return isLoading ? <div data-bd-fe-id="Loading">Loading</div> : (
        <div>
            <div data-bd-fe-id="Hi">Hi</div>
            <div data-bd-fe-id="Hello">Hello</div>
        </div>
    )
};

const Loading = () => <Foo isLoading={true} />;

const Loaded = () => <Foo isLoading={false} />;
