import React from "react";
import styles from "./bar.module.css";

type BarDateHandleProps = {
  dataTestid: string;
  barCornerRadius: number;
  height: number;
  startMove: (clientX: number) => void;
  width: number;
  x: number;
  y: number;
};

export const BarDateHandle: React.FC<BarDateHandleProps> = ({
  dataTestid,
  // barCornerRadius,
  height,
  startMove,
  width,
  x,
  y,
}) => {
  return (
    <rect
      data-testid={dataTestid}
      x={x}
      y={y}
      width={width}
      height={height}
      className={styles.barHandle}
      ry={2}
      rx={2}
      onMouseDown={e => {
        startMove(e.clientX);
      }}
      onTouchStart={e => {
        const firstTouch = e.touches[0];

        if (firstTouch) {
          startMove(firstTouch.clientX);
        }
      }}
    />
  );
};
