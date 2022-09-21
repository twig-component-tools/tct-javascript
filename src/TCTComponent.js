import { disposeComponents } from './component-utils'

/**
 * Base class to be extended. Handles basic lifecycle and event methods.
 *
 * @property {ParentNode} container Root container of the component.
 * @property {Function} addEventListener
 * @property {Function} removeEventListener
 */
export class TCTComponent {
  constructor (container) {
    this.container = container

    window.setTimeout(this.__mountAndNotify.bind(this), 0)

    this.addEventListener = this.container.addEventListener
    this.removeEventListener = this.container.removeEventListener
  }

  /**
   * @override
   *
   * Use this method to initialize your component's inner workings.
   * @return void|Promise<>
   */
  mount () {
    throw new Error(`Method 'mount' of ${this.constructor.name} was not implemented.`)
  }

  /**
   * Clear all children, event listeners, library components, etc.
   */
  dispose () {
    disposeComponents(this.container)
  }

  /**
   * Dispatches a custom event with less friction.
   *
   * @param {String} eventName
   * @param {any} detail
   * @param {EventInit} options
   */
  dispatch (eventName, detail = undefined, options = {}) {
    this.container.dispatchEvent(new window.CustomEvent(eventName, { detail, ...options }))
  }

  /**
   * Waits until the component is mounted, then dispatched the appropriate event.
   * @returns {Promise<void>}
   * @private
   */
  async __mountAndNotify () {
    const promise = this.mount()

    if (promise instanceof Promise) {
      try {
        await promise
      } catch (error) {
        console.error({ component: this, error })
        throw new Error(`Could not mount component: ${this.constructor.name}`)
      }
    }

    this.dispatch(`mounted-${this.constructor.name}`, this)
  }
}
