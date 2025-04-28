// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body></body></html>');

// Assign window, document, and other DOM APIs globally
(globalThis as any).window = dom.window;
(globalThis as any).document = dom.window.document;
(globalThis as any).navigator = {
    userAgent: 'node.js',
};

Object.defineProperties(global, {
    TextEncoder: { value: dom.window.TextEncoder },
    TextDecoder: { value: dom.window.TextDecoder },
});