import * as t from "@babel/types";
const INTERNAL_PARAM = "_internal_param";
const CLASSNAME = "className";
const STYLES = "styles";
const INTERNAL_ID = "_internal_testid";
const REACT_FRAGMENT = "React.Fragment";
const ID_ATTRIBUTE_KEY_LIST = [
  "title",
  "label",
  "placeholder",
  "description",
  "header",
  "name",
  "field",
  "type",
];
const CAPITALISED_REGEX = /^[A-Z]/g;
const NON_ALPHANUMERIC_OR_UNDERSCORE_REGEX = /[^a-zA-Z0-9_]/g; // i18n keys contain _
const isCapitalised = (str) => str.match(CAPITALISED_REGEX) !== null;

/**
 * addTestAutomationAttributesPlugin is a custom babel plugin that adds
 * 1. classnameAttributeKey based on the className prop, i.e. className={cx(styles.deviceCard, styles.red)}
 * 2. idAttributeKey based on any i18n key in these attributes (ID_ATTRIBUTE_KEY_LIST) or in the content of the element
 * 3. componentAttributeKey based on var or fn declaration, i.e. var DataDisplay = React.memo(React.forwardRef(function () {...}))
 * **Note**:
 * 1. We assume it is a user-defined component if the first letter is capitalised
 * 2. If it's a user-defined component, we add a variable declaration to the function, and add the same attribute to the component in return statement
 * 3. If the component in return statement is HTML tag, we add idAttributeKey attribute, else (user-defined component) add testId={testId} attribute
 *
 * @returns {{ visitor: import('@babel/core').Visitor }}
 */
export default function (
  api,
  {
    idAttributeKey = "data-id",
    componentAttributeKey = "data-component-name",
    classnameAttributeKey = "data-classname",
    delimiter = "-",
  }
) {
  return {
    visitor: {
      JSXElement(path) {
        const attributes = path.node.openingElement.attributes;
        const componentName = getContent(path.node.openingElement.name);
        // Skip for React.Fragment elements
        if (!componentName || componentName === REACT_FRAGMENT) {
          return;
        }

        // Add INTERNAL_ID as a prop for user-defined components else add auto-generated idAttributeKey
        const testId = isCapitalised(componentName)
          ? INTERNAL_ID
          : idAttributeKey;

        // Add testId by guessing
        const idNodes = [
          ...path.node.children,
          ...attributes.filter(
            (a) =>
              t.isJSXAttribute(a) &&
              a.name.name !== CLASSNAME &&
              (!a.value ||
                !("expression" in a.value) ||
                !("name" in a.value.expression) ||
                a.name.name !== a.value.expression.name) && // Ignore not meaningful cases e.g. description={description}
              ID_ATTRIBUTE_KEY_LIST.some(
                (id) =>
                  typeof a.name.name === "string" &&
                  a.name.name.toLowerCase().includes(id) // As long as it's similar to any of the ID_ATTRIBUTE_KEY_LIST
              )
          ),
        ];

        const newTestIdValue = getContentForArray(idNodes)
          .filter(isCapitalised) // The value should be a capitalised string, i.e. i18n key
          .join(delimiter);
        if (newTestIdValue.length > 0) {
          attributes.push(createAttributeLiteral(testId, newTestIdValue));
        }

        // Add classnameAttributeKey
        const classnameAttribute = attributes.find(
          (a) => t.isJSXAttribute(a) && a.name?.name === CLASSNAME
        );
        if (classnameAttribute && t.isJSXAttribute(classnameAttribute)) {
          const newAttributeValue = getContent(classnameAttribute);
          if (newAttributeValue.length > 0) {
            attributes.push(
              createAttributeLiteral(classnameAttributeKey, newAttributeValue)
            );
          }
        }
      },
      FunctionDeclaration(path) {
        // function TableFilter(_a) { ... }
        const functionName = path.node.id?.name;
        // Skip if function name is not capitalized
        if (!functionName || !isCapitalised(functionName)) {
          return;
        }
        const returnStatement = path.node.body?.body?.find((s) =>
          t.isReturnStatement(s)
        );
        if (
          returnStatement &&
          "argument" in returnStatement &&
          returnStatement.argument
        ) {
          const currentParams = [];
          path.node.params.forEach((p) => {
            if (t.isIdentifier(p)) {
              currentParams.push(p);
            }
          });
          addComponentAttribute(
            returnStatement?.argument,
            idAttributeKey,
            componentAttributeKey,
            functionName,
            currentParams,
            path.node.body?.body
          );
        }
      },
      VariableDeclaration(path) {
        // Should just have one declaration, var RadioTab =  React.memo(React.forwardRef(function (_a, ref) { ... }));
        if (t.isIdentifier(path.node.declarations[0]?.id)) {
          const variableName = path.node.declarations[0]?.id?.name;

          // Skip if variable name is not capitalized
          if (!variableName || !isCapitalised(variableName)) {
            return;
          }
          if (path.node.declarations[0]?.init) {
            const body = getMainFunctionBody(path.node.declarations[0]?.init);
            const returnStatement = body?.find((s) => t.isReturnStatement(s));
            const currentParameters = getMainFunctionParameter(
              path.node.declarations[0]?.init
            );
            addComponentAttribute(
              returnStatement?.argument,
              idAttributeKey,
              componentAttributeKey,
              variableName,
              currentParameters,
              body
            );
          }
        }
      },
    },
  };
}

/**
 * @example createAttributeLiteral(componentAttributeKey, 'ComponentName`) -> ${componentAttributeKey}=`ComponentName'
 * @param {string} key
 * @param {string} stringValue
 * @returns {t.JSXAttribute} jsx attribute with string type value
 */
function createAttributeLiteral(key, stringValue) {
  return t.jsxAttribute(t.jsxIdentifier(key), t.stringLiteral(stringValue));
}

/**
 * @example createAttributeIdentifier(idAttributeKey, testId) ->  ${idAttributeKey}={testId}
 * @param {string} key
 * @param {string} indentifier
 * @returns {t.JSXAttribute} jsx attribute with identifier type value
 */
function createAttributeIdentifier(key, indentifier) {
  return t.jsxAttribute(
    t.jsxIdentifier(key),
    t.jsxExpressionContainer(t.identifier(indentifier))
  );
}

/**
 * @example createVariable(_a, testId) -> var testId = _a?.testId
 * @param {t.Identifier} parameterIdentifier
 * @param {string} key
 * @returns {t.VariableDeclarator} a variable declaration for a given identifier
 */
function createVariable(parameterIdentifier, key) {
  return t.variableDeclarator(
    t.identifier(key),
    t.optionalMemberExpression(
      parameterIdentifier, // object key
      t.identifier(key), // object property
      false,
      true // optional
    )
  );
}

/**
 * @param {t.Identifier} parameterIdentifier
 * @param {string} key
 * @returns {t.VariableDeclaration | undefined} a variable declaration array with one variable
 */
function createVariableDeclarationArray(parameterIdentifier, key) {
  const variable = createVariable(parameterIdentifier, key);
  if (variable) {
    return t.variableDeclaration("var", [variable]);
  }
}

/**
 * @example getContentForArray([styles.a, styles.a, styles.b]) -> [a, b]
 * @param {t.Node[]} nodeArray
 * @returns {string[]} an array of unique content extracted from the node array
 */
function getContentForArray(nodeArray) {
  return Array.from(
    new Set(
      nodeArray.map((node) => getContent(node)).filter((t) => t.length > 0)
    )
  );
}

/**
 * @example getContentStringForArray([styles.a, styles.a, styles.b]) -> a + delimiter + b
 * @param {t.Node[]} nodeArray
 * @returns {string} a string of unique content extracted from the node array joined by the delimiter
 */
function getContentStringForArray(nodeArray, delimiter) {
  return getContentForArray(nodeArray).join(delimiter);
}

/**
 * @param {t.Node} node
 * @param {boolean} allowIdentifier
 * @returns {string} the content of nodes based on their type
 */
function getContent(node, allowIdentifier = false) {
  if (!node || !node.type) {
    return "";
  }
  switch (node.type) {
    case "StringLiteral":
    case "JSXText":
      return node.value.replace(NON_ALPHANUMERIC_OR_UNDERSCORE_REGEX, "");
    case "MemberExpression":
      // styles.a or enum constants
      return "name" in node.object &&
        node.object.name &&
        (node.object.name === STYLES ||
          node.object.name === node.object.name.toUpperCase())
        ? getContent(node.property, true)
        : getContent(node.property, allowIdentifier);
    case "JSXMemberExpression":
      // React.Fragment
      if ("name" in node.object) {
        return node.object.name + "." + node.property.name;
      }
    case "Identifier":
      return allowIdentifier && t.isIdentifier(node)
        ? node.name.replace(NON_ALPHANUMERIC_OR_UNDERSCORE_REGEX, "")
        : "";
    case "JSXIdentifier":
      return node.name.replace(NON_ALPHANUMERIC_OR_UNDERSCORE_REGEX, "");
    case "JSXExpressionContainer":
      return getContent(node.expression, allowIdentifier);
    case "ObjectProperty":
    case "JSXAttribute": {
      return node.value ? getContent(node.value, allowIdentifier) : "";
    }
    case "CallExpression":
      // cx(styles.a, styles.b)
      return getContentStringForArray(node.arguments, delimiter);
    case "ConditionalExpression":
      return getContentStringForArray([node.consequent, node.alternate], delimiter);
    case "LogicalExpression":
    case "BinaryExpression":
      // a + b
      return getContentStringForArray([node.left, node.right], delimiter);
    case "ObjectExpression":
      /*
        header={{
            title: t('DASHBOARD_CURRENT_HVAC_EFFICIENCY'),
            link: { path: HvacPage.ChillerPlantMonitoring },
          }}
        */
      return getContentStringForArray(node.properties, delimiter);
    default:
      // console.warn(node.type + ' not handled', node);
      return "";
  }
}

/**
 * @param {t.Node} node
 * @returns the body node of the function declaration
 */
function getMainFunctionBody(node) {
  if (!node) {
    return null;
  }
  if (t.isCallExpression(node)) {
    //  React.memo(React.forwardRef())
    return getMainFunctionBody(node.arguments?.[0]);
  }
  if (t.isFunctionExpression(node)) {
    return node.body?.body;
  }
  return null;
}

/**
 * @param {t.Node} node
 * @returns the params array node of the function declaration
 */
function getMainFunctionParameter(node) {
  if (!node) {
    return null;
  }
  if (t.isCallExpression(node)) {
    //  React.memo(React.forwardRef())
    return getMainFunctionParameter(node.arguments?.[0]);
  }
  if (t.isFunctionExpression(node)) {
    return node.params;
  }
  return null;
}

/**
 * Get first parameter identifier or add one if it doesn't exist
 * @param {t.Identifier[]} currentParameters
 * @returns {t.Identifier} the first parameter identifier
 */
function getParameterIdentifier(currentParameters) {
  const parameterIdentifier = currentParameters[0];
  if (!parameterIdentifier) {
    const newParam = t.identifier(INTERNAL_PARAM);
    currentParameters.push(newParam);
    return newParam;
  }
  return parameterIdentifier;
}

/**
 * Find the first node that is JSXElement, and add attributes and variable declarations
 * @param {t.Node | undefined} element
 * @param {string} idAttributeKey
 * @param {string} componentAttributeKey
 * @param {string} componentName
 * @param {t.Identifier[]} currentParameters
 * @param {t.Node[]} body
 */
function addComponentAttribute(
  element,
  componentAttributeKey,
  componentName,
  currentParameters,
  body
) {
  if (!element) {
    return;
  }

  if (t.isJSXElement(element)) {
    // 1. Add component attribute
    const attributes = element.openingElement.attributes;
    const tagName = getContent(element.openingElement.name);
    if (isCapitalised(tagName)) {
      if (tagName.includes(".")) {
        // .Provider wrapper or React.Fragment wrapper
        element.children?.forEach((child) =>
          addComponentAttribute(
            child,
            idAttributeKey,
            componentAttributeKey,
            componentName,
            currentParameters,
            body
          )
        );
      } else {
        // Component returns Component, so we add testId={testId}
        attributes.push(createAttributeIdentifier(INTERNAL_ID, INTERNAL_ID));
      }
    } else {
      // Only when it's HTML tag, we add component name attribute
      attributes.push(
        createAttributeLiteral(componentAttributeKey, componentName)
      );
      // And add data-testid={testId}
      attributes.push(createAttributeIdentifier(idAttributeKey, INTERNAL_ID));
    }

    // 2. Add variable and parameter to body
    const parameterIdentifier = getParameterIdentifier(currentParameters);
    const variableDeclarationArray = body?.filter((s) =>
      t.isVariableDeclaration(s)
    );
    if (
      variableDeclarationArray.length === 0 ||
      parameterIdentifier.name === INTERNAL_PARAM
    ) {
      // Add varible declaration to body if it doesn't exist
      const newVariableDeclarationArray = createVariableDeclarationArray(
        parameterIdentifier,
        INTERNAL_ID
      );
      if (newVariableDeclarationArray) {
        body.push(newVariableDeclarationArray);
      }
    } else {
      // Find the variable declaration using the same parameter identifier
      const variableDeclaration = variableDeclarationArray.find(
        (v) =>
          t.isVariableDeclaration(v) &&
          v.declarations?.[0]?.init &&
          "object" in v.declarations?.[0]?.init &&
          "name" in v.declarations?.[0]?.init?.object &&
          v.declarations?.[0]?.init?.object?.name === parameterIdentifier.name
      );
      if (!variableDeclaration) {
        const newVariableDeclarationArray = createVariableDeclarationArray(
          parameterIdentifier,
          INTERNAL_ID
        );
        if (newVariableDeclarationArray) {
          body.push(newVariableDeclarationArray);
        }
      } else {
        if (t.isVariableDeclaration(variableDeclaration)) {
          const newVariable = createVariable(parameterIdentifier, INTERNAL_ID);
          if (newVariable) {
            variableDeclaration.declarations.push(newVariable);
          }
        }
      }
    }
  } else if (t.isJSXFragment(element)) {
    // <><div/><span/></>
    element.children?.forEach((child) =>
      addComponentAttribute(
        child,
        idAttributeKey,
        componentAttributeKey,
        componentName,
        currentParameters,
        body
      )
    );
  } else if (t.isJSXExpressionContainer(element)) {
    if (t.isConditionalExpression(element.expression)) {
      // {a ? </> : null}
      addComponentAttribute(
        element.expression.consequent,
        idAttributeKey,
        componentAttributeKey,
        componentName,
        currentParameters,
        body
      );
      addComponentAttribute(
        element.expression.alternate,
        idAttributeKey,
        componentAttributeKey,
        componentName,
        currentParameters,
        body
      );
    } else if (t.isLogicalExpression(element.expression)) {
      // {a && </>}
      addComponentAttribute(
        element.expression?.right,
        idAttributeKey,
        componentAttributeKey,
        componentName,
        currentParameters,
        body
      );
    }
  }
}
