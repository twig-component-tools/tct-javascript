/**
 * @typedef {String} Selector
 * @typedef {Function} ComponentConstructor
 * @typedef {Array<[Selector, ComponentConstructor]>} ComponentMap
 */

/**
 * This will parse all existing script tags that have a <code>data-component</code> attribute.
 * Attribute values:
 * data-component: Component Constructor Name. Must exist on the "window" object.
 * data-selector: Selector used to find all occurrences of the component.
 *
 * @param {Selector} selector Selector used to find script tags.
 */
export async function registerFromScriptTags (selector = 'script[data-component]') {
  const scriptTags = document.querySelectorAll(selector)
  const map = []

  if (!window.TCTComponents) {
    return
  }

  for (const tag of scriptTags) {
    const componentName = tag.dataset.component
    const selector = tag.dataset.selector || `.${componentName}`
    const componentModule = window.TCTComponents[componentName]

    if (componentModule.toString() === '[object Module]') {
      map.push([selector, componentModule[componentName]])
    }
  }

  registerComponents(map)
}

/**
 * Saves a map of selectors to components.
 * These can later be initialized using the method <code>mountComponents</code>.
 *
 * @param {ComponentMap} componentMap Map (Array of arrays) of selectors to constructors.
 */
export function registerComponents (componentMap) {
  if (!window.__tct) {
    window.__tct = new Map()
  }

  for (const [selector, constructor] of componentMap) {
    if (!window.__tct.has(selector)) {
      window.__tct.set(selector, [])
    }

    const componentList = window.__tct.get(selector)
    if (componentList.includes(constructor)) {
      continue
    }

    componentList.push(constructor)
  }
}
