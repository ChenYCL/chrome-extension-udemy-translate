/**
 * chrome storage get
 * @param key
 * @param callback
 */
export const getItem = async(key) => {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get(key, function(data) {
            resolve(data[key]);
        });
    });
};

/**
 * chrome storage set
 * @param key
 * @param value
 */
export const setItem = async(key, value) => {
    let obj = {};
    obj[key] = value;
    chrome.storage.sync.set(obj);
};