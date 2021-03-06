'use strict';

import { launch, LaunchedChrome } from 'chrome-launcher';
import * as CDP from 'chrome-remote-interface';

import * as CompletionTrigger from './CompletionTriggers';
import { CreateOptions } from './CreateOptions';
import { CreateResult } from './CreateResult';

const DEFAULT_CHROME_FLAGS = [
  '--disable-gpu',
  '--headless',
  '--hide-scrollbars',
];

export { CompletionTrigger, CreateOptions, CreateResult };

/**
 * Generates a PDF from the given HTML string, launching Chrome as necessary.
 *
 * @export
 * @param {string} html the HTML string.
 * @param {Options} [options] the generation options.
 * @returns {Promise<CreateResult>} the generated PDF data.
 */
export async function create(html: string, options?: CreateOptions): Promise<CreateResult> {
  const myOptions = Object.assign({}, options);
  let chrome: LaunchedChrome;

  myOptions._canceled = false;
  if (myOptions.timeout >= 0) {
    setTimeout(() => {
      myOptions._canceled = true;
    }, myOptions.timeout);
  }

  await throwIfCanceled(myOptions);
  if (!myOptions.host && !myOptions.port) {
    await throwIfCanceled(myOptions);
    chrome = await launchChrome(myOptions);
  }

  try {
    const tab = await CDP.New(myOptions);
    try {
      return await generate(html, myOptions, tab);
    } finally {
      await CDP.Close({ ...myOptions, id: tab.id });
    }
  } finally {
    if (chrome) {
      await chrome.kill();
    }
  }
}

/**
 * Connects to Chrome and generates a PDF from HTML or a URL.
 *
 * @param {string} html the HTML string or URL.
 * @param {CreateOptions} options the generation options.
 * @param {any} tab the tab to use.
 * @returns {Promise<CreateResult>} the generated PDF data.
 */
async function generate(html: string, options: CreateOptions, tab: any): Promise<CreateResult>  {
  await throwIfCanceled(options);
  const client = await CDP({ ...options, target: tab });
  try {
    await beforeNavigate(options, client);
    const {Page} = client;
    const url = /^(https?|file|data):/i.test(html) ? html : `data:text/html,${html}`;
    await Promise.all([
      Page.navigate({url}),
      Page.loadEventFired(),
    ]); // Resolve order varies
    await afterNavigate(options, client);
    // https://chromedevtools.github.io/debugger-protocol-viewer/tot/Page/#method-printToPDF
    const pdf = await Page.printToPDF(options.printOptions);
    await throwIfCanceled(options);
    return new CreateResult(pdf.data);
  } finally {
    client.close();
  }
}

/**
 * Code to execute before the page navigation.
 *
 * @param {CreateOptions} options the generation options.
 * @param {*} client the Chrome client.
 * @returns {Promise<void>} resolves if there we no errors or cancellations.
 */
async function beforeNavigate(options: CreateOptions, client: any): Promise<void> {
  const {Network, Page, Runtime} = client;
  await throwIfCanceled(options);
  if (options.clearCache) {
    await Network.clearBrowserCache();
  }
  // Enable events to be used here, in generate(), or in afterNavigate().
  await Promise.all([
    Page.enable(),
    Runtime.enable(),
  ]);
  if (options.runtimeConsoleHandler) {
    await throwIfCanceled(options);
    Runtime.consoleAPICalled(options.runtimeConsoleHandler);
  }
  if (options.runtimeExceptionHandler) {
    await throwIfCanceled(options);
    Runtime.exceptionThrown(options.runtimeExceptionHandler);
  }
  if (options.cookies) {
    await throwIfCanceled(options);
    await Network.setCookies({cookies: options.cookies});
  }
  await throwIfCanceled(options);
}

/**
 * Code to execute after the page navigation.
 *
 * @param {CreateOptions} options the generation options.
 * @param {*} client the Chrome client.
 * @returns {Promise<void>} resolves if there we no errors or cancellations.
 */
async function afterNavigate(options: CreateOptions, client: any): Promise<void> {
  if (options.completionTrigger) {
    await throwIfCanceled(options);
    const waitResult = await options.completionTrigger.wait(client);
    if (waitResult && waitResult.exceptionDetails) {
      await throwIfCanceled(options);
      throw new Error(waitResult.result.value);
    }
  }
  await throwIfCanceled(options);
}

/**
 * Throws an exception if the operation has been canceled.
 *
 * @param {CreateOptions} options the options which track cancellation.
 * @returns {Promise<void>} reject if canceled, resolve if not.
 */
async function throwIfCanceled(options: CreateOptions): Promise<void> {
  if (options._canceled) {
    throw new Error('HtmlPdf.create() timed out.');
  }
}

/**
 * Launches Chrome with the specified options.
 *
 * @param {CreateOptions} options the options for Chrome.
 * @returns {Promise<LaunchedChrome>} The launched Chrome instance.
 */
async function launchChrome(options: CreateOptions): Promise<LaunchedChrome> {
  const chrome = await launch({
    port: options.port,
    chromePath: options.chromePath,
    chromeFlags: options.chromeFlags || DEFAULT_CHROME_FLAGS,
  });
  options.port = chrome.port;
  return chrome;
}
