"use strict";
import logger from "./logger.js";

class EventBus {
  constructor() {
    this.listeners = new Map();
    logger.info("EventBus initialized");
  }

  /**
   * Subscribe to an event
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   * @returns {Function} - Unsubscribe function
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    
    this.listeners.get(event).add(callback);
    
    return () => {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.listeners.delete(event);
        }
      }
    };
  }

  /**
   * Emit an event with data
   * @param {string} event - Event name
   * @param {any} data - Event data
   */
  emit(event, data = {}) {
    if (!this.listeners.has(event)) {
      return;
    }
    
    this.listeners.get(event).forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        logger.error(`Error in event listener for "${event}":`, error);
      }
    });
  }
}

const eventBus = new EventBus();
export default eventBus;