import React, { useCallback, useState } from "react";

import {
  Column,
  ColumnProps,
  DateEndColumn,
  DateStartColumn,
  Gantt,
  OnChangeTasks,
  OnResizeColumn,
  Task,
  TaskOrEmpty,
  TitleColumn,
} from "../src";

import { initTasks, onAddTask, onEditTask } from "./helper";

import "../dist/style.css";
import {
  Checkbox,
  FormControl,
  ListItemText,
  MenuItem,
  Select,
} from "@mui/material";

const ProgressColumn: React.FC<ColumnProps> = ({ data: { task } }) => {
  if (task.type === "project" || task.type === "task") {
    return <>{task.progress}%</>;
  }

  return null;
};

enum TaskListColumnEnum {
  NAME = "Name",
  FROM = "From",
  TO = "To",
  PROGRESS = "Progress",
  ASSIGNEE = "Assignee",
}

export const getColumns = (
  columnTypes: TaskListColumnEnum[],
  displayColumns: boolean
) => {
  if (!displayColumns) {
    return new Map<TaskListColumnEnum, Column>();
  }
  const typeToColumn = new Map<TaskListColumnEnum, Column>();
  columnTypes.forEach(columnType => {
    if (columnType === TaskListColumnEnum.NAME) {
      typeToColumn.set(columnType, {
        Cell: TitleColumn,
        width: 210,
        title: "Name",
        id: TaskListColumnEnum.NAME,
      });
    } else if (columnType === TaskListColumnEnum.FROM) {
      typeToColumn.set(columnType, {
        Cell: DateStartColumn,
        width: 150,
        title: "Date of start",
        id: TaskListColumnEnum.FROM,
      });
    } else if (columnType === TaskListColumnEnum.TO) {
      typeToColumn.set(columnType, {
        Cell: DateEndColumn,
        width: 150,
        title: "Date of end",
        id: TaskListColumnEnum.TO,
      });
    } else if (columnType === TaskListColumnEnum.PROGRESS) {
      typeToColumn.set(columnType, {
        Cell: ProgressColumn,
        width: 40,
        title: "Progress",
        id: TaskListColumnEnum.PROGRESS,
      });
    }
  });

  return typeToColumn;
};

export const CustomColumns_VerticalScroll: React.FC = props => {
  const [tasks, setTasks] = useState<readonly TaskOrEmpty[]>(initTasks());

  const onChangeTasks = useCallback<OnChangeTasks>((nextTasks, action) => {
    switch (action.type) {
      case "delete_relation":
        if (
          window.confirm(
            `Do yo want to remove relation between ${action.payload.taskFrom.name} and ${action.payload.taskTo.name}?`
          )
        ) {
          setTasks(nextTasks);
        }
        break;

      case "delete_task":
        if (window.confirm("Are you sure?")) {
          setTasks(nextTasks);
        }
        break;

      default:
        setTasks(nextTasks);
        break;
    }
  }, []);

  const handleDblClick = useCallback((task: Task) => {
    alert("On Double Click event Id:" + task.id);
  }, []);

  const handleClick = useCallback((task: TaskOrEmpty) => {
    console.log("On Click event Id:" + task.id);
  }, []);

  const [columnTypes, setColumnTypes] = useState<TaskListColumnEnum[]>([
    TaskListColumnEnum.NAME,
    TaskListColumnEnum.FROM,
    TaskListColumnEnum.TO,
    TaskListColumnEnum.PROGRESS,
  ]);
  const typeToColumn: Map<TaskListColumnEnum, Column> = getColumns(
    [
      TaskListColumnEnum.NAME,
      TaskListColumnEnum.FROM,
      TaskListColumnEnum.TO,
      TaskListColumnEnum.PROGRESS,
    ],
    true
  );
  const [displayedColumns, setDisplayedColumns] = useState<Column[]>(
    Array.from(typeToColumn.values())
  );

  const allMetaColumns = [
    { type: TaskListColumnEnum.NAME, name: "Name" },
    { type: TaskListColumnEnum.FROM, name: "From" },
    { type: TaskListColumnEnum.TO, name: "To" },
    { type: TaskListColumnEnum.PROGRESS, name: "Progress" },
  ];

  const handleChangeColumns = event => {
    const columnTypes: TaskListColumnEnum[] = event.target.value;
    const newMetaColumns = allMetaColumns.filter(col =>
      columnTypes.includes(col.type)
    );
    setColumnTypes(newMetaColumns.map(col => col.type));

    const newDisplayedColumns: Column[] = [];

    newMetaColumns.forEach(metaColumn => {
      let column = displayedColumns.find(col => col.id == metaColumn.type);
      if (!column) {
        column = typeToColumn.get(metaColumn.type);
      }
      if (column) {
        newDisplayedColumns.push(column);
      }
    });

    setDisplayedColumns(newDisplayedColumns);
  };

  const onResizeColumn: OnResizeColumn = (newColumns: readonly Column[]) => {
    setDisplayedColumns(() => {
      return [...newColumns];
    });
  };

  return (
    <>
      <FormControl>
        <Select
          labelId="columns-checkbox-label"
          id="columns-checkbox"
          multiple
          disableUnderline
          value={columnTypes}
          onChange={handleChangeColumns}
          renderValue={() => "Columns"}
        >
          {allMetaColumns.map(column => (
            <MenuItem key={column.type} value={column.type}>
              <Checkbox checked={columnTypes.indexOf(column.type) > -1} />
              <ListItemText primary={column.name} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <div
        style={{
          display: "flex",
          width: "980px",
          height: "376px",
          position: "absolute",
          transform: "translate(149px, 8px)",
        }}
      >
        <Gantt
          {...props}
          columns={displayedColumns}
          onAddTask={onAddTask}
          onChangeTasks={onChangeTasks}
          onDoubleClick={handleDblClick}
          onEditTask={onEditTask}
          onClick={handleClick}
          tasks={tasks}
          onResizeColumn={onResizeColumn}
          roundDate={date => date}
          isAdjustToWorkingDates={false}
        />
      </div>
    </>
  );
};
