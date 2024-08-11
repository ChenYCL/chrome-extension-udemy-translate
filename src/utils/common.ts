const $ = require('jquery')

export {
    $
}


/**
 * set local storage
 * @param key 
 * @param value 
 * @returns 
 */
export const setItem = async (key: string, value: any): Promise<void> => {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ [key]: value }, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  };


/**
 * get local storage
 * @param key 
 * @returns 
 */
export const getItem = async (key: string): Promise<any> => {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get([key], (result) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(result[key]);
        }
      });
    });
  };




