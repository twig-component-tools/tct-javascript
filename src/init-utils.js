/**
 * @typedef {String} Selector
 * @typedef {Function} ComponentConstructor
 * @typedef {[Selector, ComponentConstructor]} ComponentEntry
 * @typedef {Array<ComponentEntry>} ComponentMap
 */

import { mountComponent } from './component-utils'

function initComponentMap () {
  if (!window.__tct) {
    window.__tct = new Map()
  }
}

function registerComponent (selector, constructor) {
  if (!window.__tct.has(selector)) {
    window.__tct.set(selector, [])
  }

  const componentList = window.__tct.get(selector)
  if (componentList.includes(constructor)) {
    return
  }

  componentList.push(constructor)
}

function handleTagLoadedComponent (name, module) {
  const tag = document.querySelector(`script[data-component="${name}"]`)
  const selector = tag.dataset.selector || `.${name}`
  const constructor = module[name]

  registerComponent(selector, constructor)

  const containers = document.querySelectorAll(selector)
  for (const container of containers) {
    mountComponent(container, constructor)
  }
}

export function watchScriptTags () {
  initComponentMap()

  const existing = window.TCTComponents || {}
  for (const [name, module] of Object.entries(existing)) {
    if (!module) {
      continue
    }

    handleTagLoadedComponent(name, module)
  }

  window.TCTComponents = new Proxy(existing, {
    set (obj, name, module) {
      if (!module[name]) {
        return true
      }

      handleTagLoadedComponent(name, module)

      obj[name] = module
      return true
    }
  })
}

/**
 * Saves a map of selectors to components.
 * These can later be initialized using the method <code>mountComponents</code>.
 *
 * @param {ComponentMap} componentMap Map (Array of arrays) of selectors to constructors.
 */
export function registerComponents (componentMap) {
  initComponentMap()

  for (const [selector, constructor] of componentMap) {
    registerComponent(selector, constructor)
  }
}
