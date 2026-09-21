import { expect, test } from "vitest";
import { render } from "vitest-browser-react";

import parseOneLine from "../parser";

test("parser works with plain text", () => {
  expect(parseOneLine("The big car.")).toStrictEqual(["The big car."]);
});

test("parser works with link in the middle", async () => {
  const parsed = parseOneLine(
    "There is info at [this link](https://www.google.com) for some more information"
  );
  expect(parsed.length).toBe(3);

  const [start, Hyperlink, end] = parsed;
  expect(start).toBe("There is info at ");
  expect(end).toBe(" for some more information");

  const { getByText } = render(Hyperlink);
  const link = getByText("this link");
  await expect.element(link).toBeInTheDocument();
  await expect.element(link).toHaveAttribute("href", "https://www.google.com");
  await expect.element(link).toHaveTextContent("this link");
});

test("parser works with code in the middle", async () => {
  const parsed = parseOneLine(
    "When using binary search methods from `<algorithm>` the end iterator range is not inclusive."
  );
  expect(parsed.length).toBe(3);

  const [start, Code, end] = parsed;
  expect(start).toBe("When using binary search methods from ");
  expect(end).toBe(" the end iterator range is not inclusive.");

  const { getByText } = render(Code);
  const code = getByText("<algorithm>");
  await expect.element(code).toBeInTheDocument();
  await expect.element(code).toHaveTextContent("<algorithm>");
});

test("parser works with multiple code blocks", async () => {
  const parsed = parseOneLine(
    "When using `upper_bound` and `lower_bound` from `<algorithm>` the end iterator range is not inclusive."
  );
  expect(parsed.length).toBe(7);

  const [text1, Code1, text2, Code2, text3, Code3, text4] = parsed;
  expect(text1).toBe("When using ");

  const { getByText: code1Locator } = render(Code1);
  const code1 = code1Locator("upper_bound");
  await expect.element(code1).toBeInTheDocument();
  await expect.element(code1).toHaveTextContent("upper_bound");

  expect(text2).toBe(" and ");

  const { getByText: code2Locator } = render(Code2);
  const code2 = code2Locator("lower_bound");
  await expect.element(code2).toBeInTheDocument();
  await expect.element(code2).toHaveTextContent("lower_bound");

  expect(text3).toBe(" from ");

  const { getByText: code3Locator } = render(Code3);
  const code3 = code3Locator("<algorithm>");
  await expect.element(code3).toBeInTheDocument();
  await expect.element(code3).toHaveTextContent("<algorithm>");

  expect(text4).toBe(" the end iterator range is not inclusive.");
});

test("parser removes backslashes for escaped brackets", () => {
  const parsed = parseOneLine(
    "Source \\[1\\] recommends putting `$PATH` setup in `.zshenv`."
  );
  // | text, code, text, code, text with full stop | = 5
  expect(parsed.length).toBe(5);

  const [text, ..._] = parsed;

  expect(text).toBe("Source [1] recommends putting ");
});

test("parser removes backslashes for escaped parentheses", () => {
  const parsed = parseOneLine("The prompt \\(PS2\\) will be shown.");

  const [text] = parsed;
  expect(text).toBe("The prompt (PS2) will be shown.");
});

test("parser removes backslashes for inline code", () => {
  const parsed = parseOneLine(
    "the backtic looks like \\` - it's to the left of 1 on the keyboard"
  );

  const [text] = parsed;
  expect(text).toBe(
    "the backtic looks like ` - it's to the left of 1 on the keyboard"
  );
});

test("parser removes asterisks for bold text", () => {
  const parsed = parseOneLine(
    "the asterisk looks like \\* - press SHIFT + 8 on the keyboard to find it"
  );

  const [text] = parsed;
  expect(text).toBe(
    "the asterisk looks like * - press SHIFT + 8 on the keyboard to find it"
  );
});
