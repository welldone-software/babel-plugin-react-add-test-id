# babel-plugin-react-add-test-id 

## Example

#### in
```
const Foo = () => 
  <Bar>
    <div>
  </Bar>
```

#### out
```
const Foo = () => 
  <Bar data-test-id="Foo-Bar">
    <div data-test-id="Foo-Bar-div">
  </Bar>
```

## Useful with styled-components

#### in
```
const Wrapper = styled.div`...`

const Bar = styled.div`...`

const Foo = () => 
  <Wrapper>
    <Bar>
  </Wrapper>
```

#### out
```
const Wrapper = styled.div`...`

const Bar = styled.div`...`

const Foo = () => 
  <Wrapper data-test-id="Foo-Wrapper">
    <Bar data-test-id="Foo-Wrapper-Bar">
  </Wrapper>
```


## Install
`yarn add @welldone-software/babel-plugin-react-add-test-id`

or

`npm install @welldone-software/babel-plugin-react-add-test-id`

## Usage
in .babelrc
```
"plugins": [
  "@welldone-software/babel-plugin-add-test-id",
  ...
```

## Options

`dataAttr` - change attribute name (default: `data-test-id`)

in .babelrc
```
"plugins": [
  ["@welldone-software/babel-plugin-add-test-id", {"dataAttr": "data-test-id-example"}],
```
