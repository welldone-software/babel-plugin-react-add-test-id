import * as t from "@babel/types";

export default function(
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
  return {
    visitor: {
      Program(path) {
        path.traverse({
          ClassDeclaration(path) {
            const componentName = path.node.id.name;
            passDownComponentName(path, componentName, mode, delimiter);
          },
          VariableDeclarator(path) {
            const componentName = path.node.id.name;
            passDownComponentName(path, componentName, mode, delimiter);
          },
          JSXElement(path) {
            const componentName = path.node.openingElement.name.name || "";

            if (
              componentName === "" ||
              componentName.includes("Fragment") ||
              ignoreElements.includes(componentName)
            ) {
              return;
            }
            // if has a key get its value
            const keyValue = getKey(path);

            const concatComponentName = concatComponentsName(
              path.node.componentName,
              componentName,
              delimiter,
              keyValue,
            );

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
}

const concatComponentsName = (
  parent = "",
  current = "",
  delimiter = "-",
  keyValue = "",
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
    JSXElement(path) {
      if (mode === "minimal") {
        path.node.componentName = isRootElement || path.parent.type === 'ReturnStatement'
          ? concatComponentsName(
              path.node.componentName,
              componentName,
              delimiter
            )
          : null;
      } else {
        path.node.componentName = concatComponentsName(
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
