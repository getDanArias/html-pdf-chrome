/// <reference types="node" />
import { Stream } from 'stream';
/**
 * PDF generation options.
 *
 * @export
 * @interface CreateOptions
 */
export interface CreateOptions {
    port?: number;
    printOptions?: ChromePrintOptions;
}
/**
 * Chrome Page.printToPDF options.
 *
 * @export
 * @interface ChromePrintOptions
 */
export interface ChromePrintOptions {
    /**
     * Paper orientation. Defaults to false.
     *
     * @type {boolean}
     * @memberof ChromePrintOptions
     */
    landscape?: boolean;
    /**
     * Display header and footer. Defaults to false.
     *
     * @type {boolean}
     * @memberof ChromePrintOptions
     */
    displayHeaderFooter?: boolean;
    /**
     * Print background graphics. Defaults to false.
     *
     * @type {boolean}
     * @memberof ChromePrintOptions
     */
    printBackground?: boolean;
    /**
     * Scale of the webpage rendering. Defaults to 1.
     *
     * @type {number}
     * @memberof ChromePrintOptions
     */
    scale?: number;
    /**
     * Paper width in inches. Defaults to 8.5 inches.
     *
     * @type {number}
     * @memberof ChromePrintOptions
     */
    paperWidth?: number;
    /**
     * Paper height in inches. Defaults to 11 inches.
     *
     * @type {number}
     * @memberof ChromePrintOptions
     */
    paperHeight?: number;
    /**
     * Top margin in inches. Defaults to 1cm (~0.4 inches).
     *
     * @type {number}
     * @memberof ChromePrintOptions
     */
    marginTop?: number;
    /**
     * Bottom margin in inches. Defaults to 1cm (~0.4 inches).
     *
     * @type {number}
     * @memberof ChromePrintOptions
     */
    marginBottom?: number;
    /**
     * Left margin in inches. Defaults to 1cm (~0.4 inches).
     *
     * @type {number}
     * @memberof ChromePrintOptions
     */
    marginLeft?: number;
    /**
     * Right margin in inches. Defaults to 1cm (~0.4 inches).
     *
     * @type {number}
     * @memberof ChromePrintOptions
     */
    marginRight?: number;
    /**
     * Paper ranges to print, e.g., '1-5, 8, 11-13'.
     * Defaults to the empty string, which means print all pages.
     *
     * @type {string}
     * @memberof ChromePrintOptions
     */
    pageRanges?: string;
}
/**
 * Generates a PDF from the given HTML string.
 *
 * @export
 * @param {string} html the HTML string.
 * @param {Options} [options] the generation options.
 * @returns {Promise<CreateResult>} the generated PDF data.
 */
export declare function create(html: string, options?: CreateOptions): Promise<CreateResult>;
/**
 * Allows exporting of PDF data to multiple formats.
 *
 * @export
 * @class CreateResult
 */
export declare class CreateResult {
    /**
     * Writes the given data Buffer to the specified file location.
     *
     * @private
     * @static
     * @param {string} filename the file name to write to.
     * @param {Buffer} data the data to write.
     * @returns {Promise<void>}
     *
     * @memberof CreateResult
     */
    private static writeFile(filename, data);
    /**
     * Base64-encoded PDF data.
     *
     * @private
     * @type {string}
     * @memberof CreateResult
     */
    private data;
    /**
     * Creates an instance of CreateResult.
     * @param {string} data base64 PDF data
     *
     * @memberof CreateResult
     */
    constructor(data: string);
    /**
     * Get the base64 PDF data.
     *
     * @returns {string} base64 PDF data.
     *
     * @memberof CreateResult
     */
    toBase64(): string;
    /**
     * Get a Buffer of the PDF data.
     *
     * @returns {Buffer} PDF data.
     *
     * @memberof CreateResult
     */
    toBuffer(): Buffer;
    /**
     * Get a Stream of the PDF data.
     *
     * @returns {Stream} Stream of PDF data.
     *
     * @memberof CreateResult
     */
    toStream(): Stream;
    /**
     * Saves the PDF to a file.
     *
     * @param {string} filename the filename.
     * @returns {Promise<void>} resolves upon successful create.
     *
     * @memberof CreateResult
     */
    toFile(filename: string): Promise<void>;
}
