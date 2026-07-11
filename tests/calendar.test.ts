import test from "node:test";
import assert from "node:assert/strict";
import { getDay } from "date-fns";
import { getCalendarWeeks } from "../src/components/ui/calendar";

test("calendar month is split into complete Sunday-to-Saturday weeks", () => {
  const weeks = getCalendarWeeks(new Date(2026, 6, 1));

  assert.ok(weeks.length === 5 || weeks.length === 6);
  assert.ok(weeks.every((week) => week.length === 7));
  assert.ok(weeks.every((week) => getDay(week[0]) === 0));
  assert.ok(weeks.every((week) => getDay(week[6]) === 6));
  assert.equal(weeks.flat().some((date) => date.getDate() === 15 && date.getMonth() === 6), true);
});
