/* global bootstrap */

// Storage key names and data attribute name:
const td_persistStorageKeyNameBase = 'td-tp-persist';
const td_persistCounterStorageKeyName = `${td_persistStorageKeyNameBase}-count`;
const td_persistDataAttrName = `data-${td_persistStorageKeyNameBase}`;

// Utilities

const _tdPersistCssSelector = (attrValue) =>
  attrValue
    ? `[${td_persistDataAttrName}="${attrValue}"]`
    : `[${td_persistDataAttrName}]`;

const _tdStoragePersistKey = (tabKey) =>
  td_persistStorageKeyNameBase + ':' + (tabKey || '');

const _tdSupportsLocalStorage = () => typeof Storage !== 'undefined';

// Helpers

function tdPersistKey(key, value) {
  try {
    if (value) {
      localStorage.setItem(key, value);
    } else {
      localStorage.removeItem(key);
    }
  } catch (error) {
    const action = value ? 'add' : 'remove';
    console.error(
      `Docsy tabpane: unable to ${action} localStorage key '${key}': `,
      error
    );
  }
}

function tdGetTabSelectEventCountAndInc() {
  const storedCount = localStorage.getItem(td_persistCounterStorageKeyName);
  let numTabSelectEvents = parseInt(storedCount) || 0;
  numTabSelectEvents++;
  tdPersistKey(td_persistCounterStorageKeyName, numTabSelectEvents.toString());
  return numTabSelectEvents;
}

// Main functions

function tdActivateTabsWithKey(key) {
  if (!key) return;

  document.querySelectorAll(_tdPersistCssSelector(key)).forEach((element) => {
    new bootstrap.Tab(element).show();
  });
}

function tdPersistActiveTab(activeTabKey) {
  if (!_tdSupportsLocalStorage()) return;

  tdPersistKey(
    _tdStoragePersistKey(activeTabKey),
    tdGetTabSelectEventCountAndInc()
  );
  tdActivateTabsWithKey(activeTabKey);
}

// Handlers

function tdGetAndActivatePersistedTabs(tabs) {
  const keyOfTabsInThisPage = [
    ...new Set(
      Array.from(tabs).map((el) => el.getAttribute(td_persistDataAttrName))
    ),
  ];

  let key_ageList = keyOfTabsInThisPage
    .map((k) => [
      k,
      parseInt(localStorage.getItem(_tdStoragePersistKey(k))) || 0,
    ])
    .filter(([k, v]) => v)
    .sort((a, b) => a[1] - b[1]);

  key_ageList.forEach(([key]) => {
    tdActivateTabsWithKey(key);
  });

  return key_ageList;
}

function tdRegisterTabClickHandler(tabs) {
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const activeTabKey = tab.getAttribute(td_persistDataAttrName);
      tdPersistActiveTab(activeTabKey);
    });
  });
}

// Register listeners and activate tabs

window.addEventListener('DOMContentLoaded', () => {
  if (!_tdSupportsLocalStorage()) return;

  const allTabsInThisPage = document.querySelectorAll(_tdPersistCssSelector());
  tdRegisterTabClickHandler(allTabsInThisPage);
  tdGetAndActivatePersistedTabs(allTabsInThisPage);
});