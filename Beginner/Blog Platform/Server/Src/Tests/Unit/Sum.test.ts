import { describe, expect, it, test } from "vitest";

const sum = (a: number, b: number) => a + b;

describe("Summation processes", () => {
  it("Does not sum to 3", () => expect(sum(1, 2)).not.equal(4));
  it("Sums to 10", () => expect(sum(5, 5)).toBe(10));
  it("Expects a type number", () => expect(typeof sum(1, 2)).toBe("number"));
});
