const { types: t } = require('@babel/core');

module.exports = function(
  api,
  {
    attrName = "data-test-id",
    mode = "regular", // minimal, regular, full
    ignoreElements = [
      "div",
      "input",
      "a",
      "button",
      "span",
      "p",
      "br",
      "hr",
      "ul",
      "ol",
      "li",
      "img",
      "form",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6"
    ],
    delimiter = "-"
  }
) {
  let isRootElement = true;
  return {
    visitor: {
      Program(path) {
        path.traverse({
          ClassDeclaration(path) {
            isRootElement = true;
            const componentName = path.node.id.name;
            passDownComponentName(path, componentName, mode, delimiter);
          },
          VariableDeclarator(path) {
            isRootElement = true;
            const componentName = path.node.id.name;
            passDownComponentName(path, componentName, mode, delimiter);
          },
          JSXElement(path) {
            const componentName = path.node.openingElement.name.name || "";
            const isRoot = isRootElement || path.parent.type === "ReturnStatement";
            const isIgnoredElement = ignoreElements.includes(componentName);

            if (
              componentName === "" ||
              componentName.includes("Fragment") ||
              (!isRoot && isIgnoredElement)
            ) {
              return;
            }
            // if has a key get its value
            const keyValue = getKey(path);

            const concatComponentName = concatComponentsName(
              path.node.componentName,
              isIgnoredElement ? "" : componentName,
              delimiter,
              keyValue,
            );

            isRootElement = false;

            const testId = keyValue
              ? t.jsxExpressionContainer(t.identifier(concatComponentName))
              : t.stringLiteral(concatComponentName);

            path.node.openingElement.attributes.push(
              t.jSXAttribute(t.jSXIdentifier(attrName), testId)
            );

            mode === "full" &&
              passDownComponentName(path, componentName, mode, delimiter);
          }
        });
      }
    }
  };
};

const concatComponentsName = (
  parent = "",
  current = "",
  delimiter = "-",
  keyValue = ""
) => {
  const componentsName =
    parent && current ? `${parent}${delimiter}${current}` : parent || current;

  return keyValue
    ? `\`${componentsName}${delimiter}\${${keyValue}}\``
    : componentsName;
};

const passDownComponentName = (path, componentName, mode, delimiter) => {
  let isRootElement = true;

  path.traverse({
    JSXElement(path2) {
      if (mode === "minimal") {
        path2.node.componentName =
          isRootElement || path2.parent.type === "ReturnStatement"
            ? concatComponentsName(
                path.node.componentName,
                componentName,
                delimiter
              )
            : null;
      } else {
        path2.node.componentName = concatComponentsName(
          path.node.componentName,
          componentName,
          delimiter
        );
      }

      isRootElement = false;
    }
  });
};

const getKey = path => {
  const keyAttribute = path.node.openingElement.attributes.find(
    ({ name }) => name && name.name === "key"
  );

  const keyValue =
    keyAttribute && keyAttribute.value && keyAttribute.value.expression
      ? keyAttribute.value.expression.name
      : "";

  return keyValue;
};
