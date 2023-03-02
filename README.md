# babel-plugin-test-id

## Example

#### in

```
const Bar = () => <div>Hi</div>;
```

#### out

```
const Bar = () => <div data-id="Hi">Hi</div>;
```

#### in

```
const t = (s) => s;

const I18NDiv = () => <div>{t('I18N_KEY')}</div>;
```

#### out

```
const t = (s) => s;

const I18NDiv = () => <div data-id="I18N_KEY">{t('I18N_KEY')}</div>;

```

## Install

`yarn add babel-plugin-test-id`

or

`npm install babel-plugin-test-id`

## Usage

in .babelrc

```
"plugins": [
  "babel-plugin-test-id",
  ...
 ]
```

## Options

| Property | Type | Default | Description |
| --- | --- | --- | ---|
| idAttributeKey | string | `data-id` | Unique information extracted from the attributes and content of the element |
| componentAttributeKey | string | `data-component-name` | React component name if any |
| classnameAttributeKey | string | `data-classname` | css classnames before uglified |
| delimiter | string | `-` | Join multiple extracted strings