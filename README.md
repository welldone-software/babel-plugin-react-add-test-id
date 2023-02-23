# babel-plugin-test-id

## Example

#### in

```
const Bar = () => <div>Hi</div>;
```

#### out

```
const Bar = () => <div data-bd-fe-id="Hi">Hi</div>;
```

#### in

```
const t = (s) => s;

const I18NDiv = () => <div>{t('I18N_KEY')}</div>;
```

#### out

```
const t = (s) => s;

const I18NDiv = () => <div data-bd-fe-id="I18N_KEY">{t('I18N_KEY')}</div>;

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
