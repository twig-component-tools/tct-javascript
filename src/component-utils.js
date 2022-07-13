/**
 * Mounts all registered components on all elements matching the respective selectors.
 *
 * @param {ParentNode} base The base used for <code>querySelectorAll</code>.
 */
export function mountComponents (base = document) {
  if (!window.__tct) {
    return
  }

  for (const [selector, constructors] of window.__tct.entries()) {
    const containers = base.querySelectorAll(selector)

    for (const container of containers) {
      for (const constructor of constructors) {
        mountComponent(container, constructor)
      }
    }
  }
}

/**
 * Creates an instance of a component and stores it on the container's registry.
 *
 * @param {ParentNode} container
 * @param {Function} ComponentConstructor
 */
export function mountComponent (container, ComponentConstructor) {
  if (!container.__tct) {
    container.__tct = {}
    container.dataset.tct = ''
  }

  if (container.__tct[ComponentConstructor.name]) {
    return
  }

  container.__tct[ComponentConstructor.name] = new ComponentConstructor(container)
}

/**
 * Calls all <code>dispose</code> methods of all components nested within <code>container</code>, then clear all references to it.
 * @param {ParentNode} container The root container to search for components in. This method will not dispose of components on the <code>container</code> itself.
 */
export function disposeComponents (container = document) {
  const containers = container.querySelectorAll('[tct]')

  for (const container of containers) {
    if (!container.__tct) {
      continue
    }

    const entries = Object.entries(container.__tct)
    for (const [component, instance] of entries) {
      if (instance === this) {
        continue
      }

      instance.dispose()
      delete container.__tct[component]
    }

    delete container.__tct
    container.removeAttribute('data-tct')
  }
}

/**
 * Fetches the mounted instance of a component on a child element.
 * This will throw an error if the component has not been mounted within <code>timeout</code> milliseconds.
 *
 * @param {Element} child The DOM element, that is the component's <code>container</code>.
 * @param {String} componentName The component's name as registered on initialization (i.e. its constructor name).
 * @param {Number} timeout Milliseconds to wait until the promise rejects, if the requested component was not mounted.
 * @returns {Promise<TCTComponent>}
 */
export function getComponent (child, componentName, timeout = 300) {
  if (child.__tct && child.__tct[componentName]) {
    return Promise.resolve(child.__tct[componentName])
  }

  return new Promise(function (resolve, reject) {
    const timeoutId = window.setTimeout(reject, timeout)

    const mountEventName = `mounted-${componentName}`
    const onChildMounted = function (event) {
      window.clearTimeout(timeoutId)
      child.removeEventListener(mountEventName, onChildMounted)
      resolve(event.detail)
    }

    child.addEventListener(mountEventName, onChildMounted)
  })
}
