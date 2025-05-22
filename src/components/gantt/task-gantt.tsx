import React, { memo, SyntheticEvent, useMemo } from "react";
import type { CSSProperties, RefObject } from "react";

import { GridProps, Grid } from "../grid/grid";
import { CalendarProps, Calendar } from "../calendar/calendar";
import { TaskGanttContentProps, TaskGanttContent } from "./task-gantt-content";
import styles from "./gantt.module.css";
import Popper from "@mui/material/Popper";
import Paper from "@mui/material/Paper";
import {
  TaskContextualPaletteProps,
  Task,
  Distances,
  DateExtremity,
  TaskDependencyContextualPaletteProps,
  ColorStyles,
} from "../../types/public-types";
import ClickAwayListener from "@mui/material/ClickAwayListener";

export type TaskGanttProps = {
  barProps: TaskGanttContentProps;
  calendarProps: CalendarProps;
  gridProps: GridProps;
  distances: Distances;
  fullRowHeight: number;
  fullSvgWidth: number;
  ganttFullHeight: number;
  ganttSVGRef: RefObject<SVGSVGElement>;
  ganttTaskContentRef: RefObject<HTMLDivElement>;
  onVerticalScrollbarScrollX: (event: SyntheticEvent<HTMLDivElement>) => void;
  ganttTaskRootRef: RefObject<HTMLDivElement>;
  onScrollGanttContentVertically: (
    event: SyntheticEvent<HTMLDivElement>
  ) => void;
  colors: Partial<ColorStyles>;
};

const TaskGanttInner: React.FC<TaskGanttProps> = props => {
  const {
    barProps,
    barProps: { additionalLeftSpace },
    calendarProps,
    fullRowHeight,
    fullSvgWidth,
    ganttFullHeight,
    ganttSVGRef,
    gridProps,
    distances: { columnWidth, rowHeight, minimumRowDisplayed },
    ganttTaskContentRef,
    onVerticalScrollbarScrollX,
    ganttTaskRootRef,
    onScrollGanttContentVertically: onScrollVertically,
    colors,
  } = props;
  const containerStyle: CSSProperties = {
    // In order to see the vertical scrollbar of the gantt content,
    // we resize dynamically the width of the gantt content
    height: Math.max(ganttFullHeight, minimumRowDisplayed * rowHeight),
    width: ganttTaskRootRef?.current
      ? ganttTaskRootRef.current.clientWidth +
        ganttTaskRootRef.current.scrollLeft
      : fullSvgWidth,
  };

  const gridStyle = useMemo<CSSProperties>(
    () => ({
      height: Math.max(ganttFullHeight, minimumRowDisplayed * rowHeight),
      width: fullSvgWidth,
      backgroundSize: `${columnWidth}px ${fullRowHeight * 2}px`,
      backgroundPositionX: additionalLeftSpace || undefined,
      backgroundImage: [
        `linear-gradient(to right, #ECE7E2 1px, transparent 2px)`,
      ].join(", "),
    }),
    [
      additionalLeftSpace,
      columnWidth,
      fullRowHeight,
      fullSvgWidth,
      ganttFullHeight,
    ]
  );

  const [arrowAnchorEl, setArrowAnchorEl] = React.useState<null | SVGElement>(
    null
  );
  const [selectedDependency, setSelectedDependency] = React.useState<{
    taskFrom: Task;
    extremityFrom: DateExtremity;
    taskTo: Task;
    extremityTo: DateExtremity;
  }>(null);
  const isArrowContextualPaletteOpened = Boolean(arrowAnchorEl);
  const onClickArrow: (
    taskFrom: Task,
    extremityFrom: DateExtremity,
    taskTo: Task,
    extremityTo: DateExtremity,
    event: React.MouseEvent<SVGElement>
  ) => void = (taskFrom, extremityFrom, taskTo, extremityTo, event) => {
    setArrowAnchorEl(event.currentTarget);
    setSelectedDependency({ taskFrom, extremityFrom, taskTo, extremityTo });
  };

  const onCloseArrowContextualPalette = () => {
    setArrowAnchorEl(null);
  };

  let arrowContextualPalette:
    | React.FunctionComponentElement<TaskDependencyContextualPaletteProps>
    | undefined = undefined;
  if (barProps.TaskDependencyContextualPalette && selectedDependency) {
    arrowContextualPalette = React.createElement(
      barProps.TaskDependencyContextualPalette,
      {
        taskFrom: selectedDependency.taskFrom,
        extremityFrom: selectedDependency.extremityFrom,
        taskTo: selectedDependency.taskTo,
        extremityTo: selectedDependency.extremityTo,
        onClosePalette: onCloseArrowContextualPalette,
      }
    );
  } else {
    arrowContextualPalette = <div></div>;
  }

  const onArrowClickAway = (e: MouseEvent | TouchEvent) => {
    const svgElement = e.target as SVGElement;
    if (svgElement) {
      const keepPalette =
        svgElement.ownerSVGElement?.classList.contains("ArrowClassName");
      // In a better world the contextual palette should be defined in TaskItem component but ClickAwayListener and Popper uses div that are not displayed in svg
      // So in order to let the palette open when clicking on another task, this checks if the user clicked on another task
      if (!keepPalette) {
        setArrowAnchorEl(null);
        setSelectedDependency(null);
      }
    }
  };

  // Manage the contextual palette
  const [anchorEl, setAnchorEl] = React.useState<null | SVGElement>(null);
  const [selectedTask, setSelectedTask] = React.useState<Task>(null);
  const open = Boolean(anchorEl);
  const onClickTask: (
    task: Task,
    event: React.MouseEvent<SVGElement>
  ) => void = (task, event) => {
    setAnchorEl(event.currentTarget);
    setSelectedTask(task);
    barProps.onClick(task, event);
  };

  const onClose = () => {
    setAnchorEl(null);
  };

  let contextualPalette:
    | React.FunctionComponentElement<TaskContextualPaletteProps>
    | undefined = undefined;
  if (barProps.ContextualPalette && selectedTask) {
    contextualPalette = React.createElement(barProps.ContextualPalette, {
      selectedTask,
      onClosePalette: onClose,
    });
  } else {
    contextualPalette = <div></div>;
  }

  const onClickAway = (e: MouseEvent | TouchEvent) => {
    const svgElement = e.target as SVGElement;
    if (svgElement) {
      const keepPalette =
        svgElement.ownerSVGElement?.classList.contains("TaskItemClassName");
      // In a better world the contextual palette should be defined in TaskItem component but ClickAwayListener and Popper uses div that are not displayed in svg
      // So in order to let the palette open when clicking on another task, this checks if the user clicked on another task
      if (!keepPalette) {
        setAnchorEl(null);
        setSelectedTask(null);
      }
    }
  };
  return (
    <div
      className={styles.ganttTaskRoot}
      ref={ganttTaskRootRef}
      onScroll={onVerticalScrollbarScrollX}
      dir="ltr"
    >
      <Calendar {...calendarProps} colors={colors} />

      <div
        ref={ganttTaskContentRef}
        className={styles.ganttTaskContent}
        style={containerStyle}
        onScroll={onScrollVertically}
      >
        <div style={gridStyle}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={fullSvgWidth}
            height={ganttFullHeight}
            fontFamily={barProps.fontFamily}
            ref={ganttSVGRef}
          >
            <Grid {...gridProps} />
            <TaskGanttContent
              {...barProps}
              onClick={onClickTask}
              onArrowClick={onClickArrow}
            />
          </svg>
        </div>
        {barProps.ContextualPalette && open && (
          <ClickAwayListener onClickAway={onClickAway}>
            <Popper
              key={`contextual-palette`}
              open={open}
              anchorEl={anchorEl}
              disablePortal
              placement="top"
            >
              <Paper>{contextualPalette}</Paper>
            </Popper>
          </ClickAwayListener>
        )}
        {barProps.TaskDependencyContextualPalette &&
          isArrowContextualPaletteOpened && (
            <ClickAwayListener onClickAway={onArrowClickAway}>
              <Popper
                key={`dependency-contextual-palette`}
                open={isArrowContextualPaletteOpened}
                anchorEl={arrowAnchorEl}
                disablePortal
                placement="top"
              >
                <Paper>{arrowContextualPalette}</Paper>
              </Popper>
            </ClickAwayListener>
          )}
      </div>
    </div>
  );
};

export const TaskGantt = memo(TaskGanttInner);
