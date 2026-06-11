/* core/caesar — transporte de contraseña (mismo criterio que langlab Swagger). */
(function () {
  "use strict";
  const PREFIX = "abc123";
  const SUFFIX = "xyz987";

  function shiftChar(c: string, delta: number): string {
    const code = c.charCodeAt(0);
    if (code >= 65 && code <= 90) return String.fromCharCode(((code - 65 + delta + 26) % 26) + 65);
    if (code >= 97 && code <= 122) return String.fromCharCode(((code - 97 + delta + 26) % 26) + 97);
    return c;
  }
  function caesarEncode(plain: string, shift: number): string {
    return [...plain].map((c) => shiftChar(c, shift)).join("");
  }
  function wrapPassword(plain: string): string {
    const shift = new Date().getUTCDate();
    return caesarEncode(PREFIX + plain + SUFFIX, shift);
  }

  const w = window as any;
  w.SLG = w.SLG || {};
  w.SLG.Caesar = { wrapPassword };
})();
