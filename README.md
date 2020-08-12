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
  "@welldone-software/babel-plugin-react-add-test-id",
  ...
```

## Options

| Property                 | Type             | Default                                                                                                                                           | Description                                 |
| ------------------------ | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| attrName                 | String           | `data-test-id`                                                                                                                                    | Define the attribute name                   |
| mode                     | String           | `regular`                                                                                                                                         | One of `minimal`, `regular`, `full`         |
| ignoreElements           | Array of Strings | [`div`, `input`, `a`, `button`, `span`, `p`, `br`, `hr`, `ul`, `ol`, `li`, `img`, `form`, `h1`, `h2`, `h3`, `h4`, `h5`, `h6`, `svg`, `path`, `g`] | Avoid adding test id on those elements      |
| additionalIgnoreElements | Array of Strings | []                                                                                                                                                | Add extra ignoreElements                    |
| delimiter                | String           | `-`                                                                                                                                               | Separate components name with the delimiter |

in .babelrc

```
"plugins": [
  ["@welldone-software/babel-plugin-add-test-id", {"attrName": "data-test-id-example"}],
```
