import addDays from "date-fns/addDays";
import addHours from "date-fns/addHours";
import addMonths from "date-fns/addMonths";
import addWeeks from "date-fns/addWeeks";
import addYears from "date-fns/addYears";
import addQuarters from "date-fns/addQuarters";

import { ViewMode } from "../types/public-types";

export const getDateByOffset = (
  startDate: Date,
  offset: number,
  viewMode: ViewMode
) => {
  switch (viewMode) {
    case ViewMode.Day:
      return addDays(startDate, offset);

    case ViewMode.TwoDays:
      return addDays(startDate, offset * 2);

    case ViewMode.HalfDay:
      return addHours(startDate, offset * 12);

    case ViewMode.QuarterDay:
      return addHours(startDate, offset * 6);

    case ViewMode.Hour:
      return addHours(startDate, offset);

    case ViewMode.Month:
      return addMonths(startDate, offset);

    case ViewMode.Week:
      return addWeeks(startDate, offset);

    case ViewMode.QuarterYear:
      return addQuarters(startDate, offset);

    case ViewMode.Year:
      return addYears(startDate, offset);

    default:
      throw new Error("Unknown view mode");
  }
};
